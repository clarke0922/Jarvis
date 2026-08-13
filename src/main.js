import './style.css';
import './tts.css';
import './boot.css';
import './armor-mask.css';
import './main-menu.css';
import './jarvis-core.css';
import './main-menu-fixes.css';
import './login-reactor.css';
import './settings.css';
import './schedule-center.css';
import './schedule-scrollbar.css';
import './workspace-center.css';
import './knowledge-center.css';
import './task-center.css';
import { initTaskCenter, refreshTaskCenter } from './task-center.js';
import { getLanguage, getLanguagePreference, locale, localizeDom, setLanguage, tr } from './i18n.js';
import './login-motion.css';

const app = document.querySelector('#app');
app.innerHTML = `
  <section id="bootScreen" class="boot-screen">
    <div class="boot-grid"></div>
    <div class="login-reactor" aria-label="JARVIS 环形登录核心">
      <div class="reactor-orbit orbit-outer"><i></i><i></i><i></i></div>
      <div class="reactor-orbit orbit-scale"></div>
      <div class="reactor-orbit orbit-armor"><i></i><i></i><i></i><i></i></div>
      <div class="reactor-orbit orbit-energy"><i></i><i></i></div>
      <div class="reactor-orbit orbit-inner"></div>
      <div class="reactor-center"><b>J.A.R.V.I.S.</b><small>NEURAL ACCESS CORE</small></div>
      <span id="counterSequence" class="reactor-index index-a" data-label="SEQ">00</span><span id="counterSync" class="reactor-index index-b" data-label="SYNC">00.0</span><span id="counterOps" class="reactor-index index-c" data-label="OPS">000</span>
    </div>
    <div class="boot-copy"><small>ADVANCED PERSONAL INTELLIGENCE</small><h1>JARVIS</h1><p id="bootStatus">等待生物识别授权</p></div>
    <button id="bootButton" class="boot-button"><b>启动系统</b><small>INITIALIZE CORE</small></button>
    <div class="boot-progress"><i></i></div>
    <div class="boot-corners"><i></i><i></i><i></i><i></i></div>
  </section>
  <header class="topbar">
    <div class="brand"><span class="brand-mark">J</span><div><b>JARVIS</b><small>PERSONAL INTELLIGENCE SYSTEM</small></div></div>
    <nav class="main-nav" aria-label="主菜单">
      <button class="active" title="主页">⌂<small>HOME</small></button>
      <button id="scheduleNav" title="任务与日程">▱<small>AGENDA</small></button>
      <button id="taskCenterNav" title="月历任务中心">▦<small>PLAN</small></button>
      <button id="workspaceNav" title="对话工作区">⚒<small>WORK</small></button>
      <button id="settingsNav" title="系统设置">⌘<small>CORE</small></button>
      <button id="knowledgeNav" title="本地知识库">◉<small>KNOW</small></button>
      <button title="安全">⬡<small>SECURE</small></button>
      <button title="网络">◎<small>NET</small></button>
    </nav>
    <div class="system-state"><button id="languageToggle" class="language-toggle" type="button">EN</button><i></i><span id="clock">--:--:--</span><em>核心待命</em></div>
  </header>
  <main class="hud">
    <aside class="panel left-panel">
      <div class="panel-title">SYSTEM // 系统状态</div>
      <div class="metric"><span>神经网络</span><b>READY</b><div><i style="width:91%"></i></div></div>
      <div class="metric"><span>语音链路</span><b id="voiceLink">STANDBY</b><div><i id="voiceBar" style="width:26%"></i></div></div>
      <div class="metric"><span>任务引擎</span><b>ONLINE</b><div><i style="width:78%"></i></div></div>
      <div class="telemetry">
        <span>LATENCY<strong id="latency">-- ms</strong></span>
        <span>SESSION<strong id="duration">00:00</strong></span>
      </div>
      <div class="panel-title second">QUICK // 快捷指令</div>
      <button class="quick" data-command="帮我制定今天的计划">▹ 制定今日计划</button>
      <button class="quick" data-command="记录一个想法">▹ 记录一个想法</button>
      <button class="quick" data-command="设置一个25分钟专注计时器">▹ 开启专注计时</button>
      <button class="quick" data-command="告诉我你记得关于我的哪些事情">▹ 查看长期记忆 <em id="memoryCount">0</em></button>
    </aside>

    <section class="core-zone">
      <div class="target-lines"></div>
      <div class="jarvis-matrix" aria-hidden="true">
        <div class="matrix-grid"></div><div class="matrix-scan"></div><div class="matrix-noise"></div>
        <div class="holo-ring ring-01"></div><div class="holo-ring ring-02"></div><div class="holo-ring ring-03"></div>
        <div class="data-orbit orbit-left"><i></i><b>011010</b><span></span></div>
        <div class="data-orbit orbit-right"><i></i><b>98.742</b><span></span></div>
        <div class="holo-avatar movie-mask">
          <div class="mask-photo"></div><div class="mask-edge"></div><div class="mask-eyes"><i></i><i></i></div>
          <div class="mask-scanline"></div><div class="mask-readout">FACIAL ARMOR // ONLINE</div>
        </div>
        <div class="matrix-ticks"></div><div class="matrix-sweep"></div>
        <div class="stream stream-a">NEURAL_07 · LINK_STABLE · 01101001</div>
        <div class="stream stream-b">CORE_SYNC · 98.742% · ACTIVE</div>
      </div>
      <div class="hud-caption caption-a"><b>MARK // 07</b><span>ARMOR INTEGRITY</span><i></i></div>
      <div class="hud-caption caption-b"><b>NEURAL LINK</b><span>SYNC 98.7%</span><i></i></div>
      <div class="hud-caption caption-c"><b>POWER CELL</b><span>STABLE</span><i></i></div>
      <div class="orb" id="orb">
        <div class="orbit orbit-a"></div><div class="orbit orbit-b"></div><div class="orbit orbit-c"></div>
        <div class="core"><div class="core-glow"></div><span>AI</span></div>
      </div>
      <div class="status-label"><small>VOICE INTERFACE</small><strong id="statusText">点击核心唤醒 JARVIS</strong></div>
      <button id="activate" class="activate"><span class="mic">⌁</span><b>启动语音链路</b><small>ACTIVATE NEURAL LINK</small></button>
      <div class="wave" id="wave">${Array.from({length: 36},(_,i)=>`<i style="--i:${i}"></i>`).join('')}</div>
    </section>

    <aside class="panel right-panel">
      <div class="panel-title">MISSION // 任务队列</div>
      <div id="tasks" class="tasks"><div class="empty"><span>◇</span><b>暂无运行任务</b><small>用语音或文字下达指令</small></div></div>
      <div class="panel-title second">DIALOGUE // 对话记录</div>
      <div id="transcript" class="transcript"><p><b>JARVIS</b><span>系统已就绪。晚上好，我随时为你效劳。</span></p></div>
    </aside>
  </main>
  <footer>
    <div class="input-wrap"><span>›</span><textarea id="command" rows="3" placeholder="输入指令，或直接与我对话…" autocomplete="off"></textarea><button id="send">发送</button></div>
    <div class="footer-meta"><span>SECURE CONNECTION</span><span>LOCAL TIME // <b id="date"></b></span><span>JARVIS CORE v0.1</span></div>
  </footer>
  <div id="toast" class="toast"></div>
  <div id="knowledgeModal" class="knowledge-modal" aria-hidden="true">
    <section class="knowledge-shell" role="dialog" aria-modal="true" aria-labelledby="knowledgeTitle">
      <header><div><small>JARVIS LOCAL KNOWLEDGE MATRIX</small><h2 id="knowledgeTitle">本地知识库</h2></div><button id="closeKnowledge" aria-label="关闭">×</button></header>
      <div class="knowledge-layout">
        <aside class="knowledge-upload"><div class="knowledge-drop" id="knowledgeDrop"><span>⇧</span><b>上传资料</b><p>PDF、Word、Markdown</p><small>单文件最大 20MB · 仅保存在本机</small><button id="chooseKnowledgeFile">选择文件</button><input id="knowledgeFile" type="file" accept=".pdf,.docx,.md,.markdown" hidden></div><div class="knowledge-privacy"><i></i><p><b>LOCAL RAG</b><span>文档在本机解析和索引，仅相关片段会随问题发送给推理模型。</span></p></div></aside>
        <main class="knowledge-main"><div class="knowledge-head"><div><small>DOCUMENT STORE</small><b><span id="knowledgeCount">0</span> 个文档</b></div><div class="knowledge-search"><span>⌕</span><input id="knowledgeSearch" placeholder="测试知识库检索…"><button id="testKnowledgeSearch">检索</button></div></div><div id="knowledgeResults" class="knowledge-results"></div><div id="knowledgeList" class="knowledge-list"></div></main>
      </div>
    </section>
  </div>
  <div id="workspaceModal" class="workspace-modal" aria-hidden="true">
    <section class="workspace-shell" role="dialog" aria-modal="true" aria-labelledby="workspaceTitle">
      <header><div><small>JARVIS CONTINUITY MATRIX</small><h2 id="workspaceTitle">对话与工作区</h2></div><button id="closeWorkspace" aria-label="关闭">×</button></header>
      <div class="workspace-toolbar"><div class="workspace-search"><span>⌕</span><input id="workspaceSearch" placeholder="搜索标题或对话内容…"></div><button id="newWorkspace">＋ 新建会话</button><button id="saveWorkspace">保存当前会话</button><button id="exportWorkspace">导出 Markdown</button></div>
      <div class="workspace-layout">
        <aside><div id="workspaceList" class="workspace-list"></div></aside>
        <main class="workspace-detail">
          <label>工作区标题<input id="workspaceName" maxlength="100" placeholder="为这次工作命名"></label>
          <div class="mode-title">ASSISTANT MODE // 助手模式</div>
          <div class="assistant-modes"><button data-mode="general" class="active"><b>通用管家</b><small>日常对话与综合协助</small></button><button data-mode="analyst"><b>分析师</b><small>严谨拆解、研究与决策</small></button><button data-mode="creator"><b>创意伙伴</b><small>写作、构思与内容创作</small></button><button data-mode="executor"><b>执行官</b><small>任务导向、计划与推进</small></button></div>
          <div class="workspace-summary"><div><small>CURRENT WORKSPACE</small><b id="currentWorkspaceLabel">临时会话</b></div><div><small>MESSAGES</small><b id="workspaceMessageCount">0</b></div></div>
          <div class="workspace-help"><b>连续工作模式</b><p>保存后，JARVIS 会在每次回答完成时自动更新该工作区。再次打开即可恢复完整上下文并继续工作。</p></div>
        </main>
      </div>
    </section>
  </div>
  <div id="scheduleModal" class="schedule-modal" aria-hidden="true">
    <section class="schedule-shell" role="dialog" aria-modal="true" aria-labelledby="scheduleTitle">
      <header><div><small>JARVIS MISSION CONTROL</small><h2 id="scheduleTitle">任务与日程中心</h2></div><button id="closeSchedule" aria-label="关闭">×</button></header>
      <div class="brief-strip" id="todayBrief"><span>今日简报载入中…</span></div>
      <div class="schedule-layout">
        <aside class="schedule-create">
          <h3>NEW MISSION // 新建任务</h3>
          <form id="scheduleForm">
            <label>任务名称<input id="scheduleName" maxlength="160" required placeholder="例如：提交周报"></label>
            <label>日期与时间<input id="scheduleDue" type="datetime-local"></label>
            <div class="schedule-fields"><label>重复<select id="scheduleRepeat"><option value="none">不重复</option><option value="daily">每天</option><option value="weekly">每周</option><option value="monthly">每月</option></select></label><label>提前提醒<select id="scheduleReminder"><option value="0">准时</option><option value="5">5 分钟</option><option value="15" selected>15 分钟</option><option value="60">1 小时</option><option value="1440">1 天</option></select></label></div>
            <label>优先级<select id="schedulePriority"><option value="normal">普通</option><option value="high">高</option><option value="low">低</option></select></label>
            <label>备注<textarea id="scheduleNotes" rows="3" maxlength="1000"></textarea></label>
            <button class="schedule-submit" type="submit">加入任务中心</button>
          </form>
          <div class="calendar-sync"><h3>CALENDAR // 日历同步</h3><div><button id="calendarImport">导入 .ICS</button><button id="calendarExport">导出 .ICS</button><input id="calendarFile" type="file" accept=".ics,text/calendar" hidden></div><small>兼容 Google、Outlook 与 Apple Calendar</small></div>
        </aside>
        <main class="schedule-list-zone"><nav class="schedule-filters"><button class="active" data-filter="active">待办</button><button data-filter="today">今天</button><button data-filter="all">全部</button></nav><div id="scheduleList" class="schedule-list"></div></main>
      </div>
    </section>
  </div>
  <div id="settingsModal" class="settings-modal" aria-hidden="true">
    <section class="settings-shell" role="dialog" aria-modal="true" aria-labelledby="settingsTitle">
      <header><div><small>JARVIS CONTROL MATRIX</small><h2 id="settingsTitle">系统设置</h2></div><button id="closeSettings" aria-label="关闭设置">×</button></header>
      <div class="settings-layout">
        <nav class="settings-tabs">
          <button class="active" data-settings-tab="model">◇ <span>模型核心</span></button>
          <button data-settings-tab="memory">◉ <span>长期记忆</span></button>
          <button data-settings-tab="voice">⌁ <span>语音系统</span></button>
          <button data-settings-tab="language">文 <span>语言设置</span></button>
          <button data-settings-tab="about">◎ <span>系统信息</span></button>
        </nav>
        <div class="settings-content">
          <div class="settings-pane active" data-settings-pane="model">
            <h3>MODEL PROVIDER // 推理核心</h3>
            <label>模型提供商<select id="settingProvider"><option value="deepseek">DeepSeek</option><option value="openai-compatible">OpenAI-Compatible</option><option value="ollama">Ollama · 本地模型</option></select></label>
            <label>模型名称<input id="settingModel" list="modelSuggestions" placeholder="例如：deepseek-chat"><datalist id="modelSuggestions"><option value="deepseek-chat"><option value="deepseek-reasoner"><option value="gpt-4.1-mini"><option value="qwen-plus"><option value="moonshot-v1-8k"><option value="llama3.2"></datalist></label>
            <label>API Base URL<input id="settingApiBaseUrl" placeholder="https://api.example.com/v1"></label>
            <label>API Key<input id="settingProviderApiKey" type="password" autocomplete="new-password" placeholder="留空表示保持现有密钥"></label>
            <div class="provider-presets"><button type="button" data-provider-preset="deepseek">DeepSeek</button><button type="button" data-provider-preset="openai">OpenAI API</button><button type="button" data-provider-preset="siliconflow">SiliconFlow</button><button type="button" data-provider-preset="moonshot">Moonshot</button><button type="button" data-provider-preset="ollama">Ollama Local</button></div>
            <div class="setting-note"><i></i><p><b id="apiKeyState">API 链路检测中</b><span>密钥只保存在本地服务器环境中，设置界面不会显示密钥内容。</span></p></div>
          </div>
          <div class="settings-pane" data-settings-pane="memory">
            <h3>MEMORY // 长期记忆体</h3>
            <label class="switch-row"><span><b>启用长期记忆</b><small>允许保存和检索个人偏好</small></span><input id="settingMemoryEnabled" type="checkbox"><i></i></label>
            <label class="switch-row"><span><b>自动记忆</b><small>识别稳定偏好和长期目标</small></span><input id="settingAutoMemory" type="checkbox"><i></i></label>
            <div class="setting-grid"><label>记忆容量<input id="settingMemoryLimit" type="number" min="20" max="500"></label><label>每轮引用数量<input id="settingMemoryContext" type="number" min="1" max="20"></label></div>
            <div class="memory-manager"><div><b>已保存记忆</b><button id="clearMemories">清空全部</button></div><div id="settingsMemoryList" class="settings-memory-list"></div></div>
          </div>
          <div class="settings-pane" data-settings-pane="voice">
            <h3>VOICE // 语音系统</h3>
            <label class="switch-row"><span><b>启用语音播报</b><small>通过免费 Edge TTS 生成语音</small></span><input id="settingTtsEnabled" type="checkbox"><i></i></label>
            <label>播报音色<select id="settingVoice"><option value="zh-CN-YunxiNeural">云希 · 沉稳男声</option><option value="zh-CN-YunyangNeural">云扬 · 专业男声</option><option value="zh-CN-XiaoxiaoNeural">晓晓 · 自然女声</option></select></label>
            <label class="range-row"><span>语速 <b id="rateValue">-10%</b></span><input id="settingRate" type="range" min="-30" max="20"></label>
            <label class="range-row"><span>音调 <b id="pitchValue">-18Hz</b></span><input id="settingPitch" type="range" min="-30" max="20"></label>
            <label class="range-row"><span>机器人效果 <b id="robotValue">55%</b></span><input id="settingRobot" type="range" min="0" max="100"></label>
            <button id="testVoice" class="test-voice">试听当前音色</button>
          </div>
          <div class="settings-pane" data-settings-pane="language"><h3>LANGUAGE // 语言设置</h3><label class="language-setting">界面语言<select id="settingLanguage"><option value="auto">自动（浏览器语言）</option><option value="zh-CN">中文</option><option value="en">English</option></select></label><div class="setting-note language-note"><i></i><p><b>自动匹配浏览器语言</b><span>自动模式会优先使用浏览器语言；目前支持简体中文和英文。</span></p></div></div>
          <div class="settings-pane" data-settings-pane="about"><h3>ABOUT // 系统信息</h3><div class="about-core"><b>JARVIS</b><span>PERSONAL INTELLIGENCE SYSTEM</span><dl><dt>核心版本</dt><dd>0.2 MEMORY</dd><dt>推理服务</dt><dd>DEEPSEEK</dd><dt>语音服务</dt><dd>EDGE TTS</dd><dt>数据位置</dt><dd>LOCAL ONLY</dd></dl></div></div>
        </div>
      </div>
      <footer><span id="settingsStatus">所有设置保存在本机</span><button id="saveSettings">保存并应用</button></footer>
    </section>
  </div>
`;

localizeDom(app);

const $ = (s) => document.querySelector(s);
let connected = false, listening = false, recognitionActive = false, recognitionPausedForSpeech = false, recognitionRestartTimer = null, startedAt = 0, recognition = null;
let currentAudio = null, currentAudioUrl = null, speechAudioContext = null;
let appSettings = { model:'deepseek-chat', provider:'deepseek', apiBaseUrl:'https://api.deepseek.com', memoryEnabled:true, autoMemory:true, memoryLimit:200, memoryContextLimit:8, ttsEnabled:true, ttsVoice:'zh-CN-YunxiNeural', ttsRate:-10, ttsPitch:-18, robotIntensity:55 };

function updateLanguageToggle(){
  const button=$('#languageToggle');if(!button)return;
  const english=getLanguage()==='en';button.textContent=english?'中':'EN';button.title=english?'切换到中文':'Switch to English';button.setAttribute('aria-label',button.title);
}

function scheduleRecognitionRestart(delay=350){
  clearTimeout(recognitionRestartTimer);
  if(!listening||recognitionPausedForSpeech||!recognition)return;
  recognitionRestartTimer=setTimeout(()=>{if(!listening||recognitionPausedForSpeech||recognitionActive)return;try{recognition.start()}catch{scheduleRecognitionRestart(700)}},delay);
}

function pauseRecognitionForJarvis(){
  recognitionPausedForSpeech=true;clearTimeout(recognitionRestartTimer);
  if(recognition&&recognitionActive)try{recognition.stop()}catch{}
}

function resumeRecognitionAfterJarvis(){
  recognitionPausedForSpeech=false;
  if(listening)scheduleRecognitionRestart(450);
}

function playBootSound(){
  const AudioContext=window.AudioContext||window.webkitAudioContext;
  if(!AudioContext)return;
  const ctx=new AudioContext(), master=ctx.createGain(), compressor=ctx.createDynamicsCompressor();
  master.gain.setValueAtTime(.01,ctx.currentTime);master.gain.exponentialRampToValueAtTime(.7,ctx.currentTime+.04);master.gain.exponentialRampToValueAtTime(.01,ctx.currentTime+3.5);master.connect(compressor);compressor.connect(ctx.destination);
  const tone=(start,duration,from,to,type='sawtooth',volume=.15)=>{const o=ctx.createOscillator(),g=ctx.createGain(),f=ctx.createBiquadFilter();o.type=type;o.frequency.setValueAtTime(from,ctx.currentTime+start);o.frequency.exponentialRampToValueAtTime(to,ctx.currentTime+start+duration);f.type='lowpass';f.frequency.value=2200;g.gain.setValueAtTime(.001,ctx.currentTime+start);g.gain.exponentialRampToValueAtTime(volume,ctx.currentTime+start+.02);g.gain.exponentialRampToValueAtTime(.001,ctx.currentTime+start+duration);o.connect(f);f.connect(g);g.connect(master);o.start(ctx.currentTime+start);o.stop(ctx.currentTime+start+duration+.02)};
  const clang=(start,pitch)=>{const length=ctx.sampleRate*.18,buffer=ctx.createBuffer(1,length,ctx.sampleRate),data=buffer.getChannelData(0);for(let i=0;i<length;i++)data[i]=(Math.random()*2-1)*Math.exp(-i/(ctx.sampleRate*.025));const src=ctx.createBufferSource(),filter=ctx.createBiquadFilter(),gain=ctx.createGain();src.buffer=buffer;filter.type='bandpass';filter.frequency.value=pitch;filter.Q.value=7;gain.gain.value=.65;src.connect(filter);filter.connect(gain);gain.connect(master);src.start(ctx.currentTime+start)};
  tone(0,.45,70,230,'sawtooth',.28);clang(.12,520);clang(.36,760);clang(.62,960);
  tone(.48,.8,110,520,'square',.12);clang(.92,1350);clang(1.12,830);
  tone(1.05,1.55,180,1450,'sawtooth',.16);tone(1.12,1.45,90,720,'sine',.28);
  clang(1.55,1700);clang(1.78,2100);clang(2.02,2600);
  tone(2.05,1.15,240,80,'sine',.55);tone(2.12,.85,820,1550,'triangle',.12);clang(2.74,440);
}

function bootJarvis(){
  const screen=$('#bootScreen'),status=$('#bootStatus'),button=$('#bootButton');button.disabled=true;playBootSound();screen.classList.add('booting');
  bootCounterMode=true;bootCounterStarted=performance.now();
  const steps=[[200,'验证完成'],[650,'装甲协议载入'],[1100,'神经核心同步'],[1650,'能源矩阵上线'],[2250,'所有系统正常'],[2900,'欢迎回来']];
  steps.forEach(([delay,text])=>setTimeout(()=>status.textContent=tr(text),delay));
  setTimeout(()=>{screen.classList.add('complete');setTimeout(()=>screen.remove(),750)},3200);
}

$('#bootButton').onclick=bootJarvis;

let bootCounterMode=false,bootCounterStarted=0;
function animateBootCounters(now){
  const seq=$('#counterSequence'),sync=$('#counterSync'),ops=$('#counterOps');
  if(!seq||!sync||!ops)return;
  if(bootCounterMode){
    const progress=Math.min(1,(now-bootCounterStarted)/3000),eased=1-Math.pow(1-progress,3);
    seq.textContent=String(Math.round(eased*99)).padStart(2,'0');sync.textContent=(eased*100).toFixed(1);ops.textContent=String(Math.round(eased*999)).padStart(3,'0');
  }else{
    const seconds=now/1000;seq.textContent=String(Math.floor(seconds*7)%100).padStart(2,'0');sync.textContent=((seconds*4.3)%100).toFixed(1).padStart(4,'0');ops.textContent=String(Math.floor(seconds*31)%1000).padStart(3,'0');
  }
  requestAnimationFrame(animateBootCounters);
}
requestAnimationFrame(animateBootCounters);
const history = [{ role: 'system', content: '你是 JARVIS，一个原创的中文私人智能助理。表达沉稳、克制、机敏，带英式管家般的礼貌和轻微幽默，但不模仿任何真实演员或电影角色。回答简洁自然。你可以记录备忘、设置计时器、读取时间、经用户确认后打开网站。你拥有长期记忆工具：当用户明确说“记住”或提供明显长期稳定的称呼、偏好、习惯、目标时，调用 save_memory；不要保存密码、密钥、验证码、支付信息或未经用户同意的敏感数据。任何高影响操作必须先取得确认。' }];
const baseSystemMessage=history[0];
const modePolicies={general:'作为通用私人助理，平衡信息、建议与执行。',analyst:'作为严谨分析师，明确假设、证据、风险和结论，避免未经验证的断言。',creator:'作为创意伙伴，主动提供新颖方案、不同方向和可直接使用的成品。',executor:'作为执行官，将目标拆成明确行动、优先级和下一步，持续推动完成。'};
let currentWorkspaceId=null,currentWorkspaceMode='general',workspaceSearchTimer=null;

function openWorkspace(){const modal=$('#workspaceModal');modal.classList.add('open');modal.setAttribute('aria-hidden','false');loadWorkspaceList();syncWorkspaceDetail()}
function closeWorkspace(){const modal=$('#workspaceModal');modal.classList.remove('open');modal.setAttribute('aria-hidden','true')}
function workspaceMessages(){return history.filter(message=>['user','assistant'].includes(message.role)&&typeof message.content==='string').map(({role,content})=>({role,content}))}
function syncWorkspaceDetail(){document.querySelectorAll('[data-mode]').forEach(button=>button.classList.toggle('active',button.dataset.mode===currentWorkspaceMode));$('#workspaceMessageCount').textContent=workspaceMessages().length;$('#currentWorkspaceLabel').textContent=$('#workspaceName').value||'临时会话'}
async function loadWorkspaceList(query=''){try{const data=await(await fetch(`/api/workspaces?query=${encodeURIComponent(query)}`)).json(),list=$('#workspaceList');list.innerHTML='';if(!data.items?.length){list.innerHTML='<div class="workspace-list-empty">◇<br>还没有已保存的工作区</div>';return}data.items.forEach(item=>{const card=document.createElement('div');card.className=`workspace-card ${item.id===currentWorkspaceId?'active':''}`;card.innerHTML='<b></b><p></p><small></small><em></em><button title="删除">×</button>';card.querySelector('b').textContent=item.title;card.querySelector('p').textContent=item.preview||'暂无消息';card.querySelector('small').textContent=new Date(item.updatedAt).toLocaleString(locale());card.querySelector('em').textContent=`${item.messageCount} 条`;card.onclick=e=>{if(e.target.tagName!=='BUTTON')loadWorkspace(item.id)};card.querySelector('button').onclick=()=>deleteWorkspace(item.id);list.append(card)})}catch(error){showToast(error.message||'工作区读取失败')}}
async function loadWorkspace(id){const response=await fetch(`/api/workspaces/${id}`),data=await response.json();if(!response.ok)return showToast(data.error);const item=data.item;currentWorkspaceId=item.id;currentWorkspaceMode=item.mode||'general';$('#workspaceName').value=item.title;history.splice(0,history.length,baseSystemMessage,...(item.messages||[]));const transcript=$('#transcript');transcript.innerHTML='';(item.messages||[]).forEach(message=>addTranscript(message.role==='user'?'YOU':'JARVIS',message.content));if(!(item.messages||[]).length)addTranscript('JARVIS','工作区已载入，随时可以继续。');syncWorkspaceDetail();loadWorkspaceList($('#workspaceSearch').value);showToast(`已载入：${item.title}`);closeWorkspace()}
async function saveCurrentWorkspace(silent=false){const messages=workspaceMessages(),first=messages.find(message=>message.role==='user')?.content||'',title=$('#workspaceName').value.trim()||first.slice(0,36)||`会话 ${new Date().toLocaleDateString(locale())}`,payload={title,mode:currentWorkspaceMode,messages};const response=await fetch(currentWorkspaceId?`/api/workspaces/${currentWorkspaceId}`:'/api/workspaces',{method:currentWorkspaceId?'PUT':'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(payload)}),data=await response.json();if(!response.ok){if(!silent)showToast(data.error);return null}currentWorkspaceId=data.item.id;$('#workspaceName').value=data.item.title;syncWorkspaceDetail();if(!silent){showToast('当前会话已保存');loadWorkspaceList($('#workspaceSearch').value)}return data.item}
function newWorkspace(){currentWorkspaceId=null;currentWorkspaceMode='general';history.splice(0,history.length,baseSystemMessage);$('#transcript').innerHTML='';addTranscript('JARVIS','新的工作区已经就绪。请告诉我这次要完成什么。');$('#workspaceName').value='';syncWorkspaceDetail();loadWorkspaceList($('#workspaceSearch').value);closeWorkspace()}
async function deleteWorkspace(id){if(!confirm('删除这个工作区及其对话历史吗？'))return;const response=await fetch(`/api/workspaces/${id}`,{method:'DELETE'});if(!response.ok)return showToast('删除失败');if(id===currentWorkspaceId)newWorkspace();else loadWorkspaceList($('#workspaceSearch').value)}
function exportWorkspaceMarkdown(){const messages=workspaceMessages();if(!messages.length)return showToast('当前会话没有可导出的内容');const title=$('#workspaceName').value.trim()||'JARVIS 会话',lines=[`# ${title}`,'',`- 导出时间：${new Date().toLocaleString(locale())}`,`- 助手模式：${currentWorkspaceMode}`,''];messages.forEach(message=>lines.push(`## ${message.role==='user'?'用户':'JARVIS'}`,'',message.content,''));const blob=new Blob([lines.join('\n')],{type:'text/markdown;charset=utf-8'}),url=URL.createObjectURL(blob),link=document.createElement('a');link.href=url;link.download=`${title.replace(/[\\/:*?"<>|]/g,'_')}.md`;link.click();setTimeout(()=>URL.revokeObjectURL(url),1000)}

const addTranscript = (who, text) => {
  const p = document.createElement('p');
  p.innerHTML = `<b>${who}</b><span></span>`;
  p.querySelector('span').textContent = text;
  $('#transcript').append(p); $('#transcript').scrollTop = $('#transcript').scrollHeight;
};

const showToast = (text) => { $('#toast').textContent = text; $('#toast').classList.add('show'); setTimeout(()=>$('#toast').classList.remove('show'), 2800); };

const addTask = (name, status = tr('已完成')) => {
  if ($('#tasks .empty')) $('#tasks').innerHTML = '';
  const row = document.createElement('div'); row.className = 'task';
  row.innerHTML = `<i></i><div><b></b><small>${status}</small></div><span>✓</span>`;
  row.querySelector('b').textContent = name; $('#tasks').prepend(row);
};

let scheduleItems=[],scheduleFilter='active',remindedSchedules=new Set();
const repeatNames={none:'不重复',daily:'每天',weekly:'每周',monthly:'每月'};
const dateTimeValue=date=>{const d=new Date(date),offset=d.getTimezoneOffset();return new Date(d.getTime()-offset*60000).toISOString().slice(0,16)};

function openSchedule(){const modal=$('#scheduleModal');modal.classList.add('open');modal.setAttribute('aria-hidden','false');if(!$('#scheduleDue').value){const date=new Date(Date.now()+3600000);date.setMinutes(0,0,0);$('#scheduleDue').value=dateTimeValue(date)}loadSchedules()}
function closeSchedule(){const modal=$('#scheduleModal');modal.classList.remove('open');modal.setAttribute('aria-hidden','true')}
async function loadSchedules(){try{const [list,brief]=await Promise.all([fetch('/api/schedules').then(r=>r.json()),fetch('/api/schedules/brief').then(r=>r.json())]);scheduleItems=list.items||[];renderSchedules();renderBrief(brief);renderHudSchedules()}catch(e){showToast(e.message||'日程读取失败')}}
function renderBrief(data){const summary=data.summary||{};$('#todayBrief').innerHTML=[['TODAY','今日任务',summary.today||0],['OVERDUE','已经逾期',summary.overdue||0,'alert'],['REMAIN','待办总数',summary.remaining||0],['COMPLETE','累计完成',summary.completed||0]].map(([code,label,value,kind])=>`<div class="brief-card ${kind||''}"><small>${code} // ${tr(label)}</small><b>${value}</b></div>`).join('')}
function filteredSchedules(){const now=new Date(),start=new Date(now.getFullYear(),now.getMonth(),now.getDate()),end=new Date(start);end.setDate(end.getDate()+1);if(scheduleFilter==='active')return scheduleItems.filter(x=>!x.completed);if(scheduleFilter==='today')return scheduleItems.filter(x=>x.dueAt&&new Date(x.dueAt)>=start&&new Date(x.dueAt)<end);return scheduleItems}
function renderSchedules(){const list=$('#scheduleList'),items=filteredSchedules();list.innerHTML='';if(!items.length){list.innerHTML=`<div class="schedule-empty">◇<br>${tr('当前视图没有任务')}</div>`;return}items.forEach(item=>{const row=document.createElement('div');row.className=`schedule-item ${item.priority||'normal'} ${item.completed?'done':''}`;const due=item.dueAt?new Date(item.dueAt):null,delta=due?due-Date.now():Infinity,dueClass=delta<0&&!item.completed?'overdue':delta<3600000&&!item.completed?'soon':'';row.innerHTML=`<button class="schedule-check">${item.completed?'✓':''}</button><p><b></b><small><em class="schedule-due ${dueClass}"></em>${item.repeat!=='none'?`<span class="schedule-repeat">${tr(repeatNames[item.repeat]||item.repeat)}</span>`:''}</small></p><div class="schedule-actions"><button class="schedule-delete" title="${tr('删除')}">×</button></div>`;row.querySelector('b').textContent=item.title;row.querySelector('.schedule-due').textContent=due?due.toLocaleString(locale(),{month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit'}):tr('无截止时间');row.querySelector('.schedule-check').onclick=()=>updateSchedule(item.id,{completed:!item.completed});row.querySelector('.schedule-delete').onclick=()=>deleteSchedule(item.id);list.append(row)})}
function renderHudSchedules(){const active=scheduleItems.filter(x=>!x.completed).slice(0,5),box=$('#tasks');box.innerHTML='';if(!active.length){box.innerHTML=`<div class="empty"><span>◇</span><b>${tr('暂无运行任务')}</b><small>${tr('用语音或文字下达指令')}</small></div>`;return}active.forEach(item=>{const row=document.createElement('div');row.className='task';row.innerHTML='<i></i><div><b></b><small></small></div><span>○</span>';row.querySelector('b').textContent=item.title;row.querySelector('small').textContent=item.dueAt?new Date(item.dueAt).toLocaleString(locale(),{month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit'}):tr('待办');box.append(row)})}
async function createSchedule(payload){const response=await fetch('/api/schedules',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(payload)}),data=await response.json();if(!response.ok)throw new Error(data.error||'创建任务失败');await loadSchedules();return data.item}
async function updateSchedule(id,payload){const response=await fetch(`/api/schedules/${id}`,{method:'PUT',headers:{'Content-Type':'application/json'},body:JSON.stringify(payload)}),data=await response.json();if(!response.ok)return showToast(data.error);await loadSchedules()}
async function deleteSchedule(id){if(!confirm('删除这个任务吗？'))return;const response=await fetch(`/api/schedules/${id}`,{method:'DELETE'});if(!response.ok)return showToast('删除失败');await loadSchedules()}
async function checkScheduleReminders(){try{const data=await(await fetch('/api/schedules')).json(),now=Date.now();for(const item of data.items||[]){if(item.completed||!item.dueAt||remindedSchedules.has(item.id))continue;const alertAt=new Date(item.dueAt).getTime()-(item.reminderMinutes||0)*60000;if(now>=alertAt&&now<new Date(item.dueAt).getTime()+3600000){remindedSchedules.add(item.id);const message=`提醒：${item.title}`;showToast(message);speak(message)}}}catch{}}

const toolDefinitions = [
  {type:'function',function:{name:'create_note',description:'在本地记录备忘或想法',parameters:{type:'object',properties:{content:{type:'string'}},required:['content']}}},
  {type:'function',function:{name:'set_timer',description:'设置倒计时器',parameters:{type:'object',properties:{minutes:{type:'number',minimum:.1,maximum:180},label:{type:'string'}},required:['minutes','label']}}},
  {type:'function',function:{name:'create_schedule',description:'创建待办、提醒或重复任务。dueAt 使用 ISO 日期时间；repeat 可为 none、daily、weekly、monthly',parameters:{type:'object',properties:{title:{type:'string'},dueAt:{type:'string'},repeat:{type:'string',enum:['none','daily','weekly','monthly']},reminderMinutes:{type:'number'},notes:{type:'string'}},required:['title']}}},
  {type:'function',function:{name:'get_local_time',description:'读取用户本地日期和时间',parameters:{type:'object',properties:{}}}},
  {type:'function',function:{name:'open_website',description:'打开用户明确要求的 HTTPS 网站',parameters:{type:'object',properties:{url:{type:'string'},reason:{type:'string'}},required:['url','reason']}}},
  {type:'function',function:{name:'save_memory',description:'保存用户明确要求记住的长期称呼、偏好、习惯或目标。禁止保存密码、密钥和支付信息',parameters:{type:'object',properties:{content:{type:'string'},category:{type:'string',enum:['identity','preference','habit','goal','relationship','general']}},required:['content','category']}}},
  {type:'function',function:{name:'recall_memories',description:'检索与当前话题有关的长期记忆',parameters:{type:'object',properties:{query:{type:'string'}},required:['query']}}},
  {type:'function',function:{name:'forget_memory',description:'按关键词查找并忘记一条长期记忆，执行前必须由用户确认',parameters:{type:'object',properties:{query:{type:'string'}},required:['query']}}},
  {type:'function',function:{name:'create_task',description:'创建一个待办任务',parameters:{type:'object',properties:{title:{type:'string'},notes:{type:'string'},priority:{type:'string',enum:['low','medium','high']},dueAt:{type:'string'}},required:['title']}}},
  {type:'function',function:{name:'create_event',description:'创建一项有起止时间的日程',parameters:{type:'object',properties:{title:{type:'string'},notes:{type:'string'},startAt:{type:'string'},endAt:{type:'string'}},required:['title','startAt','endAt']}}},
  {type:'function',function:{name:'query_schedule',description:'查询指定日期的月历任务与日程',parameters:{type:'object',properties:{date:{type:'string'}},required:['date']}}}
];

async function executeTool(name, args) {
  const english=getLanguage()==='en';
  if(name==='create_note'){ localStorage.setItem(`jarvis-note-${Date.now()}`,args.content); addTask(`${english?'Recorded':'已记录'}：${args.content}`); return `${english?'Recorded':'已经记录'}：${args.content}`; }
  if(name==='set_timer'){ const m=Math.max(.1,Math.min(180,Number(args.minutes))); const label=args.label||tr('计时器'); addTask(`${label} · ${m} ${english?'minutes':'分钟'}`,tr('计时中')); setTimeout(()=>{const alert=`${label}${english?' is complete':'时间到了'}`;showToast(alert);speak(alert)},m*60000); return english?`${label} set for ${m} minutes`:`${label}已设置为${m}分钟`; }
  if(name==='create_schedule'){const item=await createSchedule({title:args.title,dueAt:args.dueAt||null,repeat:args.repeat||'none',reminderMinutes:Number(args.reminderMinutes??15),notes:args.notes||''});return english?`Task created: ${item.title}`:`任务已创建：${item.title}`;}
  if(name==='get_local_time') return new Date().toLocaleString(locale());
  if(name==='open_website'){ if(!String(args.url).startsWith('https://')) return english?'For security, only HTTPS websites can be opened':'出于安全考虑，只能打开 HTTPS 网站'; if(confirm(`JARVIS ${english?'requests to open':'请求打开网站'}：\n${args.url}\n${english?'Reason':'原因'}：${args.reason}`)){window.open(args.url,'_blank','noopener');addTask(`${english?'Opened website':'打开网站'}：${new URL(args.url).hostname}`);return english?'Website opened':'网站已打开';} return english?'Operation cancelled':'用户取消了操作'; }
  if(name==='save_memory'){const response=await fetch('/api/memories',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({content:args.content,category:args.category})});const data=await response.json();if(!response.ok)return data.error||(english?'Failed to save memory':'记忆保存失败');updateMemoryCount();addTask(`${english?'Long-term memory':'长期记忆'}：${args.content}`);return data.duplicate?(english?'This is already in long-term memory':'这条内容已经在长期记忆中'):(english?'Saved to long-term memory':'已经写入长期记忆');}
  if(name==='recall_memories'){const response=await fetch(`/api/memories?query=${encodeURIComponent(args.query)}`);const data=await response.json();return data.memories?.length?data.memories.map((m,i)=>`${i+1}. [${m.category}] ${m.content}`).join('\n'):(english?'No relevant long-term memories found':'没有找到相关长期记忆');}
  if(name==='forget_memory'){const response=await fetch(`/api/memories?query=${encodeURIComponent(args.query)}`);const data=await response.json();const memory=data.memories?.[0];if(!memory)return english?'No relevant memory found':'没有找到相关记忆';if(!confirm(`JARVIS ${english?'requests to forget this memory':'请求忘记这条记忆'}：\n“${memory.content}”`))return english?'Deletion cancelled':'用户取消了删除';const deleted=await fetch(`/api/memories/${memory.id}`,{method:'DELETE'});if(!deleted.ok)return english?'Failed to delete memory':'删除记忆失败';updateMemoryCount();addTask(`${english?'Forgotten':'已忘记'}：${memory.content}`);return english?'Memory forgotten':'已经忘记这条记忆';}
  if(name==='create_task'){const response=await fetch('/api/tasks',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(args)}),data=await response.json();if(!response.ok)return data.error;addTask(`${english?'Task':'任务'}：${data.task.title}`,english?'Pending':'待办');refreshTaskCenter();return english?'Task created':'任务已创建';}
  if(name==='create_event'){const response=await fetch('/api/events',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(args)}),data=await response.json();if(!response.ok)return data.error;addTask(`${english?'Event':'日程'}：${data.event.title}`);refreshTaskCenter();return data.conflicts?.length?(english?'Event created with a time conflict':'日程已创建，但存在时间冲突'):(english?'Event created':'日程已创建');}
  if(name==='query_schedule'){const [trsp,ersp]=await Promise.all([fetch(`/api/tasks?date=${encodeURIComponent(args.date)}`),fetch(`/api/events?date=${encodeURIComponent(args.date)}`)]),tasks=(await trsp.json()).tasks||[],events=(await ersp.json()).events||[];if(!tasks.length&&!events.length)return english?'No tasks or events for that date':'该日期没有任务或日程';return [...tasks.map(item=>`${english?'Task':'任务'}: ${item.title}`),...events.map(item=>`${english?'Event':'日程'}: ${item.title} (${new Date(item.startAt).toLocaleTimeString(locale(),{hour:'2-digit',minute:'2-digit'})})`)].join('\n');}
  return english?'Unknown tool':'未知工具';
}

async function updateMemoryCount(){try{const data=await(await fetch('/api/memories')).json();if($('#memoryCount'))$('#memoryCount').textContent=data.total||0}catch{}}

async function relevantMemoryContext(query){
  if(!appSettings.memoryEnabled)return null;
  try{const data=await(await fetch(`/api/memories?query=${encodeURIComponent(query)}`)).json();if(!data.memories?.length)return null;return `以下是仅供本轮参考的用户长期记忆：\n${data.memories.map(m=>`- [${m.category}] ${m.content}`).join('\n')}`}
  catch{return null}
}

function openKnowledge(){const modal=$('#knowledgeModal');modal.classList.add('open');modal.setAttribute('aria-hidden','false');loadKnowledge()}
function closeKnowledge(){const modal=$('#knowledgeModal');modal.classList.remove('open');modal.setAttribute('aria-hidden','true');$('#knowledgeResults').classList.remove('open')}
async function loadKnowledge(){try{const data=await(await fetch('/api/knowledge')).json(),list=$('#knowledgeList');$('#knowledgeCount').textContent=data.total||0;list.innerHTML='';if(!data.items?.length){list.innerHTML=`<div class="knowledge-empty">◇<br>${tr('尚未添加本地资料')}</div>`;return}data.items.forEach(item=>{const row=document.createElement('div');row.className='knowledge-doc';row.innerHTML=`<i></i><p><b></b><small></small></p><button title="${tr('删除文档')}">×</button>`;row.querySelector('i').textContent=item.type.toUpperCase();row.querySelector('b').textContent=item.name;row.querySelector('small').textContent=`${item.chunkCount} ${getLanguage()==='en'?'chunks':'个片段'} · ${(item.size/1024).toFixed(1)} KB · ${new Date(item.createdAt).toLocaleDateString(locale())}`;row.querySelector('button').onclick=()=>deleteKnowledge(item.id);list.append(row)})}catch(error){showToast(error.message||'知识库读取失败')}}
async function uploadKnowledge(file){if(!file)return;const ext=file.name.toLowerCase().split('.').pop();if(!['pdf','docx','md','markdown'].includes(ext))return showToast('仅支持 PDF、DOCX 和 Markdown');const drop=$('#knowledgeDrop'),status=document.createElement('div');status.className='knowledge-progress';status.textContent=`正在解析 ${file.name}…`;drop.append(status);try{const form=new FormData();form.append('file',file);const response=await fetch('/api/knowledge/upload',{method:'POST',body:form}),data=await response.json();if(!response.ok)throw new Error(data.error);showToast(`已建立索引：${data.item.name}`);await loadKnowledge()}catch(error){showToast(error.message)}finally{status.remove();$('#knowledgeFile').value=''}}
async function deleteKnowledge(id){if(!confirm('删除这份资料及其本地索引吗？'))return;const response=await fetch(`/api/knowledge/${id}`,{method:'DELETE'});if(!response.ok)return showToast('删除失败');await loadKnowledge()}
async function searchKnowledge(query,limit=5){if(!query.trim())return[];try{const data=await(await fetch(`/api/knowledge/search?query=${encodeURIComponent(query)}&limit=${limit}`)).json();return data.matches||[]}catch{return[]}}
async function testKnowledgeSearch(){const query=$('#knowledgeSearch').value.trim();if(!query)return;const matches=await searchKnowledge(query,8),box=$('#knowledgeResults');box.classList.add('open');box.innerHTML=matches.length?'':'<div class="knowledge-empty">没有找到相关片段</div>';matches.forEach(hit=>{const row=document.createElement('div');row.className='knowledge-hit';row.innerHTML='<b></b><p></p>';row.querySelector('b').textContent=`${hit.source} #片段${hit.chunk}`;row.querySelector('p').textContent=hit.content.slice(0,280);box.append(row)})}
async function relevantKnowledgeContext(query){const matches=await searchKnowledge(query,5);if(!matches.length)return null;return `以下内容来自用户的本地知识库。仅在片段确实支持结论时使用，并在对应句子后严格标注 [来源: 文件名#片段编号]；不要编造未提供的来源。\n\n${matches.map(hit=>`[来源: ${hit.source}#片段${hit.chunk}]\n${hit.content}`).join('\n\n')}`}

async function loadSettings(){
  try{const data=await(await fetch('/api/settings')).json();appSettings={...appSettings,...data.settings};$('#settingProvider').value=appSettings.provider||'deepseek';$('#settingModel').value=appSettings.model;$('#settingApiBaseUrl').value=appSettings.apiBaseUrl||'';$('#settingProviderApiKey').value='';$('#settingMemoryEnabled').checked=appSettings.memoryEnabled;$('#settingAutoMemory').checked=appSettings.autoMemory;$('#settingMemoryLimit').value=appSettings.memoryLimit;$('#settingMemoryContext').value=appSettings.memoryContextLimit;$('#settingTtsEnabled').checked=appSettings.ttsEnabled;$('#settingVoice').value=appSettings.ttsVoice;$('#settingRate').value=appSettings.ttsRate;$('#settingPitch').value=appSettings.ttsPitch;$('#settingRobot').value=appSettings.robotIntensity;$('#settingLanguage').value=getLanguagePreference();$('#apiKeyState').textContent=tr(data.apiKeyConfigured?'API KEY 已配置':'API KEY 未配置');updateRangeLabels();}
  catch{$('#settingsStatus').textContent=tr('设置读取失败')}
}

function updateRangeLabels(){$('#rateValue').textContent=`${Number($('#settingRate').value)>=0?'+':''}${$('#settingRate').value}%`;$('#pitchValue').textContent=`${Number($('#settingPitch').value)>=0?'+':''}${$('#settingPitch').value}Hz`;$('#robotValue').textContent=`${$('#settingRobot').value}%`}

async function renderSettingsMemories(){
  const list=$('#settingsMemoryList');list.innerHTML=`<p class="loading-memory">${tr('读取记忆中…')}</p>`;
  try{const data=await(await fetch('/api/memories?limit=50')).json();list.innerHTML=data.memories?.length?'':`<p class="loading-memory">${tr('还没有长期记忆')}</p>`;data.memories?.forEach(memory=>{const row=document.createElement('div');row.innerHTML=`<i></i><p><b></b><small></small></p><button title="${tr('删除记忆')}">×</button>`;row.querySelector('b').textContent=memory.content;row.querySelector('small').textContent=`${memory.category} · ${new Date(memory.createdAt).toLocaleDateString(locale())}`;row.querySelector('button').onclick=async()=>{if(!confirm(`${getLanguage()==='en'?'Forget this memory':'确定忘记'}：\n“${memory.content}”`))return;await fetch(`/api/memories/${memory.id}`,{method:'DELETE'});renderSettingsMemories();updateMemoryCount()};list.append(row)})}catch{list.innerHTML=`<p class="loading-memory">${tr('记忆读取失败')}</p>`}
}

function openSettings(){const modal=$('#settingsModal');modal.classList.add('open');modal.setAttribute('aria-hidden','false');loadSettings();renderSettingsMemories()}
function closeSettings(){const modal=$('#settingsModal');modal.classList.remove('open');modal.setAttribute('aria-hidden','true')}

async function saveSettings(){
  const next={provider:$('#settingProvider').value,model:$('#settingModel').value,apiBaseUrl:$('#settingApiBaseUrl').value,providerApiKey:$('#settingProviderApiKey').value,memoryEnabled:$('#settingMemoryEnabled').checked,autoMemory:$('#settingAutoMemory').checked,memoryLimit:Number($('#settingMemoryLimit').value),memoryContextLimit:Number($('#settingMemoryContext').value),ttsEnabled:$('#settingTtsEnabled').checked,ttsVoice:$('#settingVoice').value,ttsRate:Number($('#settingRate').value),ttsPitch:Number($('#settingPitch').value),robotIntensity:Number($('#settingRobot').value)};
  setLanguage($('#settingLanguage').value,app);$('#settingsStatus').textContent=tr('正在同步设置…');try{const response=await fetch('/api/settings',{method:'PUT',headers:{'Content-Type':'application/json'},body:JSON.stringify(next)});const data=await response.json();if(!response.ok)throw new Error(data.error);appSettings=data.settings;$('#settingsStatus').textContent=tr('设置已保存并立即生效');showToast(tr('JARVIS 设置已更新'));setTimeout(closeSettings,650)}catch(e){$('#settingsStatus').textContent=e.message||tr('保存失败')}
}

function speakWithSystemVoice(text,preview={}){
  if(!('speechSynthesis' in window)||!window.SpeechSynthesisUtterance)return false;
  const utterance=new SpeechSynthesisUtterance(text),voiceCode=preview.voice||appSettings.ttsVoice,keyword=voiceCode.match(/-(Yunxi|Yunyang|Xiaoxiao)Neural/i)?.[1]?.toLowerCase(),voices=speechSynthesis.getVoices();
  utterance.voice=voices.find(voice=>keyword&&voice.name.toLowerCase().includes(keyword))||voices.find(voice=>voice.lang?.toLowerCase().startsWith(getLanguage()==='en'?'en':'zh'))||null;
  utterance.lang=getLanguage()==='en'?'en-US':'zh-CN';utterance.rate=Math.max(.5,Math.min(1.5,1+Number(preview.rate??appSettings.ttsRate)/100));utterance.pitch=Math.max(.5,Math.min(1.5,1+Number(preview.pitch??appSettings.ttsPitch)/60));
  utterance.onend=()=>{document.body.classList.remove('speaking');resumeRecognitionAfterJarvis()};utterance.onerror=()=>{document.body.classList.remove('speaking');resumeRecognitionAfterJarvis()};speechSynthesis.cancel();speechSynthesis.speak(utterance);return true;
}

async function speak(text,preview={}){
  try{
    pauseRecognitionForJarvis();
    if(currentAudio){try{currentAudio.stop?.()}catch{}currentAudio=null}
    if(speechAudioContext){try{await speechAudioContext.close()}catch{}speechAudioContext=null}
    if(currentAudioUrl){URL.revokeObjectURL(currentAudioUrl);currentAudioUrl=null}
    document.body.classList.add('speaking'); $('#statusText').textContent=tr('JARVIS 正在回应…');
    const response=await fetch('/api/tts',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({text,...preview})});
    if(!response.ok){const error=await response.json().catch(()=>({}));throw new Error(error.error||'语音合成失败')}
    const AudioContext=window.AudioContext||window.webkitAudioContext;
    if(!AudioContext)throw new Error('当前浏览器不支持音频处理');
    speechAudioContext=new AudioContext();
    const buffer=await speechAudioContext.decodeAudioData(await response.arrayBuffer());
    const source=speechAudioContext.createBufferSource(),highpass=speechAudioContext.createBiquadFilter(),presence=speechAudioContext.createBiquadFilter(),robotGain=speechAudioContext.createGain(),compressor=speechAudioContext.createDynamicsCompressor(),dry=speechAudioContext.createGain(),delay=speechAudioContext.createDelay(.2),echo=speechAudioContext.createGain();
    source.buffer=buffer;source.playbackRate.value=.96;highpass.type='highpass';highpass.frequency.value=170;presence.type='peaking';presence.frequency.value=1450;presence.Q.value=1.4;presence.gain.value=5;robotGain.gain.value=.72;dry.gain.value=.9;delay.delayTime.value=.045;echo.gain.value=.18;compressor.threshold.value=-22;compressor.knee.value=12;compressor.ratio.value=5;compressor.attack.value=.006;compressor.release.value=.16;
    const modulator=speechAudioContext.createOscillator(),modDepth=speechAudioContext.createGain();const robotMix=(appSettings.robotIntensity||0)/100;modulator.type='square';modulator.frequency.value=24+robotMix*18;modDepth.gain.value=robotMix*.34;echo.gain.value=robotMix*.3;presence.gain.value=robotMix*8;modulator.connect(modDepth);modDepth.connect(robotGain.gain);
    source.connect(highpass);highpass.connect(presence);presence.connect(robotGain);robotGain.connect(dry);dry.connect(compressor);robotGain.connect(delay);delay.connect(echo);echo.connect(compressor);compressor.connect(speechAudioContext.destination);
    currentAudio=source;source.onended=()=>{document.body.classList.remove('speaking');try{modulator.stop()}catch{}currentAudio=null;resumeRecognitionAfterJarvis();$('#statusText').textContent=tr(listening?'正在聆听，请下达指令':'点击核心唤醒 JARVIS')};
    modulator.start();source.start();
  }catch(e){if(speakWithSystemVoice(text,preview)){showToast('在线音色不可用，已切换系统语音');return}document.body.classList.remove('speaking');resumeRecognitionAfterJarvis();showToast(e.message)}
}

async function connectVoice() {
  if(listening){ listening=false;recognitionPausedForSpeech=false;clearTimeout(recognitionRestartTimer);try{recognition?.stop()}catch{}setConnected(false); return; }
  const SpeechRecognition=window.SpeechRecognition||window.webkitSpeechRecognition;
  if(!SpeechRecognition){ showToast(tr('当前浏览器不支持语音识别，请使用 Chrome 或 Edge')); return; }
  recognition=new SpeechRecognition(); recognition.lang=getLanguage()==='en'?'en-US':'zh-CN'; recognition.continuous=true; recognition.interimResults=true;
  recognition.onstart=()=>{recognitionActive=true;setConnected(true)};
  recognition.onresult=e=>{let final='';for(let i=e.resultIndex;i<e.results.length;i++)if(e.results[i].isFinal)final+=e.results[i][0].transcript;if(final){pauseRecognitionForJarvis();sendText(final)}};
  recognition.onerror=e=>{recognitionActive=false;if(!['no-speech','aborted'].includes(e.error))showToast(`语音识别：${e.error}`)};
  recognition.onend=()=>{recognitionActive=false;if(listening&&!recognitionPausedForSpeech)scheduleRecognitionRestart()};
  listening=true;recognitionPausedForSpeech=false;recognition.start();
}

function setConnected(value) {
  connected = value; document.body.classList.toggle('connected', value);
  $('#voiceLink').textContent = value ? 'LINKED' : 'STANDBY'; $('#voiceBar').style.width = value ? '96%' : '26%';
  $('#statusText').textContent = tr(value ? '正在聆听，请下达指令' : '点击核心唤醒 JARVIS');
  $('#activate b').textContent = tr(value ? '关闭语音链路' : '启动语音链路'); if(value) startedAt = Date.now();
}

function sendText(text) {
  if (!text.trim()) return; addTranscript('YOU', text); $('#command').value = '';
  askDeepSeek(text);
}

async function askDeepSeek(text){
  if(listening)pauseRecognitionForJarvis();
  const started=performance.now(); history.push({role:'user',content:text});syncWorkspaceDetail(); $('#statusText').textContent=tr('DeepSeek 正在思考…');
  try{
    const [memoryContext,knowledgeContext]=await Promise.all([relevantMemoryContext(text),relevantKnowledgeContext(text)]);const memoryPolicy=`长期记忆当前${appSettings.memoryEnabled?'开启':'关闭'}，自动记忆${appSettings.autoMemory?'开启':'关闭'}。${appSettings.autoMemory?'可按规则主动保存稳定偏好。':'除非用户明确说“记住”，否则不要保存。'}`;const languagePolicy=getLanguage()==='en'?'Reply in English unless the user explicitly requests another language.':'除非用户明确要求其他语言，否则使用简体中文回答。';const requestMessages=[...history.slice(0,-1),{role:'system',content:memoryPolicy},{role:'system',content:languagePolicy},{role:'system',content:modePolicies[currentWorkspaceMode]||modePolicies.general},...(memoryContext?[{role:'system',content:memoryContext}]:[]),...(knowledgeContext?[{role:'system',content:knowledgeContext}]:[]),history.at(-1)];const activeTools=appSettings.memoryEnabled?toolDefinitions:toolDefinitions.filter(tool=>!['save_memory','recall_memories','forget_memory'].includes(tool.function.name));
    let response=await fetch('/api/chat',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({messages:requestMessages,tools:activeTools})}); let data=await response.json();
    if(!response.ok) throw new Error(data.error||data.message||'DeepSeek 请求失败');
    let message=data.choices?.[0]?.message; if(!message) throw new Error('DeepSeek 未返回内容'); history.push(message);
    if(message.tool_calls?.length){for(const call of message.tool_calls){let args={};try{args=JSON.parse(call.function.arguments||'{}')}catch{}const result=await executeTool(call.function.name,args);history.push({role:'tool',tool_call_id:call.id,content:String(result)})} response=await fetch('/api/chat',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({messages:history})});data=await response.json();if(!response.ok)throw new Error(data.error||'工具结果处理失败');message=data.choices?.[0]?.message;history.push(message)}
    const answer=message.content||tr('任务已经处理完成。'); addTranscript('JARVIS',answer);syncWorkspaceDetail();if(currentWorkspaceId)saveCurrentWorkspace(true);speak(answer); $('#latency').textContent=`${Math.round(performance.now()-started)} ms`; $('#statusText').textContent=tr(listening?'正在聆听，请下达指令':'点击核心唤醒 JARVIS');
  }catch(e){resumeRecognitionAfterJarvis();if(e.message.includes('API Key')){addTask(text,getLanguage()==='en'?'Demo mode':'演示模式');addTranscript('JARVIS',getLanguage()==='en'?`Received: “${text}”. Configure a model API key in CORE settings.`:`已收到：“${text}”。请在 CORE 设置中配置模型 API Key。`)}else addTranscript('JARVIS',`${getLanguage()==='en'?'Connection error':'连接出现问题'}：${e.message}`);showToast(e.message);$('#statusText').textContent='模型链路未连接';}
}

$('#activate').onclick = connectVoice; $('#orb').onclick = connectVoice; $('#send').onclick = ()=>sendText($('#command').value);
$('#command').onkeydown = e => { if(e.key==='Enter'&&!e.shiftKey){e.preventDefault();sendText(e.target.value);} };
document.querySelectorAll('.quick').forEach(b=>b.onclick=()=>sendText(b.dataset.command));
updateMemoryCount();
loadSchedules();
loadSettings();
$('#knowledgeNav').onclick=openKnowledge;$('#closeKnowledge').onclick=closeKnowledge;$('#knowledgeModal').onclick=e=>{if(e.target===$('#knowledgeModal'))closeKnowledge()};
$('#chooseKnowledgeFile').onclick=()=>$('#knowledgeFile').click();$('#knowledgeFile').onchange=e=>uploadKnowledge(e.target.files?.[0]);$('#testKnowledgeSearch').onclick=testKnowledgeSearch;$('#knowledgeSearch').onkeydown=e=>{if(e.key==='Enter')testKnowledgeSearch()};
['dragenter','dragover'].forEach(type=>$('#knowledgeDrop').addEventListener(type,e=>{e.preventDefault();$('#knowledgeDrop').classList.add('drag')}));['dragleave','drop'].forEach(type=>$('#knowledgeDrop').addEventListener(type,e=>{e.preventDefault();$('#knowledgeDrop').classList.remove('drag')}));$('#knowledgeDrop').addEventListener('drop',e=>uploadKnowledge(e.dataTransfer.files?.[0]));
$('#workspaceNav').onclick=openWorkspace;$('#closeWorkspace').onclick=closeWorkspace;$('#workspaceModal').onclick=e=>{if(e.target===$('#workspaceModal'))closeWorkspace()};
$('#newWorkspace').onclick=newWorkspace;$('#saveWorkspace').onclick=()=>saveCurrentWorkspace();$('#exportWorkspace').onclick=exportWorkspaceMarkdown;
$('#workspaceSearch').oninput=e=>{clearTimeout(workspaceSearchTimer);workspaceSearchTimer=setTimeout(()=>loadWorkspaceList(e.target.value),220)};
document.querySelectorAll('[data-mode]').forEach(button=>button.onclick=()=>{currentWorkspaceMode=button.dataset.mode;syncWorkspaceDetail()});
$('#scheduleNav').onclick=openSchedule;$('#closeSchedule').onclick=closeSchedule;$('#scheduleModal').onclick=e=>{if(e.target===$('#scheduleModal'))closeSchedule()};
$('#scheduleForm').onsubmit=async e=>{e.preventDefault();try{await createSchedule({title:$('#scheduleName').value,dueAt:$('#scheduleDue').value?new Date($('#scheduleDue').value).toISOString():null,repeat:$('#scheduleRepeat').value,reminderMinutes:Number($('#scheduleReminder').value),priority:$('#schedulePriority').value,notes:$('#scheduleNotes').value});e.target.reset();$('#scheduleReminder').value='15';showToast('任务已加入日程中心')}catch(error){showToast(error.message)}};
document.querySelectorAll('[data-filter]').forEach(button=>button.onclick=()=>{scheduleFilter=button.dataset.filter;document.querySelectorAll('[data-filter]').forEach(x=>x.classList.toggle('active',x===button));renderSchedules()});
$('#calendarExport').onclick=()=>{const link=document.createElement('a');link.href='/api/calendar/export';link.download='jarvis-calendar.ics';document.body.append(link);link.click();link.remove()};
$('#calendarImport').onclick=()=>$('#calendarFile').click();$('#calendarFile').onchange=async e=>{const file=e.target.files?.[0];if(!file)return;try{const response=await fetch('/api/calendar/import',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({ics:await file.text()})}),data=await response.json();if(!response.ok)throw new Error(data.error);showToast(`已导入 ${data.imported} 项日程`);await loadSchedules()}catch(error){showToast(error.message)}finally{e.target.value=''}};
$('#settingsNav').onclick=openSettings;$('#closeSettings').onclick=closeSettings;$('#saveSettings').onclick=saveSettings;$('#settingsModal').onclick=e=>{if(e.target===$('#settingsModal'))closeSettings()};
document.querySelectorAll('[data-settings-tab]').forEach(button=>button.onclick=()=>{document.querySelectorAll('[data-settings-tab]').forEach(x=>x.classList.toggle('active',x===button));document.querySelectorAll('[data-settings-pane]').forEach(pane=>pane.classList.toggle('active',pane.dataset.settingsPane===button.dataset.settingsTab))});
const providerPresets={deepseek:{provider:'deepseek',url:'https://api.deepseek.com',model:'deepseek-chat'},openai:{provider:'openai-compatible',url:'https://api.openai.com/v1',model:'gpt-4.1-mini'},siliconflow:{provider:'openai-compatible',url:'https://api.siliconflow.cn/v1',model:'deepseek-ai/DeepSeek-V3'},moonshot:{provider:'openai-compatible',url:'https://api.moonshot.cn/v1',model:'moonshot-v1-8k'},ollama:{provider:'ollama',url:'http://localhost:11434/v1',model:'llama3.2'}};
document.querySelectorAll('[data-provider-preset]').forEach(button=>button.onclick=()=>{const preset=providerPresets[button.dataset.providerPreset];$('#settingProvider').value=preset.provider;$('#settingApiBaseUrl').value=preset.url;$('#settingModel').value=preset.model;$('#apiKeyState').textContent=preset.provider==='ollama'?'本地模型无需 API Key':'保存后检测 API Key'});
$('#settingLanguage').onchange=e=>setLanguage(e.target.value,app);
$('#languageToggle').onclick=()=>{const next=getLanguage()==='en'?'zh-CN':'en';setLanguage(next,app);$('#settingLanguage').value=next;updateLanguageToggle();};
['#settingRate','#settingPitch','#settingRobot'].forEach(selector=>$(selector).oninput=updateRangeLabels);
$('#settingVoice').onchange=()=>{$('#settingsStatus').textContent='已选择新音色，保存后应用'};
$('#testVoice').onclick=()=>speak(tr('试听语音'),{voice:$('#settingVoice').value,rate:Number($('#settingRate').value),pitch:Number($('#settingPitch').value)});
$('#clearMemories').onclick=async()=>{if(!confirm(tr('确定清空全部长期记忆吗？此操作无法撤销。')))return;await fetch('/api/memories',{method:'DELETE'});renderSettingsMemories();updateMemoryCount();showToast(tr('长期记忆已清空'))};
window.addEventListener('jarvis:languagechange',()=>{if(recognition)recognition.lang=getLanguage()==='en'?'en-US':'zh-CN';setConnected(connected);updateLanguageToggle();renderSettingsMemories();loadSchedules()});
updateLanguageToggle();
initTaskCenter($('#taskCenterNav'));
setInterval(checkScheduleReminders,30000);setTimeout(checkScheduleReminders,3500);

setInterval(()=>{
  const now = new Date(); $('#clock').textContent = now.toLocaleTimeString(locale(),{hour12:false});
  $('#date').textContent = now.toLocaleDateString(locale());
  if(connected) { const s=Math.floor((Date.now()-startedAt)/1000); $('#duration').textContent=`${String(Math.floor(s/60)).padStart(2,'0')}:${String(s%60).padStart(2,'0')}`; }
},1000);

const canvas=$('#matrix'), ctx=canvas.getContext('2d'); let particles=[];
function resize(){canvas.width=innerWidth;canvas.height=innerHeight;particles=Array.from({length:Math.min(80,innerWidth/18)},()=>({x:Math.random()*innerWidth,y:Math.random()*innerHeight,v:.15+Math.random()*.35,r:Math.random()*1.4}));} resize(); addEventListener('resize',resize);
(function draw(){ctx.clearRect(0,0,canvas.width,canvas.height);ctx.fillStyle='#36d9ff';particles.forEach(p=>{p.y-=p.v;if(p.y<0)p.y=canvas.height;ctx.globalAlpha=.15;ctx.fillRect(p.x,p.y,p.r,p.r*6)});requestAnimationFrame(draw)})();
