import { describe, expect, it } from 'vitest';
import { dateKey, filterTasks, findConflicts, fromLocalInput, monthCells, parseIso, toLocalInput, validateEvent, validateTask } from '../../src/schedule-core.js';

describe('schedule core', () => {
  it('validates task fields and enums', () => {
    expect(validateTask({ title:'  Ship release  ', priority:'high', dueAt:'2026-08-09T10:00:00+08:00' }).value).toMatchObject({ title:'Ship release', priority:'high', status:'pending', dueAt:'2026-08-09T02:00:00.000Z' });
    expect(validateTask({ title:' ' }).error).toContain('标题');
    expect(validateTask({ title:'x', priority:'urgent' }).error).toContain('优先级');
    expect(parseIso('2026-08-09T10:00:00')).toBeNull();
  });

  it('validates event order and timezone', () => {
    expect(validateEvent({ title:'Meeting', startAt:'2026-08-09T10:00:00+08:00', endAt:'2026-08-09T11:00:00+08:00' }).value.title).toBe('Meeting');
    expect(validateEvent({ title:'Meeting', startAt:'2026-08-09T11:00:00+08:00', endAt:'2026-08-09T10:00:00+08:00' }).error).toContain('晚于');
  });

  it('detects overlap but permits adjacent events and excludes self', () => {
    const events=[{id:'a',startAt:'2026-08-09T01:00:00Z',endAt:'2026-08-09T02:00:00Z'}];
    expect(findConflicts({startAt:'2026-08-09T01:30:00Z',endAt:'2026-08-09T02:30:00Z'},events)).toHaveLength(1);
    expect(findConflicts({startAt:'2026-08-09T02:00:00Z',endAt:'2026-08-09T03:00:00Z'},events)).toHaveLength(0);
    expect(findConflicts(events[0],events,'a')).toHaveLength(0);
  });

  it('filters tasks and builds a Monday-first six-week month', () => {
    const tasks=[{status:'pending',priority:'high',dueAt:'2026-08-09T04:00:00Z'},{status:'completed',priority:'low',dueAt:null}];
    expect(filterTasks(tasks,{date:dateKey(new Date('2026-08-09T12:00:00')),status:'pending',priority:'high'})).toHaveLength(1);
    const cells=monthCells(2026,7); expect(cells).toHaveLength(42); expect(cells[0].date.getDay()).toBe(1);
  });

  it('round-trips local datetime controls', () => {
    const iso=fromLocalInput('2026-08-09T10:30'); expect(toLocalInput(iso)).toBe('2026-08-09T10:30');
  });
});
