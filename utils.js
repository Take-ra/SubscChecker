// utils.js（共通ユーティリティ関数）

/**
 * HTMLテキストとして埋め込む文字列をエスケープする（XSS対策）
 */
export function escapeHtml(str) {
  if (str == null) return "";
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/**
 * HTML属性値（value, title, onclick等）内に埋め込む文字列をエスケープする
 */
export function escapeAttr(str) {
  if (str == null) return "";
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/'/g, "&#39;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

/**
 * 数値をカンマ区切りの金額表記に変換する（例: 1200 -> "¥1,200"）
 */
export function formatCurrency(val) {
  const num = Number(val || 0);
  return `¥${num.toLocaleString()}`;
}

/**
 * 数値要素のカウントアップアニメーション
 */
export function animateValue(element, start, end, duration = 500) {
  if (!element || start === end) {
    if (element) element.textContent = Number(end || 0).toLocaleString();
    return;
  }
  if (element.animationId) cancelAnimationFrame(element.animationId);
  let startTimestamp = null;
  const step = (timestamp) => {
    if (!startTimestamp) startTimestamp = timestamp;
    const t = Math.min((timestamp - startTimestamp) / duration, 1);
    const progress = t * (2 - t);
    const currentVal = Math.floor(start + (end - start) * progress);
    element.textContent = currentVal.toLocaleString();
    if (t < 1) {
      element.animationId = window.requestAnimationFrame(step);
    } else {
      element.textContent = Number(end || 0).toLocaleString();
      element.animationId = null;
    }
  };
  element.animationId = window.requestAnimationFrame(step);
}

