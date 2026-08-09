import express from 'express';
import dotenv from 'dotenv';
import { EdgeTTS } from 'edge-tts-universal';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { filterTasks, findConflicts, validateEvent, validateTask } from './src/schedule-core.js';

dotenv.config();
const app = express();
const port = Number(process.env.PORT || 3001);
const memoryDir = path.resolve(process.env.JARVIS_DATA_DIR || 'data');
const memoryFile = path.join(memoryDir, 'memories.json');
const settingsFile = path.join(memoryDir, 'settings.json');
const tasksFile = path.join(memoryDir, 'tasks.json');
const eventsFile = path.join(memoryDir, 'events.json');
const defaultSettings = {
  model: process.env.DEEPSEEK_MODEL || 'deepseek-v4-flash',
  memoryEnabled: true,
  autoMemory: true,
  memoryLimit: 200,
  memoryContextLimit: 8,
  ttsEnabled: true,
  ttsVoice: 'zh-CN-YunxiNeural',
  ttsRate: -10,
  ttsPitch: -18,
  robotIntensity: 55
};

async function readSettings() {
  try { return { ...defaultSettings, ...JSON.parse(await readFile(settingsFile, 'utf8')) }; }
  catch (error) { if (error.code === 'ENOENT') return { ...defaultSettings }; throw error; }
}

async function writeSettings(input) {
  const current = await readSettings();
  const allowedModels = ['deepseek-v4-flash', 'deepseek-v4-pro'];
  const allowedVoices = ['zh-CN-YunxiNeural', 'zh-CN-YunyangNeural', 'zh-CN-XiaoxiaoNeural'];
  const next = {
    ...current,
    model: allowedModels.includes(input.model) ? input.model : current.model,
    memoryEnabled: input.memoryEnabled === undefined ? current.memoryEnabled : Boolean(input.memoryEnabled),
    autoMemory: input.autoMemory === undefined ? current.autoMemory : Boolean(input.autoMemory),
    memoryLimit: Math.max(20, Math.min(500, Number(input.memoryLimit ?? current.memoryLimit))),
    memoryContextLimit: Math.max(1, Math.min(20, Number(input.memoryContextLimit ?? current.memoryContextLimit))),
    ttsEnabled: input.ttsEnabled === undefined ? current.ttsEnabled : Boolean(input.ttsEnabled),
    ttsVoice: allowedVoices.includes(input.ttsVoice) ? input.ttsVoice : current.ttsVoice,
    ttsRate: Math.max(-30, Math.min(20, Number(input.ttsRate ?? current.ttsRate))),
    ttsPitch: Math.max(-30, Math.min(20, Number(input.ttsPitch ?? current.ttsPitch))),
    robotIntensity: Math.max(0, Math.min(100, Number(input.robotIntensity ?? current.robotIntensity)))
  };
  await mkdir(memoryDir, { recursive: true }); await writeFile(settingsFile, JSON.stringify(next, null, 2), 'utf8'); return next;
}

async function readMemories() {
  try { return JSON.parse(await readFile(memoryFile, 'utf8')); }
  catch (error) { if (error.code === 'ENOENT') return []; throw error; }
}

async function writeMemories(memories) {
  await mkdir(memoryDir, { recursive: true });
  await writeFile(memoryFile, JSON.stringify(memories, null, 2), 'utf8');
}

async function readCollection(file) {
  try {
    const value = JSON.parse(await readFile(file, 'utf8'));
    return Array.isArray(value) ? value : [];
  } catch (error) {
    if (error.code === 'ENOENT') return [];
    throw error;
  }
}

async function writeCollection(file, value) {
  await mkdir(memoryDir, { recursive: true });
  await writeFile(file, JSON.stringify(value, null, 2), 'utf8');
}

function memoryScore(memory, query) {
  const normalized = String(query).toLowerCase();
  const words = normalized.match(/[a-z0-9]{2,}/g) || [];
  const cjk = normalized.match(/[\u3400-\u9fff]/g) || [];
  const terms = [...new Set([...words, ...cjk.map((char, index) => char + (cjk[index + 1] || '')).filter(term => term.length > 1)])];
  const text = `${memory.content} ${memory.category}`.toLowerCase();
  return terms.reduce((score, term) => score + (text.includes(term) ? 2 : 0), 0) + (memory.pinned ? 1 : 0);
}

app.use(express.json({ limit: '64kb' }));
app.use(express.static('dist'));

app.post('/api/chat', async (req, res) => {
  if (!process.env.DEEPSEEK_API_KEY) {
    return res.status(503).json({ error: '尚未配置 DEEPSEEK_API_KEY', demo: true });
  }
  try {
    const settings = await readSettings();
    const messages = Array.isArray(req.body.messages) ? req.body.messages.slice(-30) : [];
    const response = await fetch('https://api.deepseek.com/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.DEEPSEEK_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: settings.model,
        messages,
        thinking: { type: 'disabled' },
        max_tokens: 800,
        tools: req.body.tools || undefined,
        tool_choice: req.body.tools ? 'auto' : undefined
      })
    });
    const data = await response.json();
    if (!response.ok) return res.status(response.status).json(data);
    res.json(data);
  } catch (error) {
    res.status(502).json({ error: '无法连接 DeepSeek 服务', detail: error.message });
  }
});

app.get('/api/health', (_req, res) => res.json({
  online: true,
  voiceConfigured: Boolean(process.env.DEEPSEEK_API_KEY),
  provider: 'DeepSeek',
  time: new Date().toISOString()
}));

app.get('/api/settings', async (_req, res) => {
  try { res.json({ settings: await readSettings(), apiKeyConfigured: Boolean(process.env.DEEPSEEK_API_KEY) }); }
  catch (error) { res.status(500).json({ error: '读取设置失败', detail: error.message }); }
});

app.put('/api/settings', async (req, res) => {
  try { res.json({ settings: await writeSettings(req.body || {}) }); }
  catch (error) { res.status(500).json({ error: '保存设置失败', detail: error.message }); }
});

app.get('/api/memories', async (req, res) => {
  try {
    const memories = await readMemories();
    const query = String(req.query.query || '').trim();
    const ranked = query ? memories.map(memory => ({ memory, score: memoryScore(memory, query) })).filter(item => item.score > 0).sort((a, b) => b.score - a.score).map(item => item.memory) : memories.slice().reverse();
    const requestedLimit = Math.max(1, Math.min(50, Number(req.query.limit || 12)));
    res.json({ memories: ranked.slice(0, requestedLimit), total: memories.length });
  } catch (error) { res.status(500).json({ error: '读取记忆失败', detail: error.message }); }
});

app.post('/api/memories', async (req, res) => {
  try {
    const content = String(req.body?.content || '').trim().slice(0, 500);
    const category = String(req.body?.category || 'general').trim().slice(0, 30);
    if (!content) return res.status(400).json({ error: '记忆内容不能为空' });
    if (/\b(sk-[a-z0-9]{16,}|password|api[_ -]?key)\b/i.test(content) || /密码|密钥|验证码|支付口令/.test(content)) return res.status(400).json({ error: '出于安全考虑，不能记忆密码或密钥' });
    const memories = await readMemories();
    const duplicate = memories.find(memory => memory.content.toLowerCase() === content.toLowerCase());
    if (duplicate) return res.json({ memory: duplicate, duplicate: true, total: memories.length });
    const memory = { id: crypto.randomUUID(), content, category, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
    const settings = await readSettings();
    if (!settings.memoryEnabled) return res.status(403).json({ error: '长期记忆已在设置中关闭' });
    memories.push(memory); await writeMemories(memories.slice(-settings.memoryLimit));
    res.status(201).json({ memory, total: Math.min(memories.length, settings.memoryLimit) });
  } catch (error) { res.status(500).json({ error: '保存记忆失败', detail: error.message }); }
});

app.delete('/api/memories/:id', async (req, res) => {
  try {
    const memories = await readMemories();
    const next = memories.filter(memory => memory.id !== req.params.id);
    if (next.length === memories.length) return res.status(404).json({ error: '没有找到这条记忆' });
    await writeMemories(next); res.json({ deleted: true, total: next.length });
  } catch (error) { res.status(500).json({ error: '删除记忆失败', detail: error.message }); }
});

app.delete('/api/memories', async (_req, res) => {
  try { await writeMemories([]); res.json({ deleted: true, total: 0 }); }
  catch (error) { res.status(500).json({ error: '清空记忆失败', detail: error.message }); }
});

app.get('/api/tasks', async (req, res) => {
  try {
    const tasks = filterTasks(await readCollection(tasksFile), req.query);
    res.json({ tasks: tasks.sort((a, b) => String(a.dueAt || '').localeCompare(String(b.dueAt || ''))), total: tasks.length });
  } catch (error) { res.status(500).json({ error: '读取任务失败', detail: error.message }); }
});

app.post('/api/tasks', async (req, res) => {
  try {
    const parsed = validateTask(req.body || {});
    if (parsed.error) return res.status(400).json({ error: parsed.error });
    const tasks = await readCollection(tasksFile);
    const now = new Date().toISOString();
    const task = { id: crypto.randomUUID(), ...parsed.value, createdAt: now, updatedAt: now };
    tasks.push(task); await writeCollection(tasksFile, tasks);
    res.status(201).json({ task });
  } catch (error) { res.status(500).json({ error: '保存任务失败', detail: error.message }); }
});

app.put('/api/tasks/:id', async (req, res) => {
  try {
    const tasks = await readCollection(tasksFile), index = tasks.findIndex(item => item.id === req.params.id);
    if (index < 0) return res.status(404).json({ error: '没有找到该任务' });
    const parsed = validateTask(req.body || {}, tasks[index]);
    if (parsed.error) return res.status(400).json({ error: parsed.error });
    tasks[index] = { ...tasks[index], ...parsed.value, updatedAt: new Date().toISOString() };
    await writeCollection(tasksFile, tasks); res.json({ task: tasks[index] });
  } catch (error) { res.status(500).json({ error: '更新任务失败', detail: error.message }); }
});

app.delete('/api/tasks/:id', async (req, res) => {
  try {
    const tasks = await readCollection(tasksFile), next = tasks.filter(item => item.id !== req.params.id);
    if (next.length === tasks.length) return res.status(404).json({ error: '没有找到该任务' });
    await writeCollection(tasksFile, next); res.json({ deleted: true, total: next.length });
  } catch (error) { res.status(500).json({ error: '删除任务失败', detail: error.message }); }
});

app.get('/api/events', async (req, res) => {
  try {
    const date = String(req.query.date || '');
    let events = await readCollection(eventsFile);
    if (date) events = events.filter(event => {
      const start = new Date(`${date}T00:00:00`), end = new Date(start); end.setDate(end.getDate() + 1);
      return new Date(event.startAt) < end && new Date(event.endAt) > start;
    });
    events.sort((a, b) => a.startAt.localeCompare(b.startAt));
    res.json({ events, total: events.length });
  } catch (error) { res.status(500).json({ error: '读取日程失败', detail: error.message }); }
});

app.post('/api/events', async (req, res) => {
  try {
    const parsed = validateEvent(req.body || {});
    if (parsed.error) return res.status(400).json({ error: parsed.error });
    const events = await readCollection(eventsFile), now = new Date().toISOString();
    const event = { id: crypto.randomUUID(), ...parsed.value, createdAt: now, updatedAt: now };
    const conflicts = findConflicts(event, events);
    events.push(event); await writeCollection(eventsFile, events);
    res.status(201).json({ event, conflicts });
  } catch (error) { res.status(500).json({ error: '保存日程失败', detail: error.message }); }
});

app.put('/api/events/:id', async (req, res) => {
  try {
    const events = await readCollection(eventsFile), index = events.findIndex(item => item.id === req.params.id);
    if (index < 0) return res.status(404).json({ error: '没有找到该日程' });
    const parsed = validateEvent(req.body || {}, events[index]);
    if (parsed.error) return res.status(400).json({ error: parsed.error });
    events[index] = { ...events[index], ...parsed.value, updatedAt: new Date().toISOString() };
    const conflicts = findConflicts(events[index], events, events[index].id);
    await writeCollection(eventsFile, events); res.json({ event: events[index], conflicts });
  } catch (error) { res.status(500).json({ error: '更新日程失败', detail: error.message }); }
});

app.delete('/api/events/:id', async (req, res) => {
  try {
    const events = await readCollection(eventsFile), next = events.filter(item => item.id !== req.params.id);
    if (next.length === events.length) return res.status(404).json({ error: '没有找到该日程' });
    await writeCollection(eventsFile, next); res.json({ deleted: true, total: next.length });
  } catch (error) { res.status(500).json({ error: '删除日程失败', detail: error.message }); }
});

app.post('/api/tts', async (req, res) => {
  const text = String(req.body?.text || '').trim().slice(0, 1200);
  if (!text) return res.status(400).json({ error: '缺少需要播报的文本' });
  try {
    const settings = await readSettings();
    if (!settings.ttsEnabled) return res.status(403).json({ error: '语音播报已在设置中关闭' });
    const tts = new EdgeTTS(text, settings.ttsVoice, {
      rate: `${settings.ttsRate >= 0 ? '+' : ''}${settings.ttsRate}%`, volume: '+0%', pitch: `${settings.ttsPitch >= 0 ? '+' : ''}${settings.ttsPitch}Hz`
    });
    const result = await tts.synthesize();
    const audio = Buffer.from(await result.audio.arrayBuffer());
    res.set({ 'Content-Type': 'audio/mpeg', 'Content-Length': audio.length, 'Cache-Control': 'no-store' });
    res.send(audio);
  } catch (error) {
    res.status(502).json({ error: '语音合成失败', detail: error.message });
  }
});

export { app };

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  app.listen(port, () => console.log(`JARVIS core listening on http://localhost:${port}`));
}
