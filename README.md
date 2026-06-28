# 魔法詠唱產生器｜親子共學 AI 生圖提示詞工具

幫家長與孩子用「填空」的方式，召喚出一段完整、漂亮的 AI 生圖提示詞（詠唱），
貼到 Gemini / ChatGPT / Copilot 就能生圖。另支援上傳照片，讓 AI 看圖建議「改造詠唱」。

為「未來魔法學院」親子共學營（2026/7/18）打造，可重複用於藍鴨小聚 demo。

## 結合三個工具的優點
- **填空式**（像 prompt-fill）：主角／動作／場景／風格／心情／鏡頭，點選即組合。
- **AI 擴寫**（像 prompt-gen）：一鍵把零碎想法擴寫成精煉的中英雙版提示詞。
- **看圖**（延伸 image-creator 思路）：上傳照片 → AI 描述重點＋建議三個改造詠唱。

兩種年齡風格：🧸 小小孩・可愛風 ／ 🚀 大小孩・遊戲科幻風。

## 架構
```
瀏覽器(純靜態, 零金鑰)  →  GitHub Pages (prompt-magic.launchdock.app)
        └ fetch API_ENDPOINT → Cloudflare Worker(持鑰 LLM 代理)
              供應商鏈 fallback：OpenRouter → GitHub Models → Anthropic
```
- 前端：`index.html` / `styles.css` / `app.js` / `config.js`（純靜態、無框架）
- 後端：`worker/`（改自 dev-harness `llm-proxy-worker` 標準件，加上看圖/多模態）

## 本機預覽
```bash
python3 -m http.server 8080
# 開 http://127.0.0.1:8080
```
未設定 `API_ENDPOINT` 時走「離線模式」：只組合中文詠唱，不呼叫 AI（擴寫／看圖停用）。

## 部署
1. **Worker**（需 `wrangler login`，每台機器各自 OAuth）
   ```bash
   cd worker
   wrangler deploy
   echo "$GITHUB_TOKEN" | wrangler secret put GITHUB_TOKEN   # 需 models:read 權限
   ```
   把 `wrangler.toml` 的 `ALLOWED_ORIGIN` 改成正式網域。
2. **前端**：把 `config.js` 的 `API_ENDPOINT` 換成 Worker 網址，部署到 GitHub Pages，
   再用 Cloudflare 綁 `prompt-magic.launchdock.app`（見 dev-harness `static-site-deploy` skill）。

## 隱私
課堂使用，提醒學員勿上傳含證件／地址／學校班級的照片；公開分享前先檢查。
