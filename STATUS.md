# STATUS — 魔法詠唱產生器 (prompt-magic)

## 現況（2026-06-28）
- ✅ Worker 已部署：`https://prompt-magic-worker.589411.workers.dev`（ALLOWED_ORIGIN 已鎖 github.io＋launchdock 子網域，假來源回 403）。
- ✅ GitHub repo 已建並推送：`589411/prompt-magic`；GitHub Pages 已上線：`https://589411.github.io/prompt-magic/`（HTTP 200）。
- ✅ `config.js` 的 `API_ENDPOINT` 已指向 worker。
- ✅ LLM 金鑰已設（GITHUB_TOKEN，GitHub Models gpt-4o）。worker 兩條路徑均已驗證：
  - AI 擴寫 → 正確回中英雙版 JSON ✅
  - 看圖（vision，傳 base64）→ 正確描述＋回改造詠唱 JSON ✅
  - 注意：用 python-urllib 打 worker 會被 Cloudflare 擋（error 1010），用 curl 或真實瀏覽器正常。
- **工具已完全可用：`https://589411.github.io/prompt-magic/`**
- ⏳ 唯一剩餘（選用，非必要）：綁自訂子網域 `prompt-magic.launchdock.app`（需在 Cloudflare 後台加 DNS）。

## 卡在哪（選用，不影響使用）
- 子網域：Cloudflare 後台（launchdock.app zone）加一筆 DNS：CNAME，名稱 `prompt-magic`，目標 `589411.github.io`，Proxy=DNS only（灰雲）。加完告知我，我補 `CNAME` 檔＋設自訂網域。

## 下一個具體動作
1.（Joseph）開 `https://589411.github.io/prompt-magic/` 實測一輪：填空→開始詠唱→複製→貼 Gemini 生圖；再試上傳照片看圖。回報體驗要調整的地方。
2.（選用）加子網域 DNS 後告知 → 我加 CNAME 檔＋push＋Pages 設自訂網域，等 GitHub 簽 HTTPS。

## 已加功能（2026-06-28 同日）
- 選項性別均衡：大小孩不再偏男生取向（加魔法少女/偶像/時尚/夢幻/療癒…），分頁改名「大小孩・酷炫奇幻」。
- 表單改為 **schema 驅動**（`MODES` 物件），新增第三模式 **🎬 大人・電影創作**：
  專業電影前期欄位（logline/類型/時空/場景/人設/景別/機位/運鏡/鏡頭焦段/光線/色調/敘事角度/氛圍）
  → AI 產出中英 cinematic 提示詞＋3～5 顆分鏡序列。已 curl 實測 gpt-4o 正確回 zh/en/shots。

## 決策紀錄
- 模式＝填空＋AI擴寫翻譯（非站內直接生圖；生圖仍由學員在 Gemini/ChatGPT 免費版做）。
- 照片＝AI 看圖建議提示詞（靜態站不改圖，改圖在 Gemini）。
- 命名暫定 prompt-magic / prompt-magic.launchdock.app（Joseph 可改）。
