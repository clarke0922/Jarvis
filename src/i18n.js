const messages = {
  en: {
    'JARVIS 环形登录核心':'JARVIS circular login core','等待生物识别授权':'Awaiting biometric authorization','启动系统':'Initialize System','主菜单':'Main menu','主页':'Home','档案':'Files','工具':'Tools','系统设置':'System Settings','记忆':'Memory','安全':'Security','网络':'Network','核心待命':'CORE STANDBY','SYSTEM // 系统状态':'SYSTEM // STATUS','神经网络':'Neural Network','语音链路':'Voice Link','任务引擎':'Task Engine','QUICK // 快捷指令':'QUICK // COMMANDS','▹ 制定今日计划':'▹ Plan My Day','▹ 记录一个想法':'▹ Capture an Idea','▹ 开启专注计时':'▹ Start Focus Timer','▹ 查看长期记忆':'▹ View Long-term Memory','帮我制定今天的计划':'Help me plan my day','记录一个想法':'Capture an idea','设置一个25分钟专注计时器':'Set a 25-minute focus timer','告诉我你记得关于我的哪些事情':'Tell me what you remember about me','点击核心唤醒 JARVIS':'Click the core to wake JARVIS','启动语音链路':'Activate Voice Link','MISSION // 任务队列':'MISSION // QUEUE','暂无运行任务':'No active missions','用语音或文字下达指令':'Issue a command by voice or text','DIALOGUE // 对话记录':'DIALOGUE // LOG','系统已就绪。晚上好，我随时为你效劳。':'Systems ready. Good evening. I am at your service.','输入指令，或直接与我对话…':'Enter a command or speak with me…','发送':'Send','关闭设置':'Close settings','模型核心':'Model Core','长期记忆':'Long-term Memory','语音系统':'Voice System','语言设置':'Language','LANGUAGE // 语言设置':'LANGUAGE // SETTINGS','自动匹配浏览器语言':'Match Browser Language','自动模式会优先使用浏览器语言；目前支持简体中文和英文。':'Auto mode follows your browser preference. Simplified Chinese and English are supported.','系统信息':'System Information','DEEPSEEK // 推理核心':'DEEPSEEK // REASONING CORE','当前模型':'Current Model','快速':'Fast','高性能':'High Performance','API 链路检测中':'Checking API link','密钥只保存在本地服务器环境中，设置界面不会显示密钥内容。':'The key is stored only in the local server environment and is never displayed here.','MEMORY // 长期记忆体':'MEMORY // LONG-TERM STORE','启用长期记忆':'Enable long-term memory','允许保存和检索个人偏好':'Allow personal preferences to be saved and retrieved','自动记忆':'Automatic memory','识别稳定偏好和长期目标':'Detect stable preferences and long-term goals','记忆容量':'Memory capacity','每轮引用数量':'References per turn','已保存记忆':'Saved memories','清空全部':'Clear all','VOICE // 语音系统':'VOICE // SYSTEM','启用语音播报':'Enable voice playback','通过免费 Edge TTS 生成语音':'Generate speech using Edge TTS','播报音色':'Voice','云希 · 沉稳男声':'Yunxi · Calm male','云扬 · 专业男声':'Yunyang · Professional male','晓晓 · 自然女声':'Xiaoxiao · Natural female','语速':'Speed','音调':'Pitch','机器人效果':'Robot effect','试听当前音色':'Test Current Voice','ABOUT // 系统信息':'ABOUT // SYSTEM','核心版本':'Core version','推理服务':'Reasoning service','语音服务':'Voice service','数据位置':'Data location','所有设置保存在本机':'All settings are stored locally','保存并应用':'Save & Apply','界面语言':'Interface language','自动（浏览器语言）':'Auto (browser language)','中文':'Chinese','英文':'English','删除记忆':'Delete memory',
    '验证完成':'Verification complete','装甲协议载入':'Armor protocol loaded','神经核心同步':'Neural core synchronized','能源矩阵上线':'Energy matrix online','所有系统正常':'All systems nominal','欢迎回来':'Welcome back','已完成':'Completed','计时中':'Running','计时器':'Timer','读取记忆中…':'Loading memories…','还没有长期记忆':'No long-term memories yet','记忆读取失败':'Failed to load memories','DEEPSEEK API 已连接':'DEEPSEEK API CONNECTED','DEEPSEEK API 未配置':'DEEPSEEK API NOT CONFIGURED','设置读取失败':'Failed to load settings','正在同步设置…':'Syncing settings…','设置已保存并立即生效':'Settings saved and applied','JARVIS 设置已更新':'JARVIS settings updated','保存失败':'Save failed','JARVIS 正在回应…':'JARVIS is responding…','正在聆听，请下达指令':'Listening. Please issue a command.','关闭语音链路':'Deactivate Voice Link','DeepSeek 正在思考…':'DeepSeek is thinking…','任务已经处理完成。':'Task completed.','DeepSeek 链路未连接':'DeepSeek link disconnected','当前浏览器不支持语音识别，请使用 Chrome 或 Edge':'Speech recognition is not supported. Please use Chrome or Edge.','长期记忆已清空':'Long-term memory cleared','确定清空全部长期记忆吗？此操作无法撤销。':'Clear all long-term memories? This cannot be undone.','试听语音':'Good evening. JARVIS voice systems are operating with the current settings.'
  }
};

// Complete translations for the newer settings, workspace, schedule, and
// knowledge-center surfaces. Keeping these keys here also makes hidden modal
// content localize correctly before it is opened.
Object.assign(messages.en, {
  'MODEL PROVIDER // 推理核心': 'MODEL PROVIDER // REASONING CORE',
  '模型提供商': 'Model provider',
  '模型名称': 'Model name',
  '留空表示保持现有密钥': 'Leave blank to keep the current key',
  '本地模型': 'Local model',
  'Ollama · 本地模型': 'Ollama · Local model',
  'API KEY 已配置': 'API KEY CONFIGURED',
  'API KEY 未配置': 'API KEY NOT CONFIGURED',
  '密钥只保存在本地服务器环境中，设置界面不会显示密钥内容。': 'The key is stored only in the local server environment and is never displayed here.',
  '暂无运行任务': 'No active missions',
  '用语音或文字下达指令': 'Issue a command by voice or text',
  '本地知识库': 'Local Knowledge Base',
  '关闭': 'Close',
  '上传资料': 'Upload documents',
  'PDF、Word、Markdown': 'PDF, Word, Markdown',
  '单文件最大 20MB · 仅保存在本机': '20 MB maximum · Stored locally only',
  '选择文件': 'Choose file',
  '文档在本机解析和索引，仅相关片段会随问题发送给推理模型。': 'Documents are parsed and indexed locally. Only relevant excerpts are sent to the reasoning model.',
  '个文档': ' documents',
  '测试知识库检索…': 'Search the knowledge base…',
  '检索': 'Search',
  '尚未添加本地资料': 'No local documents yet',
  '删除文档': 'Delete document',
  '对话与工作区': 'Conversations & Workspaces',
  '搜索标题或对话内容…': 'Search titles or conversation content…',
  '＋ 新建会话': '＋ New session',
  '保存当前会话': 'Save current session',
  '导出 Markdown': 'Export Markdown',
  '工作区标题': 'Workspace title',
  '为这次工作命名': 'Name this workspace',
  '临时会话': 'Temporary session',
  '连续工作模式': 'Continuous work mode',
  '任务与日程中心': 'Tasks & Schedule Center',
  '任务名称': 'Task name',
  '例如：提交周报': 'For example: Submit weekly report',
  '日期与时间': 'Date & time',
  '重复': 'Repeat',
  '不重复': 'No repeat',
  '每天': 'Daily',
  '每周': 'Weekly',
  '每月': 'Monthly',
  '提前提醒': 'Reminder',
  '准时': 'At due time',
  '分钟': 'minutes',
  '小时': 'hour',
  '天': 'day',
  '优先级': 'Priority',
  '普通': 'Normal',
  '高': 'High',
  '低': 'Low',
  '备注': 'Notes',
  '加入任务中心': 'Add to task center',
  '待办': 'To-do',
  '今天': 'Today',
  '全部': 'All'
});

const supported = ['zh-CN', 'en'];
const browserLanguage = () => (navigator.languages || [navigator.language]).some(value => value?.toLowerCase().startsWith('zh')) ? 'zh-CN' : 'en';
let preference = localStorage.getItem('jarvis-language') || 'auto';
let language = preference === 'auto' ? browserLanguage() : (supported.includes(preference) ? preference : browserLanguage());

export const getLanguage = () => language;
export const getLanguagePreference = () => preference;
export const locale = () => language === 'zh-CN' ? 'zh-CN' : 'en-US';
export const tr = (source) => language === 'en' ? (messages.en[source] || source) : source;

export function localizeDom(root = document) {
  document.documentElement.lang = language;
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  const nodes = [];
  while (walker.nextNode()) nodes.push(walker.currentNode);
  nodes.forEach(node => {
    const parent = node.parentElement;
    if (!parent || ['SCRIPT','STYLE'].includes(parent.tagName) || !node.nodeValue.trim()) return;
    if (!node.__i18nSource) node.__i18nSource = node.nodeValue;
    const source = node.__i18nSource;
    const trimmed = source.trim();
    node.nodeValue = source.replace(trimmed, tr(trimmed));
  });
  root.querySelectorAll?.('[title],[aria-label],[placeholder],[data-command]').forEach(element => {
    ['title','aria-label','placeholder','data-command'].forEach(attribute => {
      if (!element.hasAttribute(attribute)) return;
      const key = `i18n${attribute.replace(/-([a-z])/g, (_, c) => c.toUpperCase()).replace(/^./, c => c.toUpperCase())}`;
      if (!element.dataset[key]) element.dataset[key] = element.getAttribute(attribute);
      element.setAttribute(attribute, tr(element.dataset[key]));
    });
  });
}

export function setLanguage(next, root = document) {
  preference = supported.includes(next) ? next : 'auto';
  localStorage.setItem('jarvis-language', preference);
  language = preference === 'auto' ? browserLanguage() : preference;
  localizeDom(root);
  window.dispatchEvent(new CustomEvent('jarvis:languagechange', {detail:{language, preference}}));
}
