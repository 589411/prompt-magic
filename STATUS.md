# STATUS — 魔法詠唱產生器 (prompt-magic)

## 現況（2026-06-28）
- MVP 前端完成：填空式 UI（兩種年齡風格）＋ 即時中文預覽＋一鍵召喚（AI 擴寫成中英雙版）＋複製＋上傳照片看圖建議改造詠唱。
- Worker 完成：以 dev-harness `llm-proxy-worker` 標準件為底，**加上 vision/多模態**支援（OpenAI 相容＋Anthropic 兩種圖片格式）。
- 尚未部署、尚未建 GitHub repo、尚未綁子網域。
- 目前 `config.js` 的 `API_ENDPOINT` 為空 → 前端走離線模式（只組中文句子）。

## 卡在哪
- 需要 Joseph 在這台機器 `wrangler login`（Cloudflare OAuth）才能部署 worker。
- 需確認要用哪個 LLM 金鑰：預設走 GitHub Models `openai/gpt-4o`（免費額度、可看圖），需 `GITHUB_TOKEN`（models:read）。

## 下一個具體動作
1. `python3 -m http.server` 本機開頁，肉眼確認填空→預覽→離線詠唱流程正常。
2. `cd worker && wrangler login && wrangler deploy`，`wrangler secret put GITHUB_TOKEN`。
3. 把 worker 網址填進 `config.js` 的 `API_ENDPOINT`，本機測「召喚」與「看圖」真的會回詠唱。
4. `gh repo create 589411/prompt-magic`（已登入 589411）→ push → 開 GitHub Pages。
5. Cloudflare 綁 `prompt-magic.launchdock.app`（用 `static-site-deploy` skill）。
6. 把 `wrangler.toml` 的 `ALLOWED_ORIGIN` 改成正式網域並重新 deploy。

## 決策紀錄
- 模式＝填空＋AI擴寫翻譯（非站內直接生圖；生圖仍由學員在 Gemini/ChatGPT 免費版做）。
- 照片＝AI 看圖建議提示詞（靜態站不改圖，改圖在 Gemini）。
- 命名暫定 prompt-magic / prompt-magic.launchdock.app（Joseph 可改）。
