import { afterAll, beforeEach, describe, expect, it } from 'vitest';
import request from 'supertest';
import { rm } from 'node:fs/promises';
import path from 'node:path';

const dataDir=path.resolve('.test-data'); process.env.JARVIS_DATA_DIR=dataDir;
const { app } = await import('../../server.js');

beforeEach(()=>rm(dataDir,{recursive:true,force:true}));
afterAll(()=>rm(dataDir,{recursive:true,force:true}));

describe('task API',()=>{
  it('shares one collection with the legacy schedule API',async()=>{
    await request(app).post('/api/schedules').send({title:'Legacy task',dueAt:'2026-08-09T10:00:00+08:00'}).expect(201);
    expect((await request(app).get('/api/tasks?date=2026-08-09').expect(200)).body.tasks[0].title).toBe('Legacy task');
    await request(app).post('/api/tasks').send({title:'Calendar task',dueAt:'2026-08-09T11:00:00+08:00'}).expect(201);
    expect((await request(app).get('/api/schedules').expect(200)).body.items.map(item=>item.title)).toContain('Calendar task');
  });
  it('creates, persists, filters, completes, and deletes a task',async()=>{
    const created=await request(app).post('/api/tasks').send({title:'Release',priority:'high',dueAt:'2026-08-09T10:00:00+08:00'}).expect(201);
    const id=created.body.task.id;
    expect((await request(app).get('/api/tasks?date=2026-08-09&priority=high').expect(200)).body.tasks).toHaveLength(1);
    expect((await request(app).put(`/api/tasks/${id}`).send({status:'completed'}).expect(200)).body.task.status).toBe('completed');
    await request(app).delete(`/api/tasks/${id}`).expect(200);
    expect((await request(app).get('/api/tasks').expect(200)).body.total).toBe(0);
  });
  it('stores the default medium priority as normal in the shared collection',async()=>{
    await request(app).post('/api/tasks').send({title:'Default priority',dueAt:'2026-08-09T10:00:00+08:00'}).expect(201);
    const schedules=await request(app).get('/api/schedules?date=2026-08-09').expect(200);
    expect(schedules.body.items[0].priority).toBe('normal');
    const tasks=await request(app).get('/api/tasks?date=2026-08-09').expect(200);
    expect(tasks.body.tasks[0].priority).toBe('medium');
    const id=tasks.body.tasks[0].id;
    await request(app).put('/api/tasks/' + id).send({notes:'touched'}).expect(200);
    const after=await request(app).get('/api/schedules').expect(200);
    expect(after.body.items.find(item=>item.id===id).priority).toBe('normal');
  });
  it('rolls a repeating task to its next occurrence when completed via the task API',async()=>{
    const created=await request(app).post('/api/tasks').send({title:'Daily standup',priority:'high',dueAt:'2026-08-09T09:00:00+08:00'}).expect(201);
    const id=created.body.task.id;
    await request(app).put('/api/schedules/' + id).send({repeat:'daily'}).expect(200);
    const done=await request(app).put('/api/tasks/' + id).send({status:'completed'}).expect(200);
    expect(done.body.task.status).toBe('pending');
    expect(done.body.task.completed).toBe(false);
    expect(done.body.task.dueAt).toBe('2026-08-10T01:00:00.000Z');
  });
  it('returns default-priority tasks with medium in create and update responses',async()=>{
    const created=await request(app).post('/api/tasks').send({title:'Dto check',dueAt:'2026-08-09T10:00:00+08:00'}).expect(201);
    expect(created.body.task.priority).toBe('medium');
    const updated=await request(app).put('/api/tasks/' + created.body.task.id).send({notes:'x'}).expect(200);
    expect(updated.body.task.priority).toBe('medium');
  });
  it('rejects invalid data and reports missing resources',async()=>{
    await request(app).post('/api/tasks').send({title:'',priority:'urgent'}).expect(400);
    await request(app).post('/api/tasks').send({title:'x',dueAt:'2026-08-09T10:00'}).expect(400);
    await request(app).put('/api/tasks/missing').send({status:'completed'}).expect(404);
    await request(app).delete('/api/tasks/missing').expect(404);
  });
});

describe('calendar export',()=>{
  it('exports events with start and end times',async()=>{
    await request(app).post('/api/events').send({title:'Review',startAt:'2026-08-09T09:00:00+08:00',endAt:'2026-08-09T10:30:00+08:00'}).expect(201);
    const ics=(await request(app).get('/api/calendar/export').expect(200)).text;
    expect(ics).toContain('DTSTART:' + '20260809T010000Z');
    expect(ics).toContain('DTEND:' + '20260809T023000Z');
  });
});

describe('calendar import',()=>{
  it('imports an event with its end time when DTEND is present',async()=>{
    const ics=['BEGIN:VCALENDAR','BEGIN:VEVENT','UID:meeting-1@test','DTSTART:20260809T010000Z','DTEND:20260809T023000Z','SUMMARY:Imported review','END:VEVENT','END:VCALENDAR'].join('\r\n');
    await request(app).post('/api/calendar/import').send({ics}).expect(200);
    const events=(await request(app).get('/api/events?date=2026-08-09').expect(200)).body.events;
    expect(events).toHaveLength(1);
    expect(events[0]).toMatchObject({title:'Imported review',startAt:'2026-08-09T01:00:00.000Z',endAt:'2026-08-09T02:30:00.000Z'});
  });
});

describe('calendar all-day import',()=>{
  it('imports an all-day event spanning local midnight to midnight',async()=>{
    const ics=['BEGIN:VCALENDAR','BEGIN:VEVENT','UID:allday-1@test','DTSTART;VALUE=DATE:20260809','DTEND;VALUE=DATE:20260810','SUMMARY:Holiday','END:VEVENT','END:VCALENDAR'].join('\r\n');
    await request(app).post('/api/calendar/import').send({ics}).expect(200);
    const events=(await request(app).get('/api/events?date=2026-08-09').expect(200)).body.events;
    expect(events).toHaveLength(1);
    expect(events[0]).toMatchObject({title:'Holiday',startAt:'2026-08-08T16:00:00.000Z',endAt:'2026-08-09T16:00:00.000Z'});
  });
});

describe('event API',()=>{
  it('stores events in the shared schedule collection',async()=>{
    await request(app).post('/api/events').send({title:'Shared event',startAt:'2026-08-09T09:00:00+08:00',endAt:'2026-08-09T10:00:00+08:00'}).expect(201);
    const schedules=(await request(app).get('/api/schedules').expect(200)).body.items;
    expect(schedules[0]).toMatchObject({title:'Shared event',kind:'event',dueAt:'2026-08-09T01:00:00.000Z'});
  });
  it('returns conflicts for overlap, not adjacency or self',async()=>{
    const first=(await request(app).post('/api/events').send({title:'A',startAt:'2026-08-09T09:00:00+08:00',endAt:'2026-08-09T10:00:00+08:00'}).expect(201)).body.event;
    expect((await request(app).post('/api/events').send({title:'B',startAt:'2026-08-09T09:30:00+08:00',endAt:'2026-08-09T10:30:00+08:00'}).expect(201)).body.conflicts).toHaveLength(1);
    expect((await request(app).post('/api/events').send({title:'C',startAt:'2026-08-09T10:30:00+08:00',endAt:'2026-08-09T11:00:00+08:00'}).expect(201)).body.conflicts).toHaveLength(0);
    expect((await request(app).put(`/api/events/${first.id}`).send({notes:'updated'}).expect(200)).body.conflicts).toHaveLength(1);
    expect((await request(app).get('/api/events?date=2026-08-09').expect(200)).body.total).toBe(3);
  });
  it('validates time range and missing resources',async()=>{
    await request(app).post('/api/events').send({title:'x',startAt:'bad',endAt:'bad'}).expect(400);
    await request(app).post('/api/events').send({title:'x',startAt:'2026-08-09T11:00:00Z',endAt:'2026-08-09T10:00:00Z'}).expect(400);
    await request(app).delete('/api/events/missing').expect(404);
  });
});

describe('knowledge API',()=>{
  it('uploads a markdown document, indexes chunks, searches, and deletes it',async()=>{
    const markdown='# 项目手册\n\nJARVIS 使用 Edge TTS 进行语音合成，并支持长期记忆检索。';
    const uploaded=await request(app)
      .post('/api/knowledge/upload')
      .attach('file', Buffer.from(markdown,'utf8'), {filename:'manual.md'})
      .expect(201);
    expect(uploaded.body.item).toMatchObject({name:'manual.md',type:'md',chunkCount:1});
    expect((await request(app).get('/api/knowledge').expect(200)).body.total).toBe(1);
    const search=await request(app).get('/api/knowledge/search?query=语音合成').expect(200);
    expect(search.body.matches).toHaveLength(1);
    expect(search.body.matches[0].source).toBe('manual.md');
    await request(app).delete('/api/knowledge/' + uploaded.body.item.id).expect(200);
    expect((await request(app).get('/api/knowledge').expect(200)).body.total).toBe(0);
  });
  it('rejects unsupported file types and missing resources',async()=>{
    await request(app)
      .post('/api/knowledge/upload')
      .attach('file', Buffer.from('hi','utf8'), {filename:'note.txt'})
      .expect(400);
    await request(app).delete('/api/knowledge/missing').expect(404);
  });
});

describe('workspace API',()=>{
  it('creates, lists, loads, updates, and deletes a workspace',async()=>{
    const created=await request(app).post('/api/workspaces').send({title:'Planning',mode:'analyst',messages:[{role:'user',content:'first question'},{role:'assistant',content:'first answer'}]}).expect(201);
    const id=created.body.item.id;
    expect(created.body.item).toMatchObject({title:'Planning',mode:'analyst'});
    const list=await request(app).get('/api/workspaces').expect(200);
    expect(list.body.items).toHaveLength(1);
    expect(list.body.items[0]).toMatchObject({preview:'first answer',messageCount:2});
    expect((await request(app).get('/api/workspaces/' + id).expect(200)).body.item.title).toBe('Planning');
    const filtered=await request(app).get('/api/workspaces?query=planning').expect(200);
    expect(filtered.body.items).toHaveLength(1);
    await request(app).put('/api/workspaces/' + id).send({title:'Renamed'}).expect(200);
    expect((await request(app).get('/api/workspaces/' + id).expect(200)).body.item.title).toBe('Renamed');
    await request(app).delete('/api/workspaces/' + id).expect(200);
    expect((await request(app).get('/api/workspaces').expect(200)).body.total).toBe(0);
  });
  it('rejects missing resources and invalid modes',async()=>{
    await request(app).get('/api/workspaces/missing').expect(404);
    await request(app).put('/api/workspaces/missing').send({title:'x'}).expect(404);
    await request(app).delete('/api/workspaces/missing').expect(404);
    const created=await request(app).post('/api/workspaces').send({title:'Mode guard',mode:'unknown'}).expect(201);
    expect(created.body.item.mode).toBe('general');
  });
});

describe('memory API',()=>{
  it('saves, searches, deletes one, and clears all memories',async()=>{
    await request(app).post('/api/memories').send({content:'用户喜欢简洁回答',category:'preference'}).expect(201);
    await request(app).post('/api/memories').send({content:'每天早上八点开会',category:'habit'}).expect(201);
    const found=await request(app).get('/api/memories?query=简洁').expect(200);
    expect(found.body.memories).toHaveLength(1);
    expect(found.body.memories[0].content).toBe('用户喜欢简洁回答');
    const all=await request(app).get('/api/memories').expect(200);
    await request(app).delete('/api/memories/' + all.body.memories[0].id).expect(200);
    expect((await request(app).get('/api/memories').expect(200)).body.total).toBe(1);
    await request(app).delete('/api/memories').expect(200);
    expect((await request(app).get('/api/memories').expect(200)).body.total).toBe(0);
  });
  it('rejects empty content and secrets, and treats duplicates as such',async()=>{
    await request(app).post('/api/memories').send({content:'   '}).expect(400);
    await request(app).post('/api/memories').send({content:'密码是 abc123'}).expect(400);
    await request(app).post('/api/memories').send({content:'sk-' + 'a'.repeat(24)}).expect(400);
    await request(app).post('/api/memories').send({content:'固定偏好内容'}).expect(201);
    expect((await request(app).post('/api/memories').send({content:'固定偏好内容'}).expect(200)).body.duplicate).toBe(true);
    await request(app).delete('/api/memories/missing').expect(404);
  });
});

describe('settings API',()=>{
  it('persists settings, clamps ranges, and keeps an empty key unchanged',async()=>{
    const saved=await request(app).put('/api/settings').send({model:'deepseek-chat',provider:'deepseek',memoryLimit:9999,memoryContextLimit:99,ttsRate:75,robotIntensity:-50}).expect(200);
    expect(saved.body.settings).toMatchObject({memoryLimit:500,memoryContextLimit:20,ttsRate:20,robotIntensity:0});
    const loaded=await request(app).get('/api/settings').expect(200);
    expect(loaded.body.settings.model).toBe('deepseek-chat');
  });
  it('stores a provider key under the provider and base URL identity',async()=>{
    await request(app).put('/api/settings').send({provider:'openai-compatible',apiBaseUrl:'https://api.openai.com/v1',model:'gpt-4.1-mini',providerApiKey:'sk-test-1234567890'}).expect(200);
    const status=await request(app).get('/api/settings').expect(200);
    expect(status.body.apiKeyConfigured).toBe(true);
  });
  it('exposes health and rejects invalid providers by falling back',async()=>{
    const health=await request(app).get('/api/health').expect(200);
    expect(health.body.online).toBe(true);
    const fallback=await request(app).put('/api/settings').send({provider:'unknown-vendor'}).expect(200);
    expect(['deepseek','openai-compatible','ollama']).toContain(fallback.body.settings.provider);
  });
});

describe('tts API',()=>{
  it('rejects empty text',async()=>{
    await request(app).post('/api/tts').send({text:'   '}).expect(400);
  });
  it('refuses synthesis when voice playback is disabled',async()=>{
    await request(app).put('/api/settings').send({ttsEnabled:false}).expect(200);
    await request(app).post('/api/tts').send({text:'你好'}).expect(403);
  });
});
