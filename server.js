import express from 'express';
import dotenv from 'dotenv';
import { EdgeTTS } from 'edge-tts-universal';
import { mkdir, readFile, writeFile, unlink } from 'node:fs/promises';
import path from 'node:path';
import multer from 'multer';
import mammoth from 'mammoth';
import { PDFParse } from 'pdf-parse';
import { fileURLToPath } from 'node:url';
import { filterTasks, findConflicts, validateEvent, validateTask } from './src/schedule-core.js';

dotenv.config();
const app = express();
const port = Number(process.env.PORT || 3001);
const memoryDir = path.resolve(process.env.JARVIS_DATA_DIR || 'data');
const memoryFile = path.join(memoryDir, 'memories.json');
const settingsFile = path.join(memoryDir, 'settings.json');
const schedulesFile = path.join(memoryDir, 'schedules.json');
const workspacesFile = path.join(memoryDir, 'workspaces.json');
const knowledgeFile = path.join(memoryDir, 'knowledge.json');
const knowledgeUploadDir = path.join(memoryDir, 'knowledge-files');
const providerSecretsFile = path.join(memoryDir, 'provider-secrets.json');
const tasksFile = path.join(memoryDir, 'tasks.json');
const eventsFile = path.join(memoryDir, 'events.json');
const defaultSettings = {
  model: process.env.DEEPSEEK_MODEL || 'deepseek-v4-flash',
  provider: 'deepseek',
  apiBaseUrl: 'https://api.deepseek.com',
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
const allowedVoices = ['zh-CN-YunxiNeural', 'zh-CN-YunyangNeural', 'zh-CN-XiaoxiaoNeural'];

async function readProviderSecrets(){try{return JSON.parse(await readFile(providerSecretsFile,'utf8'));}catch(error){if(error.code==='ENOENT')return{};throw error;}}
async function writeProviderSecrets(secrets){await mkdir(memoryDir,{recursive:true});await writeFile(providerSecretsFile,JSON.stringify(secrets,null,2),'utf8');}
function safeApiBaseUrl(value,current){try{const url=new URL(String(value||current));const local=['localhost','127.0.0.1','::1'].includes(url.hostname);if(url.protocol!=='https:'&&!(local&&url.protocol==='http:'))return current;return url.toString().replace(/\/$/,'');}catch{return current;}}
const providerSecretKey=settings=>`${settings.provider}:${settings.apiBaseUrl}`;

async function readSettings() {
  try { return { ...defaultSettings, ...JSON.parse(await readFile(settingsFile, 'utf8')) }; }
  catch (error) { if (error.code === 'ENOENT') return { ...defaultSettings }; throw error; }
}

async function writeSettings(input) {
  const current = await readSettings();
  const allowedProviders=['deepseek','openai-compatible','ollama'];
  const next = {
    ...current,
    model: String(input.model||current.model).trim().slice(0,120)||current.model,
    provider: allowedProviders.includes(input.provider)?input.provider:(current.provider||'deepseek'),
    apiBaseUrl: safeApiBaseUrl(input.apiBaseUrl,current.apiBaseUrl||'https://api.deepseek.com'),
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
  if(String(input.providerApiKey||'').trim()){const secrets=await readProviderSecrets();secrets[providerSecretKey(next)]=String(input.providerApiKey).trim();await writeProviderSecrets(secrets);}
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
  try { const value=JSON.parse(await readFile(file,'utf8')); return Array.isArray(value)?value:[]; }
  catch(error){if(error.code==='ENOENT')return[];throw error;}
}
async function writeCollection(file,value){await mkdir(memoryDir,{recursive:true});await writeFile(file,JSON.stringify(value,null,2),'utf8');}

async function readSchedules() {
  try { const value = JSON.parse(await readFile(schedulesFile, 'utf8')); return Array.isArray(value) ? value : []; }
  catch (error) { if (error.code === 'ENOENT') return []; throw error; }
}

async function writeSchedules(items) {
  await mkdir(memoryDir, { recursive: true });
  await writeFile(schedulesFile, JSON.stringify(items, null, 2), 'utf8');
}

async function readWorkspaces() {
  try { const value=JSON.parse(await readFile(workspacesFile,'utf8')); return Array.isArray(value)?value:[]; }
  catch(error){if(error.code==='ENOENT')return[];throw error;}
}
async function writeWorkspaces(items){await mkdir(memoryDir,{recursive:true});await writeFile(workspacesFile,JSON.stringify(items,null,2),'utf8');}
function normalizeWorkspace(input,current={}){
  const allowedModes=['general','analyst','creator','executor'];
  const messages=(Array.isArray(input.messages)?input.messages:current.messages||[]).slice(-100).map(message=>({role:['user','assistant'].includes(message.role)?message.role:'user',content:String(message.content||'').slice(0,10000)})).filter(message=>message.content.trim());
  return {...current,title:String(input.title??current.title??'未命名会话').trim().slice(0,100)||'未命名会话',mode:allowedModes.includes(input.mode)?input.mode:(current.mode||'general'),messages};
}

async function readKnowledge(){try{const value=JSON.parse(await readFile(knowledgeFile,'utf8'));return Array.isArray(value)?value:[];}catch(error){if(error.code==='ENOENT')return[];throw error;}}
async function writeKnowledge(items){await mkdir(memoryDir,{recursive:true});await writeFile(knowledgeFile,JSON.stringify(items,null,2),'utf8');}
function chunkText(text,size=900,overlap=120){const clean=String(text||'').replace(/\r/g,'').replace(/\n{3,}/g,'\n\n').trim().slice(0,2000000),chunks=[];let start=0;while(start<clean.length){let end=Math.min(clean.length,start+size);if(end<clean.length){const boundary=Math.max(clean.lastIndexOf('\n',end),clean.lastIndexOf('。',end),clean.lastIndexOf('. ',end));if(boundary>start+size*.55)end=boundary+1;}const content=clean.slice(start,end).trim();if(content)chunks.push({index:chunks.length+1,content});if(end>=clean.length)break;start=Math.max(start+1,end-overlap);}return chunks;}
function searchTerms(query){const normalized=String(query||'').toLowerCase(),words=normalized.match(/[a-z0-9_-]{2,}/g)||[],chars=normalized.match(/[\u3400-\u9fff]/g)||[],bigrams=chars.map((char,index)=>char+(chars[index+1]||'')).filter(x=>x.length===2);return[...new Set([...words,...bigrams])];}
const knowledgeUpload=multer({storage:multer.memoryStorage(),limits:{fileSize:20*1024*1024},fileFilter:(_req,file,cb)=>{const ext=path.extname(file.originalname).toLowerCase();cb(null,['.pdf','.docx','.md','.markdown'].includes(ext));}});
async function extractDocument(buffer,ext){if(ext==='.pdf'){const parser=new PDFParse({data:buffer});try{return(await parser.getText()).text||''}finally{await parser.destroy()}}if(ext==='.docx')return(await mammoth.extractRawText({buffer})).value||'';return buffer.toString('utf8');}

function normalizeSchedule(input, current = {}) {
  const repeat = ['none','daily','weekly','monthly'].includes(input.repeat) ? input.repeat : (current.repeat || 'none');
  const due = input.dueAt === null || input.dueAt === '' ? null : new Date(input.dueAt || current.dueAt || Date.now());
  return {
    ...current,
    title: String(input.title ?? current.title ?? '').trim().slice(0, 160),
    notes: String(input.notes ?? current.notes ?? '').trim().slice(0, 1000),
    dueAt: due && !Number.isNaN(due.valueOf()) ? due.toISOString() : null,
    priority: ['low','normal','high'].includes(input.priority) ? input.priority : (current.priority || 'normal'),
    repeat,
    reminderMinutes: Math.max(0, Math.min(10080, Number(input.reminderMinutes ?? current.reminderMinutes ?? 15))),
    completed: input.completed === undefined ? Boolean(current.completed) : Boolean(input.completed),
    source: String(input.source || current.source || 'local').slice(0, 30)
  };
}

function nextOccurrence(iso, repeat) {
  const date = new Date(iso); if (Number.isNaN(date.valueOf())) return null;
  if (repeat === 'daily') date.setDate(date.getDate() + 1);
  if (repeat === 'weekly') date.setDate(date.getDate() + 7);
  if (repeat === 'monthly') date.setMonth(date.getMonth() + 1);
  return date.toISOString();
}

const icsEscape = value => String(value || '').replace(/\\/g,'\\\\').replace(/\n/g,'\\n').replace(/,/g,'\\,').replace(/;/g,'\\;');
const icsDate = iso => new Date(iso).toISOString().replace(/[-:]/g,'').replace(/\.\d{3}Z$/,'Z');
function parseIcsDate(value) {
  const match=String(value||'').match(/^(\d{4})(\d{2})(\d{2})(?:T(\d{2})(\d{2})(\d{2})Z?)?/); if(!match)return null;
  const [,y,m,d,h='09',min='00',s='00']=match; const date=new Date(`${y}-${m}-${d}T${h}:${min}:${s}${value.endsWith('Z')?'Z':''}`);return Number.isNaN(date.valueOf())?null:date.toISOString();
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
  try {
    const settings = await readSettings();
    const secrets=await readProviderSecrets(),apiKey=secrets[providerSecretKey(settings)]||secrets[settings.provider]||(settings.provider==='deepseek'?process.env.DEEPSEEK_API_KEY:null);
    if(!apiKey&&settings.provider!=='ollama')return res.status(503).json({error:'尚未配置模型 API Key',demo:true});
    const messages = Array.isArray(req.body.messages) ? req.body.messages.slice(-30) : [];
    const response = await fetch(`${settings.apiBaseUrl.replace(/\/$/,'')}/chat/completions`, {
      method: 'POST',
      headers: {
        ...(apiKey?{Authorization:`Bearer ${apiKey}`} : {}),
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: settings.model,
        messages,
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

app.get('/api/health', async (_req, res) => {const settings=await readSettings(),secrets=await readProviderSecrets();res.json({online:true,voiceConfigured:settings.provider==='ollama'||Boolean(secrets[providerSecretKey(settings)]||secrets[settings.provider])||(settings.provider==='deepseek'&&Boolean(process.env.DEEPSEEK_API_KEY)),provider:settings.provider,model:settings.model,time:new Date().toISOString()})});

app.get('/api/settings', async (_req, res) => {
  try { const settings=await readSettings(),secrets=await readProviderSecrets();res.json({ settings, apiKeyConfigured: settings.provider==='ollama'||Boolean(secrets[providerSecretKey(settings)]||secrets[settings.provider])||(settings.provider==='deepseek'&&Boolean(process.env.DEEPSEEK_API_KEY)) }); }
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

app.get('/api/schedules', async (req, res) => {
  try {
    const items = await readSchedules(); const now = new Date();
    const from = req.query.from ? new Date(req.query.from) : null, to = req.query.to ? new Date(req.query.to) : null;
    const filtered = items.filter(item => (!from || !item.dueAt || new Date(item.dueAt) >= from) && (!to || !item.dueAt || new Date(item.dueAt) <= to));
    filtered.sort((a,b)=>(a.completed-b.completed)||((a.dueAt?new Date(a.dueAt):new Date('9999-12-31'))-(b.dueAt?new Date(b.dueAt):new Date('9999-12-31'))));
    res.json({ items: filtered, total: items.length, now: now.toISOString() });
  } catch (error) { res.status(500).json({ error:'读取日程失败', detail:error.message }); }
});

app.get('/api/schedules/brief', async (_req, res) => {
  try {
    const items=await readSchedules(), now=new Date(), start=new Date(now.getFullYear(),now.getMonth(),now.getDate()), end=new Date(start);end.setDate(end.getDate()+1);
    const active=items.filter(item=>!item.completed), today=active.filter(item=>item.dueAt&&new Date(item.dueAt)>=start&&new Date(item.dueAt)<end), overdue=active.filter(item=>item.dueAt&&new Date(item.dueAt)<start), upcoming=active.filter(item=>item.dueAt&&new Date(item.dueAt)>=end).sort((a,b)=>new Date(a.dueAt)-new Date(b.dueAt)).slice(0,5);
    res.json({date:start.toISOString(),today,overdue,upcoming,summary:{today:today.length,overdue:overdue.length,remaining:active.length,completed:items.filter(item=>item.completed).length}});
  } catch(error){res.status(500).json({error:'生成今日简报失败',detail:error.message});}
});

app.post('/api/schedules', async (req,res)=>{
  try{const items=await readSchedules(),now=new Date().toISOString(),item={id:crypto.randomUUID(),...normalizeSchedule(req.body||{}),createdAt:now,updatedAt:now,lastRemindedAt:null};if(!item.title)return res.status(400).json({error:'任务标题不能为空'});items.push(item);await writeSchedules(items);res.status(201).json({item});}
  catch(error){res.status(500).json({error:'创建任务失败',detail:error.message});}
});

app.put('/api/schedules/:id', async (req,res)=>{
  try{const items=await readSchedules(),index=items.findIndex(item=>item.id===req.params.id);if(index<0)return res.status(404).json({error:'没有找到该任务'});const previous=items[index],next={...normalizeSchedule(req.body||{},previous),id:previous.id,createdAt:previous.createdAt,updatedAt:new Date().toISOString(),lastRemindedAt:previous.lastRemindedAt||null};if(!previous.completed&&next.completed&&next.repeat!=='none'&&next.dueAt){next.completed=false;next.dueAt=nextOccurrence(next.dueAt,next.repeat);next.lastRemindedAt=null;}items[index]=next;await writeSchedules(items);res.json({item:next});}
  catch(error){res.status(500).json({error:'更新任务失败',detail:error.message});}
});

app.delete('/api/schedules/:id',async(req,res)=>{
  try{const items=await readSchedules(),next=items.filter(item=>item.id!==req.params.id);if(next.length===items.length)return res.status(404).json({error:'没有找到该任务'});await writeSchedules(next);res.json({deleted:true});}
  catch(error){res.status(500).json({error:'删除任务失败',detail:error.message});}
});

app.get('/api/calendar/export',async(_req,res)=>{
  try{const items=(await readSchedules()).filter(item=>item.dueAt),lines=['BEGIN:VCALENDAR','VERSION:2.0','PRODID:-//JARVIS//Schedule Center//CN','CALSCALE:GREGORIAN'];for(const item of items){lines.push('BEGIN:VEVENT',`UID:${item.id}@jarvis.local`,`DTSTAMP:${icsDate(item.updatedAt||item.createdAt)}`,`DTSTART:${icsDate(item.dueAt)}`,`SUMMARY:${icsEscape(item.title)}`,`DESCRIPTION:${icsEscape(item.notes)}`);if(item.repeat!=='none')lines.push(`RRULE:FREQ=${item.repeat.toUpperCase()}`);lines.push('END:VEVENT');}lines.push('END:VCALENDAR');res.set({'Content-Type':'text/calendar; charset=utf-8','Content-Disposition':'attachment; filename="jarvis-calendar.ics"'}).send(lines.join('\r\n'));}
  catch(error){res.status(500).json({error:'导出日历失败',detail:error.message});}
});

app.post('/api/calendar/import',async(req,res)=>{
  try{const text=String(req.body?.ics||'').slice(0,1000000),blocks=text.match(/BEGIN:VEVENT[\s\S]*?END:VEVENT/g)||[],items=await readSchedules();let imported=0;for(const block of blocks){const field=name=>block.match(new RegExp(`^${name}(?:;[^:]*)?:(.*)$`,'mi'))?.[1]?.trim();const title=field('SUMMARY'),dueAt=parseIcsDate(field('DTSTART'));if(!title||!dueAt)continue;const uid=field('UID'),existing=uid&&items.find(item=>item.externalUid===uid);if(existing)continue;const freq=(field('RRULE')||'').match(/FREQ=(DAILY|WEEKLY|MONTHLY)/i)?.[1]?.toLowerCase()||'none',now=new Date().toISOString();items.push({id:crypto.randomUUID(),...normalizeSchedule({title,notes:(field('DESCRIPTION')||'').replace(/\\n/g,'\n'),dueAt,repeat:freq,source:'ics'}),externalUid:uid||null,createdAt:now,updatedAt:now,lastRemindedAt:null});imported++;}await writeSchedules(items);res.json({imported,total:items.length});}
  catch(error){res.status(500).json({error:'导入日历失败',detail:error.message});}
});

app.get('/api/workspaces',async(req,res)=>{
  try{const query=String(req.query.query||'').trim().toLowerCase(),items=await readWorkspaces();const filtered=query?items.filter(item=>`${item.title} ${item.mode} ${(item.messages||[]).map(m=>m.content).join(' ')}`.toLowerCase().includes(query)):items;filtered.sort((a,b)=>new Date(b.updatedAt)-new Date(a.updatedAt));res.json({items:filtered.map(item=>({...item,preview:item.messages?.at(-1)?.content?.slice(0,140)||'',messageCount:item.messages?.length||0,messages:undefined})),total:items.length});}
  catch(error){res.status(500).json({error:'读取工作区失败',detail:error.message});}
});
app.get('/api/workspaces/:id',async(req,res)=>{try{const item=(await readWorkspaces()).find(item=>item.id===req.params.id);if(!item)return res.status(404).json({error:'没有找到该工作区'});res.json({item});}catch(error){res.status(500).json({error:'读取工作区失败',detail:error.message});}});
app.post('/api/workspaces',async(req,res)=>{try{const items=await readWorkspaces(),now=new Date().toISOString(),item={id:crypto.randomUUID(),...normalizeWorkspace(req.body||{}),createdAt:now,updatedAt:now};items.push(item);await writeWorkspaces(items);res.status(201).json({item});}catch(error){res.status(500).json({error:'创建工作区失败',detail:error.message});}});
app.put('/api/workspaces/:id',async(req,res)=>{try{const items=await readWorkspaces(),index=items.findIndex(item=>item.id===req.params.id);if(index<0)return res.status(404).json({error:'没有找到该工作区'});items[index]={...normalizeWorkspace(req.body||{},items[index]),id:items[index].id,createdAt:items[index].createdAt,updatedAt:new Date().toISOString()};await writeWorkspaces(items);res.json({item:items[index]});}catch(error){res.status(500).json({error:'保存工作区失败',detail:error.message});}});
app.delete('/api/workspaces/:id',async(req,res)=>{try{const items=await readWorkspaces(),next=items.filter(item=>item.id!==req.params.id);if(next.length===items.length)return res.status(404).json({error:'没有找到该工作区'});await writeWorkspaces(next);res.json({deleted:true});}catch(error){res.status(500).json({error:'删除工作区失败',detail:error.message});}});

app.get('/api/knowledge',async(_req,res)=>{try{const items=await readKnowledge();res.json({items:items.map(({chunks,...item})=>({...item,chunkCount:chunks.length})).sort((a,b)=>new Date(b.createdAt)-new Date(a.createdAt)),total:items.length});}catch(error){res.status(500).json({error:'读取知识库失败',detail:error.message});}});
app.post('/api/knowledge/upload',knowledgeUpload.single('file'),async(req,res)=>{try{if(!req.file)return res.status(400).json({error:'请选择 PDF、DOCX 或 Markdown 文件，最大 20MB'});const ext=path.extname(req.file.originalname).toLowerCase(),text=await extractDocument(req.file.buffer,ext);if(!text.trim())return res.status(422).json({error:'未能从文件中提取文字，请确认文件不是扫描图片或加密文档'});const items=await readKnowledge(),id=crypto.randomUUID(),storedName=`${id}${ext}`,chunks=chunkText(text);await mkdir(knowledgeUploadDir,{recursive:true});await writeFile(path.join(knowledgeUploadDir,storedName),req.file.buffer);const item={id,name:path.basename(req.file.originalname).slice(0,200),storedName,type:ext.slice(1),size:req.file.size,charCount:text.length,createdAt:new Date().toISOString(),chunks};items.push(item);await writeKnowledge(items);res.status(201).json({item:{...item,chunks:undefined,chunkCount:chunks.length}});}catch(error){res.status(500).json({error:'文档解析失败',detail:error.message});}});
app.get('/api/knowledge/search',async(req,res)=>{try{const query=String(req.query.query||'').trim().slice(0,500),limit=Math.max(1,Math.min(8,Number(req.query.limit||5))),terms=searchTerms(query),items=await readKnowledge(),matches=[];for(const item of items)for(const chunk of item.chunks||[]){const text=chunk.content.toLowerCase();let score=terms.reduce((total,term)=>total+(text.includes(term)?2:0),0);if(query&&text.includes(query.toLowerCase()))score+=6;if(score>0)matches.push({documentId:item.id,source:item.name,type:item.type,chunk:chunk.index,content:chunk.content,score});}matches.sort((a,b)=>b.score-a.score);res.json({matches:matches.slice(0,limit),query});}catch(error){res.status(500).json({error:'知识库检索失败',detail:error.message});}});
app.delete('/api/knowledge/:id',async(req,res)=>{try{const items=await readKnowledge(),item=items.find(x=>x.id===req.params.id);if(!item)return res.status(404).json({error:'没有找到该文档'});await writeKnowledge(items.filter(x=>x.id!==req.params.id));try{await unlink(path.join(knowledgeUploadDir,item.storedName))}catch{}res.json({deleted:true});}catch(error){res.status(500).json({error:'删除文档失败',detail:error.message});}});

app.get('/api/tasks',async(req,res)=>{try{const tasks=filterTasks(await readCollection(tasksFile),req.query);res.json({tasks:tasks.sort((a,b)=>String(a.dueAt||'').localeCompare(String(b.dueAt||''))),total:tasks.length});}catch(error){res.status(500).json({error:'读取任务失败',detail:error.message});}});
app.post('/api/tasks',async(req,res)=>{try{const parsed=validateTask(req.body||{});if(parsed.error)return res.status(400).json({error:parsed.error});const tasks=await readCollection(tasksFile),now=new Date().toISOString(),task={id:crypto.randomUUID(),...parsed.value,createdAt:now,updatedAt:now};tasks.push(task);await writeCollection(tasksFile,tasks);res.status(201).json({task});}catch(error){res.status(500).json({error:'保存任务失败',detail:error.message});}});
app.put('/api/tasks/:id',async(req,res)=>{try{const tasks=await readCollection(tasksFile),index=tasks.findIndex(item=>item.id===req.params.id);if(index<0)return res.status(404).json({error:'没有找到该任务'});const parsed=validateTask(req.body||{},tasks[index]);if(parsed.error)return res.status(400).json({error:parsed.error});tasks[index]={...tasks[index],...parsed.value,updatedAt:new Date().toISOString()};await writeCollection(tasksFile,tasks);res.json({task:tasks[index]});}catch(error){res.status(500).json({error:'更新任务失败',detail:error.message});}});
app.delete('/api/tasks/:id',async(req,res)=>{try{const tasks=await readCollection(tasksFile),next=tasks.filter(item=>item.id!==req.params.id);if(next.length===tasks.length)return res.status(404).json({error:'没有找到该任务'});await writeCollection(tasksFile,next);res.json({deleted:true,total:next.length});}catch(error){res.status(500).json({error:'删除任务失败',detail:error.message});}});

app.get('/api/events',async(req,res)=>{try{const date=String(req.query.date||'');let events=await readCollection(eventsFile);if(date)events=events.filter(event=>{const start=new Date(`${date}T00:00:00`),end=new Date(start);end.setDate(end.getDate()+1);return new Date(event.startAt)<end&&new Date(event.endAt)>start;});events.sort((a,b)=>a.startAt.localeCompare(b.startAt));res.json({events,total:events.length});}catch(error){res.status(500).json({error:'读取日程失败',detail:error.message});}});
app.post('/api/events',async(req,res)=>{try{const parsed=validateEvent(req.body||{});if(parsed.error)return res.status(400).json({error:parsed.error});const events=await readCollection(eventsFile),now=new Date().toISOString(),event={id:crypto.randomUUID(),...parsed.value,createdAt:now,updatedAt:now},conflicts=findConflicts(event,events);events.push(event);await writeCollection(eventsFile,events);res.status(201).json({event,conflicts});}catch(error){res.status(500).json({error:'保存日程失败',detail:error.message});}});
app.put('/api/events/:id',async(req,res)=>{try{const events=await readCollection(eventsFile),index=events.findIndex(item=>item.id===req.params.id);if(index<0)return res.status(404).json({error:'没有找到该日程'});const parsed=validateEvent(req.body||{},events[index]);if(parsed.error)return res.status(400).json({error:parsed.error});events[index]={...events[index],...parsed.value,updatedAt:new Date().toISOString()};const conflicts=findConflicts(events[index],events,events[index].id);await writeCollection(eventsFile,events);res.json({event:events[index],conflicts});}catch(error){res.status(500).json({error:'更新日程失败',detail:error.message});}});
app.delete('/api/events/:id',async(req,res)=>{try{const events=await readCollection(eventsFile),next=events.filter(item=>item.id!==req.params.id);if(next.length===events.length)return res.status(404).json({error:'没有找到该日程'});await writeCollection(eventsFile,next);res.json({deleted:true,total:next.length});}catch(error){res.status(500).json({error:'删除日程失败',detail:error.message});}});

app.post('/api/tts', async (req, res) => {
  const text = String(req.body?.text || '').trim().slice(0, 1200);
  if (!text) return res.status(400).json({ error: '缺少需要播报的文本' });
  try {
    const settings = await readSettings();
    if (!settings.ttsEnabled) return res.status(403).json({ error: '语音播报已在设置中关闭' });
    const voice=allowedVoices.includes(req.body?.voice)?req.body.voice:settings.ttsVoice;
    const rate=Math.max(-30,Math.min(20,Number(req.body?.rate??settings.ttsRate))),pitch=Math.max(-30,Math.min(20,Number(req.body?.pitch??settings.ttsPitch)));
    let result,lastError;
    for(let attempt=0;attempt<3;attempt++){try{const tts=new EdgeTTS(text,voice,{rate:`${rate>=0?'+':''}${rate}%`,volume:'+0%',pitch:`${pitch>=0?'+':''}${pitch}Hz`});result=await tts.synthesize();break}catch(error){lastError=error;if(attempt<2)await new Promise(resolve=>setTimeout(resolve,300*(attempt+1)))}}
    if(!result)throw lastError||new Error('No audio was received.');
    const audio = Buffer.from(await result.audio.arrayBuffer());
    res.set({ 'Content-Type': 'audio/mpeg', 'Content-Length': audio.length, 'Cache-Control': 'no-store' });
    res.send(audio);
  } catch (error) {
    res.status(502).json({ error: '语音合成失败', detail: error.message });
  }
});

app.use((error,_req,res,_next)=>{
  if(error instanceof multer.MulterError)return res.status(400).json({error:error.code==='LIMIT_FILE_SIZE'?'文件超过 20MB 限制':'文件上传失败',detail:error.message});
  res.status(500).json({error:'服务处理失败',detail:error.message});
});

export { app };
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url))app.listen(port,()=>console.log(`JARVIS core listening on http://localhost:${port}`));
