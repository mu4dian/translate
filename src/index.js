const SYSTEM_PROMPT = `你是一名专业的考研英语辅导老师，拥有丰富的考研英语教学经验。
用户会给你一段英文或中文文本，请进行翻译并提供详细的词汇和语法讲解。

请严格按照以下 JSON 格式返回结果，不要输出任何其他内容，不要加 markdown 代码块：

{
  "translation": "主翻译结果（如英译汉则返回中文，汉译英则返回英文）",
  "words": [
    {
      "word": "单词或短语",
      "phonetic": "音标（仅英文单词需要）",
      "pos": "词性（如 n. / v. / adj. / adv. / prep. / conj.）",
      "meaning": "中文释义（简洁准确）",
      "en_meaning": "英文释义（来自权威词典风格）",
      "usage": "考研常见用法说明（结合考研语境）",
      "collocations": ["常用搭配1", "常用搭配2", "常用搭配3"],
      "examples": [
        { "en": "英文例句1", "zh": "对应中文翻译" },
        { "en": "英文例句2", "zh": "对应中文翻译" }
      ],
      "synonyms": ["近义词1", "近义词2"],
      "antonyms": ["反义词1"],
      "kaoyan_note": "考研重点提示（是否为高频词、考点说明等）"
    }
  ],
  "grammar": "语法结构分析（分析原文的句型、从句、特殊结构等）",
  "kaoyan_tips": "考研备考贴士（与该文本相关的考研英语应试技巧）"
}

注意事项：
1. words 数组只选取原文中重要的、考研高频的词汇和短语（3-8个为宜）
2. 汉译英时，words 分析英文翻译结果中的重要词汇
3. 例句要贴近考研真题风格
4. kaoyan_note 要标注是否为考研真题高频词
5. 必须返回合法的 JSON，translation 字段是整段文本的翻译`;

function getHTML() {
  return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>考研 AI 翻译</title>
<style>
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  :root {
    --bg: #f5f5f7;
    --surface: #ffffff;
    --border: rgba(0,0,0,0.08);
    --border-strong: rgba(0,0,0,0.12);
    --primary: #0071e3;
    --primary-hover: #0077ed;
    --text: #1d1d1f;
    --text-2: #6e6e73;
    --text-3: #aeaeb2;
    --green: #30b94d;
    --orange: #ff9f0a;
    --purple: #7c6af7;
    --red: #ff453a;
    --shadow-sm: 0 1px 3px rgba(0,0,0,0.06), 0 4px 16px rgba(0,0,0,0.04);
    --shadow: 0 2px 8px rgba(0,0,0,0.08), 0 12px 32px rgba(0,0,0,0.04);
    --shadow-hover: 0 4px 16px rgba(0,0,0,0.1), 0 16px 40px rgba(0,0,0,0.06);
    --r: 20px;
    --r-sm: 14px;
    --r-xs: 10px;
    --ease: cubic-bezier(0.4, 0, 0.2, 1);
    --header-bg: rgba(255,255,255,0.85);
    --header-border: rgba(0,0,0,0.1);
    --control-bg: rgba(118,118,128,0.12);
    --control-bg-hover: rgba(118,118,128,0.18);
    --control-bg-focus: rgba(0,113,227,0.1);
    --primary-soft: rgba(0,113,227,0.08);
    --primary-soft-hover: rgba(0,113,227,0.14);
    --primary-disabled: rgba(0,113,227,0.45);
    --seg-shadow: 0 1px 4px rgba(0,0,0,0.12), 0 0 0 0.5px rgba(0,0,0,0.04);
    --scroll-thumb: rgba(0,0,0,0.14);
    --toast-bg: rgba(28,28,30,0.88);
  }

  :root[data-theme='dark'] {
    --bg: #111214;
    --surface: #1c1d20;
    --border: rgba(255,255,255,0.1);
    --border-strong: rgba(255,255,255,0.16);
    --primary: #3a9cff;
    --primary-hover: #5aabff;
    --text: #f5f5f7;
    --text-2: #c8c9cf;
    --text-3: #9a9ca6;
    --green: #39d353;
    --orange: #ffb224;
    --purple: #a78bfa;
    --red: #ff6b60;
    --shadow-sm: 0 2px 8px rgba(0,0,0,0.4);
    --shadow: 0 10px 28px rgba(0,0,0,0.4);
    --shadow-hover: 0 10px 30px rgba(0,0,0,0.52);
    --header-bg: rgba(28,29,32,0.82);
    --header-border: rgba(255,255,255,0.12);
    --control-bg: rgba(255,255,255,0.1);
    --control-bg-hover: rgba(255,255,255,0.16);
    --control-bg-focus: rgba(58,156,255,0.2);
    --primary-soft: rgba(58,156,255,0.18);
    --primary-soft-hover: rgba(58,156,255,0.28);
    --primary-disabled: rgba(58,156,255,0.5);
    --seg-shadow: 0 2px 6px rgba(0,0,0,0.42);
    --scroll-thumb: rgba(255,255,255,0.22);
    --toast-bg: rgba(0,0,0,0.72);
  }

  body {
    font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Display', 'PingFang SC', 'Helvetica Neue', sans-serif;
    background: var(--bg);
    color: var(--text);
    min-height: 100vh;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }

  /* ── Header ── */
  header {
    position: sticky;
    top: 0;
    z-index: 100;
    height: 52px;
    display: flex;
    align-items: center;
    padding: 0 28px;
    gap: 16px;
    background: var(--header-bg);
    backdrop-filter: saturate(180%) blur(20px);
    -webkit-backdrop-filter: saturate(180%) blur(20px);
    border-bottom: 1px solid var(--header-border);
  }

  .brand {
    display: flex;
    align-items: baseline;
    gap: 8px;
    flex: 1;
  }

  .brand-name {
    font-size: 15px;
    font-weight: 600;
    color: var(--text);
    letter-spacing: -0.3px;
  }

  .brand-sub {
    font-size: 12px;
    color: var(--text-3);
    font-weight: 400;
  }

  .header-right {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .theme-toggle {
    width: 30px;
    height: 30px;
    border: none;
    border-radius: 8px;
    background: var(--control-bg);
    color: var(--text);
    font-size: 15px;
    cursor: pointer;
    transition: background 0.15s var(--ease), transform 0.12s var(--ease);
  }

  .theme-toggle:hover { background: var(--control-bg-hover); }
  .theme-toggle:active { transform: scale(0.96); }

  .model-label {
    font-size: 12px;
    color: var(--text-2);
    font-weight: 500;
  }

  .model-wrap {
    position: relative;
    display: flex;
    align-items: center;
  }

  .model-wrap::after {
    content: '';
    position: absolute;
    right: 10px;
    top: 50%;
    transform: translateY(-50%);
    width: 0; height: 0;
    border-left: 3.5px solid transparent;
    border-right: 3.5px solid transparent;
    border-top: 4.5px solid var(--text-2);
    pointer-events: none;
  }

  select.model-select {
    appearance: none;
    -webkit-appearance: none;
    background: var(--control-bg);
    border: none;
    padding: 6px 28px 6px 12px;
    border-radius: var(--r-xs);
    font-size: 13px;
    font-family: inherit;
    font-weight: 500;
    color: var(--text);
    cursor: pointer;
    outline: none;
    transition: background 0.15s var(--ease);
  }

  select.model-select:hover { background: var(--control-bg-hover); }
  select.model-select:focus { background: var(--control-bg-focus); }

  /* ── Layout ── */
  .container {
    max-width: 1300px;
    margin: 0 auto;
    padding: 28px 24px;
    display: grid;
    grid-template-columns: 400px 1fr;
    gap: 20px;
    align-items: start;
  }

  @media (max-width: 960px) {
    .container { grid-template-columns: 1fr; padding: 20px 16px; }
  }

  /* ── Card ── */
  .card {
    background: var(--surface);
    border-radius: var(--r);
    box-shadow: var(--shadow-sm);
    overflow: hidden;
  }

  /* ── Segmented Control ── */
  .seg {
    display: flex;
    background: var(--control-bg);
    border-radius: 980px;
    padding: 3px;
    gap: 2px;
  }

  .seg-btn {
    flex: 1;
    border: none;
    background: transparent;
    padding: 7px 10px;
    border-radius: 980px;
    font-size: 13px;
    font-family: inherit;
    font-weight: 500;
    color: var(--text-2);
    cursor: pointer;
    transition: all 0.18s var(--ease);
    white-space: nowrap;
    text-align: center;
  }

  .seg-btn.active {
    background: var(--surface);
    color: var(--text);
    font-weight: 600;
    box-shadow: var(--seg-shadow);
  }

  .seg-btn:hover:not(.active) { color: var(--text); }

  /* ── Input Panel ── */
  .input-inner {
    padding: 20px;
    display: flex;
    flex-direction: column;
    gap: 14px;
  }

  textarea {
    width: 100%;
    min-height: 176px;
    background: var(--bg);
    border: 1.5px solid transparent;
    border-radius: var(--r-sm);
    color: var(--text);
    font-size: 15px;
    font-family: inherit;
    line-height: 1.7;
    padding: 14px 16px;
    resize: vertical;
    outline: none;
    transition: border-color 0.18s var(--ease), background 0.18s var(--ease);
  }

  textarea:focus {
    border-color: rgba(0,113,227,0.5);
    background: var(--surface);
  }

  textarea::placeholder { color: var(--text-3); }

  .input-foot {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-top: -6px;
  }

  .char-count { font-size: 12px; color: var(--text-3); }

  .btn-clear {
    background: none;
    border: none;
    font-family: inherit;
    font-size: 12px;
    color: var(--text-3);
    cursor: pointer;
    padding: 3px 6px;
    border-radius: 6px;
    transition: color 0.15s;
  }

  .btn-clear:hover { color: var(--text-2); }

  .btn-translate {
    width: 100%;
    padding: 13px;
    background: var(--primary);
    border: none;
    border-radius: 980px;
    color: white;
    font-size: 15px;
    font-family: inherit;
    font-weight: 500;
    cursor: pointer;
    transition: background 0.15s var(--ease), transform 0.12s var(--ease);
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    letter-spacing: -0.1px;
  }

  .btn-translate:hover:not(:disabled) { background: var(--primary-hover); }
  .btn-translate:active:not(:disabled) { transform: scale(0.985); }
  .btn-translate:disabled { background: var(--primary-disabled); cursor: not-allowed; }

  .spinner {
    width: 15px; height: 15px;
    border: 2px solid rgba(255,255,255,0.35);
    border-top-color: white;
    border-radius: 50%;
    animation: spin 0.7s linear infinite;
    display: none;
    flex-shrink: 0;
  }

  .btn-translate.loading .spinner { display: block; }
  .btn-translate.loading .btn-text { display: none; }
  @keyframes spin { to { transform: rotate(360deg); } }

  /* ── History ── */
  .history-wrap {
    border-top: 1px solid var(--border);
    padding: 14px 20px 18px;
  }

  .history-lbl {
    font-size: 11px;
    font-weight: 600;
    color: var(--text-3);
    text-transform: uppercase;
    letter-spacing: 0.7px;
    margin-bottom: 10px;
  }

  .history-list {
    display: flex;
    flex-direction: column;
    gap: 3px;
    max-height: 140px;
    overflow-y: auto;
  }

  .history-item {
    padding: 7px 12px;
    background: var(--bg);
    border-radius: var(--r-xs);
    font-size: 13px;
    color: var(--text-2);
    cursor: pointer;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    transition: all 0.15s var(--ease);
  }

  .history-item:hover {
    background: var(--primary-soft);
    color: var(--primary);
  }

  /* ── Result Panel ── */
  .result-col { display: flex; flex-direction: column; gap: 16px; }

  /* Translation card */
  .result-head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 15px 20px;
    border-bottom: 1px solid var(--border);
  }

  .result-label {
    display: flex;
    align-items: center;
    gap: 7px;
    font-size: 11px;
    font-weight: 600;
    color: var(--text-3);
    text-transform: uppercase;
    letter-spacing: 0.7px;
  }

  .status-dot {
    width: 6px; height: 6px;
    border-radius: 50%;
    background: var(--text-3);
    transition: background 0.3s, box-shadow 0.3s;
    flex-shrink: 0;
  }

  .status-dot.streaming {
    background: var(--primary);
    box-shadow: 0 0 0 3px rgba(0,113,227,0.2);
    animation: pulse-dot 1s ease infinite;
  }

  .status-dot.done { background: var(--green); }

  @keyframes pulse-dot {
    0%, 100% { box-shadow: 0 0 0 3px rgba(0,113,227,0.2); }
    50% { box-shadow: 0 0 0 5px rgba(0,113,227,0.08); }
  }

  .btn-copy {
    display: none;
    background: var(--primary-soft);
    border: none;
    font-family: inherit;
    font-size: 12px;
    font-weight: 500;
    color: var(--primary);
    padding: 5px 14px;
    border-radius: 980px;
    cursor: pointer;
    transition: background 0.15s;
  }

  .btn-copy:hover { background: var(--primary-soft-hover); }

  .trans-body {
    padding: 20px;
    font-size: 16px;
    line-height: 1.85;
    color: var(--text);
    min-height: 80px;
    word-break: break-word;
  }

  .trans-body.empty {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    min-height: 160px;
    gap: 10px;
    color: var(--text-3);
    font-size: 14px;
    text-align: center;
  }

  .empty-icon { font-size: 32px; opacity: 0.45; }

  /* Streaming cursor */
  .stream-cursor::after {
    content: '|';
    color: var(--primary);
    animation: blink 0.9s step-end infinite;
    margin-left: 1px;
    font-weight: 300;
  }

  @keyframes blink { 50% { opacity: 0; } }

  /* ── Section Cards ── */
  .section-card {
    display: none;
  }

  .section-card.visible {
    display: block;
    animation: rise 0.38s var(--ease) both;
  }

  @keyframes rise {
    from { opacity: 0; transform: translateY(10px); }
    to   { opacity: 1; transform: translateY(0); }
  }

  .section-head {
    padding: 15px 20px;
    border-bottom: 1px solid var(--border);
    font-size: 13px;
    font-weight: 600;
    color: var(--text-2);
    letter-spacing: -0.1px;
    display: flex;
    align-items: center;
    gap: 8px;
  }

  /* ── Word Cards ── */
  .words-grid {
    padding: 16px;
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .word-card {
    background: var(--bg);
    border-radius: var(--r-sm);
    overflow: hidden;
    transition: transform 0.2s var(--ease), box-shadow 0.2s var(--ease);
    animation: rise 0.35s var(--ease) both;
  }

  .word-card:nth-child(1) { animation-delay: 0ms; }
  .word-card:nth-child(2) { animation-delay: 55ms; }
  .word-card:nth-child(3) { animation-delay: 110ms; }
  .word-card:nth-child(4) { animation-delay: 165ms; }
  .word-card:nth-child(5) { animation-delay: 220ms; }
  .word-card:nth-child(6) { animation-delay: 275ms; }
  .word-card:nth-child(7) { animation-delay: 330ms; }
  .word-card:nth-child(8) { animation-delay: 385ms; }

  .word-card:hover {
    transform: translateY(-2px);
    box-shadow: var(--shadow-hover);
  }

  .wc-top {
    padding: 16px 16px 10px;
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 12px;
  }

  .wc-word {
    font-size: 22px;
    font-weight: 700;
    color: var(--primary);
    letter-spacing: -0.4px;
    line-height: 1.2;
  }

  .wc-phonetic {
    font-size: 13px;
    color: var(--text-2);
    margin-top: 3px;
    font-style: italic;
  }

  .wc-pos {
    display: inline-block;
    background: var(--primary-soft);
    color: var(--primary);
    font-size: 11px;
    font-weight: 600;
    padding: 2px 9px;
    border-radius: 980px;
    margin-top: 7px;
    letter-spacing: 0.1px;
  }

  .wc-badge {
    flex-shrink: 0;
    align-self: flex-start;
    background: var(--primary-soft);
    color: var(--primary);
    font-size: 11px;
    font-weight: 600;
    padding: 4px 10px;
    border-radius: 980px;
    letter-spacing: 0.1px;
    white-space: nowrap;
  }

  .wc-meaning {
    padding: 2px 16px 12px;
    font-size: 15px;
    font-weight: 500;
    color: var(--text);
    line-height: 1.5;
  }

  .wc-en {
    padding: 0 16px 12px;
    font-size: 13px;
    color: var(--text-2);
    font-style: italic;
    line-height: 1.6;
  }

  .wc-row {
    padding: 11px 16px;
    border-top: 1px solid var(--border);
  }

  .wc-lbl {
    font-size: 11px;
    font-weight: 600;
    color: var(--text-3);
    text-transform: uppercase;
    letter-spacing: 0.7px;
    margin-bottom: 7px;
  }

  .usage-text {
    font-size: 13px;
    color: var(--orange);
    line-height: 1.65;
    font-weight: 500;
  }

  .tags { display: flex; flex-wrap: wrap; gap: 6px; }

  .tag {
    font-size: 12px;
    font-weight: 500;
    padding: 4px 11px;
    border-radius: 980px;
    background: var(--control-bg);
    color: var(--text-2);
  }

  .tag.coll { background: rgba(124,106,247,0.09); color: var(--purple); }
  .tag.syn  { background: rgba(48,185,77,0.1);    color: var(--green);  }
  .tag.ant  { background: rgba(255,69,58,0.08);   color: var(--red);    }

  .ex-list { display: flex; flex-direction: column; gap: 10px; }

  .ex-en {
    font-size: 13px;
    color: var(--text);
    font-style: italic;
    line-height: 1.65;
  }

  .ex-zh {
    font-size: 12px;
    color: var(--text-2);
    margin-top: 3px;
    padding-left: 11px;
    border-left: 2px solid var(--border-strong);
    line-height: 1.5;
  }

  .kaoyan-note {
    background: var(--primary-soft);
    border: 1px solid var(--primary-soft-hover);
    border-radius: var(--r-xs);
    padding: 10px 13px;
    font-size: 12px;
    font-weight: 500;
    color: var(--primary);
    line-height: 1.65;
  }

  /* ── Prose blocks ── */
  .prose {
    margin: 16px 20px;
    padding: 14px 16px;
    font-size: 14px;
    color: var(--text-2);
    line-height: 1.85;
    border-radius: var(--r-xs);
  }

  .prose-grammar {
    background: rgba(124,106,247,0.06);
    border-left: 3px solid var(--purple);
  }

  .prose-tips {
    background: rgba(255,159,10,0.07);
    border-left: 3px solid var(--orange);
  }

  /* ── Toast ── */
  .toast {
    position: fixed;
    bottom: 28px;
    left: 50%;
    transform: translateX(-50%) translateY(16px);
    background: var(--toast-bg);
    backdrop-filter: blur(12px);
    -webkit-backdrop-filter: blur(12px);
    color: white;
    padding: 10px 22px;
    border-radius: 980px;
    font-size: 13px;
    font-weight: 500;
    z-index: 9999;
    opacity: 0;
    pointer-events: none;
    transition: opacity 0.28s var(--ease), transform 0.28s var(--ease);
    white-space: nowrap;
  }

  .toast.show {
    opacity: 1;
    transform: translateX(-50%) translateY(0);
  }

  /* ── Scrollbar ── */
  ::-webkit-scrollbar { width: 4px; }
  ::-webkit-scrollbar-track { background: transparent; }
  ::-webkit-scrollbar-thumb { background: var(--scroll-thumb); border-radius: 10px; }

  @media (max-width: 540px) {
    .brand-sub { display: none; }
    .model-label { display: none; }
    header { padding: 0 16px; }
  }
</style>
</head>
<body>

<header>
  <div class="brand">
    <span class="brand-name">考研 AI 翻译</span>
    <span class="brand-sub">千问大模型驱动</span>
  </div>
  <div class="header-right">
    <button class="theme-toggle" id="themeToggle" onclick="toggleTheme()" title="切换深色模式">🌙</button>
    <span class="model-label">模型</span>
    <div class="model-wrap">
      <select class="model-select" id="modelSelect" onchange="setModel(this.value)">
        <option value="qwen-turbo">Turbo · 极速</option>
        <option value="qwen-plus" selected>Plus · 均衡</option>
        <option value="qwen-max">Max · 旗舰</option>
        <option value="qwen-max-longcontext">Max Long · 长文本</option>
      </select>
    </div>
  </div>
</header>

<div class="container">

  <!-- Input column -->
  <div>
    <div class="card">
      <div class="input-inner">
        <div class="seg">
          <button class="seg-btn active" onclick="setMode('auto',this)">自动</button>
          <button class="seg-btn" onclick="setMode('en2zh',this)">英 → 汉</button>
          <button class="seg-btn" onclick="setMode('zh2en',this)">汉 → 英</button>
        </div>

        <div>
          <textarea id="inputText"
            placeholder="输入单词、短语或句子…&#10;&#10;支持英译汉 / 汉译英&#10;翻译结果含详细词汇讲解与考研贴士"
            oninput="updateCharCount()"></textarea>
          <div class="input-foot">
            <span class="char-count" id="charCount">0 / 1000</span>
            <button class="btn-clear" onclick="clearInput()">清空</button>
          </div>
        </div>

        <button class="btn-translate" id="translateBtn" onclick="doTranslate()">
          <div class="spinner"></div>
          <span class="btn-text">翻译 &amp; 词汇分析</span>
        </button>
      </div>

      <div class="history-wrap" id="historyWrap" style="display:none">
        <div class="history-lbl">最近翻译</div>
        <div class="history-list" id="historyList"></div>
      </div>
    </div>
  </div>

  <!-- Result column -->
  <div class="result-col">

    <div class="card">
      <div class="result-head">
        <div class="result-label">
          <div class="status-dot" id="statusDot"></div>
          翻译结果
        </div>
        <button class="btn-copy" id="copyBtn" onclick="copyResult()">复制</button>
      </div>
      <div class="trans-body empty" id="transResult">
        <div class="empty-icon">✦</div>
        <div>在左侧输入文本，点击翻译</div>
        <div style="font-size:12px;margin-top:4px;opacity:.7">Ctrl + Enter 快捷翻译</div>
      </div>
    </div>

    <div class="section-card card" id="wordsSection">
      <div class="section-head">📚 核心词汇讲解</div>
      <div class="words-grid" id="wordsGrid"></div>
    </div>

    <div class="section-card card" id="grammarSection">
      <div class="section-head">🔬 语法结构分析</div>
      <div class="prose prose-grammar" id="grammarContent"></div>
    </div>

    <div class="section-card card" id="tipsSection">
      <div class="section-head">💡 考研备考贴士</div>
      <div class="prose prose-tips" id="tipsContent"></div>
    </div>

  </div>
</div>

<div class="toast" id="toast"></div>

<script>
let currentMode = 'auto';
let currentModel = localStorage.getItem('ai-translate-model') || 'qwen-plus';
let currentTheme = localStorage.getItem('ai-translate-theme') ||
  (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
let isLoading = false;

function applyTheme(theme) {
  currentTheme = theme === 'dark' ? 'dark' : 'light';
  document.documentElement.setAttribute('data-theme', currentTheme);
  localStorage.setItem('ai-translate-theme', currentTheme);
  const btn = document.getElementById('themeToggle');
  if (btn) {
    btn.textContent = currentTheme === 'dark' ? '☀️' : '🌙';
    btn.title = currentTheme === 'dark' ? '切换浅色模式' : '切换深色模式';
  }
}

function toggleTheme() {
  applyTheme(currentTheme === 'dark' ? 'light' : 'dark');
}

// Restore user preferences
(function() {
  applyTheme(currentTheme);
  const sel = document.getElementById('modelSelect');
  if (sel) sel.value = currentModel;
})();

function setMode(mode, el) {
  currentMode = mode;
  document.querySelectorAll('.seg-btn').forEach(b => b.classList.remove('active'));
  el.classList.add('active');
}

function setModel(val) {
  currentModel = val;
  localStorage.setItem('ai-translate-model', val);
}

function updateCharCount() {
  const n = document.getElementById('inputText').value.length;
  document.getElementById('charCount').textContent = n + ' / 1000';
}

function clearInput() {
  document.getElementById('inputText').value = '';
  updateCharCount();
}

function showToast(msg) {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 2400);
}

function copyResult() {
  const el = document.getElementById('transResult');
  navigator.clipboard.writeText(el.innerText.trim())
    .then(() => showToast('已复制到剪贴板'));
}

function setDot(state) {
  const d = document.getElementById('statusDot');
  d.className = 'status-dot' + (state ? ' ' + state : '');
}

function setLoading(v) {
  isLoading = v;
  const btn = document.getElementById('translateBtn');
  btn.disabled = v;
  btn.classList.toggle('loading', v);
}

function escapeHTML(s) {
  if (s == null) return '';
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/* ── History ── */
function saveHistory(text) {
  let h = JSON.parse(localStorage.getItem('ai-translate-history') || '[]');
  h = [text, ...h.filter(x => x !== text)].slice(0, 20);
  localStorage.setItem('ai-translate-history', JSON.stringify(h));
  renderHistory();
}

function renderHistory() {
  const h = JSON.parse(localStorage.getItem('ai-translate-history') || '[]');
  const wrap = document.getElementById('historyWrap');
  const list = document.getElementById('historyList');
  if (!h.length) { wrap.style.display = 'none'; return; }
  wrap.style.display = 'block';
  list.innerHTML = h.map(x =>
    \`<div class="history-item" onclick="loadHistory(this)" title="\${escapeHTML(x)}">\${escapeHTML(x.slice(0,60))}\${x.length > 60 ? '…' : ''}</div>\`
  ).join('');
}

function loadHistory(el) {
  document.getElementById('inputText').value = el.title;
  updateCharCount();
}

/* ── Translate ── */
async function doTranslate() {
  if (isLoading) return;
  var text = document.getElementById('inputText').value.trim();
  if (!text) { showToast('请输入需要翻译的内容'); return; }
  if (text.length > 1000) { showToast('文本不能超过 1000 字符'); return; }

  setLoading(true);
  setDot('streaming');

  var el = document.getElementById('transResult');
  el.className = 'trans-body stream-cursor';
  el.textContent = '';
  document.getElementById('copyBtn').style.display = 'none';
  ['wordsSection', 'grammarSection', 'tipsSection'].forEach(function(id) {
    document.getElementById(id).classList.remove('visible');
  });

  var modeHint = '';
  if (currentMode === 'en2zh') modeHint = '请将以下英文翻译为中文，并进行词汇分析：';
  else if (currentMode === 'zh2en') modeHint = '请将以下中文翻译为英文，并进行词汇分析：';
  else modeHint = '请自动识别语言并翻译（英译汉或汉译英），并进行词汇分析：';

  try {
    var resp = await fetch('/api/stream', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: modeHint + ' ' + text, model: currentModel }),
    });

    if (!resp.ok) {
      var errJson = await resp.json().catch(function() { return {}; });
      throw new Error(errJson.error || 'API 请求失败 (' + resp.status + ')');
    }

    var reader = resp.body.getReader();
    var decoder = new TextDecoder();
    var rawBuf = '';
    var contentBuf = '';
    var streaming = true;
    var NL = String.fromCharCode(10);

    while (streaming) {
      var read = await reader.read();
      if (read.done) break;

      rawBuf += decoder.decode(read.value, { stream: true });
      var lines = rawBuf.split(NL);
      rawBuf = lines.pop() || '';

      for (var li = 0; li < lines.length; li++) {
        var line = lines[li].replace(String.fromCharCode(13), '');
        if (line.slice(0, 6) !== 'data: ') continue;
        var payload = line.slice(6).trim();
        if (payload === '[DONE]') { streaming = false; break; }
        try {
          var c = JSON.parse(payload);
          var delta = c && c.choices && c.choices[0] && c.choices[0].delta && c.choices[0].delta.content;
          if (delta) {
            contentBuf += delta;
            // Safe partial extraction using indexOf (no escape-sequence-sensitive regex)
            var KEY = '"translation"';
            var ki = contentBuf.indexOf(KEY);
            if (ki !== -1) {
              var after = contentBuf.slice(ki + KEY.length);
              var ci = after.indexOf(':');
              if (ci !== -1) {
                var val = after.slice(ci + 1).trimStart();
                if (val.charAt(0) === '"') {
                  var raw = val.slice(1);
                  var endQ = raw.indexOf('"');
                  var snippet = endQ === -1 ? raw : raw.slice(0, endQ);
                  try { el.textContent = JSON.parse('"' + snippet + '"'); }
                  catch (pe) { el.textContent = snippet; }
                }
              }
            }
          }
        } catch (ce) { /* ignore malformed SSE chunk */ }
      }
    }

    // Parse complete JSON by finding first { and last }
    var parsed;
    try {
      var fb = contentBuf.indexOf('{');
      var lb = contentBuf.lastIndexOf('}');
      var js = (fb !== -1 && lb !== -1) ? contentBuf.slice(fb, lb + 1) : contentBuf;
      parsed = JSON.parse(js);
    } catch (pe) {
      parsed = { translation: contentBuf, words: [], grammar: '', kaoyan_tips: '' };
    }

    el.className = 'trans-body';
    el.textContent = parsed.translation || contentBuf || '（无翻译结果）';
    document.getElementById('copyBtn').style.display = '';
    setDot('done');
    setTimeout(function() { setDot(''); }, 2000);

    renderWords(parsed.words || []);
    if (parsed.grammar) {
      document.getElementById('grammarContent').textContent = parsed.grammar;
      document.getElementById('grammarSection').classList.add('visible');
    }
    if (parsed.kaoyan_tips) {
      document.getElementById('tipsContent').textContent = parsed.kaoyan_tips;
      document.getElementById('tipsSection').classList.add('visible');
    }

    saveHistory(text);

  } catch (e) {
    el.className = 'trans-body empty';
    el.innerHTML = '<div class="empty-icon">⚠️</div><div>' + escapeHTML(e.message) + '</div>';
    setDot('');
    showToast('翻译失败：' + e.message);
  } finally {
    setLoading(false);
  }
}

/* ── Word cards ── */
function renderWords(words) {
  const grid = document.getElementById('wordsGrid');
  grid.innerHTML = '';
  if (!words.length) return;
  words.forEach(w => grid.appendChild(buildWordCard(w)));
  document.getElementById('wordsSection').classList.add('visible');
}

function buildWordCard(w) {
  const card = document.createElement('div');
  card.className = 'word-card';
  const isHF = w.kaoyan_note && /高频|考研|真题/.test(w.kaoyan_note);

  let h = \`<div class="wc-top">
    <div>
      <div class="wc-word">\${escapeHTML(w.word || '')}</div>
      \${w.phonetic ? \`<div class="wc-phonetic">\${escapeHTML(w.phonetic)}</div>\` : ''}
      \${w.pos ? \`<span class="wc-pos">\${escapeHTML(w.pos)}</span>\` : ''}
    </div>
    \${isHF ? '<span class="wc-badge">★ 考研高频</span>' : ''}
  </div>
  <div class="wc-meaning">\${escapeHTML(w.meaning || '')}</div>
  \${w.en_meaning ? \`<div class="wc-en">\${escapeHTML(w.en_meaning)}</div>\` : ''}\`;

  if (w.usage) {
    h += \`<div class="wc-row"><div class="wc-lbl">考研用法</div><div class="usage-text">\${escapeHTML(w.usage)}</div></div>\`;
  }

  if (w.collocations?.length) {
    h += \`<div class="wc-row"><div class="wc-lbl">常用搭配</div><div class="tags">\${
      w.collocations.map(c => \`<span class="tag coll">\${escapeHTML(c)}</span>\`).join('')
    }</div></div>\`;
  }

  if (w.examples?.length) {
    h += \`<div class="wc-row"><div class="wc-lbl">例句</div><div class="ex-list">\${
      w.examples.map(ex => \`<div><div class="ex-en">\${escapeHTML(ex.en || '')}</div><div class="ex-zh">\${escapeHTML(ex.zh || '')}</div></div>\`).join('')
    }</div></div>\`;
  }

  const hasSyn = w.synonyms?.length;
  const hasAnt = w.antonyms?.length;
  if (hasSyn || hasAnt) {
    h += \`<div class="wc-row"><div class="wc-lbl">近 / 反义词</div><div class="tags">
      \${hasSyn ? w.synonyms.map(s => \`<span class="tag syn">≈ \${escapeHTML(s)}</span>\`).join('') : ''}
      \${hasAnt ? w.antonyms.map(a => \`<span class="tag ant">↔ \${escapeHTML(a)}</span>\`).join('') : ''}
    </div></div>\`;
  }

  if (w.kaoyan_note) {
    h += \`<div class="wc-row"><div class="kaoyan-note">📌 \${escapeHTML(w.kaoyan_note)}</div></div>\`;
  }

  card.innerHTML = h;
  return card;
}

document.addEventListener('keydown', e => {
  if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') doTranslate();
});

renderHistory();
</script>
</body>
</html>`;
}

/* ── Stream handler ── */
async function handleStream(request, env) {
  let body;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: '请求体格式错误' }, { status: 400 });
  }

  const { text, model = 'qwen-plus' } = body;

  if (!text || typeof text !== 'string' || !text.trim()) {
    return Response.json({ error: '翻译内容不能为空' }, { status: 400 });
  }
  if (text.length > 2000) {
    return Response.json({ error: '文本过长，请控制在 1000 字符以内' }, { status: 400 });
  }
  if (!env.QIANWEN_API_KEY) {
    return Response.json({ error: 'API Key 未配置，请运行 wrangler secret put QIANWEN_API_KEY' }, { status: 500 });
  }

  const VALID_MODELS = ['qwen-turbo', 'qwen-plus', 'qwen-max', 'qwen-max-longcontext'];
  const safeModel = VALID_MODELS.includes(model) ? model : 'qwen-plus';

  const apiResp = await fetch('https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + env.QIANWEN_API_KEY,
    },
    body: JSON.stringify({
      model: safeModel,
      stream: true,
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: text },
      ],
      temperature: 0.3,
      max_tokens: 4096,
    }),
  });

  if (!apiResp.ok) {
    const errText = await apiResp.text();
    console.error('Qianwen API error:', apiResp.status, errText);
    return Response.json({ error: '千问 API 调用失败，状态码：' + apiResp.status }, { status: 502 });
  }

  // Pipe SSE stream directly to browser
  return new Response(apiResp.body, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'X-Accel-Buffering': 'no',
    },
  });
}

/* ── Worker entry ── */
export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    if (url.pathname === '/api/stream' && request.method === 'POST') {
      try {
        return await handleStream(request, env);
      } catch (err) {
        console.error('Unexpected error in /api/stream:', err);
        return Response.json({ error: '服务器内部错误' }, { status: 500 });
      }
    }

    if (url.pathname === '/' || url.pathname === '/index.html') {
      return new Response(getHTML(), {
        headers: {
          'Content-Type': 'text/html; charset=utf-8',
          'Cache-Control': 'public, max-age=60',
        },
      });
    }

    return new Response('Not Found', { status: 404 });
  },
};
