import { dateKey, fromLocalInput, monthCells, toLocalInput } from './schedule-core.js';
import { getLanguage, locale } from './i18n.js';

let state = { selected: dateKey(new Date()), cursor: new Date(new Date().getFullYear(), new Date().getMonth(), 1), tasks: [], events: [], editing: null };
let root;
const t = (zh, en) => getLanguage() === 'en' ? en : zh;
const escape = value => String(value ?? '').replace(/[&<>"']/g, char => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' })[char]);

async function api(url, options) {
  const response = await fetch(url, options), data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.error || t('请求失败', 'Request failed'));
  return data;
}

function shell() {
  const section = document.createElement('section');
  section.id = 'taskCenter'; section.className = 'task-center'; section.setAttribute('aria-hidden', 'true');
  section.innerHTML = `<header><div><small>JARVIS // OPERATIONS</small><h1 data-center-title></h1></div><button type="button" data-close aria-label="Close">×</button></header><div class="planner-layout"><aside class="calendar-panel"><div class="calendar-nav"><button data-prev>‹</button><b data-month></b><button data-next>›</button></div><div class="weekdays"></div><div class="calendar-grid" data-calendar></div><div class="filters"><select data-status><option value="">${t('全部状态','All statuses')}</option><option value="pending">${t('待办','Pending')}</option><option value="completed">${t('已完成','Completed')}</option></select><select data-priority><option value="">${t('全部优先级','All priorities')}</option><option value="high">${t('高','High')}</option><option value="medium">${t('中','Medium')}</option><option value="low">${t('低','Low')}</option></select></div></aside><main class="agenda-panel"><div class="agenda-head"><div><small data-date></small><h2>${t('当日议程','Daily agenda')}</h2></div><div><button class="primary" data-new-task>+ ${t('任务','Task')}</button><button class="primary" data-new-event>+ ${t('日程','Event')}</button></div></div><div class="agenda-columns"><section><h3>${t('任务','Tasks')} <span data-task-count></span></h3><div data-tasks></div></section><section><h3>${t('日程','Events')} <span data-event-count></span></h3><div data-events></div></section></div></main></div><div class="editor" data-editor aria-hidden="true"><form><header><h2 data-form-title></h2><button type="button" data-cancel>×</button></header><label>${t('标题','Title')}<input name="title" maxlength="120" required></label><label>${t('备注','Notes')}<textarea name="notes" maxlength="1000"></textarea></label><div data-task-fields><label>${t('优先级','Priority')}<select name="priority"><option value="low">${t('低','Low')}</option><option value="medium" selected>${t('中','Medium')}</option><option value="high">${t('高','High')}</option></select></label><label>${t('截止时间','Due')}<input name="dueAt" type="datetime-local"></label></div><div data-event-fields><label>${t('开始','Start')}<input name="startAt" type="datetime-local"></label><label>${t('结束','End')}<input name="endAt" type="datetime-local"></label></div><p class="form-error" data-error></p><footer><button type="button" data-cancel>${t('取消','Cancel')}</button><button class="primary" type="submit">${t('保存','Save')}</button></footer></form></div>`;
  document.body.append(section); return section;
}

function renderCalendar() {
  root.querySelector('[data-month]').textContent = state.cursor.toLocaleDateString(locale(), { year:'numeric', month:'long' });
  root.querySelector('.weekdays').innerHTML = (getLanguage() === 'en' ? ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'] : ['一','二','三','四','五','六','日']).map(x => `<span>${x}</span>`).join('');
  root.querySelector('[data-calendar]').innerHTML = monthCells(state.cursor.getFullYear(), state.cursor.getMonth()).map(cell => `<button class="${cell.currentMonth?'':'muted'} ${cell.key===state.selected?'selected':''}" data-day="${cell.key}">${cell.date.getDate()}</button>`).join('');
}

function renderAgenda() {
  root.querySelector('[data-center-title]').textContent = t('任务与日程中心','Tasks & Schedule');
  root.querySelector('[data-date]').textContent = new Date(`${state.selected}T12:00:00`).toLocaleDateString(locale(), { weekday:'long', year:'numeric', month:'long', day:'numeric' });
  root.querySelector('[data-task-count]').textContent = state.tasks.length; root.querySelector('[data-event-count]').textContent = state.events.length;
  root.querySelector('[data-tasks]').innerHTML = state.tasks.length ? state.tasks.map(item => `<article class="agenda-card task-item ${item.status}"><button class="check" data-toggle-task="${item.id}" aria-label="toggle">${item.status==='completed'?'✓':''}</button><div><b>${escape(item.title)}</b><small>${t({high:'高优先级',medium:'中优先级',low:'低优先级'}[item.priority],{high:'High',medium:'Medium',low:'Low'}[item.priority])}${item.dueAt?' · '+new Date(item.dueAt).toLocaleTimeString(locale(),{hour:'2-digit',minute:'2-digit'}):''}</small><p>${escape(item.notes)}</p></div><nav><button data-edit-task="${item.id}">✎</button><button data-delete-task="${item.id}">×</button></nav></article>`).join('') : `<p class="empty-agenda">${t('当天没有任务','No tasks for this day')}</p>`;
  root.querySelector('[data-events]').innerHTML = state.events.length ? state.events.map(item => `<article class="agenda-card event-item"><i></i><div><b>${escape(item.title)}</b><small>${new Date(item.startAt).toLocaleTimeString(locale(),{hour:'2-digit',minute:'2-digit'})} – ${new Date(item.endAt).toLocaleTimeString(locale(),{hour:'2-digit',minute:'2-digit'})}</small><p>${escape(item.notes)}</p></div><nav><button data-edit-event="${item.id}">✎</button><button data-delete-event="${item.id}">×</button></nav></article>`).join('') : `<p class="empty-agenda">${t('当天没有日程','No events for this day')}</p>`;
}

async function load() {
  if (!root || !root.classList.contains('open')) return;
  const status = root.querySelector('[data-status]').value, priority = root.querySelector('[data-priority]').value;
  try {
    const [taskData, eventData] = await Promise.all([api(`/api/tasks?date=${state.selected}&status=${status}&priority=${priority}`), api(`/api/events?date=${state.selected}`)]);
    state.tasks = taskData.tasks; state.events = eventData.events; renderCalendar(); renderAgenda();
  } catch (error) { root.querySelector('[data-tasks]').innerHTML = `<p class="form-error">${escape(error.message)}</p>`; }
}

function openEditor(type, item = null) {
  state.editing = { type, item }; const editor = root.querySelector('[data-editor]'), form = editor.querySelector('form'); form.reset();
  editor.classList.add('open'); editor.setAttribute('aria-hidden','false'); editor.querySelector('[data-form-title]').textContent = item ? t('编辑','Edit') : type === 'task' ? t('新建任务','New task') : t('新建日程','New event');
  editor.querySelector('[data-task-fields]').hidden = type !== 'task'; editor.querySelector('[data-event-fields]').hidden = type !== 'event'; editor.querySelector('[data-error]').textContent = '';
  form.title.value = item?.title || ''; form.notes.value = item?.notes || '';
  if (type === 'task') { form.priority.value = item?.priority || 'medium'; form.dueAt.value = toLocalInput(item?.dueAt) || `${state.selected}T09:00`; }
  else { form.startAt.value = toLocalInput(item?.startAt) || `${state.selected}T09:00`; form.endAt.value = toLocalInput(item?.endAt) || `${state.selected}T10:00`; }
}

async function submit(event) {
  event.preventDefault(); const form = event.currentTarget, { type, item } = state.editing, body = { title:form.title.value, notes:form.notes.value };
  if (type === 'task') Object.assign(body, { priority:form.priority.value, dueAt:fromLocalInput(form.dueAt.value) });
  else Object.assign(body, { startAt:fromLocalInput(form.startAt.value), endAt:fromLocalInput(form.endAt.value) });
  try {
    const data = await api(`/api/${type==='task'?'tasks':'events'}${item?`/${item.id}`:''}`, { method:item?'PUT':'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify(body) });
    root.querySelector('[data-editor]').classList.remove('open');
    if (data.conflicts?.length) alert(t(`已保存，与 ${data.conflicts.length} 项日程冲突`,`Saved with ${data.conflicts.length} conflict(s)`));
    await load();
  } catch (error) { root.querySelector('[data-error]').textContent = error.message; }
}

async function action(event) {
  const button = event.target.closest('button'); if (!button) return;
  if (button.dataset.day) { state.selected = button.dataset.day; return load(); }
  if (button.hasAttribute('data-new-task')) return openEditor('task'); if (button.hasAttribute('data-new-event')) return openEditor('event');
  for (const type of ['task','event']) {
    const suffix=type[0].toUpperCase()+type.slice(1), editId=button.dataset[`edit${suffix}`], deleteId=button.dataset[`delete${suffix}`];
    if (editId) return openEditor(type, state[`${type}s`].find(x=>x.id===editId));
    if (deleteId && confirm(t(`确定删除这项${type==='task'?'任务':'日程'}吗？`,`Delete this ${type}?`))) { await api(`/api/${type}s/${deleteId}`,{method:'DELETE'}); return load(); }
  }
  if (button.dataset.toggleTask) { const item=state.tasks.find(x=>x.id===button.dataset.toggleTask); await api(`/api/tasks/${item.id}`,{method:'PUT',headers:{'Content-Type':'application/json'},body:JSON.stringify({status:item.status==='completed'?'pending':'completed'})}); return load(); }
}

export function initTaskCenter(trigger) {
  root = document.querySelector('#taskCenter') || shell();
  trigger.addEventListener('click', () => { root.classList.add('open'); root.setAttribute('aria-hidden','false'); load(); });
  root.querySelector('[data-close]').onclick=()=>{root.classList.remove('open');root.setAttribute('aria-hidden','true')};
  root.querySelectorAll('[data-cancel]').forEach(x=>x.onclick=()=>root.querySelector('[data-editor]').classList.remove('open'));
  root.querySelector('[data-prev]').onclick=()=>{state.cursor=new Date(state.cursor.getFullYear(),state.cursor.getMonth()-1,1);renderCalendar()};
  root.querySelector('[data-next]').onclick=()=>{state.cursor=new Date(state.cursor.getFullYear(),state.cursor.getMonth()+1,1);renderCalendar()};
  root.querySelector('[data-status]').onchange=load; root.querySelector('[data-priority]').onchange=load; root.addEventListener('click',action); root.querySelector('form').addEventListener('submit',submit);
  window.addEventListener('jarvis:languagechange',()=>{renderCalendar();renderAgenda()}); renderCalendar(); renderAgenda();
}

export function refreshTaskCenter() { return load(); }
