"use strict";

/* ============================================================
   115-1 四年級英語期中考 · 300 題互動練習
   範圍：SB p8~9 / p12~46 / p79、WB p2~19、Pocket Book 4-1~35、
        Halloween Song (Trick or Treat)
   題型比例：聽力 48%（144 題）／讀寫 52%（156 題）
   ============================================================ */

const SECTIONS = [
  {
    id: "phonics",
    part: "listening",
    name: "Phonics 長短母音",
    en: "Long & Short Vowels",
    icon: "🔤",
    pct: "12%",
    note: "長母音的字尾通常有 e（e 不發音），例如 mat → mate、kit → kite。短母音沒有字尾 e。聽的時候注意母音長短。",
    desc: "聽單字，選出正確拼法。涵蓋 a / e / i / o / u 的短母音與長母音。"
  },
  {
    id: "picture",
    part: "listening",
    name: "圖片圈選",
    en: "Listen & Choose",
    icon: "🖼️",
    pct: "24%",
    note: "先看選項的圖，再聽關鍵字：天氣、數字、時間、教室用語、萬聖節單字。",
    desc: "聽句子或單字，選出正確的圖片。涵蓋 U1 天氣、U2 數字與時間、教室用語、萬聖節。"
  },
  {
    id: "spelling",
    part: "listening",
    name: "口袋書拼字",
    en: "Pocket Book Spelling",
    icon: "✏️",
    pct: "12%",
    note: "口袋書 4-2～4-35 共 34 字全部入題，再加上天氣與萬聖節主題單字。拼字時注意：silent e、雙寫字母（blackboard、butterfly、eighteen、eighty）。",
    desc: "聽單字，拼出正確拼法。口袋書 34 字＋主題單字 12 字。"
  },
  {
    id: "daily",
    part: "reading",
    name: "Daily English 配合",
    en: "Daily English",
    icon: "💬",
    pct: "8%",
    note: "U1：Line up, please. / Let's go.　U2：Listen! / Great!　教室用語：Open your book. / Close your book. / Look at the blackboard. / Come here, please.",
    desc: "U1、U2 日常生活用語，看情境選出最適合的句子。"
  },
  {
    id: "vocab",
    part: "reading",
    name: "單字句型配合",
    en: "Vocabulary & Sentences",
    icon: "🧩",
    pct: "8%",
    note: "U1 句型：How's the weather? It's sunny.　U2 句型：What time is it? It's nine o'clock. / It's nine thirty.",
    desc: "U1、U2 主要單字與句型配對。"
  },
  {
    id: "clock",
    part: "reading",
    name: "看時鐘寫句子",
    en: "What Time Is It?",
    icon: "🕒",
    pct: "16%",
    note: "整點：It's + 數字 + o'clock.　半點：It's + 數字 + thirty.　例：It's three o'clock. / It's seven thirty.",
    desc: "看時鐘，寫出完整英文句子。整點與半點各半。"
  },
  {
    id: "reading",
    part: "reading",
    name: "U1 閱讀理解",
    en: "Reading Comprehension",
    icon: "📖",
    pct: "14%",
    note: "先讀短文，再看題目。填空題注意單字拼法；寫句子題可用短文中的句型。",
    desc: "六篇短文（天氣、萬聖節、學校生活），包含選擇、填空與寫句子。"
  },
  {
    id: "halloween",
    part: "reading",
    name: "萬聖節歌詞",
    en: "Halloween Song",
    icon: "🎃",
    pct: "6%",
    note: "歌詞有兩段：第一段想要 something good to eat（好吃的東西），第二段想要 something sweet to eat（甜的東西）。注意水果與甜食單字。",
    desc: "Trick or Treat 歌詞：水果、甜食、歌詞填空與押韻。"
  }
];

const QUESTIONS = [];
function add(q) { QUESTIONS.push(q); return q; }

/* ---------- helpers ---------- */
function mc(sec, prompt, options, answer, explain, extra) {
  return Object.assign({
    sec, type: "mc", prompt,
    options: options.map(t => typeof t === "string" ? { text: t } : t),
    answer, explain
  }, extra || {});
}
function pic(sec, audio, options, answer, explain, extra) {
  return Object.assign({
    sec, type: "pic", audio,
    prompt: "聽一聽，選出正確的圖片。",
    options, answer, explain
  }, extra || {});
}
function img(icon, label) { return { icon, label }; }
function num(n) { return { text: String(n) }; }
function clk(h, m) {
  return { clock: { h, m }, label: h + ":" + String(m).padStart(2, "0") };
}
function spell(word, zh, sentence, note) {
  return {
    sec: "spelling", type: "spell", audio: word,
    prompt: "聽一聽，拼出單字。",
    hint: "中文：" + zh,
    letters: word.length,
    first: word[0],
    accept: [word],
    sample: sentence,
    explain: word + "（" + zh + "）" + (note ? "・" + note : "") + "<br>例：" + sentence
  };
}
function writeQ(sec, prompt, accept, sample, explain, extra) {
  return Object.assign({
    sec, type: "write", prompt, accept, sample, explain
  }, extra || {});
}

/* ============================================================
   1. Phonics（40 題）
   ============================================================ */
const PHONICS = [
  ["mat", "mate", 0, "mat /mæt/ 是短母音 a；mate /meɪt/ 是 a_e，a 發字母音 /eɪ/，e 不發音。"],
  ["cap", "cape", 1, "cap /kæp/ 是短音；cape /keɪp/ 是 a_e，a 發 /eɪ/。"],
  ["tap", "tape", 1, "tap /tæp/ 是短音；tape /teɪp/ 是 a_e，a 發 /eɪ/。"],
  ["hat", "hate", 0, "hat /hæt/ 是短音；hate /heɪt/ 是 a_e，a 發 /eɪ/。"],
  ["mad", "made", 1, "mad /mæd/ 是短音；made /meɪd/ 是 a_e，a 發 /eɪ/。"],
  ["pet", "Pete", 1, "pet /pet/ 是短音 /e/；Pete /piːt/ 是長音 /iː/，e_e 讓 e 發字母音。"],
  ["jet", "Jeep", 0, "jet /dʒet/ 是短音 /e/；Jeep /dʒiːp/ 的 ee 發長音 /iː/。"],
  ["met", "meet", 1, "met /met/ 是短音 /e/；meet /miːt/ 的 ee 發長音 /iː/。"],
  ["bed", "bead", 0, "bed /bed/ 是短音 /e/；bead /biːd/ 的 ea 發長音 /iː/。"],
  ["kit", "kite", 1, "kit /kɪt/ 是短音 /ɪ/；kite /kaɪt/ 是 i_e，i 發 /aɪ/。"],
  ["pin", "pine", 0, "pin /pɪn/ 是短音 /ɪ/；pine /paɪn/ 是 i_e，i 發 /aɪ/。"],
  ["win", "wine", 1, "win /wɪn/ 是短音 /ɪ/；wine /waɪn/ 是 i_e，i 發 /aɪ/。"],
  ["bit", "bite", 0, "bit /bɪt/ 是短音 /ɪ/；bite /baɪt/ 是 i_e，i 發 /aɪ/。"],
  ["rid", "ride", 1, "rid /rɪd/ 是短音 /ɪ/；ride /raɪd/ 是 i_e，i 發 /aɪ/。"],
  ["hop", "hope", 1, "hop /hɒp/ 是短音 /ɒ/；hope /hoʊp/ 是 o_e，o 發 /oʊ/。"],
  ["cod", "code", 1, "cod /kɒd/ 是短音 /ɒ/；code /koʊd/ 是 o_e，o 發 /oʊ/。"],
  ["rob", "robe", 0, "rob /rɒb/ 是短音 /ɒ/；robe /roʊb/ 是 o_e，o 發 /oʊ/。"],
  ["not", "note", 1, "not /nɒt/ 是短音 /ɒ/；note /noʊt/ 是 o_e，o 發 /oʊ/。"],
  ["cop", "cope", 0, "cop /kɒp/ 是短音 /ɒ/；cope /koʊp/ 是 o_e，o 發 /oʊ/。"],
  ["cut", "cute", 1, "cut /kʌt/ 是短音 /ʌ/；cute /kjuːt/ 是 u_e，u 發字母音 /juː/。"],
  ["cub", "cube", 1, "cub /kʌb/ 是短音 /ʌ/；cube /kjuːb/ 是 u_e，u 發 /juː/。"],
  ["tub", "tube", 0, "tub /tʌb/ 是短音 /ʌ/；tube /tjuːb/ 是 u_e，u 發 /juː/。"],
  ["hug", "huge", 1, "hug /hʌɡ/ 是短音 /ʌ/；huge /hjuːdʒ/ 是 u_e，u 發 /juː/。"],
  ["us", "use", 1, "us /ʌs/ 是短音 /ʌ/；use /juːz/ 是 u_e，u 發 /juː/。"]
];
PHONICS.forEach(function (p) {
  add(mc("phonics", "聽一聽，選出你聽到的單字。", [p[0], p[1]], p[2], p[3], { audio: p[2] === 0 ? p[0] : p[1] }));
});

/* Phonics 進階 16 題（總計 40） */
const PHONICS2 = [
  ["rat", "rate", 0, "rat /ræt/ 是短母音 a；rate /reɪt/ 是 a_e，a 發字母音 /eɪ/。"],
  ["plan", "plane", 1, "plan /plæn/ 是短音；plane /pleɪn/ 是 a_e，a 發 /eɪ/。"],
  ["man", "mane", 1, "man /mæn/ 是短音；mane /meɪn/ 是 a_e，a 發 /eɪ/。"],
  ["can", "cane", 0, "can /kæn/ 是短音；cane /keɪn/ 是 a_e，a 發 /eɪ/。"],
  ["dim", "dime", 1, "dim /dɪm/ 是短音 /ɪ/；dime /daɪm/ 是 i_e，i 發 /aɪ/。"],
  ["fin", "fine", 0, "fin /fɪn/ 是短音 /ɪ/；fine /faɪn/ 是 i_e，i 發 /aɪ/。"],
  ["pip", "pipe", 1, "pip /pɪp/ 是短音 /ɪ/；pipe /paɪp/ 是 i_e，i 發 /aɪ/。"],
  ["rip", "ripe", 0, "rip /rɪp/ 是短音 /ɪ/；ripe /raɪp/ 是 i_e，i 發 /aɪ/。"],
  ["quit", "quite", 1, "quit /kwɪt/ 是短音 /ɪ/；quite /kwaɪt/ 是 i_e，i 發 /aɪ/。"],
  ["rod", "rode", 1, "rod /rɒd/ 是短音 /ɒ/；rode /roʊd/ 是 o_e，o 發 /oʊ/。"],
  ["fed", "feed", 0, "fed /fed/ 是短音 /e/；feed /fiːd/ 的 ee 發長音 /iː/。"],
  ["fell", "feel", 1, "fell /fel/ 是短音 /e/；feel /fiːl/ 的 ee 發長音 /iː/。"],
  ["set", "seat", 0, "set /set/ 是短音 /e/；seat /siːt/ 的 ea 發長音 /iː/。"],
  ["well", "wheel", 1, "well /wel/ 是短音 /e/；wheel /wiːl/ 的 ee 發長音 /iː/。"],
  ["slid", "slide", 1, "slid /slɪd/ 是短音 /ɪ/；slide /slaɪd/ 是 i_e，i 發 /aɪ/。"],
  ["shin", "shine", 0, "shin /ʃɪn/ 是短音 /ɪ/；shine /ʃaɪn/ 是 i_e，i 發 /aɪ/。"]
];
PHONICS2.forEach(function (p) {
  add(mc("phonics", "聽一聽，選出你聽到的單字。", [p[0], p[1]], p[2], p[3], { audio: p[2] === 0 ? p[0] : p[1] }));
});

/* ============================================================
   2. 圖片圈選（58 題）
   ============================================================ */
const W = {
  sunny: img("☀️", "sunny"),
  rainy: img("🌧️", "rainy"),
  cloudy: img("☁️", "cloudy"),
  windy: img("🌬️", "windy"),
  cold: img("🥶", "cold"),
  hot: img("🥵", "hot"),
  sunnyHot: img("☀️🥵", "sunny and hot"),
  rainyCold: img("🌧️🥶", "rainy and cold")
};
const C = {
  quiet: img("🤫", "Be quiet."),
  page: img('📖<span class="mini">12</span>', "Please turn to page 12."),
  repeat: img("🔁🗣️", "Repeat after me."),
  louder: img("📢", "Louder, please."),
  raise: img("🙋", "Raise your hand."),
  down: img('🙋<span class="mini">⬇</span>', "Put down your hand."),
  hw: img("📄✏️", "Show me your homework."),
  seat: img("🪑⬅️", "Go back to your seat.")
};
const MUMMY = '<svg viewBox="0 0 100 100" class="mummy" aria-hidden="true">' +
  '<ellipse cx="50" cy="21" rx="14" ry="16" fill="#f4e8cc" stroke="#b7a57c" stroke-width="3"/>' +
  '<path d="M37 17h26M38 25h24M41 33h18" stroke="#b7a57c" stroke-width="2"/>' +
  '<circle cx="44" cy="21" r="2" fill="#3a3a3a"/><circle cx="56" cy="21" r="2" fill="#3a3a3a"/>' +
  '<path d="M37 39q13-7 26 0l6 35q-19 8-38 0z" fill="#f4e8cc" stroke="#b7a57c" stroke-width="3"/>' +
  '<path d="M39 47h22M37 57h26M42 67h17" stroke="#b7a57c" stroke-width="2"/>' +
  '<path d="M36 44 22 58M64 44 78 58" stroke="#f4e8cc" stroke-width="9" stroke-linecap="round"/>' +
  '<path d="M36 44 22 58M64 44 78 58" stroke="#b7a57c" stroke-width="2" stroke-linecap="round"/>' +
  '</svg>';

/* 天氣 8 */
add(pic("picture", "It's sunny.", [W.sunny, W.rainy, W.cloudy, W.windy], 0, "It's sunny. 天氣晴朗，圖是太陽。"));
add(pic("picture", "It's rainy.", [W.cloudy, W.sunny, W.rainy, W.windy], 2, "It's rainy. 下雨了，圖是雲和雨滴。"));
add(pic("picture", "It's cloudy.", [W.windy, W.cloudy, W.hot, W.sunny], 1, "It's cloudy. 多雲，圖是雲。"));
add(pic("picture", "It's windy.", [W.rainy, W.sunny, W.windy, W.cold], 2, "It's windy. 颳風，圖是風。"));
add(pic("picture", "It's cold.", [W.hot, W.cold, W.sunny, W.rainy], 1, "It's cold. 很冷，圖是發抖的臉。"));
add(pic("picture", "It's hot.", [W.cold, W.windy, W.hot, W.cloudy], 2, "It's hot. 很熱，圖是流汗的臉。"));
add(pic("picture", "How's the weather? It's sunny and hot.", [W.sunnyHot, W.rainyCold, W.cloudy, W.cold], 0, "sunny and hot＝晴朗又炎熱。"));
add(pic("picture", "How's the weather? It's rainy and cold.", [W.sunnyHot, W.cloudy, W.rainyCold, W.windy], 2, "rainy and cold＝下雨又寒冷。"));

/* 數字 16～20（5） */
add(pic("picture", "sixteen", [num(16), num(60), num(6), num(17)], 0, "sixteen＝16。注意 -teen 是十幾。"));
add(pic("picture", "seventeen", [num(70), num(17), num(7), num(16)], 1, "seventeen＝17。"));
add(pic("picture", "eighteen", [num(80), num(8), num(18), num(19)], 2, "eighteen＝18。拼法只有一个 t。"));
add(pic("picture", "nineteen", [num(90), num(19), num(9), num(18)], 1, "nineteen＝19。"));
add(pic("picture", "twenty", [num(12), num(20), num(22), num(2)], 1, "twenty＝20。"));

/* U2 數字 15 / 25 / 30 / 40 / 50（5） */
add(pic("picture", "fifteen", [num(50), num(15), num(5), num(25)], 1, "fifteen＝15。"));
add(pic("picture", "twenty-five", [num(25), num(20), num(35), num(15)], 0, "twenty-five＝25。"));
add(pic("picture", "thirty", [num(13), num(40), num(30), num(20)], 2, "thirty＝30。"));
add(pic("picture", "forty", [num(14), num(40), num(50), num(30)], 1, "forty＝40。注意不是 fourty。"));
add(pic("picture", "fifty", [num(15), num(40), num(50), num(55)], 2, "fifty＝50。"));

/* 時鐘 6 */
add(pic("picture", "It's three o'clock.", [clk(3, 0), clk(3, 30), clk(8, 0), clk(8, 30)], 0, "three o'clock＝3:00。"));
add(pic("picture", "It's seven thirty.", [clk(7, 0), clk(7, 30), clk(11, 30), clk(6, 30)], 1, "seven thirty＝7:30。"));
add(pic("picture", "It's twelve o'clock.", [clk(12, 0), clk(12, 30), clk(2, 0), clk(10, 0)], 0, "twelve o'clock＝12:00。"));
add(pic("picture", "It's nine thirty.", [clk(9, 0), clk(9, 30), clk(8, 30), clk(10, 30)], 1, "nine thirty＝9:30。"));
add(pic("picture", "It's six o'clock.", [clk(6, 30), clk(6, 0), clk(5, 0), clk(7, 0)], 1, "six o'clock＝6:00。"));
add(pic("picture", "It's eleven thirty.", [clk(11, 0), clk(11, 30), clk(1, 30), clk(10, 30)], 1, "eleven thirty＝11:30。"));

/* 教室用語 8 */
add(pic("picture", "Be quiet.", [C.quiet, C.raise, C.page, C.seat], 0, "Be quiet.＝請安靜。"));
add(pic("picture", "Please turn to page 12.", [C.repeat, C.page, C.louder, C.quiet], 1, "Please turn to page 12.＝請翻到第 12 頁。"));
add(pic("picture", "Repeat after me.", [C.page, C.quiet, C.repeat, C.hw], 2, "Repeat after me.＝跟著我唸。"));
add(pic("picture", "Louder, please.", [C.quiet, C.louder, C.raise, C.seat], 1, "Louder, please.＝請大聲一點。"));
add(pic("picture", "Raise your hand.", [C.raise, C.down, C.quiet, C.page], 0, "Raise your hand.＝舉手。"));
add(pic("picture", "Put down your hand.", [C.raise, C.down, C.louder, C.seat], 1, "Put down your hand.＝把手放下。"));
add(pic("picture", "Show me your homework.", [C.hw, C.seat, C.quiet, C.page], 0, "Show me your homework.＝給我看你的作業。"));
add(pic("picture", "Go back to your seat.", [C.raise, C.page, C.seat, C.louder], 2, "Go back to your seat.＝回到你的座位。"));

/* 萬聖節 6 */
add(pic("picture", "a ghost", [img("👻", "a ghost"), img("🎃", "a jack-o'-lantern"), img("🧛", "a vampire"), img("🧙‍♀️", "a witch")], 0, "a ghost＝鬼。"));
add(pic("picture", "a jack-o'-lantern", [img("👻", "a ghost"), img("🎃", "a jack-o'-lantern"), img(MUMMY, "a mummy"), img("🧛", "a vampire")], 1, "a jack-o'-lantern＝南瓜燈。"));
add(pic("picture", "a mummy", [img(MUMMY, "a mummy"), img("👻", "a ghost"), img("🧙‍♀️", "a witch"), img("🎃", "a jack-o'-lantern")], 0, "a mummy＝木乃伊。"));
add(pic("picture", "a vampire", [img("🧙‍♀️", "a witch"), img("🧛", "a vampire"), img("👻", "a ghost"), img(MUMMY, "a mummy")], 1, "a vampire＝吸血鬼。"));
add(pic("picture", "a witch", [img("👻", "a ghost"), img("🧛", "a vampire"), img("🧙‍♀️", "a witch"), img("🎃", "a jack-o'-lantern")], 2, "a witch＝女巫。"));
add(pic("picture", "Happy Halloween!", [img("🎃👻🍬", "Happy Halloween!"), img("🎄🎅🎁", "Merry Christmas!"), img("🧧🏮", "Happy New Year!"), img("🎂🎈", "Happy birthday!")], 0, "Happy Halloween!＝萬聖節快樂！"));

/* 追加 20 題（總計 58） */
add(pic("picture", "It's windy and cool.", [img("🌬️🥶", "windy and cool"), W.sunnyHot, W.rainy, W.hot], 0, "windy and cool＝颳風又涼爽。"));
add(pic("picture", "It's rainy and windy.", [W.cloudy, img("🌧️🌬️", "rainy and windy"), W.cold, W.sunny], 1, "rainy and windy＝下雨又颳風。"));

add(pic("picture", "thirteen", [num(13), num(30), num(3), num(14)], 0, "thirteen＝13。-teen 是十幾。"));
add(pic("picture", "fourteen", [num(40), num(14), num(4), num(15)], 1, "fourteen＝14。"));
add(pic("picture", "sixty", [num(16), num(6), num(60), num(70)], 2, "sixty＝60。-ty 是幾十。"));
add(pic("picture", "seventy", [num(17), num(70), num(7), num(60)], 1, "seventy＝70。"));
add(pic("picture", "eighty", [num(8), num(18), num(80), num(90)], 2, "eighty＝80。注意只有一個 t。"));
add(pic("picture", "ninety", [num(9), num(19), num(90), num(80)], 2, "ninety＝90。"));

add(pic("picture", "It's two o'clock.", [clk(2, 0), clk(2, 30), clk(12, 0), clk(12, 30)], 0, "two o'clock＝2:00。"));
add(pic("picture", "It's ten thirty.", [clk(10, 0), clk(11, 30), clk(10, 30), clk(9, 30)], 2, "ten thirty＝10:30。"));
add(pic("picture", "It's five o'clock.", [clk(5, 30), clk(4, 0), clk(5, 0), clk(6, 0)], 2, "five o'clock＝5:00。"));
add(pic("picture", "It's four thirty.", [clk(4, 0), clk(4, 30), clk(5, 30), clk(3, 30)], 1, "four thirty＝4:30。"));

const C2 = {
  open: img("📖", "Open your book."),
  close: img("📕", "Close your book."),
  board: img('🟩<span class="mini">ABC</span>', "Look at the blackboard."),
  come: img("🚶➡️", "Come here, please.")
};
add(pic("picture", "Open your book.", [C2.open, C2.close, C2.board, C2.come], 0, "Open your book.＝打開你的書。"));
add(pic("picture", "Close your book.", [C2.open, C2.close, C2.come, C2.board], 1, "Close your book.＝闔上你的書。"));
add(pic("picture", "Look at the blackboard.", [C2.board, C2.open, C2.close, C2.come], 0, "Look at the blackboard.＝看黑板。"));
add(pic("picture", "Come here, please.", [C2.come, C2.open, C2.close, C2.board], 0, "Come here, please.＝請過來。"));

add(pic("picture", "candy", [img("🍬", "candy"), img("👻", "a ghost"), img("🧙‍♀️", "a witch"), img("🧛", "a vampire")], 0, "candy＝糖果。"));
add(pic("picture", "a black cat", [img("🐈‍⬛", "a black cat"), img("👻", "a ghost"), img(MUMMY, "a mummy"), img("🧛", "a vampire")], 0, "a black cat＝黑貓。"));
add(pic("picture", "a skeleton", [img("💀", "a skeleton"), img(MUMMY, "a mummy"), img("👻", "a ghost"), img("🧙‍♀️", "a witch")], 0, "a skeleton＝骷髏。"));
add(pic("picture", "trick or treat", [img("🍬👻", "trick or treat"), img("🎄🎅🎁", "Merry Christmas!"), img("🎂🎈", "Happy birthday!"), img("🧧🏮", "Happy New Year!")], 0, "trick or treat＝不給糖就搗蛋。"));

/* ============================================================
   3. 口袋書拼字（46 題）
   ============================================================ */
add(spell("action", "行動", "We should take action now.", "ac + tion"));
add(spell("actor", "男演員", "Andy Lau is a good actor.", "act + or"));
add(spell("actress", "女演員", "Audrey is my favorite actress.", "actor → actress（字尾 -ess）"));
add(spell("around", "到處；在周圍", "Let's walk around.", "a + round"));
add(spell("band", "樂團", "This band is very popular.", ""));
add(spell("be", "是；成為", "I want to be an engineer in the future.", ""));
add(spell("bean", "豆子", "Anna doesn't like beans.", "ea 發長音 /iː/"));
add(spell("behind", "在……的後面", "The girl is hiding behind her mom.", "be + hind"));
add(spell("beside", "在……旁邊", "Kevin is sitting beside me.", "be + side"));
add(spell("bite", "咬", "That dog bites people.", "i_e，i 發 /aɪ/"));
add(spell("blackboard", "黑板", "We have a blackboard in the classroom.", "black + board"));
add(spell("bookstore", "書店", "You can find that book in the bookstore.", "book + store"));
add(spell("born", "出生的", "The baby was born last week.", ""));
add(spell("butterfly", "蝴蝶", "The butterflies are flying in the garden.", "butter + fly"));
add(spell("break", "休息", "It's time to take a break.", "ea 發 /eɪ/"));
add(spell("bridge", "橋", "The Penghu Great Bridge is very famous.", "d + ge"));
add(spell("carry", "攜帶", "Don't carry too much money with you.", "兩個 r"));
add(spell("castle", "城堡", "The princess lives in the castle.", "t 不發音"));
add(spell("center", "中心", "The station is in the center of the city.", "美式拼法 -er"));
add(spell("chess", "棋子；西洋棋", "Tim is good at playing chess.", "兩個 s"));
add(spell("city", "城市", "Taipei is the biggest city in Taiwan.", ""));
add(spell("clear", "清澈的", "The water is clear.", "ea 發 /ɪə/"));
add(spell("comic", "漫畫的", "My brother reads many comic books.", ""));
add(spell("copy", "複製；抄寫", "You can't copy her homework.", ""));
add(spell("correct", "正確的", "The answer is correct.", "兩個 r"));
add(spell("date", "日期", "What date is today?", "a_e，a 發 /eɪ/"));
add(spell("dig", "挖", "The dog is digging on the ground.", ""));
add(spell("do", "助動詞（疑問句）", "Do you like this book?", ""));
add(spell("does", "助動詞（第三人稱）", "He doesn't know.", "do + es"));
add(spell("dozen", "一打", "How much is a dozen eggs?", "d-o-z-e-n"));
add(spell("dream", "夢想", "My dream is to make a lot of money.", "ea 發 /iː/"));
add(spell("eighteen", "十八", "I can drive when I am eighteen.", "eight + een（只有一個 t）"));
add(spell("eighty", "八十", "This old man is already eighty years old.", "eight + y"));
add(spell("even", "甚至", "Even a five-year-old kid knows it.", "e-v-e-n"));

/* 追加 12 個主題單字（總計 46） */
add(spell("sunny", "晴朗的", "It's sunny today.", "sun + ny（雙寫 n）"));
add(spell("rainy", "下雨的", "It's rainy in Taipei.", "rain + y"));
add(spell("cloudy", "多雲的", "It's cloudy and cool.", "cloud + y"));
add(spell("windy", "颳風的", "It's windy outside.", "wind + y"));
add(spell("weather", "天氣", "How's the weather today?", "ea 發 /e/"));
add(spell("morning", "早上", "I get up at seven in the morning.", "morn + ing"));
add(spell("evening", "傍晚；晚上", "We take a walk in the evening.", "e-v-e-n-i-n-g"));
add(spell("ghost", "鬼", "I'm a little ghost.", "gh 發 /g/"));
add(spell("witch", "女巫", "I'm a little witch.", "tch 發 /tʃ/"));
add(spell("mummy", "木乃伊", "I'm a little mummy.", "兩個 m"));
add(spell("vampire", "吸血鬼", "I'm a little vampire.", "v-a-m-p-i-r-e"));
add(spell("candy", "糖果", "Trick or treat! Give me candy.", "c + and + y"));

/* ============================================================
   4. Daily English（24 題）
   ============================================================ */
add(mc("daily", "「請排隊。」的英文是？", ["Line up, please.", "Let's go.", "Listen!", "Great!"], 0, "Line up, please.＝請排隊。"));
add(mc("daily", "「我們走吧。」的英文是？", ["Let's go.", "Line up, please.", "Great!", "Listen!"], 0, "Let's go.＝我們走吧。"));
add(mc("daily", "「聽！」的英文是？", ["Listen!", "Great!", "Let's go.", "Line up, please."], 0, "Listen!＝聽！"));
add(mc("daily", "「太棒了！」的英文是？", ["Great!", "Listen!", "Let's go.", "Line up, please."], 0, "Great!＝太棒了！"));
add(mc("daily", "老師要大家排隊：______", ["Line up, please.", "Great!", "Listen!", "Let's go."], 0, "老師請大家排隊用 Line up, please."));
add(mc("daily", "準備出發去公園：______", ["Let's go.", "Line up, please.", "Listen!", "Great!"], 0, "Let's go.＝我們出發吧。"));
add(mc("daily", "老師要大家注意聽：______", ["Listen!", "Let's go.", "Great!", "Line up, please."], 0, "Listen!＝注意聽。"));
add(mc("daily", "朋友畫得很好，你說：______", ["Great!", "Listen!", "Line up, please.", "Let's go."], 0, "Great! 可以用來稱讚別人。"));
add(mc("daily", "\"Line up, please.\" 是什麼意思？", ["請排隊。", "我們走吧。", "聽！", "太棒了。"], 0, "Line up＝排隊。"));
add(mc("daily", "\"Let's go.\" 是什麼意思？", ["我們走吧。", "請排隊。", "太棒了。", "聽！"], 0, "Let's＝Let us，一起去吧。"));
add(mc("daily", "\"Listen!\" 是什麼意思？", ["聽！", "太棒了！", "我們走吧。", "請排隊。"], 0, "Listen＝聽。"));
add(mc("daily", "\"Great!\" 是什麼意思？", ["太棒了！", "聽！", "請排隊。", "我們走吧。"], 0, "Great＝很棒。"));
add(mc("daily", "Which phrase does the teacher use to make a line?", ["Line up, please.", "Let's go.", "Listen!", "Great!"], 0, "make a line＝排隊，所以用 Line up, please."));
add(mc("daily", "Which phrase means 「我們走吧」?", ["Let's go.", "Line up, please.", "Listen!", "Great!"], 0, "Let's go.＝我們走吧。"));
add(mc("daily", "Your friend shows you a good drawing. What do you say?", ["Great!", "Listen!", "Line up, please.", "Let's go."], 0, "看到好作品可以說 Great!"));
add(mc("daily", "Which phrase tells someone to pay attention?", ["Listen!", "Great!", "Let's go.", "Line up, please."], 0, "pay attention＝注意聽，用 Listen!"));

/* 追加 8 題（總計 24） */
add(mc("daily", "「打開書。」的英文是？", ["Open your book.", "Close your book.", "Look at the blackboard.", "Come here, please."], 0, "open＝打開；book＝書。"));
add(mc("daily", "「闔上書。」的英文是？", ["Close your book.", "Open your book.", "Look at the blackboard.", "Come here, please."], 0, "close＝闔上、關上。"));
add(mc("daily", "「看黑板。」的英文是？", ["Look at the blackboard.", "Open your book.", "Close your book.", "Come here, please."], 0, "look at＝看著；blackboard＝黑板。"));
add(mc("daily", "「請過來。」的英文是？", ["Come here, please.", "Open your book.", "Close your book.", "Look at the blackboard."], 0, "come here＝過來這裡。"));
add(mc("daily", "\"Open your book.\" 是什麼意思？", ["打開你的書。", "闔上你的書。", "看黑板。", "請過來。"], 0, "Open your book.＝打開你的書。"));
add(mc("daily", "\"Close your book.\" 是什麼意思？", ["闔上你的書。", "打開你的書。", "看黑板。", "請過來。"], 0, "Close your book.＝闔上你的書。"));
add(mc("daily", "\"Look at the blackboard.\" 是什麼意思？", ["看黑板。", "打開你的書。", "闔上你的書。", "請過來。"], 0, "Look at the blackboard.＝看黑板。"));
add(mc("daily", "老師說 \"Come here, please.\"，你應該怎麼做？", ["走到老師旁邊。", "打開課本。", "舉手。", "回到座位。"], 0, "Come here, please.＝請過來，所以走到老師旁邊。"));

/* ============================================================
   5. 單字句型配合（24 題）
   ============================================================ */
add(mc("vocab", "cloudy 是什麼意思？", ["多雲的", "晴朗的", "下雨的", "颳風的"], 0, "cloud（雲）+ y → cloudy 多雲的。"));
add(mc("vocab", "rainy 是什麼意思？", ["下雨的", "多雲的", "熱的", "冷的"], 0, "rain（雨）+ y → rainy 下雨的。"));
add(mc("vocab", "sunny 是什麼意思？", ["晴朗的", "下雨的", "颳風的", "多雲的"], 0, "sun（太陽）+ ny → sunny 晴朗的。"));
add(mc("vocab", "windy 是什麼意思？", ["颳風的", "晴朗的", "下雨的", "多雲的"], 0, "wind（風）+ y → windy 颳風的。"));
add(mc("vocab", "cold 是什麼意思？", ["冷的", "熱的", "多雲的", "晴朗的"], 0, "cold＝冷的；hot＝熱的。"));
add(mc("vocab", "hot 是什麼意思？", ["熱的", "冷的", "下雨的", "颳風的"], 0, "hot＝熱的。"));
add(mc("vocab", "fifteen 是哪一個數字？", ["15", "50", "5", "25"], 0, "fifteen＝15；fifty＝50。"));
add(mc("vocab", "twenty-five 是哪一個數字？", ["25", "20", "35", "15"], 0, "twenty（20）+ five（5）＝25。"));
add(mc("vocab", "thirty 是哪一個數字？", ["30", "13", "40", "20"], 0, "thirty＝30；thirteen＝13。"));
add(mc("vocab", "forty 是哪一個數字？", ["40", "14", "50", "30"], 0, "forty＝40，注意不是 fourty。"));
add(mc("vocab", "fifty 是哪一個數字？", ["50", "15", "40", "25"], 0, "fifty＝50；fifteen＝15。"));
add(mc("vocab", "How's the weather? 最適合的回答是？", ["It's sunny.", "It's eight o'clock.", "Yes, it is.", "Thank you."], 0, "問天氣用 How's the weather?，答 It's + 天氣。"));
add(mc("vocab", "What time is it? 最適合的回答是？", ["It's eight o'clock.", "It's sunny.", "No, it's not.", "I'm fine."], 0, "問時間用 What time is it?，答 It's + 時間。"));
add(mc("vocab", "\"It's twelve thirty.\" 是幾點？", ["12:30", "12:00", "2:30", "10:30"], 0, "twelve thirty＝12 點 30 分。"));
add(mc("vocab", "\"It's seven o'clock.\" 是幾點？", ["7:00", "7:30", "6:00", "11:00"], 0, "seven o'clock＝7 點整。"));
add(mc("vocab", "台北今天下雨。How's the weather in Taipei?", ["It's rainy.", "It's sunny.", "It's windy.", "It's hot."], 0, "下雨＝rainy。"));

/* 追加 8 題（總計 24） */
add(mc("vocab", "\"It's nine o'clock.\" 是幾點？", ["9:00", "9:30", "8:00", "10:00"], 0, "nine o'clock＝9 點整。"));
add(mc("vocab", "\"It's three thirty.\" 是幾點？", ["3:30", "3:00", "4:30", "2:30"], 0, "three thirty＝3 點 30 分。"));
add(mc("vocab", "\"It's six thirty.\" 是幾點？", ["6:30", "6:00", "7:30", "5:30"], 0, "six thirty＝6 點 30 分。"));
add(mc("vocab", "\"What time is it?\" 是用來問什麼？", ["時間", "天氣", "名字", "年齡"], 0, "What time is it?＝現在幾點？"));
add(mc("vocab", "\"How's the weather?\" 是用來問什麼？", ["天氣", "時間", "價錢", "地點"], 0, "How's the weather?＝天氣如何？"));
add(mc("vocab", "\"It's rainy.\" 和哪一句意思相同？", ["It's raining.", "It's sunny.", "It's windy.", "It's cold."], 0, "rainy（下雨的）和 raining（正在下雨）意思相近。"));
add(mc("vocab", "eighteen 是哪一個數字？", ["18", "80", "8", "28"], 0, "eighteen＝18；eighty＝80。"));
add(mc("vocab", "sixty 是哪一個數字？", ["60", "16", "6", "70"], 0, "sixty＝60；sixteen＝16。"));

/* ============================================================
   6. 看時鐘寫句子（48 題）
   ============================================================ */
const NUM = { 1: "one", 2: "two", 3: "three", 4: "four", 5: "five", 6: "six", 7: "seven", 8: "eight", 9: "nine", 10: "ten", 11: "eleven", 12: "twelve" };
function clockAccept(h, m) {
  const w = NUM[h];
  const list = [];
  if (m === 0) {
    list.push("It's " + w + " o'clock", "It is " + w + " o'clock", "It's " + h + ":00", "It is " + h + ":00", "It's " + w, "It is " + w);
  } else {
    list.push("It's " + w + " thirty", "It is " + w + " thirty", "It's " + h + ":30", "It is " + h + ":30", "It's half past " + w, "It is half past " + w);
  }
  return list;
}
const TIMES = [
  [3, 0], [7, 30], [12, 0], [9, 30], [6, 0], [11, 30], [1, 0], [2, 30],
  [8, 0], [4, 30], [10, 0], [5, 30], [12, 30], [3, 30], [7, 0], [9, 0],
  [11, 0], [1, 30], [2, 0], [6, 30], [8, 30], [4, 0], [10, 30], [5, 0],
  [12, 0], [7, 30], [9, 30], [3, 0], [6, 0], [11, 30], [1, 0], [8, 0]
];
TIMES.forEach(function (t) {
  const h = t[0], m = t[1];
  const w = NUM[h];
  const sample = m === 0 ? "It's " + w + " o'clock." : "It's " + w + " thirty.";
  add(writeQ("clock", "看時鐘，寫出完整的英文句子。", clockAccept(h, m), sample,
    "短針指 " + h + "，長針指 " + (m === 0 ? "12" : "6") + " → " + sample +
    (m === 0 ? "（整點用 o'clock）" : "（半點用 thirty）"), { clock: { h: h, m: m } }));
});

/* 追加 16 題（總計 48，增加不同時間的熟練度） */
const TIMES2 = [
  [2, 0], [5, 30], [11, 0], [4, 30], [9, 0], [12, 30], [6, 0], [3, 30],
  [8, 0], [1, 30], [10, 0], [7, 30], [12, 0], [5, 0], [2, 30], [4, 0]
];
TIMES2.forEach(function (t) {
  const h = t[0], m = t[1];
  const w = NUM[h];
  const sample = m === 0 ? "It's " + w + " o'clock." : "It's " + w + " thirty.";
  add(writeQ("clock", "看時鐘，寫出完整的英文句子。", clockAccept(h, m), sample,
    "短針指 " + h + "，長針指 " + (m === 0 ? "12" : "6") + " → " + sample +
    (m === 0 ? "（整點用 o'clock）" : "（半點用 thirty）"), { clock: { h: h, m: m } }));
});

/* ============================================================
   7. U1 閱讀理解（44 題）
   ============================================================ */
const RC_A = {
  id: "rc-a", title: "短文 A · Amy's Sunday",
  text: "Today is Sunday. Amy and her family are in Taipei. In the morning, it is rainy. They want to go to the park, but it is too wet. They stay home. Amy plays chess with her father. Her brother reads a comic book. In the evening, the rain stops. It is cloudy and cool. They take a walk around the city. \"What a nice day!\" says Amy."
};
add(mc("reading", "What day is it today?", ["Sunday", "Monday", "Saturday", "Friday"], 0, "短文第一句：Today is Sunday.", { group: RC_A }));
add(mc("reading", "Where is Amy's family?", ["Taipei", "Tainan", "Taichung", "Kaohsiung"], 0, "短文：Amy and her family are in Taipei.", { group: RC_A }));
add(mc("reading", "How's the weather in the morning?", ["It's rainy.", "It's sunny.", "It's windy.", "It's hot."], 0, "短文：In the morning, it is rainy.", { group: RC_A }));
add(mc("reading", "What do they do at home?", ["They play chess.", "They fly a kite.", "They go to the park.", "They read comic books."], 0, "短文：Amy plays chess with her father. 他們在家下棋。", { group: RC_A }));
add(writeQ("reading", "填空：Amy's brother reads a ______ book.", ["comic", "comic book"], "comic", "短文：Her brother reads a comic book. comic＝漫畫的。", { group: RC_A, hint: "提示：漫畫的" }));
add(writeQ("reading", "填空：They take a walk ______ the city.", ["around"], "around", "短文：They take a walk around the city. around＝到處、在周圍。", { group: RC_A, hint: "提示：到處" }));
add(writeQ("reading", "How's the weather in the evening? 寫出完整句子。", ["It's cloudy.", "It is cloudy.", "It's cloudy and cool.", "It is cloudy and cool."], "It's cloudy.", "短文：In the evening, it is cloudy and cool. 問天氣用 It's + 天氣。", { group: RC_A }));

const RC_B = {
  id: "rc-b", title: "短文 B · Boka's Hat",
  text: "Boka is a blue monster. He lives in a castle on a hill. One morning, the wind is very strong. \"Let's go to the park,\" says Kevin. \"No, it's windy and cold,\" says Boka. \"We can fly a kite at home.\" Kevin opens the window. The wind blows Boka's hat away. Boka runs after it. The hat flies over the bridge and behind a big tree. Finally, Boka finds it beside a butterfly. \"Hooray!\" he says."
};
add(mc("reading", "Who is Boka?", ["A blue monster.", "A green monster.", "A boy.", "A butterfly."], 0, "短文第一句：Boka is a blue monster.", { group: RC_B }));
add(mc("reading", "Where does Boka live?", ["In a castle.", "In a city.", "In a bookstore.", "On a bridge."], 0, "短文：He lives in a castle on a hill.", { group: RC_B }));
add(mc("reading", "How's the weather?", ["It's windy and cold.", "It's sunny and hot.", "It's rainy.", "It's cloudy."], 0, "短文：\"No, it's windy and cold,\" says Boka.", { group: RC_B }));
add(mc("reading", "What does Kevin want to do?", ["Go to the park.", "Fly a kite at home.", "Read a book.", "Take a walk."], 0, "短文：\"Let's go to the park,\" says Kevin.", { group: RC_B }));
add(writeQ("reading", "填空：The wind blows Boka's hat ______.", ["away"], "away", "短文：The wind blows Boka's hat away. blow away＝吹走。", { group: RC_B, hint: "提示：吹走" }));
add(writeQ("reading", "填空：Boka finds his hat ______ a butterfly.", ["beside", "next to"], "beside", "短文：Boka finds it beside a butterfly. beside＝在旁邊。", { group: RC_B, hint: "提示：在旁邊" }));
add(writeQ("reading", "How's the weather? 寫出完整句子。", ["It's windy and cold.", "It is windy and cold.", "It's cold and windy.", "It is cold and windy."], "It's windy and cold.", "短文：It's windy and cold. 問天氣用 It's + 天氣。", { group: RC_B }));

const RC_C = {
  id: "rc-c", title: "短文 C · Halloween Night",
  text: "It is Halloween. Tim and his sister wear costumes. Tim is a vampire, and his sister is a witch. They carry big bags and walk around the neighborhood. \"Trick or treat!\" they say. Their neighbor, Mr. Brown, gives them candy and chocolate. Tim sees a jack-o'-lantern at the door. It has a happy face. \"Happy Halloween!\" says Mr. Brown. Tim and his sister say, \"Thank you!\" and go to the next house."
};
add(mc("reading", "What day is it?", ["Halloween", "Christmas", "Sunday", "Mother's Day"], 0, "短文第一句：It is Halloween.", { group: RC_C }));
add(mc("reading", "What is Tim?", ["A vampire", "A ghost", "A mummy", "A witch"], 0, "短文：Tim is a vampire.", { group: RC_C }));
add(mc("reading", "What is Tim's sister?", ["A witch", "A vampire", "A princess", "A butterfly"], 0, "短文：His sister is a witch.", { group: RC_C }));
add(mc("reading", "What does Mr. Brown give them?", ["Candy and chocolate", "Books and pencils", "Apples and beans", "Hats and bags"], 0, "短文：Mr. Brown gives them candy and chocolate.", { group: RC_C }));
add(writeQ("reading", "填空：They say \"______!\" at every house.", ["Trick or treat", "trick or treat"], "Trick or treat", "萬聖節到別人家門口說 Trick or treat!（不給糖就搗蛋）。", { group: RC_C, hint: "提示：不給糖就搗蛋" }));
add(writeQ("reading", "填空：There is a ______ at the door.", ["jack-o'-lantern", "jack-o-lantern", "jack o lantern", "jack o' lantern", "pumpkin"], "jack-o'-lantern", "短文：Tim sees a jack-o'-lantern at the door. 南瓜燈。", { group: RC_C, hint: "提示：南瓜燈" }));
add(writeQ("reading", "What does Mr. Brown say? 寫出完整句子。", ["Happy Halloween!", "Happy Halloween", "He says Happy Halloween.", "He says, Happy Halloween."], "Happy Halloween!", "短文：\"Happy Halloween!\" says Mr. Brown.", { group: RC_C }));

const RC_D = {
  id: "rc-d", title: "短文 D · Kevin's Day",
  text: "Kevin gets up at seven o'clock. He eats breakfast at seven thirty. Then he goes to school. At school, the teacher says, \"Line up, please.\" Kevin and his classmates line up in the hallway. In the afternoon, it is sunny and hot. They play baseball on the playground. At four thirty, Kevin goes home. He does his homework and reads a book. He goes to bed at nine o'clock."
};
add(mc("reading", "What time does Kevin get up?", ["Seven o'clock.", "Seven thirty.", "Six o'clock.", "Eight o'clock."], 0, "短文：Kevin gets up at seven o'clock.", { group: RC_D }));
add(mc("reading", "What time does he eat breakfast?", ["Seven thirty.", "Seven o'clock.", "Eight thirty.", "Nine o'clock."], 0, "短文：He eats breakfast at seven thirty.", { group: RC_D }));
add(mc("reading", "What does the teacher say?", ["Line up, please.", "Let's go.", "Listen!", "Great!"], 0, "短文：The teacher says, \"Line up, please.\"", { group: RC_D }));
add(mc("reading", "How's the weather in the afternoon?", ["Sunny and hot.", "Rainy and cold.", "Windy and cool.", "Cloudy."], 0, "短文：In the afternoon, it is sunny and hot.", { group: RC_D }));
add(writeQ("reading", "填空：Kevin ______ his homework after school.", ["does"], "does", "短文：He does his homework. 主詞 Kevin 是第三人稱單數，用 does。", { group: RC_D, hint: "提示：做（第三人稱）" }));
add(writeQ("reading", "填空：He goes to bed at nine ______.", ["o'clock", "oclock"], "o'clock", "短文：He goes to bed at nine o'clock. 整點用 o'clock。", { group: RC_D, hint: "提示：整點" }));
add(writeQ("reading", "What time does Kevin go home? 寫出完整句子。", ["He goes home at four thirty.", "He goes home at 4:30.", "At four thirty.", "At 4:30.", "Four thirty."], "He goes home at four thirty.", "短文：At four thirty, Kevin goes home. 問幾點用 at + 時間。", { group: RC_D }));

/* 追加兩篇短文（16 題，總計 44） */
const RC_E = {
  id: "rc-e", title: "短文 E · A Rainy Saturday",
  text: "It is Saturday morning. It is rainy and windy. Lily and her mother go to the bookstore. The bookstore is beside the city library. Lily reads a comic book. Her mother buys a book about a famous actress. At twelve o'clock, they eat lunch at a small restaurant. After lunch, the rain stops. The sun comes out. They walk around the park and go home at three thirty."
};
add(mc("reading", "What day is it?", ["Saturday", "Sunday", "Monday", "Friday"], 0, "短文第一句：It is Saturday morning.", { group: RC_E }));
add(mc("reading", "How's the weather in the morning?", ["It's rainy and windy.", "It's sunny and hot.", "It's cloudy and cold.", "It's windy and cool."], 0, "短文：It is rainy and windy.", { group: RC_E }));
add(mc("reading", "Where do Lily and her mother go?", ["The bookstore.", "The school.", "The castle.", "The beach."], 0, "短文：Lily and her mother go to the bookstore.", { group: RC_E }));
add(mc("reading", "What does Lily read?", ["A comic book.", "A picture book.", "A comic strip.", "A story about an actress."], 0, "短文：Lily reads a comic book.", { group: RC_E }));
add(writeQ("reading", "填空：The bookstore is ______ the city library.", ["beside", "next to"], "beside", "短文：The bookstore is beside the city library. beside＝在旁邊。", { group: RC_E, hint: "提示：在旁邊" }));
add(writeQ("reading", "填空：They eat lunch at ______ o'clock.", ["twelve", "12"], "twelve", "短文：At twelve o'clock, they eat lunch. twelve＝12。", { group: RC_E, hint: "提示：十二" }));
add(writeQ("reading", "What time do they go home? 寫出完整句子。", ["They go home at three thirty.", "They go home at 3:30.", "At three thirty.", "At 3:30.", "Three thirty."], "They go home at three thirty.", "短文：They go home at three thirty. 問幾點用 at + 時間。", { group: RC_E }));
add(writeQ("reading", "How's the weather after lunch? 寫出完整句子。", ["It's sunny.", "It is sunny.", "It's sunny now.", "It is sunny now."], "It's sunny.", "短文：After lunch, the rain stops. The sun comes out. 所以是 sunny。", { group: RC_E }));

const RC_F = {
  id: "rc-f", title: "短文 F · Sam's Dream",
  text: "Sam is ten years old. His dream is to be an actor. Every Saturday, he goes to the school band with his sister. His sister plays the guitar. Sam sings and acts. Their teacher, Ms. Wang, says, \"Great! You are a good actor.\" Sam is happy. He practices every day. He even acts at home. His mother says, \"You are a little star!\""
};
add(mc("reading", "How old is Sam?", ["Ten years old.", "Nine years old.", "Eleven years old.", "Twelve years old."], 0, "短文第一句：Sam is ten years old.", { group: RC_F }));
add(mc("reading", "What is Sam's dream?", ["To be an actor.", "To be a teacher.", "To be a singer.", "To be a doctor."], 0, "短文：His dream is to be an actor.", { group: RC_F }));
add(mc("reading", "When does he go to the school band?", ["Every Saturday.", "Every Sunday.", "Every morning.", "Every Friday."], 0, "短文：Every Saturday, he goes to the school band.", { group: RC_F }));
add(mc("reading", "What does his sister play?", ["The guitar.", "The piano.", "The violin.", "The drum."], 0, "短文：His sister plays the guitar.", { group: RC_F }));
add(writeQ("reading", "填空：Sam's ______ is to be an actor.", ["dream"], "dream", "短文：His dream is to be an actor. dream＝夢想。", { group: RC_F, hint: "提示：夢想" }));
add(writeQ("reading", "填空：He practices every ______.", ["day"], "day", "短文：He practices every day. every day＝每天。", { group: RC_F, hint: "提示：天" }));
add(writeQ("reading", "What does Ms. Wang say? 寫出完整句子。", ["Great! You are a good actor.", "Great, you are a good actor.", "She says, Great! You are a good actor.", "She says Great! You are a good actor."], "Great! You are a good actor.", "短文：Ms. Wang says, \"Great! You are a good actor.\"", { group: RC_F }));
add(mc("reading", "Which word means 「甚至」？", ["even", "dream", "band", "actor"], 0, "短文：He even acts at home. even＝甚至。", { group: RC_F }));

/* ============================================================
   8. 萬聖節歌詞（16 題）
   ============================================================ */
add(mc("halloween", "\"Trick or treat, trick or treat, give me something good to ______.\"", ["eat", "drink", "read", "play"], 0, "歌詞第一段：Give me something good to eat. eat＝吃。"));
add(mc("halloween", "Which fruits are in the song?", ["Apples, peaches, tangerines.", "Apples, bananas, grapes.", "Oranges, pears, peaches.", "Watermelons, apples, lemons."], 0, "歌詞：Apples, peaches, tangerines.（蘋果、桃子、橘子）"));
add(mc("halloween", "Which fruit is NOT in the song?", ["Bananas", "Apples", "Peaches", "Tangerines"], 0, "歌詞只提到 apples、peaches、tangerines，沒有 bananas。"));
add(mc("halloween", "\"Apples, peaches, ______.\"", ["tangerines", "tomatoes", "potatoes", "carrots"], 0, "歌詞：Apples, peaches, tangerines. tangerines＝橘子。"));
add(mc("halloween", "In the second verse, what do they want to eat?", ["Something sweet.", "Something hot.", "Something cold.", "Something sour."], 0, "歌詞第二段：Give me something sweet to eat. sweet＝甜的。"));
add(mc("halloween", "Which sweet foods are in the song?", ["Cookies, chocolate, jelly beans.", "Cake, ice cream, candy.", "Cookies, pizza, jelly beans.", "Chocolate, apples, peaches."], 0, "歌詞：Cookies, chocolate, jelly beans.（餅乾、巧克力、軟糖豆）"));
add(mc("halloween", "Which one is NOT in the song?", ["Pizza", "Cookies", "Chocolate", "Jelly beans"], 0, "歌詞提到 cookies、chocolate、jelly beans，沒有 pizza。"));
add(mc("halloween", "\"Cookies, chocolate, ______ beans.\"", ["jelly", "coffee", "green", "butter"], 0, "歌詞：Cookies, chocolate, jelly beans. jelly beans＝軟糖豆。"));
add(mc("halloween", "What do they say at the end of each verse?", ["Happy Halloween!", "Merry Christmas!", "Happy birthday!", "Happy New Year!"], 0, "兩段歌詞最後都唱 Happy Halloween!"));
add(mc("halloween", "What does \"trick or treat\" mean?", ["不給糖就搗蛋", "聖誕快樂", "生日快樂", "新年快樂"], 0, "trick or treat＝不給糖就搗蛋。"));
add(mc("halloween", "Which word rhymes with \"eat\"?", ["sweet", "apple", "peach", "cookie"], 0, "eat /iːt/ 和 sweet /swiːt/ 押韻，尾音都是 /iːt/。"));
add(mc("halloween", "Which word rhymes with \"beans\"?", ["tangerines", "cookies", "apples", "chocolate"], 0, "beans /biːnz/ 和 tangerines /ˌtændʒəˈriːnz/ 尾音相同，都是 /iːnz/。"));
add(writeQ("halloween", "填空：Trick or ______, trick or treat.", ["treat"], "treat", "歌詞：Trick or treat, trick or treat. treat＝招待、請客。", { hint: "提示：trick or ______" }));
add(writeQ("halloween", "填空：Cookies, chocolate, ______ beans.", ["jelly"], "jelly", "歌詞：Cookies, chocolate, jelly beans. jelly beans＝軟糖豆。", { hint: "提示：jelly ______" }));
add(writeQ("halloween", "寫出歌詞中提到的三種水果。", ["apples, peaches, tangerines", "apples peaches tangerines", "apples, peaches and tangerines", "apples peaches and tangerines", "apples, peaches, and tangerines", "apples and peaches and tangerines", "apple, peach, tangerine", "apple peach tangerine", "apple and peach and tangerine"], "apples, peaches, tangerines", "歌詞水果：apples（蘋果）、peaches（桃子）、tangerines（橘子）。"));
add(writeQ("halloween", "寫出歌詞中提到的三種甜食。", ["cookies, chocolate, jelly beans", "cookies chocolate jelly beans", "cookies, chocolate and jelly beans", "cookies chocolate and jelly beans", "cookies, chocolate, and jelly beans", "cookies and chocolate and jelly beans", "cookie, chocolate, jelly bean", "cookie chocolate jelly bean", "cookie and chocolate and jelly bean", "cookies chocolate jellybeans"], "cookies, chocolate, jelly beans", "歌詞甜食：cookies（餅乾）、chocolate（巧克力）、jelly beans（軟糖豆）。"));

module.exports = { SECTIONS, QUESTIONS };
