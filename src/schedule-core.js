export const TASK_STATUSES = ['pending', 'completed'];
export const TASK_PRIORITIES = ['low', 'medium', 'high'];

export function parseIso(value, required = false) {
  if ((value === undefined || value === null || value === '') && !required) return null;
  if (typeof value !== 'string' || !/(Z|[+-]\d{2}:\d{2})$/.test(value)) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date.toISOString();
}

export function validateTask(input, current = {}) {
  const title = String(input.title ?? current.title ?? '').trim().slice(0, 120);
  const notes = String(input.notes ?? current.notes ?? '').trim().slice(0, 1000);
  const status = input.status ?? current.status ?? 'pending';
  const priority = input.priority ?? current.priority ?? 'medium';
  const rawDueAt = input.dueAt === undefined ? current.dueAt ?? null : input.dueAt;
  const dueAt = rawDueAt ? parseIso(rawDueAt) : null;
  if (!title) return { error: '任务标题不能为空' };
  if (!TASK_STATUSES.includes(status)) return { error: '任务状态无效' };
  if (!TASK_PRIORITIES.includes(priority)) return { error: '任务优先级无效' };
  if (rawDueAt && !dueAt) return { error: '截止时间必须是带时区的 ISO 时间' };
  return { value: { title, notes, status, priority, dueAt } };
}

export function validateEvent(input, current = {}) {
  const title = String(input.title ?? current.title ?? '').trim().slice(0, 120);
  const notes = String(input.notes ?? current.notes ?? '').trim().slice(0, 1000);
  const startAt = parseIso(input.startAt ?? current.startAt, true);
  const endAt = parseIso(input.endAt ?? current.endAt, true);
  if (!title) return { error: '日程标题不能为空' };
  if (!startAt || !endAt) return { error: '开始和结束时间必须是带时区的 ISO 时间' };
  if (new Date(startAt) >= new Date(endAt)) return { error: '结束时间必须晚于开始时间' };
  return { value: { title, notes, startAt, endAt } };
}

export function overlaps(a, b) {
  return new Date(a.startAt) < new Date(b.endAt) && new Date(b.startAt) < new Date(a.endAt);
}

export function findConflicts(candidate, events, excludeId = null) {
  return events.filter(event => event.id !== excludeId && overlaps(candidate, event));
}

export function dateKey(value) {
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

export function filterTasks(tasks, { date, status, priority } = {}) {
  return tasks.filter(task => (!date || (task.dueAt && dateKey(task.dueAt) === date)) && (!status || task.status === status) && (!priority || task.priority === priority));
}

export function monthCells(year, month, weekStartsOn = 1) {
  const first = new Date(year, month, 1);
  const offset = (first.getDay() - weekStartsOn + 7) % 7;
  const start = new Date(year, month, 1 - offset);
  return Array.from({ length: 42 }, (_, index) => {
    const value = new Date(start);
    value.setDate(start.getDate() + index);
    return { date: value, key: dateKey(value), currentMonth: value.getMonth() === month };
  });
}

export function toLocalInput(value) {
  if (!value) return '';
  const date = new Date(value);
  const shifted = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
  return shifted.toISOString().slice(0, 16);
}

export function fromLocalInput(value) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date.toISOString();
}
