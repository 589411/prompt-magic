"use strict";

const CFG = window.PROMPT_MAGIC_CONFIG || { API_ENDPOINT: "", APP_KEY: "" };
const HAS_BACKEND = !!CFG.API_ENDPOINT;

/* ---------- 提示詞素材庫（依年齡切換建議選項） ---------- */
const PRESETS = {
  kid: {
    subject: ["我自己", "全家人", "我家的貓", "我家的狗", "小恐龍", "戴皇冠的公主", "勇敢的小英雄"],
    action: ["開心地笑", "在天上飛", "放魔法煙火", "一起野餐", "抱抱", "吹泡泡"],
    place: ["彩虹城堡", "棉花糖雲朵上", "魔法森林", "海邊沙灘", "奶奶家院子", "星空下"],
    style: ["可愛 Q 版", "吉卜力動畫風", "水彩繪本", "黏土公仔", "毛茸茸絨毛玩具", "蠟筆塗鴉"],
    mood: ["溫馨", "歡樂", "夢幻", "甜甜的", "驚喜"],
    camera: ["正面特寫", "可愛全身", "從上面看", "近近的大頭照"],
  },
  teen: {
    subject: ["未來戰士", "機甲駕駛員", "魔法師", "賽車手", "太空探險家", "我自己變成英雄"],
    action: ["發射能量光束", "駕駛機甲", "施展元素魔法", "高速衝刺", "召喚神獸", "潛入基地"],
    place: ["賽博龐克城市", "外太空戰艦", "末日廢墟", "浮空島嶼", "霓虹夜街", "古代遺跡"],
    style: ["3D 遊戲 CG", "電影級寫實", "日系動漫", "賽博龐克", "像素藝術", "黑白漫畫", "概念設定圖"],
    mood: ["史詩磅礴", "神秘", "緊張刺激", "酷炫", "孤獨蒼涼"],
    camera: ["電影感廣角", "低角度仰拍", "戲劇性特寫", "俯瞰全景", "動態追焦"],
  },
};

let currentAge = "kid";
const single = { style: "", mood: "", camera: "" }; // 單選欄位的值

/* ---------- 渲染選項 chips ---------- */
function renderChips() {
  document.querySelectorAll(".chips").forEach((box) => {
    const key = box.dataset.target;
    const isSingle = box.classList.contains("single");
    const items = PRESETS[currentAge][key] || [];
    box.innerHTML = "";
    items.forEach((label) => {
      const chip = document.createElement("span");
      chip.className = "chip";
      chip.textContent = label;
      if (isSingle && single[key] === label) chip.classList.add("is-on");
      chip.addEventListener("click", () => onChip(key, label, isSingle, chip, box));
      box.appendChild(chip);
    });
  });
}

function onChip(key, label, isSingle, chip, box) {
  if (isSingle) {
    const turningOff = single[key] === label;
    single[key] = turningOff ? "" : label;
    box.querySelectorAll(".chip").forEach((c) => c.classList.remove("is-on"));
    if (!turningOff) chip.classList.add("is-on");
  } else {
    // 多選欄位（主角/動作/地點）：點一下把詞塞進輸入框
    const input = document.getElementById(key);
    input.value = input.value ? `${input.value}、${label}` : label;
  }
  updatePreview();
}

/* ---------- 即時組合預覽（中文） ---------- */
function gather() {
  return {
    subject: val("subject"),
    action: val("action"),
    place: val("place"),
    style: single.style,
    mood: single.mood,
    camera: single.camera,
    extra: val("extra"),
  };
}
const val = (id) => document.getElementById(id).value.trim();

function buildSentence(g) {
  const parts = [];
  if (g.mood) parts.push(`一張${g.mood}氣氛的圖`);
  if (g.subject) parts.push(`主角是${g.subject}`);
  if (g.action) parts.push(`正在${g.action}`);
  if (g.place) parts.push(`場景在${g.place}`);
  if (g.style) parts.push(`畫面風格是${g.style}`);
  if (g.camera) parts.push(`用${g.camera}的鏡頭`);
  if (g.extra) parts.push(`細節：${g.extra}`);
  return parts.join("，") + (parts.length ? "。" : "");
}

function updatePreview() {
  const s = buildSentence(gather());
  document.getElementById("preview-text").textContent = s || "（先填上面的空格…）";
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

/* ---------- 召喚完整詠唱 ---------- */
async function summon() {
  const g = gather();
  const sentence = buildSentence(g);
  if (!g.subject && !sentence) {
    alert("先至少填一個「主角」吧！");
    return;
  }
  const resultCard = document.getElementById("result");
  const body = document.getElementById("result-body");
  const spinner = document.getElementById("summon-spinner");
  resultCard.classList.remove("hidden");
  body.innerHTML = "";
  resultCard.scrollIntoView({ behavior: "smooth", block: "start" });

  // 離線模式：直接給組好的中文句子當詠唱
  if (!HAS_BACKEND) {
    renderPrompts(body, {
      zh: sentence + " 高品質、細節豐富、光線漂亮。",
      en: "(尚未設定 AI 後端，無法自動翻譯成英文。請部署 worker 後再試。)",
    });
    return;
  }

  spinner.classList.remove("hidden");
  const ageDesc = currentAge === "kid" ? "幼兒、溫馨可愛、適合親子" : "青少年、遊戲科幻、酷炫";
  const system =
    "你是親子 AI 生圖教學的提示詞大師。把家長與孩子填的零碎想法，擴寫成一段高品質的生圖提示詞（prompt）。" +
    "風格定位：" + ageDesc + "。要安全、正向、適合闔家觀賞，避免暴力血腥與真實人物換臉。" +
    "只回傳 JSON，格式：{\"zh\":\"中文版完整提示詞\",\"en\":\"English version, comma-separated descriptive prompt\"}。" +
    "中文版用通順自然的句子描述主體、動作、場景、風格、光線、氛圍、構圖與畫質；英文版是給生圖模型吃的逗號分隔關鍵詞句。不要加任何多餘說明。";
  const user = "孩子和家長填的內容：\n" + JSON.stringify(g, null, 2) + "\n\n組好的中文句子：" + sentence;

  try {
    const text = await callLLM({ system, user, maxTokens: 1200 });
    const obj = parseJSON(text);
    if (obj && (obj.zh || obj.en)) renderPrompts(body, obj);
    else renderPrompts(body, { zh: text, en: "" }); // 解析失敗就直接顯示原文
  } catch (e) {
    body.innerHTML = `<div class="error-msg">😢 召喚失敗：${escapeHtml(String(e.message || e))}<br>先用上面組好的中文句子也可以貼去生圖喔。</div>`;
  } finally {
    spinner.classList.add("hidden");
  }
}

function renderPrompts(container, { zh, en }) {
  container.innerHTML = "";
  if (zh) container.appendChild(promptBox("🪄 中文詠唱（給人看、貼 Gemini 也通）", zh));
  if (en) container.appendChild(promptBox("🌐 英文詠唱（生圖品質更好）", en));
  const tip = document.createElement("p");
  tip.className = "parent-tip";
  tip.innerHTML = "📋 複製詠唱 → 打開 <strong>Gemini</strong>／<strong>ChatGPT</strong>／<strong>Copilot</strong> → 貼上 → 送出，就會變出圖！不滿意就改幾個字再生一次。";
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
    photoDataUrl = reader.result; // data:image/...;base64,...
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
  const ageDesc = currentAge === "kid" ? "可愛溫馨、適合幼兒" : "遊戲科幻、酷炫";
  const system =
    "你是親子 AI 生圖教學的提示詞大師，正在看一張家庭照片。" +
    "請用親切中文簡述照片重點（主體、動作、背景），再提出三個有創意的「把這張照片改造成…」的編修詠唱，風格偏向：" + ageDesc + "。" +
    "改造詠唱要能直接貼到 Gemini（搭配同一張照片）使用。安全正向、適合闔家。" +
    "只回傳 JSON：{\"summary\":\"照片重點\",\"prompts\":[\"詠唱1\",\"詠唱2\",\"詠唱3\"]}。";
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
      prompts.forEach((p, i) => out.appendChild(promptBox(`✨ 改造詠唱 ${i + 1}`, p)));
      const tip = document.createElement("p");
      tip.className = "parent-tip";
      tip.innerHTML = "做法：打開 <strong>Gemini</strong> → 上傳同一張照片 → 貼上改造詠唱 → 送出。";
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
  ["subject", "action", "place", "extra"].forEach((id) => (document.getElementById(id).value = ""));
  single.style = single.mood = single.camera = "";
  renderChips();
  updatePreview();
  document.getElementById("result").classList.add("hidden");
}

function init() {
  renderChips();
  updatePreview();

  document.querySelectorAll(".age-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      currentAge = btn.dataset.age;
      document.querySelectorAll(".age-btn").forEach((b) => {
        const on = b === btn;
        b.classList.toggle("is-active", on);
        b.setAttribute("aria-selected", on ? "true" : "false");
      });
      single.style = single.mood = single.camera = "";
      renderChips();
      updatePreview();
    });
  });

  ["subject", "action", "place", "extra"].forEach((id) =>
    document.getElementById(id).addEventListener("input", updatePreview)
  );

  document.getElementById("summon").addEventListener("click", summon);
  document.getElementById("reset").addEventListener("click", resetAll);
  document.getElementById("photo-input").addEventListener("change", onPhotoPick);
  document.getElementById("analyze").addEventListener("click", analyzePhoto);

  document.getElementById("backend-note").textContent = HAS_BACKEND
    ? "AI 後端：已連線"
    : "AI 後端：尚未設定（目前為離線模式，只組合中文詠唱）";
}

document.addEventListener("DOMContentLoaded", init);
