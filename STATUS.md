# STATUS — 魔法詠唱產生器 (prompt-magic)

## 現況（2026-06-28）
- ✅ Worker 已部署：`https://prompt-magic-worker.589411.workers.dev`（ALLOWED_ORIGIN 已鎖 github.io＋launchdock 子網域，假來源回 403）。
- ✅ GitHub repo 已建並推送：`589411/prompt-magic`；GitHub Pages 已上線：`https://589411.github.io/prompt-magic/`（HTTP 200）。
- ✅ `config.js` 的 `API_ENDPOINT` 已指向 worker。
- ⏳ 尚未設 LLM 金鑰 secret → 打 worker 目前回 `no_backend_configured`（擴寫／看圖尚不能用；填空與中文預覽可用）。
- ⏳ 尚未綁自訂子網域 `prompt-magic.launchdock.app`（需在 Cloudflare 後台加 DNS）。

## 卡在哪（等 Joseph 兩個手動動作）
1. 設 LLM 金鑰：`cd ~/github/prompt-magic/worker && echo "<GITHUB_PAT models:read>" | wrangler secret put GITHUB_TOKEN`
2. Cloudflare 後台（launchdock.app zone）加一筆 DNS：CNAME，名稱 `prompt-magic`，目標 `589411.github.io`，Proxy=DNS only（灰雲）。

## 下一個具體動作
1.（Joseph）設金鑰後告知 → 我打 worker 驗證會回中英詠唱、看圖會回建議。
2.（Joseph）加上述 DNS 記錄後告知 → 我加 `CNAME` 檔＋push＋Pages 設自訂網域，等 GitHub 簽 HTTPS。
3. 全綠後，本機/線上實測一輪填空→詠唱→複製→Gemini 生圖，確認體驗順。

## 決策紀錄
- 模式＝填空＋AI擴寫翻譯（非站內直接生圖；生圖仍由學員在 Gemini/ChatGPT 免費版做）。
- 照片＝AI 看圖建議提示詞（靜態站不改圖，改圖在 Gemini）。
- 命名暫定 prompt-magic / prompt-magic.launchdock.app（Joseph 可改）。
