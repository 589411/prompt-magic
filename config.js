// 前端設定（公開，勿放任何金鑰）
// 部署 worker 後，把 API_ENDPOINT 換成你的 Worker 網址。
// 本機測試可先留空字串，會走「離線模式」：只組合提示詞、不呼叫 AI。
window.PROMPT_MAGIC_CONFIG = {
  // 例： "https://prompt-magic-worker.<你的子域>.workers.dev"
  //  或同網域： "/api/generate"
  API_ENDPOINT: "https://prompt-magic-worker.589411.workers.dev",

  // 若 worker 有設 APP_KEY 共享密鑰才需要填；公開頁面填了等於洩漏，
  // 一般建議改用 Cloudflare Access 或 ALLOWED_ORIGIN 鎖來源，這裡留空。
  APP_KEY: "",
};
