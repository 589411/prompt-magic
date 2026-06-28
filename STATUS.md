# STATUS — 魔法詠唱產生器 (prompt-magic)

## 更新（2026-06-28 第四批·填空模板定稿）
- 🧩 填空模板最終狀態：**16 模板＋61 詞庫＋6 分類**，**中英雙語切換**、**分類篩選＋搜尋**。資料 `data-fill.js`（改編 PromptFill MIT，圖 by @sundyme）。
- **每個模板用自己的真實範例圖**（`assets/tpl/<id>.jpg`，本地、對齊內容）——取代先前「依分類重複套名畫」的做法（那是 bug，已修）。
- **名畫畫風選擇器**：保留 6 張公共領域名畫（`assets/refs/`，慕夏/莫內/秀拉/梵谷/波希/維梅爾）當「畫風」，點縮圖把畫風（中/英）加進提示詞。
- 範例圖**完整顯示不裁切**（CSS：高度為限、寬度自適應、置中）。
- 淨化（維持移除，勿加回）：版權合影（死侍/超人）、真人名人、露背時裝、私密/內著類；以及「角色藝術拆解升級版（人物拆解）」——運動內衣＋表情不適合親子。
- 重生資料：`/tmp/pf-gen5.mjs`（重抓 PromptFill banks.js/templates.js 再跑）；圖片下載清單 `/tmp/pf-imgs.txt`。

## 更新（2026-06-28 第三批，部分已被第四批取代）
- 🧩 填空模板**大幅擴充**：程式化改編 doggy8088/PromptFill（MIT）的 `banks.js`/`templates.js` → `data-fill.js`（**6 分類、61 詞庫、17 模板**），已淨化掉版權角色（死侍/超人/哈利波特）、真人合影、私密類項目，成闔家版。分頁加**分類篩選＋搜尋**。
- 修正範例圖被裁切：CSS 改為以高度為限、寬度自適應置中（完整顯示）；圖改用本地 `assets/refs/` 的 6 張公共領域名畫、依模板分類對應。
- 轉換腳本暫存於 `/tmp/pf-*.mjs`（未進 repo）；要重生 data-fill.js 可重抓 PromptFill 的 banks.js/templates.js 再跑。

## 更新（2026-06-28 第二批）
- ✅ 自訂網域上線：**https://prompt-magic.launchdock.app**（CNAME＋HTTPS 已簽，200）。
- ✅ 新增第 4 個分頁 **🧩 填空模板**：仿 prompt-fill 的「模板＋{{變數}}＋共享詞庫」，但用站內紫色版型、自家闔家詞庫、名畫預覽圖標公共領域出處、無多奇品牌；可直接複製或交給 AI 潤色。介面靈感註明 PromptFill（MIT）。
- ✅ 已加入 **lab.launchdock.app**（launchdock-lab `data/projects.yaml`，id=prompt-magic，type=llm-tool；Build&Deploy Action 已成功；封面待 covers 工作流自動截圖）。
- 註：gh active 帳號平時是 launchdockapp-beep；推 589411 的 repo（prompt-magic / launchdock-lab）需 `gh auth switch --user 589411`，推完切回。

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

## 下一個具體動作（本 repo 2026-06-28 告一段落，下次接手清單）
1.（Joseph）開 `https://589411.github.io/prompt-magic/` 實機點一輪：三模式切換、電影模式十幾欄位在手機的版面、填空→生成→複製→貼 Gemini/Luma。回報要調的地方。
2.（選用）綁子網域：Cloudflare 加 DNS（CNAME `prompt-magic`→`589411.github.io`，DNS only 灰雲）後告知 → 我加 `CNAME` 檔＋push＋Pages 設自訂網域＋等 HTTPS。
3.（選用）PWA：加到主畫面／離線可開（可用 `pwa-offline` skill）。
4.（待辦，非本 repo）報名表回覆草稿尚未存檔 → 可存 `ai-family-camp/docs/報名表回覆.md`。

## 已加功能（2026-06-28 同日）
- 選項性別均衡：大小孩不再偏男生取向（加魔法少女/偶像/時尚/夢幻/療癒…），分頁改名「大小孩・酷炫奇幻」。
- 表單改為 **schema 驅動**（`MODES` 物件），新增第三模式 **🎬 大人・電影創作**：
  專業電影前期欄位（logline/類型/時空/場景/人設/景別/機位/運鏡/鏡頭焦段/光線/色調/敘事角度/氛圍）
  → AI 產出中英 cinematic 提示詞＋3～5 顆分鏡序列。已 curl 實測 gpt-4o 正確回 zh/en/shots。

## 決策紀錄
- 模式＝填空＋AI擴寫翻譯（非站內直接生圖；生圖仍由學員在 Gemini/ChatGPT 免費版做）。
- 照片＝AI 看圖建議提示詞（靜態站不改圖，改圖在 Gemini）。
- 命名暫定 prompt-magic / prompt-magic.launchdock.app（Joseph 可改）。
