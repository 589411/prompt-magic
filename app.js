"use strict";

const CFG = window.PROMPT_MAGIC_CONFIG || { API_ENDPOINT: "", APP_KEY: "" };
const HAS_BACKEND = !!CFG.API_ENDPOINT;

/* =========================================================================
 *  模式 schema：每個模式宣告自己的欄位，表單依此動態生成。
 *  欄位 type： text=純輸入 / suggest=輸入+建議詞(點擊附加) / single=單選chip
 *  每欄位： {id, name(純文字標籤,給預覽與AI), label(UI顯示,可含emoji), type, ph?, opts?}
 * ========================================================================= */
const MODES = {
  kid: {
    label: "🧸 小小孩・可愛風",
    title: "填空：說清楚你想要的畫面",
    previewLabel: "目前組好的句子：",
    tip: "👨‍👩‍👧 給家長：讓孩子先用自己的話描述，再一起把它變具體。問問「主角心情如何？」「光線是亮的還暗的？」",
    primary: "subject",
    kind: "image",
    style: "幼兒、溫馨可愛、適合親子",
    fields: [
      { id: "subject", name: "主角", label: "🦸 誰是主角？", type: "suggest", ph: "例如：我家的橘貓、全家人",
        opts: ["我自己", "全家人", "小貓咪", "小狗狗", "小兔子", "獨角獸", "小美人魚", "小恐龍", "小機器人", "小公主", "小王子", "超級英雄"] },
      { id: "action", name: "在做什麼", label: "🎬 主角在做什麼？", type: "suggest", ph: "例如：在天上飛、開生日派對",
        opts: ["開心地笑", "在天上飛", "變身魔法", "放魔法煙火", "開生日派對", "跟動物玩", "一起野餐", "吹泡泡", "抱抱"] },
      { id: "place", name: "地點", label: "🗺️ 在哪裡？", type: "suggest", ph: "例如：彩虹城堡、海底世界",
        opts: ["彩虹城堡", "糖果屋", "海底世界", "棉花糖雲朵上", "魔法森林", "恐龍樂園", "太空星球", "奶奶家院子"] },
      { id: "style", name: "風格", label: "🎨 想要什麼風格？", type: "single",
        opts: ["可愛 Q 版", "吉卜力動畫風", "水彩繪本", "童話插畫", "黏土公仔", "毛茸茸絨毛玩具", "蠟筆塗鴉"] },
      { id: "mood", name: "心情", label: "💖 心情 / 氣氛？", type: "single",
        opts: ["溫馨", "歡樂", "夢幻", "甜甜的", "閃亮亮", "驚喜"] },
      { id: "camera", name: "鏡頭", label: "🎥 鏡頭怎麼拍？", type: "single",
        opts: ["正面特寫", "可愛全身", "從上面看", "近近的大頭照"] },
      { id: "extra", name: "小細節", label: "⭐ 還想加什麼小細節？", type: "text", ph: "例如：發光的星星、彩虹、毛茸茸的質感" },
    ],
  },

  teen: {
    label: "🚀 大小孩・酷炫奇幻",
    title: "填空：說清楚你想要的畫面",
    previewLabel: "目前組好的句子：",
    tip: "🧑‍🎨 試試混搭：可愛＋科幻、奇幻＋時尚都行。不滿意就換風格或心情再生一次。",
    primary: "subject",
    kind: "image",
    style: "青少年、酷炫奇幻；遊戲、科幻、奇幻、夢幻、偶像、時尚、療癒皆可，以使用者實際選的風格與主角為準，不要預設成男生取向",
    fields: [
      { id: "subject", name: "主角", label: "🦸 誰是主角？", type: "suggest", ph: "例如：魔法少女、未來戰士、我自己",
        opts: ["魔法少女", "未來戰士", "偶像歌手", "魔法師", "時尚設計師", "賽車手", "精靈遊俠", "機甲駕駛員", "神獸馴獸師", "太空探險家", "我自己變成主角"] },
      { id: "action", name: "在做什麼", label: "🎬 在做什麼？", type: "suggest", ph: "例如：站上舞台演唱、召喚神獸",
        opts: ["施展元素魔法", "站上舞台演唱", "走伸展台", "駕駛機甲", "召喚神獸", "變身", "高速衝刺", "探索神秘遺跡"] },
      { id: "place", name: "地點", label: "🗺️ 在哪裡？", type: "suggest", ph: "例如：星空舞台、夢幻花海、賽博城市",
        opts: ["浮空奇幻島嶼", "星空演唱會舞台", "魔法學院", "賽博龐克城市", "夢幻花海", "櫻花校園", "霓虹夜街", "外太空戰艦"] },
      { id: "style", name: "風格", label: "🎨 想要什麼風格？", type: "single",
        opts: ["日系動漫", "夢幻奇幻插畫", "少女漫畫", "3D 遊戲 CG", "時尚雜誌風", "電影級寫實", "賽博龐克", "水彩奇幻", "像素藝術"] },
      { id: "mood", name: "氛圍", label: "💖 氛圍？", type: "single",
        opts: ["夢幻唯美", "史詩磅礴", "浪漫", "酷炫", "神秘", "熱血", "療癒"] },
      { id: "camera", name: "鏡頭", label: "🎥 鏡頭怎麼拍？", type: "single",
        opts: ["電影感廣角", "戲劇性特寫", "夢幻柔焦", "低角度仰拍", "俯瞰全景", "動態追焦"] },
      { id: "extra", name: "加分細節", label: "⭐ 加分細節？", type: "text", ph: "例如：發光粒子、櫻花飄落、霓虹反光" },
    ],
  },

  pro: {
    label: "🎬 大人・電影創作",
    title: "電影前期設定：把一顆鏡頭設計清楚",
    previewLabel: "目前的鏡頭設定：",
    tip: "🎥 給創作者：先寫 logline 與人設，再決定景別、機位、運鏡、光線與敘事角度。產出可直接餵 AI 生圖當分鏡稿（keyframe），影片可再丟 Luma/可靈。",
    primary: "logline",
    kind: "film",
    fields: [
      { id: "logline", name: "一句話故事(logline)", label: "📝 一句話故事 logline", type: "text",
        ph: "例如：一名退役太空人重返荒廢的月球基地，尋找女兒最後的訊號" },
      { id: "genre", name: "類型", label: "🎞️ 類型", type: "single",
        opts: ["劇情", "科幻", "驚悚 / 懸疑", "愛情", "動作", "奇幻", "恐怖", "黑色電影 Noir", "紀錄片風", "公路電影", "賽博龐克"] },
      { id: "era", name: "時空背景 / 年代", label: "🕰️ 時空背景 / 年代", type: "suggest", ph: "例如：近未來 2087、1980 年代復古",
        opts: ["近未來 2087", "1920 年代", "1980 年代復古", "中世紀奇幻", "末日廢土", "現代都市", "蒸汽龐克", "架空王朝古裝"] },
      { id: "location", name: "場景地點", label: "📍 場景地點", type: "suggest", ph: "例如：雨夜霓虹街道、太空艙內部",
        opts: ["雨夜霓虹街道", "廢棄工廠", "海邊燈塔", "太空艙內部", "古宅書房", "荒漠公路", "頂樓天台", "地下酒吧", "竹林", "醫院長廊"] },
      { id: "character", name: "主角人設", label: "🧑 主角人設（年齡 / 外型 / 服裝 / 氣質）", type: "text",
        ph: "例如：40 歲女性，俐落短髮，磨損的飛行夾克，眼神疲憊而堅定" },
      { id: "action", name: "這顆鏡頭發生什麼", label: "🎬 這顆鏡頭發生什麼", type: "text",
        ph: "例如：她緩緩推開鏽蝕的艙門，光灑進黑暗" },
      { id: "shot", name: "景別", label: "🔲 景別 Shot size", type: "single",
        opts: ["大遠景 ELS", "遠景 LS", "全景 FS", "中景 MS", "中近景 MCU", "特寫 CU", "大特寫 ECU"] },
      { id: "angle", name: "機位角度", label: "📐 機位角度 Angle", type: "single",
        opts: ["平視 Eye-level", "俯角 High-angle", "仰角 Low-angle", "鳥瞰 Top-down", "荷蘭角 Dutch", "過肩 OTS"] },
      { id: "movement", name: "運鏡", label: "🎥 運鏡 Movement", type: "single",
        opts: ["固定鏡頭", "推軌推近 Dolly-in", "拉遠 Dolly-out", "橫搖 Pan", "直搖 Tilt", "手持跟拍 Handheld", "空拍環繞", "Steadicam 跟隨", "變焦 Zoom"] },
      { id: "lens", name: "鏡頭焦段 / 景深", label: "🔭 鏡頭焦段 / 景深", type: "single",
        opts: ["廣角 14-24mm", "標準 35mm", "標準 50mm", "人像 85mm", "長焦 135mm", "微距", "淺景深散景", "深景深全清晰"] },
      { id: "lighting", name: "光線", label: "💡 光線 Lighting", type: "single",
        opts: ["自然光", "黃金時刻 Golden hour", "藍調時刻 Blue hour", "高反差硬光", "柔光", "低調暗部 Low-key", "高調明亮 High-key", "霓虹混色", "逆光剪影", "燭光 / 火光"] },
      { id: "grade", name: "色調", label: "🎨 色調 Color grade", type: "single",
        opts: ["暖色調", "冷色調", "青橙 Teal & Orange", "復古褪色", "高飽和", "黑白", "低飽和寫實", "柔和粉彩"] },
      { id: "narration", name: "敘事角度", label: "👁️ 敘事角度 Narrative POV", type: "single",
        opts: ["客觀旁觀", "跟隨主角", "主角主觀 POV", "全知視角", "不可靠敘事", "回憶 / 閃回"] },
      { id: "mood", name: "氛圍", label: "🌫️ 氛圍", type: "single",
        opts: ["緊張懸疑", "浪漫", "孤寂蒼涼", "史詩磅礴", "溫暖療癒", "不安詭譎", "希望昂揚", "冷冽疏離"] },
      { id: "extra", name: "其他指定", label: "➕ 其他指定（道具 / 天氣 / 參考風格）", type: "text",
        ph: "例如：濃霧、霓虹反射在濕地面、致敬 Blade Runner 的氛圍" },
    ],
  },

  template: {
    label: "🧩 填空模板",
    title: "選一個模板，把空格填滿",
    previewLabel: "組好的提示詞：",
    tip: "🧩 篩選分類或搜尋 → 點一個模板 → 填／點詞庫（可切中/英）→ 複製提示詞，或交給 AI 潤色。模板、詞庫與範例圖改編自開源 PromptFill（MIT，圖 by @sundyme），已淨化為闔家版。",
    kind: "template",
    summonLabel: "✨ 交給 AI 潤色",
  },
};

// 填空模板資料（來自 data-fill.js，改編自 doggy8088/PromptFill MIT）
const FILL = () => window.FILL_DATA || { categories: {}, banks: {}, templates: [] };
const COMMONS_PAGE = (file) => `https://commons.wikimedia.org/wiki/File:${encodeURIComponent(file)}`;
// 依模板分類對應一張公共領域名畫當範例圖（本地圖，完整不裁切）
const IMG_BY_TAG = {
  人物: { f: "char", credit: "慕夏《春》", page: "Alfons_Mucha_-_1896_-_Spring.jpg" },
  攝影: { f: "scenery", credit: "莫內《印象・日出》", page: "Claude_Monet,_Impression,_soleil_levant.jpg" },
  卡通: { f: "storybook", credit: "秀拉《大碗島的星期日午後》", page: "A_Sunday_on_La_Grande_Jatte,_Georges_Seurat,_1884.jpg" },
  寵物: { f: "storybook", credit: "秀拉《大碗島的星期日午後》", page: "A_Sunday_on_La_Grande_Jatte,_Georges_Seurat,_1884.jpg" },
  創意: { f: "cinematic", credit: "梵谷《星夜》", page: "Van_Gogh_-_Starry_Night_-_Google_Art_Project.jpg" },
  圖表: { f: "cinematic", credit: "梵谷《星夜》", page: "Van_Gogh_-_Starry_Night_-_Google_Art_Project.jpg" },
  遊戲: { f: "fantasy", credit: "波希《人間樂園》", page: "The_Garden_of_Earthly_Delights_by_Bosch_High_Resolution.jpg" },
  建築: { f: "fantasy", credit: "波希《人間樂園》", page: "The_Garden_of_Earthly_Delights_by_Bosch_High_Resolution.jpg" },
  產品: { f: "product", credit: "維梅爾《戴珍珠耳環的少女》", page: "1665_Girl_with_a_Pearl_Earring.jpg" },
  社群: { f: "char", credit: "慕夏《春》", page: "Alfons_Mucha_-_1896_-_Spring.jpg" },
};
const imgForTags = (tags) => {
  for (const t of (tags || [])) if (IMG_BY_TAG[t]) return IMG_BY_TAG[t];
  return IMG_BY_TAG["創意"];
};

let currentMode = "kid";
let selectedTemplate = null;   // template 模式：選中的模板物件
let tplVals = {};              // template 模式：各 {{變數}} 已填的值
let tplFilter = "全部";        // 模板分類篩選
let tplSearch = "";            // 模板搜尋字串
let tplLang = "zh";            // 模板語言：zh | en（提示詞輸出語言）
// 取目前語言的字串：雙語物件 {zh,en} → 取對應語言；純字串原樣回傳
const pick = (o) => (o && typeof o === "object" && ("zh" in o || "en" in o)) ? (o[tplLang] || o.zh || o.en || "") : (o || "");
let selections = {}; // 單選欄位的值 {fieldId: value}

/* ---------- 動態生成表單 ---------- */
function renderForm() {
  const mode = MODES[currentMode];
  selections = {};
  const wrap = document.getElementById("builder-fields");
  wrap.innerHTML = "";

  document.getElementById("builder-title").textContent = mode.title;
  document.getElementById("preview-label").textContent = mode.previewLabel;
  document.getElementById("builder-tip").textContent = mode.tip;
  document.getElementById("summon").textContent = mode.summonLabel || (mode.kind === "film" ? "🎬 生成鏡頭 / 分鏡" : "✨ 開始詠唱");

  if (mode.kind === "template") { renderTemplateMode(wrap, mode); return; }

  mode.fields.forEach((f) => {
    const field = document.createElement("div");
    field.className = "field";

    const label = document.createElement("label");
    label.innerHTML = f.label + (f.type === "single" ? ' <small>（點一個）</small>' : "");
    if (f.type !== "single") label.setAttribute("for", f.id);
    field.appendChild(label);

    if (f.type === "single") {
      const chips = document.createElement("div");
      chips.className = "chips single";
      f.opts.forEach((opt) => {
        const chip = document.createElement("span");
        chip.className = "chip";
        chip.textContent = opt;
        chip.addEventListener("click", () => {
          const off = selections[f.id] === opt;
          selections[f.id] = off ? "" : opt;
          chips.querySelectorAll(".chip").forEach((c) => c.classList.remove("is-on"));
          if (!off) chip.classList.add("is-on");
          updatePreview();
        });
        chips.appendChild(chip);
      });
      field.appendChild(chips);
    } else {
      const input = document.createElement("input");
      input.type = "text";
      input.id = f.id;
      input.placeholder = f.ph || "";
      input.addEventListener("input", updatePreview);
      field.appendChild(input);
      if (f.type === "suggest" && f.opts) {
        const chips = document.createElement("div");
        chips.className = "chips";
        f.opts.forEach((opt) => {
          const chip = document.createElement("span");
          chip.className = "chip";
          chip.textContent = opt;
          chip.addEventListener("click", () => {
            input.value = input.value ? `${input.value}、${opt}` : opt;
            updatePreview();
          });
          chips.appendChild(chip);
        });
        field.appendChild(chips);
      }
    }
    wrap.appendChild(field);
  });
}

/* ---------- 收集已填內容 ---------- */
// 回傳 [{name, value}]（只含非空），供預覽與送 AI 用
function gather() {
  const out = [];
  (MODES[currentMode].fields || []).forEach((f) => {
    let v = "";
    if (f.type === "single") v = selections[f.id] || "";
    else {
      const el = document.getElementById(f.id);
      v = el ? el.value.trim() : "";
    }
    if (v) out.push({ name: f.name, value: v });
  });
  return out;
}

function updatePreview() {
  if (MODES[currentMode].kind === "template") {
    document.getElementById("preview-text").textContent = assembleTemplate(true);
    return;
  }
  const g = gather();
  const s = g.map((x) => `${x.name}：${x.value}`).join("　/　");
  document.getElementById("preview-text").textContent = s || "（先填上面的空格…）";
}

/* ---------- 填空模板模式（仿 prompt-fill，沿用站內版型）---------- */
const tplVars = (tpl) => {
  const set = [], re = /\{\{(.+?)\}\}/g; let m;
  while ((m = re.exec(tpl))) if (!set.includes(m[1])) set.push(m[1]);
  return set;
};

const bankLabel = (v) => (FILL().banks[v] && pick(FILL().banks[v].label)) || v;
// forPreview=true：未填的空格顯示〔詞庫標籤〕；false：未填的整段拿掉占位、留空
function assembleTemplate(forPreview) {
  if (!selectedTemplate) return forPreview ? "（先選一個模板…）" : "";
  return pick(selectedTemplate.content).replace(/\{\{(.+?)\}\}/g, (_, v) => {
    const val = (tplVals[v] || "").trim();
    return val || (forPreview ? `〔${bankLabel(v)}〕` : "");
  });
}

function renderTemplateMode(wrap) {
  const FD = FILL();
  const allTags = [];
  FD.templates.forEach((t) => (t.tags || []).forEach((g) => { if (!allTags.includes(g)) allTags.push(g); }));

  // 0) 語言切換（提示詞輸出語言；英文通常生圖品質較好）
  const lbar = document.createElement("div");
  lbar.className = "field";
  lbar.innerHTML = "<label>🌐 提示詞語言</label>";
  const lchips = document.createElement("div");
  lchips.className = "chips single";
  [["zh", "中文"], ["en", "English"]].forEach(([code, name]) => {
    const c = document.createElement("span");
    c.className = "chip" + (tplLang === code ? " is-on" : "");
    c.textContent = name;
    c.addEventListener("click", () => { tplLang = code; tplVals = {}; renderForm(); updatePreview(); });
    lchips.appendChild(c);
  });
  lbar.appendChild(lchips);
  wrap.appendChild(lbar);

  // 1) 分類篩選
  const fbar = document.createElement("div");
  fbar.className = "field";
  fbar.innerHTML = "<label>📁 分類</label>";
  const fchips = document.createElement("div");
  fchips.className = "chips";
  ["全部", ...allTags].forEach((g) => {
    const c = document.createElement("span");
    c.className = "chip" + (tplFilter === g ? " is-on" : "");
    c.textContent = g;
    c.addEventListener("click", () => { tplFilter = g; refreshList(); fchips.querySelectorAll(".chip").forEach((x) => x.classList.toggle("is-on", x.textContent === g)); });
    fchips.appendChild(c);
  });
  fbar.appendChild(fchips);
  wrap.appendChild(fbar);

  // 2) 搜尋
  const sbar = document.createElement("div");
  sbar.className = "field";
  sbar.innerHTML = '<label for="tpl-search">🔍 搜尋模板</label>';
  const sinput = document.createElement("input");
  sinput.type = "text"; sinput.id = "tpl-search"; sinput.placeholder = "輸入關鍵字…"; sinput.value = tplSearch;
  sinput.addEventListener("input", () => { tplSearch = sinput.value; refreshList(); });
  sbar.appendChild(sinput);
  wrap.appendChild(sbar);

  // 3) 模板清單（只重繪這塊，避免搜尋打字失焦）
  const listField = document.createElement("div");
  listField.className = "field";
  listField.innerHTML = '<label>📑 選一個模板 <small>（點一個）</small></label>';
  const listBox = document.createElement("div");
  listBox.className = "chips single";
  listField.appendChild(listBox);
  wrap.appendChild(listField);

  // 4) 選中後的明細（圖＋填空欄位）
  const detail = document.createElement("div");
  wrap.appendChild(detail);

  function refreshList() {
    const q = tplSearch.trim().toLowerCase();
    const list = FD.templates.filter((t) =>
      (tplFilter === "全部" || (t.tags || []).includes(tplFilter)) &&
      (!q || `${t.name.zh || ""} ${t.name.en || ""}`.toLowerCase().includes(q))
    );
    listBox.innerHTML = "";
    if (!list.length) { listBox.innerHTML = '<span class="preview-label">（沒有符合的模板）</span>'; return; }
    list.forEach((t) => {
      const chip = document.createElement("span");
      chip.className = "chip" + (selectedTemplate && selectedTemplate.id === t.id ? " is-on" : "");
      chip.textContent = pick(t.name) + (t.tags && t.tags[0] ? `・${t.tags[0]}` : "");
      chip.addEventListener("click", () => { selectedTemplate = t; tplVals = {}; refreshList(); renderDetail(); updatePreview(); detail.scrollIntoView({ behavior: "smooth", block: "nearest" }); });
      listBox.appendChild(chip);
    });
  }

  function renderDetail() {
    detail.innerHTML = "";
    if (!selectedTemplate) return;
    const fig = document.createElement("figure");
    fig.className = "tpl-figure";
    if (selectedTemplate.img) {
      // 每個模板用自己的範例圖（對齊內容，by @sundyme，改編自 PromptFill MIT）
      fig.innerHTML =
        `<a href="https://github.com/doggy8088/PromptFill" target="_blank" rel="noopener">` +
        `<img src="./${selectedTemplate.img}" alt="${pick(selectedTemplate.name)} 範例" loading="lazy" /></a>` +
        `<figcaption>此模板範例 · 圖 by @sundyme，改編自 PromptFill（MIT）</figcaption>`;
    } else {
      const img = imgForTags(selectedTemplate.tags);
      fig.innerHTML =
        `<a href="${COMMONS_PAGE(img.page)}" target="_blank" rel="noopener">` +
        `<img src="./assets/refs/${img.f}.jpg" alt="${img.credit}" loading="lazy" /></a>` +
        `<figcaption>風格示意：${img.credit} · 公共領域</figcaption>`;
    }
    detail.appendChild(fig);

    tplVars(pick(selectedTemplate.content)).forEach((v) => {
      const field = document.createElement("div");
      field.className = "field";
      const label = document.createElement("label");
      label.innerHTML = `🔹 ${bankLabel(v)} <small>（點詞或自己打）</small>`;
      label.setAttribute("for", `tv-${v}`);
      field.appendChild(label);

      const input = document.createElement("input");
      input.type = "text";
      input.id = `tv-${v}`;
      input.placeholder = `填入「${bankLabel(v)}」…`;
      input.value = tplVals[v] || "";
      input.addEventListener("input", () => { tplVals[v] = input.value; updatePreview(); });
      field.appendChild(input);

      const opts = (FD.banks[v] && FD.banks[v].options) || [];
      if (opts.length) {
        const chips = document.createElement("div");
        chips.className = "chips";
        opts.forEach((opt) => {
          const word = pick(opt);
          const chip = document.createElement("span");
          chip.className = "chip";
          chip.textContent = word;
          chip.addEventListener("click", () => { tplVals[v] = word; input.value = word; updatePreview(); });
          chips.appendChild(chip);
        });
        field.appendChild(chips);
      }
      detail.appendChild(field);
    });
  }

  refreshList();
  renderDetail();
}

/* ---------- 呼叫後端 LLM 代理 ---------- */
async function callLLM({ system, user, images, maxTokens }) {
  if (!HAS_BACKEND) throw new Error("OFFLINE");
  const headers = { "content-type": "application/json" };
  if (CFG.APP_KEY) headers["x-app-key"] = CFG.APP_KEY;
  const res = await fetch(CFG.API_ENDPOINT, {
    method: "POST",
    headers,
    body: JSON.stringify({ system, user, images, max_tokens: maxTokens || 1500 }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || data.detail || `HTTP ${res.status}`);
  return (data.text || "").trim();
}

// 從模型回傳裡盡量抽出 JSON（容忍 ```json 包裹）
function parseJSON(text) {
  const m = text.match(/\{[\s\S]*\}/);
  if (!m) return null;
  try { return JSON.parse(m[0]); } catch { return null; }
}

/* ---------- 召喚 / 開拍 ---------- */
async function summon() {
  const mode = MODES[currentMode];
  if (mode.kind === "template") return summonTemplate();
  const g = gather();
  if (!g.length) {
    alert("先填一些內容吧！");
    return;
  }
  const resultCard = document.getElementById("result");
  const body = document.getElementById("result-body");
  const spinner = document.getElementById("summon-spinner");
  resultCard.classList.remove("hidden");
  body.innerHTML = "";
  resultCard.scrollIntoView({ behavior: "smooth", block: "start" });

  const filled = g.map((x) => `${x.name}：${x.value}`).join("\n");

  if (!HAS_BACKEND) {
    renderPrompts(body, { zh: filled + "\n（尚未設定 AI 後端，無法擴寫與翻譯。）", en: "" });
    return;
  }

  spinner.classList.remove("hidden");
  let system;
  if (mode.kind === "film") {
    system =
      "你是專業電影導演與分鏡師（storyboard artist）。根據使用者填的電影前期設定，" +
      "產出可直接餵 AI 生圖、當作分鏡稿關鍵畫格（keyframe）的專業提示詞，並提供一組分鏡序列。" +
      "請運用正確的電影語言（景別、機位角度、運鏡、鏡頭焦段、光線、色調、敘事角度、畫面比例）。" +
      "安全正向，避免血腥與真實名人換臉。只回傳 JSON：" +
      '{"zh":"這顆主鏡頭的中文電影化描述（涵蓋時空背景、場景、人物、景別、機位、運鏡、鏡頭、光線色調、敘事角度與氛圍）",' +
      '"en":"a detailed English cinematic image-generation prompt: photoreal film still, include shot size, camera angle, lens (mm), lighting, color grade, mood, film grain, aspect ratio 2.39:1",' +
      '"shots":[{"shot":"鏡1 ‧ 景別/運鏡","desc":"這顆鏡頭的畫面與敘事重點"}]}。' +
      "shots 給 3～5 顆，串起來能說明這場戲。不要加任何多餘文字。";
  } else {
    system =
      "你是親子 AI 生圖教學的提示詞大師。把家長與孩子填的零碎想法，擴寫成一段高品質的生圖提示詞。" +
      "風格定位：" + mode.style + "。要安全、正向、適合闔家觀賞，避免暴力血腥與真實人物換臉。" +
      '只回傳 JSON：{"zh":"中文版完整提示詞","en":"English version, comma-separated descriptive prompt"}。' +
      "中文版用通順自然的句子描述主體、動作、場景、風格、光線、氛圍、構圖與畫質；英文版是給生圖模型吃的逗號分隔關鍵詞句。不要加多餘說明。";
  }
  const user = "使用者填的內容：\n" + filled;

  try {
    const text = await callLLM({ system, user, maxTokens: mode.kind === "film" ? 2000 : 1200 });
    const obj = parseJSON(text);
    if (obj && (obj.zh || obj.en)) renderPrompts(body, obj);
    else renderPrompts(body, { zh: text, en: "" });
  } catch (e) {
    body.innerHTML = `<div class="error-msg">😢 失敗：${escapeHtml(String(e.message || e))}<br>先用上面組好的內容也可以貼去生圖。</div>`;
  } finally {
    spinner.classList.add("hidden");
  }
}

async function summonTemplate() {
  if (!selectedTemplate) { alert("先選一個模板吧！"); return; }
  const assembled = assembleTemplate(false);
  const resultCard = document.getElementById("result");
  const body = document.getElementById("result-body");
  const spinner = document.getElementById("summon-spinner");
  resultCard.classList.remove("hidden");
  body.innerHTML = "";
  resultCard.scrollIntoView({ behavior: "smooth", block: "start" });

  // 模板本身就能用：先直接給「填好的提示詞」可複製，AI 潤色為加值
  if (!HAS_BACKEND) {
    renderPrompts(body, { zh: assembled, en: "（尚未設定 AI 後端，無法翻譯英文。中文提示詞可直接用。）" });
    return;
  }
  spinner.classList.remove("hidden");
  const system =
    "你是 AI 生圖提示詞大師。使用者用『模板填空』組出一段提示詞，請潤飾成更完整自然的中文版，並翻成適合生圖模型的英文版。" +
    "保留原本的主體、風格、場景、光線等設定，安全正向、適合闔家。" +
    '只回傳 JSON：{"zh":"潤飾後中文提示詞","en":"English comma-separated prompt"}。不要多餘說明。';
  try {
    const text = await callLLM({ system, user: "填好的提示詞：\n" + assembled, maxTokens: 1000 });
    const obj = parseJSON(text);
    renderPrompts(body, obj && (obj.zh || obj.en) ? obj : { zh: assembled, en: "" });
  } catch (e) {
    body.innerHTML = `<div class="error-msg">😢 潤色失敗：${escapeHtml(String(e.message || e))}<br>沒關係，上面「組好的提示詞」可直接複製使用。</div>`;
  } finally {
    spinner.classList.add("hidden");
  }
}

function renderPrompts(container, obj) {
  const { zh, en, shots } = obj;
  container.innerHTML = "";
  const film = MODES[currentMode].kind === "film";
  if (zh) container.appendChild(promptBox(film ? "🎬 中文鏡頭描述" : "🪄 中文詠唱（給人看、貼 Gemini 也通）", zh));
  if (en) container.appendChild(promptBox(film ? "🎞️ 英文生圖提示詞（cinematic）" : "🌐 英文詠唱（生圖品質更好）", en));
  if (Array.isArray(shots) && shots.length) {
    const h = document.createElement("p");
    h.className = "preview-label";
    h.style.marginTop = "6px";
    h.textContent = "🎬 分鏡序列：";
    container.appendChild(h);
    shots.forEach((s, i) => {
      const title = s.shot ? `🎞️ ${s.shot}` : `🎞️ 鏡 ${i + 1}`;
      container.appendChild(promptBox(title, s.desc || ""));
    });
  }
  const tip = document.createElement("p");
  tip.className = "parent-tip";
  tip.innerHTML = film
    ? "📋 複製英文提示詞 → <strong>Gemini</strong>／<strong>ChatGPT</strong> 生關鍵畫格；要動起來就把畫格丟 <strong>Luma</strong>／<strong>可靈</strong>。分鏡可逐顆生成串成一場戲。"
    : "📋 複製詠唱 → 打開 <strong>Gemini</strong>／<strong>ChatGPT</strong>／<strong>Copilot</strong> → 貼上 → 送出，就會變出圖！不滿意就改幾個字再生一次。";
  container.appendChild(tip);
}

function promptBox(title, content) {
  const box = document.createElement("div");
  box.className = "prompt-box";
  const head = document.createElement("header");
  const h = document.createElement("span");
  h.textContent = title;
  const btn = document.createElement("button");
  btn.className = "copy-btn";
  btn.textContent = "複製";
  btn.addEventListener("click", () => {
    navigator.clipboard.writeText(content).then(() => {
      btn.textContent = "已複製 ✓";
      btn.classList.add("copied");
      setTimeout(() => { btn.textContent = "複製"; btn.classList.remove("copied"); }, 1600);
    });
  });
  head.append(h, btn);
  const bd = document.createElement("div");
  bd.className = "body";
  bd.textContent = content;
  box.append(head, bd);
  return box;
}

/* ---------- 照片變魔法（vision） ---------- */
let photoDataUrl = "";

function onPhotoPick(e) {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => {
    photoDataUrl = reader.result;
    const img = document.getElementById("photo-img");
    img.src = photoDataUrl;
    document.getElementById("photo-preview").classList.remove("hidden");
    document.getElementById("analyze").disabled = false;
  };
  reader.readAsDataURL(file);
}

async function analyzePhoto() {
  const out = document.getElementById("photo-result");
  const spinner = document.getElementById("photo-spinner");
  out.innerHTML = "";
  if (!photoDataUrl) return;
  if (!HAS_BACKEND) {
    out.innerHTML = `<div class="error-msg">尚未設定 AI 後端，照片功能需要部署 worker 後才能用。</div>`;
    return;
  }
  spinner.classList.remove("hidden");
  const mode = MODES[currentMode];
  const styleHint = mode.kind === "film"
    ? "電影感、寫實、運用電影語言（景別/光線/色調），給可當分鏡 keyframe 的改造方向"
    : (currentMode === "kid" ? "可愛溫馨、適合幼兒" : "酷炫奇幻；遊戲/科幻/奇幻/夢幻/偶像/時尚/療癒皆可，依使用者喜好，不要預設男生取向");
  const system =
    "你是 AI 生圖提示詞大師，正在看一張照片。" +
    "請用親切中文簡述照片重點（主體、動作、背景），再提出三個有創意的「把這張照片改造成…」的編修提示詞，風格偏向：" + styleHint + "。" +
    "改造提示詞要能直接貼到 Gemini（搭配同一張照片）使用。安全正向。" +
    '只回傳 JSON：{"summary":"照片重點","prompts":["提示詞1","提示詞2","提示詞3"]}。';
  const user = "請看這張照片並給建議。";
  try {
    const text = await callLLM({ system, user, images: [photoDataUrl], maxTokens: 1200 });
    const obj = parseJSON(text);
    out.innerHTML = "";
    if (obj && obj.summary) {
      const s = document.createElement("p");
      s.className = "preview";
      s.innerHTML = `<span class="preview-label">AI 看到的重點：</span><br>${escapeHtml(obj.summary)}`;
      out.appendChild(s);
    }
    const prompts = (obj && obj.prompts) || [];
    if (prompts.length) {
      prompts.forEach((p, i) => out.appendChild(promptBox(`✨ 改造提示詞 ${i + 1}`, p)));
      const tip = document.createElement("p");
      tip.className = "parent-tip";
      tip.innerHTML = "做法：打開 <strong>Gemini</strong> → 上傳同一張照片 → 貼上改造提示詞 → 送出。";
      out.appendChild(tip);
    } else if (!obj) {
      out.appendChild(promptBox("AI 建議", text));
    }
  } catch (e) {
    out.innerHTML = `<div class="error-msg">😢 看照片失敗：${escapeHtml(String(e.message || e))}</div>`;
  } finally {
    spinner.classList.add("hidden");
  }
}

/* ---------- 工具 & 綁定 ---------- */
function escapeHtml(s) {
  return s.replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
}

function resetAll() {
  selectedTemplate = null;
  tplVals = {};
  tplFilter = "全部";
  tplSearch = "";
  renderForm();
  updatePreview();
  document.getElementById("result").classList.add("hidden");
}

function init() {
  renderForm();
  updatePreview();

  document.querySelectorAll(".age-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      currentMode = btn.dataset.age;
      document.querySelectorAll(".age-btn").forEach((b) => {
        const on = b === btn;
        b.classList.toggle("is-active", on);
        b.setAttribute("aria-selected", on ? "true" : "false");
      });
      renderForm();
      updatePreview();
    });
  });

  document.getElementById("summon").addEventListener("click", summon);
  document.getElementById("reset").addEventListener("click", resetAll);
  const pc = document.getElementById("preview-copy");
  if (pc) pc.addEventListener("click", () => {
    const t = document.getElementById("preview-text").textContent || "";
    navigator.clipboard.writeText(t).then(() => {
      pc.textContent = "已複製 ✓";
      setTimeout(() => { pc.textContent = "複製"; }, 1500);
    });
  });
  document.getElementById("photo-input").addEventListener("change", onPhotoPick);
  document.getElementById("analyze").addEventListener("click", analyzePhoto);

  document.getElementById("backend-note").textContent = HAS_BACKEND
    ? "AI 後端：已連線"
    : "AI 後端：尚未設定（目前為離線模式）";
}

document.addEventListener("DOMContentLoaded", init);
