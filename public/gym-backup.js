(() => {
  'use strict';

  const MAX_FILE_BYTES = 5 * 1024 * 1024;
  const existingControls = document.querySelector('#backup-controls');
  if (existingControls && existingControls.dataset.backupInitialized === 'true') return;

  const section = existingControls || document.createElement('section');
  section.id = 'backup-controls';
  section.className = 'card';
  section.setAttribute('aria-labelledby', 'backup-title');
  section.dataset.backupInitialized = 'true';
  section.replaceChildren();

  const heading = document.createElement('h2');
  heading.id = 'backup-title';
  heading.textContent = '备份与恢复';
  const description = document.createElement('p');
  description.textContent = '备份包含训练记录和模板，不含草稿。导入只合并新项目，已有记录和模板会保留。';
  const exportButton = document.createElement('button');
  exportButton.type = 'button';
  exportButton.textContent = '导出 JSON 备份';
  const fileLabel = document.createElement('label');
  fileLabel.htmlFor = 'backup-file';
  fileLabel.textContent = '选择备份文件（JSON，最大 5 MB）';
  const fileInput = document.createElement('input');
  fileInput.id = 'backup-file';
  fileInput.type = 'file';
  fileInput.accept = '.json,application/json';
  const preview = document.createElement('p');
  preview.className = 'hint';
  preview.setAttribute('aria-live', 'polite');
  const mergeButton = document.createElement('button');
  mergeButton.type = 'button';
  mergeButton.textContent = '确认合并';
  mergeButton.disabled = true;
  const status = document.createElement('p');
  status.className = 'hint';
  status.setAttribute('role', 'status');
  status.setAttribute('aria-live', 'polite');

  section.append(heading, description, exportButton, fileLabel, fileInput, preview, mergeButton, status);
  const layout = document.querySelector('.layout');
  if (!existingControls) {
    if (layout) layout.after(section);
    else document.querySelector('main')?.append(section);
  }

  let pendingRecords = null;
  let pendingTemplates = null;
  let pendingFile = null;
  let fileReadVersion = 0;

  function api() {
    return window.gymJournal;
  }

  function storageAvailable() {
    try {
      const journal = api();
      return Boolean(journal && journal.isStorageReady());
    } catch {
      return false;
    }
  }

  function readRecords() {
    try {
      const records = api().getRecords();
      if (!Array.isArray(records)) throw new Error('invalid records');
      return records;
    } catch {
      throw new Error('无法读取当前记录，原记录未更改。');
    }
  }

  function setStatus(text, error = false) {
    status.textContent = text;
    status.classList.toggle('error', error);
  }

  function disableBackup(reason) {
    exportButton.disabled = true;
    fileInput.disabled = true;
    mergeButton.disabled = true;
    setStatus(reason, true);
  }

  function resetPending() {
    fileReadVersion += 1;
    pendingRecords = null;
    pendingTemplates = null;
    pendingFile = null;
    mergeButton.disabled = true;
    preview.textContent = '';
  }

  function localDate() {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  }

  function isValidDate(value) {
    if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value) || value.slice(0, 4) === '0000') return false;
    const parsed = new Date(`${value}T00:00:00.000Z`);
    return Number.isFinite(parsed.getTime()) && parsed.toISOString().slice(0, 10) === value;
  }

  function validateRecord(row) {
    return row && typeof row === 'object' && !Array.isArray(row)
      && typeof row.id === 'string' && row.id.trim().length > 0
      && isValidDate(row.date)
      && typeof row.exercise === 'string' && row.exercise.trim().length > 0
      && row.exercise.trim().length <= 60
      && typeof row.weight === 'number' && Number.isFinite(row.weight) && row.weight >= 0 && row.weight <= 2000
      && Number.isInteger(row.reps) && row.reps >= 1 && row.reps <= 1000
      && (row.type === undefined || row.type === 'work' || row.type === 'warmup')
      && (row.note === undefined || (typeof row.note === 'string' && row.note.length <= 200));
  }

  function recordsFromBackup(value) {
    if (Array.isArray(value)) return value;
    if (value && typeof value === 'object' && [1, 2].includes(value.version) && Array.isArray(value.records)) {
      return value.records;
    }
    throw new Error('文件格式不正确，请选择练记导出的 JSON 备份。');
  }

  exportButton.addEventListener('click', () => {
    resetPending();
    if (!storageAvailable()) {
      disableBackup('无法读取本地记录。为保护原数据，已停用备份操作；请勿清除浏览器数据。');
      return;
    }
    try {
      const records = readRecords();
      if (!Array.isArray(records) || !records.every(validateRecord)) {
        throw new Error('本地记录格式无法确认，已停止导出以保护数据。');
      }
      if (!api().areTemplatesReady()) throw new Error('无法读取模板，已停止导出，避免生成不完整的备份。');
      const templates = api().getTemplates();
      if (!templates.every(api().validTemplate)) throw new Error('模板格式无法确认，已停止导出。');
      const backup = { version: 2, exportedAt: new Date().toISOString(), records, templates };
      const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `练记-backup-${localDate()}.json`;
      link.hidden = true;
      document.body.append(link);
      link.click();
      link.remove();
      window.setTimeout(() => URL.revokeObjectURL(url), 1000);
      setStatus(`已导出 ${records.length} 组记录和 ${templates.length} 个模板。`);
    } catch (error) {
      disableBackup(`读取本地记录失败。为保护原数据，已停用备份操作；${error instanceof Error ? error.message : '请勿清除浏览器数据。'}`);
    }
  });

  fileInput.addEventListener('change', async () => {
    resetPending();
    const readVersion = ++fileReadVersion;
    setStatus('');
    const file = fileInput.files && fileInput.files[0];
    if (!file) return;
    if (!storageAvailable()) {
      disableBackup('无法读取本地记录。为保护原数据，已停用备份操作；请勿清除浏览器数据。');
      return;
    }
    if (file.size > MAX_FILE_BYTES) {
      setStatus('文件超过 5 MB 限制，未读取也未更改任何记录。', true);
      return;
    }
    try {
      const parsed = JSON.parse(await file.text());
      if (readVersion !== fileReadVersion) return;
      const rows = recordsFromBackup(parsed);
      const importedTemplates = parsed && parsed.version === 2 ? parsed.templates : [];
      if (!Array.isArray(importedTemplates) || !importedTemplates.every(api().validTemplate)) throw new Error('备份中的模板无效，整份文件已拒绝。');
      if (importedTemplates.length && !api().areTemplatesReady()) throw new Error('无法读取原模板，已取消导入。');
      if (!rows.every(validateRecord)) {
        throw new Error('备份中至少有一组记录无效。整份文件已拒绝，原记录未更改。');
      }
      const unique = new Map();
      for (const row of rows) {
        if (!unique.has(row.id)) {
          unique.set(row.id, { ...row, exercise: row.exercise.trim() });
        }
      }
      const existingRows = readRecords();
      const existingIds = new Set(existingRows.filter(row => row && typeof row.id === 'string').map(row => row.id));
      const addable = [...unique.values()].filter(row => !existingIds.has(row.id));
      const skipped = unique.size - addable.length;
      const templateIds = new Set(api().getTemplates().map(row => row.id));
      const uniqueTemplates = new Map(importedTemplates.map(row => [row.id, row]));
      const addableTemplates = [...uniqueTemplates.values()].filter(row => !templateIds.has(row.id));
      pendingRecords = addable;
      pendingTemplates = addableTemplates;
      pendingFile = file;
      preview.textContent = `检查完成：${addable.length} 组记录、${addableTemplates.length} 个模板待合并；${skipped} 组记录及 ${uniqueTemplates.size - addableTemplates.length} 个模板因相同 ID 跳过。`;
      mergeButton.disabled = false;
      setStatus('请确认上方数量无误后再合并；选择其他文件会清除本次确认。');
    } catch (error) {
      if (readVersion !== fileReadVersion) return;
      resetPending();
      if (error instanceof Error && /无法读取当前记录/.test(error.message)) {
        disableBackup(`${error.message} 已停用备份操作，请勿清除浏览器数据。`);
      } else {
        setStatus(error instanceof Error ? error.message : '读取失败，原记录未更改。', true);
      }
    }
  });

  mergeButton.addEventListener('click', async () => {
    if (!pendingRecords || !pendingFile) return;
    fileReadVersion += 1;
    if (!storageAvailable()) {
      resetPending();
      disableBackup('无法读取本地记录。为保护原数据，已取消合并并停用备份；请勿清除浏览器数据。');
      return;
    }
    const rows = pendingRecords;
    const templateRows = pendingTemplates || [];
    mergeButton.disabled = true;
    let added = 0;
    try {
      const current = readRecords();
      const currentIds = new Set(current.filter(row => row && typeof row.id === 'string').map(row => row.id));
      const freshRows = rows.filter(row => !currentIds.has(row.id));
      added = await api().appendRecords(freshRows);
      if (!Number.isInteger(added) || added < 0 || added > freshRows.length) {
        throw new Error('合并结果无法确认。请检查训练历史后再操作。');
      }
      const addedTemplates = api().appendTemplates(templateRows);
      resetPending();
      fileInput.value = '';
      setStatus(`合并完成：新增 ${added} 组记录、${addedTemplates} 个模板；已有相同 ID 的项目已跳过。`);
    } catch (error) {
      mergeButton.disabled = false;
      if (error instanceof Error && /无法读取当前记录/.test(error.message)) {
        disableBackup(`${error.message} 已停用备份操作，请勿清除浏览器数据。`);
      } else {
        setStatus(`合并未完全完成：已新增 ${added} 组记录。${error instanceof Error ? error.message : '请检查后重试。'} 重试会跳过已导入的 ID。`, true);
      }
    }
  });

  if (!storageAvailable()) {
    disableBackup('无法读取本地记录。为保护原数据，已停用备份操作；请勿清除浏览器数据。');
  }
})();
