# English Midterm Exam Scope · Grade 4 (300 Questions)

115-1 四年級英語期中考互動練習，共 300 題，答完立刻批改並顯示中文解釋。

## 線上版

<https://joshua19683721.github.io/english-midterm-exam-scope/>

## 啟動

在此資料夾雙擊：

```
start-english-300.bat
```

或手動啟動：

```
node server.mjs 8124
```

瀏覽器開啟 <http://127.0.0.1:8124/>。

## 題型與配分

| 大題 | 題數 | 聽力／讀寫 |
| --- | ---: | --- |
| Phonics 長短母音 | 40 | 聽力 |
| 圖片圈選 | 58 | 聽力 |
| 口袋書拼字 | 46 | 聽力 |
| Daily English 配合 | 24 | 讀寫 |
| 單字句型配合 | 24 | 讀寫 |
| 看時鐘寫句子 | 48 | 讀寫 |
| U1 閱讀理解 | 44 | 讀寫 |
| 萬聖節歌詞 | 16 | 讀寫 |
| **合計** | **300** | 聽力 144／讀寫 156 |

練習範圍：SB p8~9、p12~46、p79；WB p2~19；Pocket Book 4-1~35；Halloween Song（Trick or Treat）。

## 功能

- 每題立即對答案，附中文解釋與正確答案。
- 聽力題使用本機 en-US MP3（Microsoft Zira，系統 SAPI 語音），可重複播放。
- 所有英文題目、選項、短文、例句旁都有 🔊，使用瀏覽器 en-US 語音朗讀（優先使用 Microsoft Mark，沒有時自動改用其他 en-US 語音）。
- 萬聖節歌詞頁提供全首歌詞、逐行 🔊 朗讀與「整首」朗讀。
- 語速滑桿 0.5×～1.5×，同時套用到 MP3 與英文朗讀。
- 進度、答案、語速存在瀏覽器 `localStorage`（`engmid300_v1`）。
- 首頁可「清除全部作答紀錄」。

## 修改題目

題目來源：`build/questions.js`

改完後重建：

```
node build/build.js
```

重建會驗證題數、選項、答案與音檔，並產生 `data.js` 與 `build/audio-manifest.json`。
選項會用固定種子打亂，避免答案總是在 A。

## 重新產生聽力音檔

需要 Windows、Python、`pywin32`、`ffmpeg`，以及 en-US 語音 `Microsoft Zira Desktop`。

```
python build/tts.py
```

只會產生缺少的 MP3，已存在的檔案會跳過。
