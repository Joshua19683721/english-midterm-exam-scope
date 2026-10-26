"use strict";

const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const { SECTIONS, QUESTIONS } = require("./questions");

const OUT_DIR = path.resolve(__dirname, "..");
const AUDIO_DIR = path.join(OUT_DIR, "assets", "audio");
const RATE = -1;

function fail(msg) {
  console.error("BUILD FAILED: " + msg);
  process.exit(1);
}

/* ---------- validate ---------- */
if (QUESTIONS.length !== 300) fail("題數不是 300，而是 " + QUESTIONS.length);

const bySec = {};
QUESTIONS.forEach(function (q, i) {
  bySec[q.sec] = (bySec[q.sec] || 0) + 1;
  q.n = i + 1;
  q.id = "q" + String(i + 1).padStart(3, "0");

  if (q.type === "mc" || q.type === "pic") {
    if (!Array.isArray(q.options) || q.options.length < 2) fail(q.id + " 選項不足");
    if (!(q.answer >= 0 && q.answer < q.options.length)) fail(q.id + " answer 超出範圍");
    q.options.forEach(function (o, j) {
      if (!o.text && !o.icon && !o.clock) fail(q.id + " 選項 " + j + " 沒有內容");
    });
  } else if (q.type === "spell" || q.type === "write") {
    if (!Array.isArray(q.accept) || !q.accept.length) fail(q.id + " 沒有 accept");
    if (!q.explain) fail(q.id + " 沒有 explain");
  } else {
    fail(q.id + " 未知題型 " + q.type);
  }
  if (!q.prompt) fail(q.id + " 沒有 prompt");
});

SECTIONS.forEach(function (s) {
  const n = bySec[s.id] || 0;
  s.count = n;
  s.actualPct = Math.round(n / 3) + "%";
  if (!n) fail("section " + s.id + " 沒有題目");
});

const expected = { phonics: 40, picture: 58, spelling: 46, daily: 24, vocab: 24, clock: 48, reading: 44, halloween: 16 };
Object.keys(expected).forEach(function (k) {
  if ((bySec[k] || 0) !== expected[k]) fail("section " + k + " 題數 " + (bySec[k] || 0) + "，預期 " + expected[k]);
});

const spellingWords = QUESTIONS.filter(function (q) { return q.sec === "spelling"; }).map(function (q) { return q.audio; });
if (new Set(spellingWords).size !== 46) fail("拼字單字沒有 46 個不重複");

/* ---------- 穩定打亂選項，避免答案總是在 A ---------- */
function seedOf(str) {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) h = Math.imul(h ^ str.charCodeAt(i), 16777619);
  return h >>> 0;
}
function rngOf(seed) {
  let s = seed >>> 0;
  return function () {
    s = (Math.imul(s, 1664525) + 1013904223) >>> 0;
    return s / 4294967296;
  };
}
QUESTIONS.forEach(function (q) {
  if (q.type !== "mc" && q.type !== "pic") return;
  const rand = rngOf(seedOf(q.id || (q.sec + q.prompt)));
  for (let i = q.options.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    const tmp = q.options[i];
    q.options[i] = q.options[j];
    q.options[j] = tmp;
    if (q.answer === i) q.answer = j;
    else if (q.answer === j) q.answer = i;
  }
});

/* ---------- audio manifest ---------- */
const audioMap = {};
const manifest = [];
QUESTIONS.forEach(function (q) {
  if (!q.audio) return;
  const key = q.audio + "|" + RATE;
  if (!audioMap[key]) {
    const file = "a_" + crypto.createHash("sha1").update(key).digest("hex").slice(0, 12) + ".mp3";
    audioMap[key] = file;
    manifest.push({ file: file, text: q.audio, rate: RATE, voice: "Microsoft Zira Desktop" });
  }
  q.audioFile = "assets/audio/" + audioMap[key];
});

/* ---------- data.js ---------- */
const data = {
  meta: {
    title: "115-1 四年級英語期中考 · 300 題",
    subtitle: "聽力 48% · 讀寫 52% · 每題立即對答案",
    total: 300,
    listening: 144,
    reading: 156,
    updated: "2026-10-26"
  },
  sections: SECTIONS,
  questions: QUESTIONS
};

fs.mkdirSync(AUDIO_DIR, { recursive: true });
fs.writeFileSync(path.join(OUT_DIR, "data.js"), "window.QUIZ_DATA = " + JSON.stringify(data, null, 2) + ";\n", "utf8");
fs.writeFileSync(path.join(__dirname, "audio-manifest.json"), JSON.stringify(manifest, null, 2) + "\n", "utf8");

console.log("OK 300 questions");
SECTIONS.forEach(function (s) { console.log("  " + s.id + ": " + s.count + " (" + s.actualPct + ")"); });
console.log("  audio: " + manifest.length + " files");
