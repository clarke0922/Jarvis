import { afterAll, beforeEach, describe, expect, it } from 'vitest';
import request from 'supertest';
import { rm } from 'node:fs/promises';
import path from 'node:path';

const dataDir=path.resolve('.test-platform-data'); process.env.JARVIS_DATA_DIR=dataDir;
const { app }=await import('../../server.js');

beforeEach(()=>rm(dataDir,{recursive:true,force:true}));
afterAll(()=>rm(dataDir,{recursive:true,force:true}));

describe('platform API',()=>{
  it('reports health and saves clamped settings without exposing secrets',async()=>{
    expect((await request(app).get('/api/health').expect(200)).body.online).toBe(true);
    const saved=await request(app).put('/api/settings').send({provider:'openai-compatible',apiBaseUrl:'https://api.example.com/v1',providerApiKey:'secret-key',memoryLimit:999,ttsRate:-99}).expect(200);
    expect(saved.body.settings).toMatchObject({provider:'openai-compatible',memoryLimit:500,ttsRate:-30});
    expect(JSON.stringify((await request(app).get('/api/settings').expect(200)).body)).not.toContain('secret-key');
  });

  it('stores, searches, deduplicates, protects, and deletes memories',async()=>{
    const created=await request(app).post('/api/memories').send({content:'我喜欢深色界面',category:'preference'}).expect(201);
    expect((await request(app).post('/api/memories').send({content:'我喜欢深色界面',category:'preference'}).expect(200)).body.duplicate).toBe(true);
    expect((await request(app).get('/api/memories?query=深色').expect(200)).body.memories[0].id).toBe(created.body.memory.id);
    await request(app).post('/api/memories').send({content:'API key is sk-1234567890123456'}).expect(400);
    await request(app).delete(`/api/memories/${created.body.memory.id}`).expect(200);
    expect((await request(app).get('/api/memories').expect(200)).body.total).toBe(0);
  });

  it('handles reminders, recurring completion, brief, and ICS round-trip',async()=>{
    const created=(await request(app).post('/api/schedules').send({title:'周报',dueAt:'2026-08-30T09:00:00+08:00',repeat:'weekly',reminderMinutes:15,priority:'high'}).expect(201)).body.item;
    const advanced=(await request(app).put(`/api/schedules/${created.id}`).send({completed:true}).expect(200)).body.item;
    expect(advanced.completed).toBe(false); expect(advanced.dueAt).toBe('2026-09-06T01:00:00.000Z');
    expect((await request(app).get('/api/schedules/brief').expect(200)).body.summary.remaining).toBe(1);
    const exported=await request(app).get('/api/calendar/export').expect(200); expect(exported.text).toContain('RRULE:FREQ=WEEKLY');
    await request(app).post('/api/calendar/import').send({ics:'BEGIN:VCALENDAR\r\nBEGIN:VEVENT\r\nUID:external-1\r\nDTSTART:20260910T010000Z\r\nSUMMARY:Imported\r\nEND:VEVENT\r\nEND:VCALENDAR'}).expect(200);
    const duplicate=await request(app).post('/api/calendar/import').send({ics:'BEGIN:VEVENT\r\nUID:external-1\r\nDTSTART:20260910T010000Z\r\nSUMMARY:Imported\r\nEND:VEVENT'}).expect(200);
    expect(duplicate.body.imported).toBe(0);
  });

  it('creates, searches, updates, reads, and deletes workspaces',async()=>{
    const created=(await request(app).post('/api/workspaces').send({title:'发布计划',mode:'executor',messages:[{role:'user',content:'准备发布'}]}).expect(201)).body.item;
    expect((await request(app).get('/api/workspaces?query=发布').expect(200)).body.items[0].messageCount).toBe(1);
    await request(app).put(`/api/workspaces/${created.id}`).send({title:'新版发布计划'}).expect(200);
    expect((await request(app).get(`/api/workspaces/${created.id}`).expect(200)).body.item.title).toBe('新版发布计划');
    await request(app).delete(`/api/workspaces/${created.id}`).expect(200);
    await request(app).get(`/api/workspaces/${created.id}`).expect(404);
  });

  it('indexes Markdown and degrades safely without external services',async()=>{
    const uploaded=await request(app).post('/api/knowledge/upload').attach('file',Buffer.from('# 发布手册\n部署前运行全部自动化测试。'),'guide.md').expect(201);
    expect((await request(app).get('/api/knowledge/search?query=自动化测试').expect(200)).body.matches[0].source).toBe('guide.md');
    await request(app).delete(`/api/knowledge/${uploaded.body.item.id}`).expect(200);
    await request(app).post('/api/chat').send({messages:[{role:'user',content:'hello'}]}).expect(503);
    await request(app).put('/api/settings').send({ttsEnabled:false}).expect(200);
    await request(app).post('/api/tts').send({text:'test'}).expect(403);
  });
});
