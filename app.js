(function () {
  "use strict";

  var DATA = window.QUIZ_DATA;
  var app = document.getElementById("app");
  var toastEl = document.getElementById("toast");
  var modal = document.getElementById("modal");
  var modalbox = document.getElementById("modalbox");

  if (!DATA || !DATA.questions) {
    app.innerHTML = '<div class="card card-pad"><h2>題庫載入失敗</h2><p>請確認 data.js 與 index.html 在同一個資料夾。</p></div>';
    return;
  }

  var ACCENTS = {
    phonics: ["#0d9f95", "#e2f7f4"],
    picture: ["#2f80ed", "#e8f1fe"],
    spelling: ["#b7791f", "#fdf3df"],
    daily: ["#7c5cbf", "#f1ecfb"],
    vocab: ["#2f9e67", "#e7f7ee"],
    clock: ["#d97706", "#fff0dd"],
    reading: ["#c2415a", "#fde9ed"],
    halloween: ["#ea6a1f", "#ffeadc"]
  };

  var LS_KEY = "engmid300_v1";
  var DEFAULT_RATE = 0.9;
  var saved = {};
  try { saved = JSON.parse(localStorage.getItem(LS_KEY) || "{}") || {}; } catch (e) { saved = {}; }
  try { localStorage.removeItem("engmid200_v1"); } catch (e) {}

  function clampRate(v) {
    v = Number(v);
    if (!isFinite(v)) v = DEFAULT_RATE;
    if (v < 0.5) v = 0.5;
    if (v > 1.5) v = 1.5;
    return Math.round(v * 100) / 100;
  }
  function fmtRate(v) {
    var s = Number(v).toFixed(2).replace(/0+$/, "").replace(/\.$/, "");
    return s + "×";
  }

  var state = {
    view: "home",
    sec: "all",
    idx: 0,
    answers: saved.answers || {},
    pos: saved.pos || {},
    autoPlay: saved.autoPlay !== false,
    rate: clampRate(typeof saved.rate === "number" ? saved.rate : (saved.slow ? 0.75 : DEFAULT_RATE)),
    sound: saved.sound !== false,
    openGroups: saved.openGroups || {},
    letterHints: saved.letterHints || {},
    paletteOpen: !!saved.paletteOpen
  };

  var actx = null;
  var toastTimer = null;
  var lastRender = 0;
  function tooSoon() { return Date.now() - lastRender < 350; }

  /* ---------------- helpers ---------------- */
  function esc(s) {
    return String(s == null ? "" : s).replace(/[&<>"]/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c];
    });
  }
  function stripHTML(s) {
    var d = document.createElement("div");
    d.innerHTML = String(s || "");
    return d.textContent || "";
  }
  function norm(s) {
    return String(s == null ? "" : s).toLowerCase()
      .replace(/[’‘`]/g, "'")
      .replace(/[。．]/g, ".")
      .replace(/[，]/g, ",")
      .replace(/[！]/g, "!")
      .replace(/[？]/g, "?")
      .replace(/\s+/g, " ")
      .trim()
      .replace(/[.,!?]/g, "")
      .replace(/-/g, " ")
      .replace(/'/g, "")
      .replace(/\s+/g, " ")
      .trim();
  }
  function normWord(s) {
    return norm(s).replace(/[^a-z]/g, "");
  }
  function section(id) {
    for (var i = 0; i < DATA.sections.length; i++) if (DATA.sections[i].id === id) return DATA.sections[i];
    return DATA.sections[0];
  }
  function accent(id) { return ACCENTS[id] || ACCENTS.phonics; }
  function list() {
    if (state.sec === "all") return DATA.questions;
    return DATA.questions.filter(function (q) { return q.sec === state.sec; });
  }
  function current() { return list()[state.idx]; }
  function answerOf(q) { return state.answers[q.id] || null; }
  function isAnswered(q) { return !!state.answers[q.id]; }
  function isCorrect(q) { var a = state.answers[q.id]; return !!(a && a.ok); }
  function persist() {
    try {
      localStorage.setItem(LS_KEY, JSON.stringify({
        answers: state.answers,
        pos: state.pos,
        autoPlay: state.autoPlay,
        rate: state.rate,
        sound: state.sound,
        openGroups: state.openGroups,
        letterHints: state.letterHints,
        paletteOpen: state.paletteOpen
      }));
    } catch (e) {}
  }
  function toast(msg) {
    toastEl.textContent = msg;
    toastEl.classList.add("on");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { toastEl.classList.remove("on"); }, 2200);
  }
  function optionText(q, i) {
    var o = q.options[i];
    if (!o) return "";
    if (o.text) return o.text;
    if (o.label) return o.label;
    return "";
  }
  function correctText(q) {
    if (q.type === "mc") return optionText(q, q.answer);
    if (q.type === "pic") return optionText(q, q.answer);
    if (q.type === "spell") return q.accept[0];
    return q.sample;
  }
  function clockSVG(h, m) {
    var hx = 50 + 20 * Math.sin(((h % 12) + m / 60) * Math.PI / 6);
    var hy = 50 - 20 * Math.cos(((h % 12) + m / 60) * Math.PI / 6);
    var mx = 50 + 29 * Math.sin(m * Math.PI / 30);
    var my = 50 - 29 * Math.cos(m * Math.PI / 30);
    var nums = "";
    for (var i = 1; i <= 12; i++) {
      var a = i * Math.PI / 6;
      var x = 50 + 35 * Math.sin(a);
      var y = 50 - 35 * Math.cos(a);
      nums += '<text x="' + x.toFixed(2) + '" y="' + y.toFixed(2) + '" font-size="8" font-weight="700" fill="#5b716c" text-anchor="middle" dominant-baseline="central">' + i + "</text>";
    }
    return '<svg class="clockface" viewBox="0 0 100 100" aria-hidden="true">' +
      '<circle cx="50" cy="50" r="46" fill="#fff" stroke="#cfe3df" stroke-width="3"/>' +
      nums +
      '<line x1="50" y1="50" x2="' + hx.toFixed(2) + '" y2="' + hy.toFixed(2) + '" stroke="#20302d" stroke-width="5" stroke-linecap="round"/>' +
      '<line x1="50" y1="50" x2="' + mx.toFixed(2) + '" y2="' + my.toFixed(2) + '" stroke="#0d9f95" stroke-width="3" stroke-linecap="round"/>' +
      '<circle cx="50" cy="50" r="2.8" fill="#20302d"/>' +
      "</svg>";
  }

  /* ---------------- text to speech ---------------- */
  var NUMW = { 1: "one", 2: "two", 3: "three", 4: "four", 5: "five", 6: "six", 7: "seven", 8: "eight", 9: "nine", 10: "ten", 11: "eleven", 12: "twelve" };
  var voices = [];
  var speechOK = typeof window.speechSynthesis !== "undefined" && typeof window.SpeechSynthesisUtterance !== "undefined";

  function loadVoices() {
    if (!speechOK) return;
    try { voices = window.speechSynthesis.getVoices() || []; } catch (e) { voices = []; }
  }
  if (speechOK) {
    loadVoices();
    try { window.speechSynthesis.addEventListener("voiceschanged", loadVoices); }
    catch (e) { window.speechSynthesis.onvoiceschanged = loadVoices; }
  }
  function pickVoice() {
    if (!voices.length) loadVoices();
    var en = voices.filter(function (v) { return /^en[-_]us/i.test(v.lang) || /en[-_]US/i.test(v.name); });
    if (!en.length) en = voices.filter(function (v) { return /^en/i.test(v.lang); });
    var pref = ["Mark", "Zira", "David", "Jenny", "Aria", "Guy", "Samantha", "Google US English"];
    for (var i = 0; i < pref.length; i++) {
      for (var j = 0; j < en.length; j++) {
        if (en[j].name && en[j].name.indexOf(pref[i]) >= 0) return en[j];
      }
    }
    return en[0] || null;
  }
  function speak(text, el) {
    var t = String(text || "").trim();
    if (!t) return;
    if (!speechOK) { toast("這個瀏覽器不支援語音朗讀"); return; }
    try {
      var a = document.getElementById("audioEl");
      if (a) { try { a.pause(); a.currentTime = 0; } catch (e) {} }
      var box = document.getElementById("audiobox");
      if (box) box.classList.remove("playing");
      window.speechSynthesis.cancel();
      var u = new SpeechSynthesisUtterance(t.replace(/_{2,}/g, " blank "));
      u.lang = "en-US";
      var v = pickVoice();
      if (v) u.voice = v;
      u.rate = state.rate;
      u.pitch = 1;
      document.querySelectorAll(".saybtn.speaking").forEach(function (x) { x.classList.remove("speaking"); });
      if (el) {
        el.classList.add("speaking");
        u.onend = function () { el.classList.remove("speaking"); };
        u.onerror = function () { el.classList.remove("speaking"); };
      }
      window.speechSynthesis.speak(u);
    } catch (e) {
      toast("語音朗讀失敗");
    }
  }
  function englishOnly(s) {
    var t = stripHTML(String(s == null ? "" : s));
    t = t.replace(/[\u4e00-\u9fff\u3000-\u303f\uff00-\uffef]/g, " ");
    t = t.replace(/[“”‘’]/g, "'").replace(/[—–]/g, "-");
    t = t.replace(/_{2,}/g, " blank ");
    t = t.replace(/\s+/g, " ").trim();
    t = t.replace(/^[\s"'.,;:!?\-]+|[\s"'.,;:\-]+$/g, "");
    return /[A-Za-z0-9]/.test(t) ? t : "";
  }
  function sayBtn(text, cls) {
    var t = englishOnly(text);
    if (!t) return "";
    return '<span class="saybtn ' + (cls || "") + '" role="button" tabindex="0" data-act="say" data-say="' +
      esc(t) + '" title="聽英文發音" aria-label="聽英文發音">🔊</span>';
  }
  function promptSay(q) {
    return englishOnly(q.prompt || "");
  }
  function clockSay(h, m) {
    return "It's " + (NUMW[h] || h) + (m === 0 ? " o'clock." : " thirty.");
  }
  function optionSay(o) {
    if (!o) return "";
    if (o.clock) return clockSay(o.clock.h, o.clock.m);
    if (o.text) return o.text;
    return englishOnly(o.label || "");
  }

  /* ---------------- audio ---------------- */
  function stopAudio() {
    var a = document.getElementById("audioEl");
    if (a) { try { a.pause(); a.currentTime = 0; } catch (e) {} }
    if (speechOK) { try { window.speechSynthesis.cancel(); } catch (e) {} }
  }
  function playAudio(auto) {
    var q = current();
    if (!q || !q.audioFile) return;
    var a = document.getElementById("audioEl");
    if (!a) return;
    try {
      if (speechOK) { try { window.speechSynthesis.cancel(); } catch (e2) {} }
      document.querySelectorAll(".saybtn.speaking").forEach(function (x) { x.classList.remove("speaking"); });
      a.pause();
      a.currentTime = 0;
      a.playbackRate = state.rate;
      var box = document.getElementById("audiobox");
      if (box) box.classList.add("playing");
      a.onended = function () { if (box) box.classList.remove("playing"); };
      var p = a.play();
      if (p && p.catch) p.catch(function () {
        if (box) box.classList.remove("playing");
        if (!auto) toast("請再按一次播放，或確認瀏覽器允許音效");
      });
    } catch (e) {
      if (!auto) toast("音訊播放失敗");
    }
  }
  function tone(ok) {
    if (!state.sound) return;
    try {
      var Ctx = window.AudioContext || window.webkitAudioContext;
      if (!Ctx) return;
      if (!actx) actx = new Ctx();
      if (actx.state === "suspended") actx.resume();
      var t = actx.currentTime;
      var o = actx.createOscillator();
      var g = actx.createGain();
      o.connect(g); g.connect(actx.destination);
      if (ok) {
        o.type = "sine";
        o.frequency.setValueAtTime(880, t);
        o.frequency.setValueAtTime(1320, t + 0.08);
      } else {
        o.type = "triangle";
        o.frequency.setValueAtTime(240, t);
        o.frequency.setValueAtTime(170, t + 0.1);
      }
      g.gain.setValueAtTime(0.0001, t);
      g.gain.exponentialRampToValueAtTime(0.075, t + 0.012);
      g.gain.exponentialRampToValueAtTime(0.0001, t + 0.23);
      o.start(t); o.stop(t + 0.25);
    } catch (e) {}
  }

  /* ---------------- navigation ---------------- */
  function start(sec) {
    state.sec = sec;
    state.view = "quiz";
    var qs = list();
    var i = state.pos[sec];
    if (typeof i !== "number" || i < 0 || i >= qs.length) {
      i = -1;
      for (var k = 0; k < qs.length; k++) { if (!isAnswered(qs[k])) { i = k; break; } }
      if (i < 0) i = 0;
    }
    state.idx = i;
    render({ autoplay: true });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
  function resume() {
    var first = null;
    for (var i = 0; i < DATA.questions.length; i++) {
      if (!isAnswered(DATA.questions[i])) { first = DATA.questions[i]; break; }
    }
    if (!first) {
      state.sec = "all";
      state.view = "result";
      render();
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    state.sec = "all";
    state.idx = DATA.questions.indexOf(first);
    state.view = "quiz";
    render({ autoplay: true });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
  function go(delta) {
    var qs = list();
    var i = state.idx + delta;
    if (i < 0) i = 0;
    if (i >= qs.length) { showResult(); return; }
    state.idx = i;
    state.pos[state.sec] = i;
    persist();
    render({ autoplay: true });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
  function jump(i) {
    var qs = list();
    if (i < 0 || i >= qs.length) return;
    state.idx = i;
    state.pos[state.sec] = i;
    persist();
    render({ autoplay: true });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
  function jumpId(id) {
    var i = DATA.questions.findIndex(function (q) { return q.id === id; });
    if (i < 0) return;
    state.sec = "all";
    state.idx = i;
    state.view = "quiz";
    state.pos.all = i;
    persist();
    render({ autoplay: true });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
  function showResult() {
    state.view = "result";
    persist();
    render();
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
  function continueUnanswered() {
    var qs = list();
    for (var i = 0; i < qs.length; i++) {
      if (!isAnswered(qs[i])) {
        state.idx = i;
        state.view = "quiz";
        state.pos[state.sec] = i;
        persist();
        render({ autoplay: true });
        window.scrollTo({ top: 0, behavior: "smooth" });
        return;
      }
    }
    toast("這個範圍已經全部作答完成");
  }
  function retry() {
    var label = state.sec === "all" ? "全部 300 題" : section(state.sec).name;
    if (!window.confirm("確定要清除「" + label + "」的作答紀錄，重新練習嗎？")) return;
    var qs = state.sec === "all" ? DATA.questions : DATA.questions.filter(function (q) { return q.sec === state.sec; });
    qs.forEach(function (q) { delete state.answers[q.id]; });
    state.pos[state.sec] = 0;
    persist();
    start(state.sec);
  }

  /* ---------------- answering ---------------- */
  function choose(i) {
    var q = current();
    if (!q || isAnswered(q)) return;
    if (q.type !== "mc" && q.type !== "pic") return;
    if (i < 0 || i >= q.options.length) return;
    var ok = i === q.answer;
    state.answers[q.id] = { v: i, ok: ok };
    persist();
    tone(ok);
    render();
    if (window.innerWidth < 760) {
      var fb = document.querySelector(".feedback");
      if (fb) setTimeout(function () { fb.scrollIntoView({ behavior: "smooth", block: "nearest" }); }, 80);
    }
  }
  function checkFill() {
    var q = current();
    if (!q || isAnswered(q)) return;
    var input = document.getElementById("answerInput");
    if (!input) return;
    var raw = input.value.trim();
    if (!raw) { toast("請先輸入答案"); input.focus(); return; }
    var ok = q.accept.some(function (a) {
      return q.type === "spell" ? normWord(a) === normWord(raw) : norm(a) === norm(raw);
    });
    state.answers[q.id] = { v: raw, ok: ok };
    persist();
    tone(ok);
    render();
    if (window.innerWidth < 760) {
      var fb = document.querySelector(".feedback");
      if (fb) setTimeout(function () { fb.scrollIntoView({ behavior: "smooth", block: "nearest" }); }, 80);
    }
  }
  function reveal() {
    var q = current();
    if (!q || isAnswered(q)) return;
    state.answers[q.id] = { v: null, ok: false, revealed: true };
    persist();
    tone(false);
    render();
  }
  function toggleLetterHint() {
    var q = current();
    if (!q) return;
    var box = document.getElementById("letterhint");
    var btn = document.querySelector('[data-act="letterhint"]');
    if (!box) return;
    var show = box.classList.contains("hidden");
    box.classList.toggle("hidden", !show);
    state.letterHints[q.id] = show;
    persist();
    if (btn) btn.textContent = show ? "隱藏提示" : "字母提示";
  }

  /* ---------------- render ---------------- */
  function render(opts) {
    opts = opts || {};
    stopAudio();
    if (state.view === "home") renderHome();
    else if (state.view === "result") renderResult();
    else renderQuiz();
    afterRender(opts);
  }

  function overall() {
    var answered = 0, correct = 0;
    DATA.questions.forEach(function (q) {
      var a = state.answers[q.id];
      if (a) { answered++; if (a.ok) correct++; }
    });
    return { total: DATA.questions.length, answered: answered, correct: correct };
  }
  function secStats(id) {
    var qs = DATA.questions.filter(function (q) { return q.sec === id; });
    var answered = 0, correct = 0;
    qs.forEach(function (q) {
      var a = state.answers[q.id];
      if (a) { answered++; if (a.ok) correct++; }
    });
    return { n: qs.length, answered: answered, correct: correct };
  }
  function partCount(part) {
    var n = 0;
    DATA.sections.forEach(function (s) { if (s.part === part) n += s.count; });
    return n;
  }
  function rateControl(id) {
    return '<span class="ratebox"><span class="rateend">🐢</span>' +
      '<input class="rate" id="' + id + '" type="range" min="0.5" max="1.5" step="0.05" value="' + state.rate + '" aria-label="語速">' +
      '<span class="rateend">🐇</span><b class="ratebadge">' + fmtRate(state.rate) + '</b></span>';
  }

  function renderHome() {
    var all = overall();
    var pct = Math.round(all.answered / all.total * 100);
    var hasAnswers = all.answered > 0;
    var firstUnanswered = null;
    for (var i = 0; i < DATA.questions.length; i++) {
      if (!isAnswered(DATA.questions[i])) { firstUnanswered = DATA.questions[i]; break; }
    }
    var html = "";
    html += '<header class="hero">';
    html += '<div class="hero-main">';
    html += '<div class="eyebrow">115-1 · 四年級英語 · 期中考複習</div>';
    html += '<h1>300 題即時練習</h1>';
    html += '<p>聽力 48% · 讀寫 52%｜每答一題馬上批改，附中文解釋</p>';
    html += '<div class="hero-actions">';
    html += '<button class="btn primary lg" data-act="startAll">' + (all.answered >= all.total ? "再練一次全部" : "開始全部 300 題") + '</button>';
    if (hasAnswers && firstUnanswered) {
      html += '<button class="btn ghost lg" data-act="resume">繼續上次（Q' + firstUnanswered.n + '）</button>';
    }
    if (hasAnswers) {
      html += '<button class="btn ghost lg" data-act="resultAll">看成績</button>';
    }
    html += '</div></div>';
    html += '<div class="ring" style="--p:' + pct + '"><div class="ring-in"><b>' + pct + '%</b><span>已完成 ' + all.answered + ' / ' + all.total + '</span></div></div>';
    html += '</header>';

    html += '<div class="stats">';
    html += '<div class="stat"><b>' + all.total + '</b><span>總題數</span></div>';
    html += '<div class="stat"><b>' + partCount("listening") + '</b><span>聽力題</span></div>';
    html += '<div class="stat"><b>' + partCount("reading") + '</b><span>讀寫題</span></div>';
    html += '<div class="stat"><b>8</b><span>大題型</span></div>';
    html += '</div>';

    html += '<div class="card card-pad homesettings"><h3>🔊 語音與速度</h3>' +
      rateControl("rateHome") +
      '<p class="ratehint">拉動滑桿調整聽力音檔與英文朗讀的速度（0.5×～1.5×）。題目裡每個英文旁邊的 🔊 都可以按來聽發音。<br>英文朗讀優先使用 <b>Microsoft Mark（en-US）</b>；若系統沒有 Mark，會自動改用其他 en-US 語音。</p>' +
      (hasAnswers ? '<div class="homesettings-foot"><button class="btn ghost sm" data-act="clearAll">清除全部作答紀錄</button></div>' : '') +
      '</div>';

    html += '<div class="two">';
    html += '<div class="card card-pad"><h3>📌 考試範圍</h3><div class="chips">';
    ["SB p8~9", "SB p12~46", "SB p79", "WB p2~19", "Pocket Book 4-1~35", "Halloween Song（Trick or Treat）"].forEach(function (t) {
      html += '<span class="chip">' + esc(t) + '</span>';
    });
    html += '</div></div>';
    html += '<div class="card card-pad tips"><h3>💡 考前 5 個小提醒</h3><ul>';
    html += '<li>聽力先看圖，再聽關鍵字（天氣、數字、時間）。</li>';
    html += '<li>時間題記住：整點 <b>o\'clock</b>' + sayBtn("o'clock") + '、半點 <b>thirty</b>' + sayBtn("thirty") + '。</li>';
    html += '<li>拼字注意 silent e 與雙寫字母：<b>blackboard</b>' + sayBtn("blackboard") + '、<b>butterfly</b>' + sayBtn("butterfly") + '、<b>eighteen</b>' + sayBtn("eighteen") + '。</li>';
    html += '<li>閱讀題先看題目，再回短文找答案。</li>';
    html += '<li>萬聖節單字：<b>ghost</b>' + sayBtn("ghost") + '、<b>jack-o\'-lantern</b>' + sayBtn("jack-o'-lantern") + '、<b>mummy</b>' + sayBtn("mummy") + '、<b>vampire</b>' + sayBtn("vampire") + '、<b>witch</b>' + sayBtn("witch") + '。</li>';
    html += '</ul></div>';
    html += '</div>';

    ["listening", "reading"].forEach(function (part) {
      var secs = DATA.sections.filter(function (s) { return s.part === part; });
      var total = secs.reduce(function (n, s) { return n + s.count; }, 0);
      html += '<div class="grouphead"><h2>' + (part === "listening" ? "🎧 聽力" : "✍️ 讀寫") + '</h2>';
      html += '<span class="pct">' + (part === "listening" ? "48%" : "52%") + ' · ' + total + ' 題</span><span class="line"></span></div>';
      html += '<div class="secgrid">';
      secs.forEach(function (s) {
        var st = secStats(s.id);
        var p = st.n ? Math.round(st.answered / st.n * 100) : 0;
        var ac = accent(s.id);
        var done = st.answered === st.n;
        html += '<button class="seccard" data-act="sec" data-sec="' + s.id + '" style="--accent:' + ac[0] + ';--accent-soft:' + ac[1] + '">';
        html += '<span class="secicon">' + s.icon + '</span>';
        html += '<span class="secbody">';
        html += '<span class="secname">' + esc(s.name) + ' <em>' + s.pct + '</em></span>';
        html += '<span class="secdesc">' + esc(s.desc) + '</span>';
        html += '<span class="secbar"><i style="width:' + p + '%"></i></span>';
        html += '</span>';
        html += '<span class="secright"><b>' + st.answered + '/' + st.n + '</b><span class="' + (done ? "done" : "") + '">' + (done ? "✅ 完成" : "開始 →") + '</span></span>';
        html += '</button>';
      });
      html += '</div>';
    });

    html += '<p class="footnote">依 115-1 四年級英語期中考公告整理 · 300 題 · 口袋書 4-2～4-35 共 34 字全部入題<br>聽力題使用本機英文語音檔；英文朗讀使用 en-US 語音，可調速度；進度會自動存在這台電腦。</p>';
    app.innerHTML = html;
  }

  function renderQuiz() {
    var qs = list();
    if (!qs.length) { state.view = "home"; renderHome(); return; }
    if (state.idx < 0) state.idx = 0;
    if (state.idx >= qs.length) state.idx = qs.length - 1;
    var q = qs[state.idx];
    var sec = section(q.sec);
    var ac = accent(q.sec);
    var answered = qs.filter(isAnswered).length;
    var a = answerOf(q);
    var pct = Math.round((state.idx + 1) / qs.length * 100);
    var typeLabel = sec.part === "listening" ? "聽力" : "讀寫";

    var html = "";
    html += '<div class="quiztop"><div class="quiztop-in">';
    html += '<button class="iconbtn" data-act="home" title="回首頁">←</button>';
    html += '<div class="qtitle">' + esc(sec.name) + '<small>' + typeLabel + ' · 官方 ' + sec.pct + ' · 本卷 ' + sec.count + ' 題</small></div>';
    html += '<div class="spacer"></div>';
    html += '<span class="pill">第 ' + (state.idx + 1) + ' / ' + qs.length + ' 題</span>';
    html += '<button class="pill ' + (state.autoPlay ? "on" : "") + '" data-act="auto">🔊 自動：' + (state.autoPlay ? "開" : "關") + '</button>';
    html += '<button class="pill ' + (state.sound ? "on" : "") + '" data-act="sound">🔔 音效：' + (state.sound ? "開" : "關") + '</button>';
    html += rateControl("rateQuiz");
    if (sec.note) html += '<button class="pill" data-act="tips">💡 提示</button>';
    html += '<button class="pill danger" data-act="result">看成績</button>';
    html += '</div></div>';
    html += '<div class="progress"><i style="width:' + pct + '%"></i></div>';

    html += '<details class="palette"' + (state.paletteOpen ? " open" : "") + '>';
    html += '<summary>題號總覽 <b>' + answered + ' / ' + qs.length + '</b> 已答<span class="pmeta">點號碼跳題</span></summary>';
    html += '<div class="pgrid">';
    qs.forEach(function (qq, i) {
      var aa = answerOf(qq);
      var cls = "pbtn";
      if (aa) cls += aa.ok ? " ok" : " no";
      if (i === state.idx) cls += " cur";
      html += '<button class="' + cls + '" data-act="jump" data-i="' + i + '" title="第 ' + (i + 1) + ' 題">' + (qq.n) + '</button>';
    });
    html += '</div></details>';

    html += '<section class="qcard" style="--accent:' + ac[0] + ';--accent-soft:' + ac[1] + '">';
    html += '<div class="qhead">';
    html += '<span class="qno">Q' + q.n + '</span>';
    html += '<span class="tag">' + sec.icon + ' ' + esc(sec.name) + '</span>';
    html += '<span class="tag ghost">' + typeLabel + '</span>';
    if (q.type === "spell") html += '<span class="tag ghost">拼字</span>';
    if (q.type === "write") html += '<span class="tag ghost">寫句子</span>';
    if (a) html += '<span class="qstatus ' + (a.ok ? "ok" : "no") + '">' + (a.ok ? "✅ 已答對" : "❌ 已答錯") + '</span>';
    else html += '<span class="qstatus">未作答</span>';
    html += '</div>';

    if (q.group) html += renderPassage(q, qs);

    var psay = promptSay(q);
    html += '<div class="qprompt">' + esc(q.prompt) + (psay ? sayBtn(psay, "inline") : "") + '</div>';

    if (q.clock) html += '<div class="clockwrap">' + clockSVG(q.clock.h, q.clock.m) + '</div>';
    if (q.audioFile) html += renderAudio(q);
    if (q.type === "mc") html += renderMC(q, a);
    else if (q.type === "pic") html += renderPic(q, a);
    else html += renderFill(q, a);

    if (a) html += renderFeedback(q, a);

    html += '<div class="qfoot">';
    html += '<button class="btn ghost" data-act="prev"' + (state.idx === 0 ? " disabled" : "") + '>← 上一題</button>';
    if (!a) html += '<button class="btn ghost sm" data-act="reveal">不會，看答案</button>';
    html += '<span class="spacer"></span>';
    html += '<span class="pos">' + (state.idx + 1) + ' / ' + qs.length + '</span>';
    html += '<button class="btn primary" data-act="next">' + (state.idx === qs.length - 1 ? "看成績 →" : "下一題 →") + '</button>';
    html += '</div>';
    html += '<div class="keyhint">鍵盤：1–4 選答 · Enter 檢查／下一題 · ← → 換題 · P 播放</div>';
    html += '</section>';
    app.innerHTML = html;
  }

  function renderPassage(q, qs) {
    var first = -1;
    for (var i = 0; i < qs.length; i++) {
      if (qs[i].group && qs[i].group.id === q.group.id) { first = i; break; }
    }
    var open = state.openGroups[q.group.id];
    if (typeof open !== "boolean") open = (first === state.idx);
    return '<details class="passage" data-gid="' + esc(q.group.id) + '"' + (open ? " open" : "") + '>' +
      '<summary>' + esc(q.group.title) + sayBtn(q.group.text, "inline") + '</summary>' +
      '<p>' + esc(q.group.text) + '</p></details>';
  }

  function renderAudio(q) {
    return '<div class="audiobox" id="audiobox">' +
      '<button class="playbtn" data-act="play">🔊 播放</button>' +
      '<span class="saybtn wide" role="button" tabindex="0" data-act="say" data-say="' + esc(englishOnly(q.audio) || q.audio) + '" title="用電腦語音再唸一次">🔊 語音</span>' +
      '<div class="wave"><i></i><i></i><i></i><i></i><i></i></div>' +
      '<span class="audiotip">可重複聽 · 速度 ' + fmtRate(state.rate) + '</span>' +
      '</div>' +
      '<audio id="audioEl" preload="auto" src="' + esc(q.audioFile) + '"></audio>';
  }

  function renderMC(q, a) {
    var html = '<div class="optlist">';
    q.options.forEach(function (o, i) {
      var cls = "opt";
      var mark = "";
      if (a) {
        cls += " locked";
        if (i === q.answer) { cls += " correct"; mark = "✅"; }
        else if (a.v === i) { cls += " wrong"; mark = "❌"; }
      }
      html += '<button class="' + cls + '" data-act="opt" data-i="' + i + '"' + (a ? ' aria-disabled="true"' : "") + '>';
      html += '<span class="olabel">' + String.fromCharCode(65 + i) + '</span>';
      html += '<span class="otext">' + esc(o.text || "") + '</span>';
      html += sayBtn(optionSay(o), "optsay");
      html += '<span class="omark">' + mark + '</span>';
      html += '</button>';
    });
    html += '</div>';
    return html;
  }

  function renderPic(q, a) {
    var html = '<div class="picgrid' + (a ? " answered" : "") + '">';
    q.options.forEach(function (o, i) {
      var cls = "picopt";
      var badge = "";
      if (a) {
        cls += " locked";
        if (i === q.answer) { cls += " correct"; badge = '<span class="badge">✅</span>'; }
        else if (a.v === i) { cls += " wrong"; badge = '<span class="badge">❌</span>'; }
      }
      html += '<button class="' + cls + '" data-act="opt" data-i="' + i + '"' + (a ? ' aria-disabled="true"' : "") + '>';
      html += badge;
      html += sayBtn(optionSay(o), "picsay");
      if (o.clock) {
        html += '<span class="picicon">' + clockSVG(o.clock.h, o.clock.m) + '</span>';
        html += '<span class="piclabel">' + esc(o.label || "") + '</span>';
      } else if (o.text) {
        html += '<span class="picnum">' + esc(o.text) + '</span>';
      } else {
        html += '<span class="picicon">' + (o.icon || "") + '</span>';
        html += '<span class="piclabel">' + esc(o.label || "") + '</span>';
      }
      html += '</button>';
    });
    html += '</div>';
    return html;
  }

  function renderFill(q, a) {
    var user = a && typeof a.v === "string" ? a.v : "";
    var hint = q.hint || "";
    if (!hint && q.sec === "clock") hint = "句型：It's ______.";
    if (!hint && q.type === "write") hint = "請用完整句子回答";
    var showLetter = !!state.letterHints[q.id];
    var html = '<div class="answerbox">';
    html += '<div class="hintline">';
    if (hint) html += '<span class="hint">' + esc(hint) + sayBtn(hint, "inline") + '</span>';
    if (q.type === "spell") html += '<button class="tiny" data-act="letterhint">' + (showLetter ? "隱藏提示" : "字母提示") + '</button>';
    html += '</div>';
    html += '<div class="inputrow">';
    html += '<input id="answerInput" type="text" autocomplete="off" autocapitalize="off" spellcheck="false" placeholder="' + (q.type === "spell" ? "輸入英文單字…" : "輸入完整英文句子…") + '" value="' + esc(user) + '"' + (a ? " disabled" : "") + '>';
    if (!a) html += '<button class="btn primary" data-act="check">檢查答案</button>';
    html += '</div>';
    if (q.type === "spell") {
      html += '<div class="letterhint' + (showLetter ? "" : " hidden") + '" id="letterhint">' + esc(q.hint || "") + '　·　' + q.letters + ' 個字母，開頭是「' + esc(q.first || "") + '」</div>';
    }
    html += '</div>';
    return html;
  }

  function renderFeedback(q, a) {
    var main = correctText(q);
    var sample = q.sample && q.sample !== main ? q.sample : "";
    var html = '<div class="feedback ' + (a.ok ? "ok" : "bad") + '">';
    if (a.ok) {
      html += '<div class="fbtop"><span class="fbicon">✅</span><b>答對了！</b></div>';
      html += '<div class="fbsay"><span class="fbsay-k">答案：</span><b class="en">' + esc(main) + '</b>' + sayBtn(main, "inline") + '</div>';
      html += '<div class="fbexplain">' + q.explain + '</div>';
    } else {
      html += '<div class="fbtop"><span class="fbicon">❌</span><b>答錯了</b></div>';
      html += '<div class="fbanswer">正確答案：<b>' + esc(main) + '</b>' + sayBtn(main, "inline") + '</div>';
      if (a.revealed) html += '<div class="fbuser">你按了「看答案」，這題先算答錯，記得再練一次。</div>';
      else if (typeof a.v === "string" && a.v) html += '<div class="fbuser">你的答案：<b>' + esc(a.v) + '</b>' + sayBtn(a.v, "inline") + '</div>';
      html += '<div class="fbexplain">' + q.explain + '</div>';
    }
    if (sample) html += '<div class="fbsay"><span class="fbsay-k">例句：</span><b class="en">' + esc(sample) + '</b>' + sayBtn(sample, "inline") + '</div>';
    html += '</div>';
    return html;
  }

  function renderResult() {
    var scopeQs = state.sec === "all" ? DATA.questions : DATA.questions.filter(function (q) { return q.sec === state.sec; });
    var secs = state.sec === "all" ? DATA.sections : [section(state.sec)];
    var total = scopeQs.length;
    var answered = 0, correct = 0;
    scopeQs.forEach(function (q) {
      var a = answerOf(q);
      if (a) { answered++; if (a.ok) correct++; }
    });
    var wrong = answered - correct;
    var unanswered = total - answered;
    var score = total ? Math.round(correct / total * 100) : 0;
    var accuracy = answered ? Math.round(correct / answered * 100) : 0;
    var title = state.sec === "all" ? "全部 300 題成績" : section(state.sec).name + " 成績";

    var html = "";
    html += '<div class="resulthero">';
    html += '<div class="ring" style="--p:' + score + '"><div class="ring-in"><b>' + score + '%</b><span>得分</span></div></div>';
    html += '<div><div class="eyebrow">本次成績</div><h1>' + esc(title) + '</h1>';
    html += '<p>答對 ' + correct + ' / ' + total + ' 題 · 作答正確率 ' + accuracy + '%' + (unanswered ? ' · 未作答 ' + unanswered + ' 題' : '') + '</p></div>';
    html += '<div class="ractions">';
    if (unanswered) html += '<button class="btn primary" data-act="continueUnanswered">繼續未作答</button>';
    html += '<button class="btn ghost" data-act="retry">再練一次' + (state.sec === "all" ? "全部" : "此大題") + '</button>';
    html += '<button class="btn ghost" data-act="home">回首頁</button>';
    html += '</div></div>';

    html += '<div class="statgrid">';
    html += '<div class="bigstat"><b>' + score + '%</b><span>得分（以總題數計）</span></div>';
    html += '<div class="bigstat"><b>' + correct + '</b><span>答對題數</span></div>';
    html += '<div class="bigstat"><b>' + wrong + '</b><span>答錯題數</span></div>';
    html += '<div class="bigstat"><b>' + unanswered + '</b><span>未作答</span></div>';
    html += '</div>';

    html += '<div class="card breakdown"><div class="card-pad"><h3>各大題表現</h3><table><thead><tr><th>大題</th><th class="num">已答</th><th class="num">答對</th><th class="num">正確率</th><th>進度</th></tr></thead><tbody>';
    secs.forEach(function (s) {
      var qs = DATA.questions.filter(function (q) { return q.sec === s.id; });
      var an = 0, ok = 0;
      qs.forEach(function (q) {
        var a = answerOf(q);
        if (a) { an++; if (a.ok) ok++; }
      });
      var p = an ? Math.round(ok / an * 100) : 0;
      html += '<tr><td>' + s.icon + ' ' + esc(s.name) + '</td><td class="num">' + an + '/' + qs.length + '</td><td class="num">' + ok + '</td><td class="num">' + p + '%</td><td><div class="minibar"><i style="width:' + p + '%"></i></div></td></tr>';
    });
    html += '</tbody></table></div></div>';

    html += '<div class="wronglist"><h3>需要再看一次的題目</h3>';
    if (wrong === 0) {
      html += '<div class="emptygood">' + (unanswered ? '目前沒有答錯的題目，繼續完成剩下的 ' + unanswered + ' 題吧！' : '🎉 全部答對，太厲害了！') + '</div>';
    } else {
      scopeQs.forEach(function (q) {
        var a = answerOf(q);
        if (!a || a.ok) return;
        html += '<div class="wrongcard">';
        html += '<span class="wq">Q' + q.n + '</span>';
        var wsay = promptSay(q);
        html += '<div class="wt">' + esc(q.prompt) + (wsay ? sayBtn(wsay, "inline") : "") +
          '<div class="wa">正解：' + esc(correctText(q)) + sayBtn(correctText(q), "inline") + '</div></div>';
        html += '<button class="btn sm" data-act="jumpid" data-id="' + q.id + '">回去看</button>';
        html += '</div>';
      });
    }
    html += '</div>';
    html += '<p class="footnote">得分以總題數計算，未作答視為未得分；作答正確率只計算已作答的題目。</p>';
    app.innerHTML = html;
  }

  /* ---------------- modal ---------------- */
  function openTips() {
    var q = current();
    var sec = section(q ? q.sec : state.sec);
    var html = '<h2>' + sec.icon + ' ' + esc(sec.name) + ' · 小提示</h2>';
    html += '<p>' + esc(sec.note).replace(/\n/g, "<br>") + '</p>';
    if (sec.id === "halloween") {
      html += '<p class="en" style="background:#fff8ef;border:1px solid #f3e3cd;border-radius:12px;padding:12px 14px;line-height:1.95">' +
        'Knock knock, trick or treat?' + sayBtn("Knock knock, trick or treat?") + '<br>' +
        'Who are you?' + sayBtn("Who are you?") + '<br>' +
        'I\'m a ghost. I\'m a little ghost.' + sayBtn("I'm a ghost. I'm a little ghost.") + '<br>' +
        'I\'m a witch. I\'m a little witch.' + sayBtn("I'm a witch. I'm a little witch.") + '<br>' +
        'I\'m a mummy. I\'m a little mummy.' + sayBtn("I'm a mummy. I'm a little mummy.") + '<br>' +
        'I\'m a vampire. I\'m a little vampire.' + sayBtn("I'm a vampire. I'm a little vampire.") + '<br>' +
        'Happy Halloween! Happy Halloween!' + sayBtn("Happy Halloween! Happy Halloween!") +
        '</p>';
    }
    html += '<p style="font-size:12.5px;color:#6c7d79">官方配分：' + sec.pct + '・本卷 ' + sec.count + ' 題</p>';
    html += '<div class="close"><button class="btn primary" data-act="closemodal">知道了</button></div>';
    modalbox.innerHTML = html;
    modal.classList.add("on");
    modal.setAttribute("aria-hidden", "false");
  }
  function closeModal() {
    modal.classList.remove("on");
    modal.setAttribute("aria-hidden", "true");
  }

  /* ---------------- after render ---------------- */
  function afterRender(opts) {
    var pal = document.querySelector(".palette");
    if (pal) {
      pal.addEventListener("toggle", function () {
        state.paletteOpen = pal.open;
        persist();
      });
    }
    document.querySelectorAll("details.passage").forEach(function (d) {
      d.addEventListener("toggle", function () {
        state.openGroups[d.dataset.gid] = d.open;
        persist();
      });
    });
    var input = document.getElementById("answerInput");
    if (input && !input.disabled && window.matchMedia && window.matchMedia("(pointer:fine)").matches) {
      setTimeout(function () { try { input.focus({ preventScroll: true }); } catch (e) {} }, 120);
    }
    if (opts && opts.autoplay && state.autoPlay && state.view === "quiz") {
      var q = current();
      if (q && q.audioFile && !isAnswered(q)) {
        setTimeout(function () { playAudio(true); }, 380);
      }
    }
  }

  /* ---------------- events ---------------- */
  app.addEventListener("click", function (e) {
    var el = e.target.closest("[data-act]");
    if (!el) return;
    var act = el.getAttribute("data-act");
    if (act === "say") {
      e.preventDefault();
      e.stopPropagation();
      speak(el.getAttribute("data-say"), el);
      return;
    }
    if (act === "startAll") { start("all"); }
    else if (act === "resume") { resume(); }
    else if (act === "sec") { start(el.getAttribute("data-sec")); }
    else if (act === "home") { state.view = "home"; persist(); render(); window.scrollTo({ top: 0, behavior: "smooth" }); }
    else if (act === "result") { showResult(); }
    else if (act === "resultAll") { state.sec = "all"; showResult(); }
    else if (act === "clearAll") {
      if (!window.confirm("確定要清除全部 300 題的作答紀錄嗎？")) return;
      state.answers = {};
      state.pos = {};
      state.letterHints = {};
      state.openGroups = {};
      persist();
      renderHome();
      toast("已清除全部作答紀錄");
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
    else if (act === "opt") { choose(Number(el.getAttribute("data-i"))); }
    else if (act === "check") { checkFill(); }
    else if (act === "reveal") { reveal(); }
    else if (act === "play") { playAudio(false); }
    else if (act === "auto") {
      state.autoPlay = !state.autoPlay;
      persist();
      el.classList.toggle("on", state.autoPlay);
      el.textContent = "🔊 自動：" + (state.autoPlay ? "開" : "關");
      if (state.autoPlay) playAudio(false);
    }
    else if (act === "sound") {
      state.sound = !state.sound;
      persist();
      el.classList.toggle("on", state.sound);
      el.textContent = "🔔 音效：" + (state.sound ? "開" : "關");
      if (state.sound) tone(true);
    }
    else if (act === "tips") { openTips(); }
    else if (act === "closemodal") { closeModal(); }
    else if (act === "prev") { go(-1); }
    else if (act === "next") { go(1); }
    else if (act === "jump") { jump(Number(el.getAttribute("data-i"))); }
    else if (act === "jumpid") { jumpId(el.getAttribute("data-id")); }
    else if (act === "retry") { retry(); }
    else if (act === "continueUnanswered") { continueUnanswered(); }
    else if (act === "letterhint") { toggleLetterHint(); }
  });

  app.addEventListener("input", function (e) {
    var t = e.target;
    if (!t || !t.classList || !t.classList.contains("rate")) return;
    state.rate = clampRate(t.value);
    document.querySelectorAll("input.rate").forEach(function (s) {
      if (Math.abs(Number(s.value) - state.rate) > 0.001) s.value = state.rate;
    });
    document.querySelectorAll(".ratebadge").forEach(function (b) { b.textContent = fmtRate(state.rate); });
    var tip = document.querySelector(".audiotip");
    if (tip && tip.textContent.indexOf("速度") >= 0) tip.textContent = "可重複聽 · 速度 " + fmtRate(state.rate);
    var audio = document.getElementById("audioEl");
    if (audio) { try { audio.playbackRate = state.rate; } catch (err) {} }
    persist();
  });

  app.addEventListener("keydown", function (e) {
    var sayEl = e.target && e.target.closest ? e.target.closest('[data-act="say"]') : null;
    if (sayEl) {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        e.stopPropagation();
        speak(sayEl.getAttribute("data-say"), sayEl);
      }
      return;
    }
    if (e.target && e.target.tagName === "INPUT") {
      if (e.key === "Enter") { e.preventDefault(); checkFill(); }
      return;
    }
    if (state.view !== "quiz") return;
    var q = current();
    if (!q) return;
    if (e.key === "ArrowLeft") { e.preventDefault(); go(-1); return; }
    if (e.key === "ArrowRight") { e.preventDefault(); go(1); return; }
    if (e.key.toLowerCase() === "p") { e.preventDefault(); playAudio(false); return; }
    if (/^[1-4]$/.test(e.key)) {
      var i = Number(e.key) - 1;
      if (q.type === "mc" || q.type === "pic") { if (q.options[i]) { e.preventDefault(); choose(i); } }
      return;
    }
    if (e.key === "Enter") {
      if (isAnswered(q)) { e.preventDefault(); go(1); }
      else if (q.type === "mc" || q.type === "pic") { e.preventDefault(); toast("請先選一個答案（鍵盤 1–4）"); }
    }
  });

  modal.addEventListener("click", function (e) {
    if (e.target === modal) closeModal();
  });
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") closeModal();
  });

  render();
})();
