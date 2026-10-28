(() => {
  'use strict';

  const RECORD_KEY = 'gym-journal-v1';
  const TEMPLATE_KEY = 'gym-templates-v1';
  const DRAFT_KEY = 'gym-draft-v1';
  const MAX_EXERCISES = 20;
  const MAX_SETS = 30;
  const $ = selector => document.querySelector(selector);
  const form = $('#form');
  const cards = $('#exercise-cards');
  let records = [];
  let templates = [];
  let storageReady = true;
  let templatesReady = true;
  let dirty = false;
  let draftWritable = true;
  let fieldId = 0;

  function element(tag, text, className) {
    const node = document.createElement(tag);
    if (text !== undefined) node.textContent = text;
    if (className) node.className = className;
    return node;
  }

  function button(text, onClick, className = 'secondary') {
    const node = element('button', text, className);
    node.type = 'button';
    node.addEventListener('click', onClick);
    return node;
  }

  function notify(text, error = false) {
    $('#message').textContent = text;
    $('#message').classList.toggle('error', error);
  }

  function templateNotice(text, error = false) {
    $('#template-message').textContent = text;
    $('#template-message').classList.toggle('error', error);
  }

  function setDirty(value = true) {
    dirty = value;
    form.querySelector('button[type=submit]').disabled = !value || !storageReady;
    if (value) saveDraft();
  }

  function draftData() {
    return { date: $('#date').value, exercises: [...cards.children].map(card => ({
      exercise: card.querySelector('.exercise-name').value, note: card.querySelector('.exercise-note').value,
      sets: [...card.querySelectorAll('.set-row')].map(row => ({ weight: row.querySelector('.weight').value,
        reps: row.querySelector('.reps').value, type: row.querySelector('.set-type').value,
        completed: row.querySelector('.complete-set').checked })),
    })) };
  }
  function saveDraft() {
    if (!draftWritable) { $('#draft-status').textContent = '原草稿无法读取，已暂停草稿写入以保护原数据。'; return; }
    try { localStorage.setItem(DRAFT_KEY, JSON.stringify(draftData())); $('#draft-status').textContent = '草稿已保存在此浏览器。'; }
    catch { $('#draft-status').textContent = '草稿保存失败，请勿关闭页面。'; }
  }

  function validDate(value) {
    if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value) || value.startsWith('0000-')) return false;
    const date = new Date(`${value}T00:00:00Z`);
    return Number.isFinite(date.getTime()) && date.toISOString().slice(0, 10) === value;
  }

  function validSet(row) {
    return row && Number.isFinite(row.weight) && row.weight >= 0 && row.weight <= 2000
      && Number.isInteger(row.reps) && row.reps >= 1 && row.reps <= 1000;
  }

  function validExercise(row) {
    return row && typeof row.exercise === 'string' && Boolean(row.exercise.trim()) && row.exercise.trim().length <= 60;
  }

  function validRecord(row) {
    return validExercise(row) && validSet(row) && typeof row.id === 'string' && Boolean(row.id.trim()) && validDate(row.date);
  }

  function validTemplate(row) {
    return row && typeof row.id === 'string' && Boolean(row.id.trim())
      && typeof row.name === 'string' && Boolean(row.name.trim()) && row.name.length <= 40
      && Array.isArray(row.exercises) && row.exercises.length > 0 && row.exercises.length <= MAX_EXERCISES
      && row.exercises.every(ex => validExercise(ex) && Array.isArray(ex.sets) && ex.sets.length > 0
        && ex.sets.length <= MAX_SETS && ex.sets.every(validSet));
  }

  function readArray(key, valid) {
    const raw = localStorage.getItem(key);
    if (raw === null) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed) || !parsed.every(valid)) throw Error('invalid data');
    return parsed;
  }

  function persist(next) {
    if (!storageReady) {
      notify('无法读取原记录，已暂停写入。请勿清除浏览器数据。', true);
      return false;
    }
    try {
      localStorage.setItem(RECORD_KEY, JSON.stringify(next));
      records = next;
      return true;
    } catch {
      notify('保存失败，请检查浏览器存储空间或权限；本次输入已保留。', true);
      return false;
    }
  }

  function persistTemplates(next) {
    if (!templatesReady) return false;
    try {
      localStorage.setItem(TEMPLATE_KEY, JSON.stringify(next));
      templates = next;
      renderTemplates();
      return true;
    } catch {
      templateNotice('模板保存失败，请检查存储空间或权限；原模板未更改。', true);
      return false;
    }
  }

  function numberInput(label, kind, value) {
    const input = element('input');
    input.type = 'number';
    input.className = kind;
    input.min = kind === 'weight' ? '0' : '1';
    input.max = kind === 'weight' ? '2000' : '1000';
    input.step = kind === 'weight' ? '0.25' : '1';
    input.placeholder = kind === 'weight' ? '20' : '10';
    input.inputMode = kind === 'weight' ? 'decimal' : 'numeric';
    input.required = true;
    input.setAttribute('aria-label', label);
    if (value !== undefined) input.value = value;
    return input;
  }

  function updateSetLabels(card) {
    const name = card.querySelector('.exercise-name').value.trim() || '动作';
    const rows = [...card.querySelectorAll('.set-row')];
    rows.forEach((row, index) => {
      row.querySelector('.set-number').textContent = index + 1;
      row.querySelector('.weight').setAttribute('aria-label', `${name} 第 ${index + 1} 组重量 / kg`);
      row.querySelector('.reps').setAttribute('aria-label', `${name} 第 ${index + 1} 组次数`);
      row.querySelector('.remove-set').disabled = rows.length === 1;
    });
    card.querySelector('.add-set').disabled = rows.length >= MAX_SETS;
  }

  function addSet(card, values = {}) {
    if (card.querySelectorAll('.set-row').length >= MAX_SETS) return;
    const row = element('div', undefined, 'set-row');
    const remove = button('删除', () => {
      row.remove();
      setDirty();
      updateSetLabels(card);
    }, 'remove-set text-button');
    const done = element('input', undefined, 'complete-set');
    done.type = 'checkbox'; done.checked = Boolean(values.completed); done.setAttribute('aria-label', '标记本组完成并开始休息');
    done.addEventListener('change', () => {
      if (done.checked) {
        const weight = row.querySelector('.weight'); const reps = row.querySelector('.reps');
        if (!weight.reportValidity() || !reps.reportValidity()) { done.checked = false; setDirty(); return; }
        startRest();
      }
      setDirty();
    });
    const type = element('select', undefined, 'set-type');
    type.setAttribute('aria-label', '组类型');
    type.append(new Option('正式组', 'work'), new Option('热身组', 'warmup'));
    type.value = values.type === 'warmup' ? 'warmup' : 'work';
    row.append(element('span', '', 'set-number'), numberInput('重量 / kg', 'weight', values.weight),
      numberInput('次数', 'reps', values.reps), done, remove, type);
    card.querySelector('.sets').append(row);
    updateSetLabels(card);
  }

  function recentSets(name) {
    const matching = records.filter(row => row.exercise === name && row.date <= $('#date').value);
    // Prefer a previous training day; same-day entries remain useful for a new action.
    const earlier = matching.filter(row => row.date < $('#date').value);
    const pool = earlier.length ? earlier : matching;
    const date = pool.reduce((latest, row) => row.date > latest ? row.date : latest, '');
    return pool.filter(row => row.date === date);
  }

  function updatePrevious(card) {
    const name = card.querySelector('.exercise-name').value.trim();
    const rows = recentSets(name);
    const hint = card.querySelector('.previous');
    hint.textContent = !name ? '填写动作后，查看上次训练。' : rows.length
      ? `上次记录：${rows[0].date} · ${rows.slice(0, 6).map(row => `${row.weight} kg × ${row.reps}`).join(' / ')}${rows.length > 6 ? ` … 共 ${rows.length} 组` : ''}`
      : '这个动作还没有记录，从今天开始。';
    hint.hidden = !rows.length;
    card.querySelector('.reuse-previous').hidden = !rows.length;
    card.querySelector('.reuse-previous').disabled = !rows.length;
    updateSetLabels(card);
  }

  function addExercise(values = {}) {
    if (cards.children.length >= MAX_EXERCISES) return;
    const card = element('fieldset', undefined, 'exercise-card');
    card.append(element('legend', '训练动作'));
    const input = element('input', undefined, 'exercise-name');
    input.id = `exercise-${++fieldId}`;
    input.setAttribute('list', 'exercises');
    input.maxLength = 60;
    input.required = true;
    input.placeholder = '例如：杠铃卧推';
    input.value = values.exercise || '';
    const label = element('label', '动作名称');
    label.htmlFor = input.id;
    const remove = button('移除动作', () => {
      if (!confirm('移除这个动作及尚未保存的组？已保存的历史记录不会删除。')) return;
      card.remove();
      setDirty();
      updateExerciseControls();
    }, 'text-button');
    const heading = element('div', undefined, 'exercise-heading');
    heading.append(label, remove);
    const previous = element('p', '', 'hint previous');
    const reuse = button('沿用上次各组', () => {
      const rows = recentSets(input.value.trim()).slice(0, MAX_SETS);
      if (!rows.length) return;
      const filled = [...card.querySelectorAll('.weight,.reps')].some(node => node.value !== '');
      if (filled && !confirm('用上次各组替换这个动作尚未保存的重量和次数？')) return;
      card.querySelector('.sets').replaceChildren();
      rows.forEach(row => addSet(card, row));
      setDirty();
      notify(`已填入 ${rows.length} 组，请确认后保存训练。`);
    }, 'secondary reuse-previous');
    const headers = element('div', undefined, 'set-headers');
    ['组', '重量 / kg', '次数', '完成', ''].forEach(text => headers.append(element('span', text)));
    const sets = element('div', undefined, 'sets');
    const add = button('＋ 加一组', () => {
      const last = card.querySelector('.set-row:last-child');
      addSet(card, { weight: last.querySelector('.weight').value, reps: last.querySelector('.reps').value });
      setDirty();
      card.querySelector('.set-row:last-child .weight').focus();
    }, 'secondary add-set');
    const note = element('input', undefined, 'exercise-note');
    note.placeholder = '动作备注（可选）'; note.maxLength = 200; note.value = values.note || '';
    note.setAttribute('aria-label', '动作备注');
    card.append(heading, input, previous, reuse, headers, sets, add, note);
    cards.append(card);
    (values.sets || [{}]).forEach(row => addSet(card, row));
    input.addEventListener('input', () => updatePrevious(card));
    updatePrevious(card);
    updateExerciseControls();
    return card;
  }

  function updateExerciseControls() {
    $('#add-exercise').disabled = cards.children.length >= MAX_EXERCISES;
    for (const card of cards.children) card.querySelector('.exercise-heading button').disabled = cards.children.length === 1;
  }

  function collectExercises(completedOnly = false) {
    if (!$('#date').reportValidity()) return null;
    for (const card of cards.children) {
      const selectedRows = [...card.querySelectorAll('.set-row')].filter(row => !completedOnly || row.querySelector('.complete-set').checked);
      if (!selectedRows.length) continue;
      if (!card.querySelector('.exercise-name').reportValidity()) return null;
      for (const row of selectedRows) if (!row.querySelector('.weight').reportValidity() || !row.querySelector('.reps').reportValidity()) return null;
    }
    const exercises = [...cards.children].map(card => ({
      exercise: card.querySelector('.exercise-name').value.trim(),
      note: card.querySelector('.exercise-note').value.trim(),
      sets: [...card.querySelectorAll('.set-row')].filter(row => !completedOnly || row.querySelector('.complete-set').checked).map(row => ({
        weight: Number(row.querySelector('.weight').value), reps: Number(row.querySelector('.reps').value),
        type: row.querySelector('.set-type').value,
      })),
    })).filter(ex => ex.sets.length);
    if (!validDate($('#date').value) || !exercises.length || !exercises.every(row => validExercise(row) && row.sets.every(validSet))) {
      notify('请检查日期、动作名称，以及每组的重量和次数。', true);
      return null;
    }
    return exercises;
  }

  function renderTemplates() {
    const select = $('#template-select');
    const selected = select.value;
    select.replaceChildren(new Option('选择已保存的模板', ''), ...templates.map(row => new Option(row.name, row.id)));
    if (templates.some(row => row.id === selected)) select.value = selected;
    $('#save-template').disabled = !templatesReady;
    $('#load-template').disabled = !templatesReady || !select.value;
    $('#delete-template').disabled = !templatesReady || !select.value;
  }

  function renderHistory() {
    const selected = $('#filter-exercise').value;
    const names = [...new Set(records.map(row => row.exercise))].sort((a, b) => a.localeCompare(b, 'zh-CN'));
    $('#filter-exercise').replaceChildren(new Option('全部动作', ''), ...names.map(name => new Option(name, name)));
    if (names.includes(selected)) $('#filter-exercise').value = selected;
    const progress = $('#progress-exercise'); const chosen = progress.value;
    progress.replaceChildren(new Option('选择动作', ''), ...names.map(name => new Option(name, name)));
    if (names.includes(chosen)) progress.value = chosen;
    renderProgress();
    const rows = records.filter(row => (!$('#filter-date').value || row.date === $('#filter-date').value)
      && (!$('#filter-exercise').value || row.exercise === $('#filter-exercise').value));
    const summary = $('#summary');
    summary.replaceChildren();
    const volume = rows.reduce((sum, row) => sum + row.weight * row.reps, 0);
    const reps = rows.reduce((sum, row) => sum + row.reps, 0);
    for (const text of [`${rows.length} 组`, `${reps} 次`, `训练量 ${volume.toLocaleString('zh-CN', { maximumFractionDigits: 2 })} kg`, `${new Set(rows.map(row => row.date)).size} 个训练日`]) {
      summary.append(element('span', text));
    }
    const history = $('#history');
    history.replaceChildren();
    if (!rows.length) history.append(element('p', records.length ? '当前筛选没有记录。' : '还没有记录。保存第一次训练，开始积累。', 'empty'));
    const dates = [...new Set(rows.map(row => row.date))].sort().reverse();
    for (const date of dates) {
      history.append(element('h3', date, 'date-heading'));
      const day = rows.filter(row => row.date === date);
      for (const name of new Set(day.map(row => row.exercise))) {
        const entry = element('div', undefined, 'entry');
        entry.append(element('strong', name));
        day.filter(row => row.exercise === name).forEach((row, index) => {
          const line = element('div', undefined, 'history-set');
          const edit = button('修改', () => {
            const fields = element('div', undefined, 'edit-fields');
            const weight = numberInput('修改重量 / kg', 'weight', row.weight);
            const reps = numberInput('修改次数', 'reps', row.reps);
            const save = button('保存', () => {
              if (!weight.reportValidity() || !reps.reportValidity()) return;
              const updated = { ...row, weight: Number(weight.value), reps: Number(reps.value) };
              if (!validSet(updated)) return;
              if (persist(records.map(item => item.id === row.id ? updated : item))) {
                renderHistory();
                notify('已更新这一组。');
              }
            });
            const cancel = button('取消', () => renderHistory(), 'text-button');
            fields.append(weight, reps, save, cancel);
            line.replaceChildren(fields);
            weight.focus();
          }, 'edit');
          edit.setAttribute('aria-label', `修改 ${row.date} ${name} 第 ${index + 1} 组`);
          const remove = button('删除', () => {
            if (confirm('确定删除这组记录？') && persist(records.filter(item => item.id !== row.id))) {
              renderHistory();
              notify('已删除这一组。');
            }
          }, 'remove');
          remove.setAttribute('aria-label', `删除 ${row.date} ${name} 第 ${index + 1} 组 ${row.weight} kg ${row.reps} 次`);
          line.append(element('span', `第 ${index + 1} 组`), element('span', `${row.weight} kg × ${row.reps} 次${row.type === 'warmup' ? ' · 热身' : ''}${row.note ? ` · ${row.note}` : ''}`), edit, remove);
          entry.append(line);
        });
        history.append(entry);
      }
    }
    for (const card of cards.children) updatePrevious(card);
  }

  function renderProgress() {
    const name = $('#progress-exercise').value; const output = $('#progress-result'); output.replaceChildren();
    if (!name) { output.append(element('p', '选择动作后查看每个训练日的最高重量。', 'hint')); return; }
    const rows = records.filter(row => row.exercise === name && row.type !== 'warmup');
    if (!rows.length) { output.append(element('p', '暂无正式组记录。', 'hint')); return; }
    const dates = [...new Set(rows.map(row => row.date))].sort().reverse();
    const maximum = rows.reduce((max, row) => Math.max(max, row.weight), 0);
    output.append(element('p', `历史最高：${maximum} kg · ${dates.length} 个训练日（显示最近 10 个）`, 'hint'));
    const list = element('ul', undefined, 'progress-list');
    dates.slice(0, 10).forEach(date => {
      const best = rows.filter(row => row.date === date).reduce((a, b) => b.weight > a.weight || (b.weight === a.weight && b.reps > a.reps) ? b : a);
      const li = element('li'); const bar = element('div', undefined, 'progress-bar'); const fill = element('span');
      bar.setAttribute('aria-hidden', 'true'); fill.style.width = `${maximum ? best.weight / maximum * 100 : 0}%`; bar.append(fill);
      li.append(element('span', date), element('span', `${best.weight} kg × ${best.reps} 次`), bar); list.append(li);
    });
    output.append(list);
  }

  const now = new Date();
  $('#date').value = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  try { records = readArray(RECORD_KEY, validRecord); }
  catch { storageReady = false; notify('无法读取本地记录。为保护原记录，已暂停保存；请勿清除浏览器数据。', true); }
  try { templates = readArray(TEMPLATE_KEY, validTemplate); }
  catch { templatesReady = false; templateNotice('无法读取原模板，已暂停模板写入；训练记录仍可单独使用。', true); }

  addExercise();
  try {
    const rawDraft = localStorage.getItem(DRAFT_KEY);
    if (rawDraft) {
      const draft = JSON.parse(rawDraft);
      if (!draft || !validDate(draft.date) || !Array.isArray(draft.exercises) || !draft.exercises.length || draft.exercises.length > MAX_EXERCISES || !draft.exercises.every(ex => ex && typeof ex.exercise === 'string' && typeof ex.note === 'string' && Array.isArray(ex.sets) && ex.sets.length && ex.sets.length <= MAX_SETS && ex.sets.every(s => s && typeof s.weight === 'string' && typeof s.reps === 'string'))) throw Error('invalid draft');
      $('#date').value = draft.date; cards.replaceChildren(); draft.exercises.forEach(ex => addExercise(ex));
      dirty = true; $('#draft-status').textContent = '已恢复上次未保存的草稿。';
    }
  } catch { draftWritable = false; $('#draft-status').textContent = '无法恢复草稿，已暂停草稿写入以保护原数据。'; }
  renderTemplates();
  renderHistory();
  form.querySelector('button[type=submit]').disabled = !dirty || !storageReady;
  form.addEventListener('input', () => { setDirty(); });
  $('#date').addEventListener('input', () => { for (const card of cards.children) updatePrevious(card); });
  $('#add-exercise').addEventListener('click', () => {
    const card = addExercise();
    setDirty();
    card?.querySelector('.exercise-name').focus();
  });
  form.addEventListener('submit', event => {
    event.preventDefault();
    if (!dirty) return;
    const completedOnly = Boolean(form.querySelector('.complete-set:checked'));
    const exercises = collectExercises(completedOnly);
    if (!exercises) return;
    const date = $('#date').value;
    const added = exercises.flatMap(ex => ex.sets.map(set => ({ id: crypto.randomUUID(), date, exercise: ex.exercise, note: ex.note, ...set })));
    if (persist([...records, ...added])) {
      const pending = completedOnly ? draftData().exercises.map(ex => ({ ...ex, sets: ex.sets.filter(set => !set.completed) })).filter(ex => ex.sets.length) : [];
      cards.replaceChildren();
      if (pending.length) { pending.forEach(ex => addExercise(ex)); setDirty(true); }
      else {
        addExercise(); setDirty(false);
        if (draftWritable) {
          try { localStorage.removeItem(DRAFT_KEY); $('#draft-status').textContent = ''; } catch { $('#draft-status').textContent = '训练已保存，但草稿未能清除。'; }
        }
      }
      renderHistory();
      const visible = added.every(row => (!$('#filter-date').value || $('#filter-date').value === row.date)
        && (!$('#filter-exercise').value || $('#filter-exercise').value === row.exercise));
      notify(`已保存 ${exercises.length} 个动作、${added.length} 组${completedOnly ? '已完成的组' : ''}。${pending.length ? '未完成的组仍保留在草稿中。' : ''}${visible ? '历史记录已更新。' : '部分记录不在当前筛选中。'}`);
    }
  });
  $('#template-select').addEventListener('change', renderTemplates);
  $('#save-template').addEventListener('click', () => {
    const exercises = collectExercises();
    if (!exercises) return;
    const name = $('#template-name').value.trim();
    if (!name || name.length > 40) { templateNotice('请填写模板名称，例如“练胸日”。', true); $('#template-name').focus(); return; }
    const existing = templates.find(row => row.name === name);
    if (existing && !confirm(`更新模板“${name}”？原模板内容会被替换。`)) return;
    const template = { id: existing?.id || crypto.randomUUID(), name, exercises };
    const next = existing ? templates.map(row => row.id === existing.id ? template : row) : [...templates, template];
    if (persistTemplates(next)) {
      $('#template-select').value = template.id;
      renderTemplates();
      templateNotice(`已保存模板“${name}”。模板不会计入训练历史。`);
    }
  });
  $('#load-template').addEventListener('click', () => {
    const template = templates.find(row => row.id === $('#template-select').value);
    if (!template || (dirty && !confirm('加载模板会替换当前尚未保存的输入，是否继续？'))) return;
    cards.replaceChildren();
    template.exercises.forEach(row => addExercise(row));
    $('#template-name').value = template.name;
    setDirty();
    templateNotice(`已加载“${template.name}”，日期保持不变；调整重量和次数后再保存训练。`);
  });
  $('#delete-template').addEventListener('click', () => {
    const template = templates.find(row => row.id === $('#template-select').value);
    if (!template || !confirm(`删除模板“${template.name}”？已保存的训练记录不会删除。`)) return;
    if (persistTemplates(templates.filter(row => row.id !== template.id))) templateNotice('模板已删除。');
  });
  $('#filter-date').addEventListener('input', renderHistory);
  $('#filter-exercise').addEventListener('change', renderHistory);
  $('#clear-filters').addEventListener('click', () => { $('#filter-date').value = ''; $('#filter-exercise').value = ''; renderHistory(); });
  $('#progress-exercise').addEventListener('change', renderProgress);
  const duration = $('#rest-duration');
  const display = $('#rest-display');
  const toggle = $('#rest-toggle');
  const restStatus = $('#rest-status');
  let remaining = Number(duration.value) * 1000;
  let endTime = 0;
  let timerId = null;
  function showTimer() {
    const seconds = Math.ceil(remaining / 1000);
    display.textContent = `${String(Math.floor(seconds / 60)).padStart(2, '0')}:${String(seconds % 60).padStart(2, '0')}`;
  }
  function stopTimer() {
    clearInterval(timerId);
    timerId = null;
    toggle.textContent = '开始计时';
  }
  function resetTimer() {
    stopTimer();
    remaining = Number(duration.value) * 1000;
    restStatus.textContent = '';
    showTimer();
  }
  function startRest() {
    resetTimer();
    toggle.click();
  }
  toggle.addEventListener('click', () => {
    if (timerId !== null) {
      remaining = Math.max(0, endTime - Date.now());
      stopTimer();
      showTimer();
      return;
    }
    if (!remaining) remaining = Number(duration.value) * 1000;
    restStatus.textContent = '';
    endTime = Date.now() + remaining;
    toggle.textContent = '暂停';
    timerId = setInterval(() => {
      remaining = Math.max(0, endTime - Date.now());
      showTimer();
      if (!remaining) { stopTimer(); restStatus.textContent = '休息结束，可以开始下一组。'; }
    }, 250);
  });
  duration.addEventListener('change', resetTimer);
  $('#rest-reset').addEventListener('click', resetTimer);
  window.addEventListener('beforeunload', event => { if (dirty) { event.preventDefault(); event.returnValue = ''; } });
  window.gymJournal = {
    getRecords: () => records.map(row => ({ ...row })),
    getTemplates: () => JSON.parse(JSON.stringify(templates)),
    areTemplatesReady: () => templatesReady,
    validTemplate,
    appendTemplates: rows => {
      if (!templatesReady || !Array.isArray(rows) || !rows.every(validTemplate)) throw Error('模板格式无效或无法读取原模板。');
      const ids = new Set(templates.map(row => row.id));
      const added = rows.filter(row => { if (ids.has(row.id)) return false; ids.add(row.id); return true; });
      if (added.length && !persistTemplates([...templates, ...added])) throw Error('模板写入失败。');
      return added.length;
    },
    isStorageReady: () => storageReady,
    appendRecords: rows => {
      if (!Array.isArray(rows) || !rows.every(validRecord)) throw Error('导入记录格式无效。');
      const ids = new Set(records.map(row => row.id));
      const added = rows.filter(row => { if (ids.has(row.id)) return false; ids.add(row.id); return true; })
        .map(row => ({ ...row, exercise: row.exercise.trim() }));
      if (!added.length) return 0;
      if (!persist([...records, ...added])) throw Error('记录写入失败，请检查浏览器存储权限或空间。');
      renderHistory();
      return added.length;
    },
  };
})();
