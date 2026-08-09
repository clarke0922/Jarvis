import { afterAll, beforeEach, describe, expect, it } from 'vitest';
import request from 'supertest';
import { rm } from 'node:fs/promises';
import path from 'node:path';

const dataDir=path.resolve('.test-data'); process.env.JARVIS_DATA_DIR=dataDir;
const { app } = await import('../../server.js');

beforeEach(()=>rm(dataDir,{recursive:true,force:true}));
afterAll(()=>rm(dataDir,{recursive:true,force:true}));

describe('task API',()=>{
  it('creates, persists, filters, completes, and deletes a task',async()=>{
    const created=await request(app).post('/api/tasks').send({title:'Release',priority:'high',dueAt:'2026-08-09T10:00:00+08:00'}).expect(201);
    const id=created.body.task.id;
    expect((await request(app).get('/api/tasks?date=2026-08-09&priority=high').expect(200)).body.tasks).toHaveLength(1);
    expect((await request(app).put(`/api/tasks/${id}`).send({status:'completed'}).expect(200)).body.task.status).toBe('completed');
    await request(app).delete(`/api/tasks/${id}`).expect(200);
    expect((await request(app).get('/api/tasks').expect(200)).body.total).toBe(0);
  });
  it('rejects invalid data and reports missing resources',async()=>{
    await request(app).post('/api/tasks').send({title:'',priority:'urgent'}).expect(400);
    await request(app).post('/api/tasks').send({title:'x',dueAt:'2026-08-09T10:00'}).expect(400);
    await request(app).put('/api/tasks/missing').send({status:'completed'}).expect(404);
    await request(app).delete('/api/tasks/missing').expect(404);
  });
});

describe('event API',()=>{
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
