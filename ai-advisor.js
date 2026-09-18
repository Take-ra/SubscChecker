// ai-advisor.js (Gemini API 固定費最適化AIアドバイザー)

let currentSelectedItemsGetter = null;
let isAnalyzing = false;
let cachedResult = null;
let lastAnalyzedHash = null;

export function initAIAdvisor(getSelectedItems) {
  currentSelectedItemsGetter = getSelectedItems;

  const btnTrigger = document.getElementById("btn-trigger-ai");
  if (btnTrigger) {
    btnTrigger.addEventListener("click", () => {
      triggerAnalysis();
    });
  }
}

// サブスクリストの内容が変わったかを判定するための簡易ハッシュ
function getItemsHash(items) {
  if (!items || items.length === 0) return "";
  return items.map((i) => `${i.name}-${i.monthly}`).sort().join("|");
}

export async function triggerAnalysis(force = false) {
  if (isAnalyzing) return;

  const contentContainer = document.getElementById("ai-advisor-content");
  const btnTrigger = document.getElementById("btn-trigger-ai");
  if (!contentContainer) return;

  const items = currentSelectedItemsGetter ? currentSelectedItemsGetter() : [];

  if (!items || items.length === 0) {
    contentContainer.innerHTML = `
      <div class="text-center py-6 px-4 bg-white/90 rounded-2xl border border-slate-200">
        <span class="text-3xl mb-2 block">📝</span>
        <p class="text-sm font-bold text-slate-700">サブスクが1つも選択されていません</p>
        <p class="text-xs text-slate-500 mt-1">前の画面に戻り、現在利用しているサブスクにチェックを入れてからAI診断をお試しください。</p>
      </div>
    `;
    return;
  }

  const currentHash = getItemsHash(items);
  if (!force && cachedResult && lastAnalyzedHash === currentHash) {
    renderAdvisor(contentContainer, cachedResult);
    return;
  }

  isAnalyzing = true;
  if (btnTrigger) {
    btnTrigger.disabled = true;
    btnTrigger.classList.add("opacity-50", "cursor-not-allowed");
    btnTrigger.innerHTML = `<span>⏳</span><span>分析中...</span>`;
  }

  renderLoading(contentContainer);

  try {
    const payload = items.map((item) => ({
      name: item.name,
      category: item.category,
      monthly: item.monthly,
      yearly: item.yearly,
    }));

    const res = await fetch("/api/analyze", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ subscriptions: payload }),
    });

    if (!res.ok) {
      const errJson = await res.json().catch(() => ({}));
      throw new Error(errJson.error || `診断エラー (${res.status})`);
    }

    const data = await res.json();
    cachedResult = data;
    lastAnalyzedHash = currentHash;
    renderAdvisor(contentContainer, data);
  } catch (error) {
    console.error("AI Analysis Error:", error);
    renderError(contentContainer, error.message);
  } finally {
    isAnalyzing = false;
    if (btnTrigger) {
      btnTrigger.disabled = false;
      btnTrigger.classList.remove("opacity-50", "cursor-not-allowed");
      btnTrigger.innerHTML = `<span>🔄</span><span>再診断する</span>`;
    }
  }
}

function renderLoading(container) {
  container.innerHTML = `
    <div class="space-y-4 py-6 px-4">
      <div class="flex items-center justify-center gap-3 mb-2">
        <div class="w-5 h-5 border-3 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        <p class="text-sm font-bold text-slate-700">Gemini AIが契約内容を徹底分析中...</p>
      </div>
      <p class="text-xs text-slate-500 text-center">重複契約の検出・年払い割引の算出・資産形成インパクトを計算しています</p>
      
      <!-- スケルトンプレースホルダー -->
      <div class="animate-pulse space-y-3 pt-2">
        <div class="h-20 bg-blue-100/60 rounded-2xl w-full"></div>
        <div class="h-24 bg-slate-200/60 rounded-2xl w-full"></div>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div class="h-28 bg-slate-100 rounded-2xl"></div>
          <div class="h-28 bg-slate-100 rounded-2xl"></div>
        </div>
      </div>
    </div>
  `;
}

function renderAdvisor(container, data) {
  const {
    profile_type,
    summary,
    priority_action,
    duplicate_warnings = [],
    plan_optimizations = [],
    investment_impact,
  } = data;

  const savingAmount = priority_action?.annual_saving
    ? Number(priority_action.annual_saving).toLocaleString()
    : null;

  let duplicateHtml = "";
  if (duplicate_warnings.length > 0) {
    duplicateHtml = `
      <div class="bg-amber-50/80 border border-amber-200/80 rounded-2xl p-4 md:p-5">
        <div class="flex items-center gap-2 mb-2">
          <span class="text-base">⚠️</span>
          <h3 class="text-sm md:text-base font-black text-amber-900">重複・二重課金の懸念</h3>
        </div>
        <ul class="space-y-2 text-xs md:text-sm text-amber-800 leading-relaxed list-disc list-inside">
          ${duplicate_warnings.map((w) => `<li>${escapeHtml(w)}</li>`).join("")}
        </ul>
      </div>
    `;
  }

  let planHtml = "";
  if (plan_optimizations.length > 0) {
    planHtml = `
      <div class="bg-blue-50/80 border border-blue-200/80 rounded-2xl p-4 md:p-5">
        <div class="flex items-center gap-2 mb-2">
          <span class="text-base">💡</span>
          <h3 class="text-sm md:text-base font-black text-blue-900">プラン・契約形態の最適化</h3>
        </div>
        <ul class="space-y-2 text-xs md:text-sm text-blue-800 leading-relaxed list-disc list-inside">
          ${plan_optimizations.map((p) => `<li>${escapeHtml(p)}</li>`).join("")}
        </ul>
      </div>
    `;
  }

  container.innerHTML = `
    <div class="space-y-4 pt-1 animate-in fade-in duration-300">
      <!-- 診断タイプ & 総評 -->
      <div class="bg-white/90 rounded-2xl p-4 md:p-6 border border-slate-200 shadow-sm">
        <div class="flex flex-wrap items-center gap-2 mb-2.5">
          <span class="text-xs font-bold text-slate-400">あなたの支出傾向:</span>
          <span class="px-3 py-1 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-black text-xs md:text-sm rounded-full shadow-sm">
            ${escapeHtml(profile_type || "固定費分析完了")}
          </span>
        </div>
        <p class="text-xs md:text-sm text-slate-700 font-medium leading-relaxed">
          ${escapeHtml(summary || "")}
        </p>
      </div>

      <!-- ★ 最優先アクション（ワンタップ意思決定） -->
      ${
        priority_action
          ? `
      <div class="bg-gradient-to-r from-emerald-500/10 via-teal-500/10 to-blue-500/10 border-2 border-emerald-400/80 rounded-2xl p-4 md:p-6 shadow-sm relative overflow-hidden">
        <div class="absolute top-0 right-0 bg-emerald-500 text-white text-[10px] md:text-xs font-black px-3 py-1 rounded-bl-xl tracking-wider">
          ★ 最優先タスク
        </div>
        <div class="flex items-center gap-2 mb-2">
          <span class="text-lg">🎯</span>
          <h3 class="text-base md:text-lg font-black text-slate-900">
            ${escapeHtml(priority_action.title || "")}
          </h3>
        </div>
        ${
          savingAmount
            ? `
          <div class="inline-flex items-baseline gap-1 my-1 px-3 py-1 bg-emerald-100 text-emerald-800 rounded-lg text-xs md:text-sm font-black">
            <span>年間で約</span>
            <span class="text-base md:text-lg font-extrabold text-emerald-700">${savingAmount}円</span>
            <span>節約可能</span>
          </div>
        `
            : ""
        }
        <p class="text-xs md:text-sm text-slate-600 font-medium mt-2 leading-relaxed">
          ${escapeHtml(priority_action.reason || "")}
        </p>
      </div>
      `
          : ""
      }

      <!-- 重複警告 & プラン最適化の2カラム (PC時) -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        ${duplicateHtml}
        ${planHtml}
      </div>

      <!-- 資産形成・再投資インパクト -->
      ${
        investment_impact
          ? `
      <div class="bg-gradient-to-r from-purple-50 via-indigo-50 to-blue-50 border border-purple-200/70 rounded-2xl p-4 md:p-5">
        <div class="flex items-center gap-2 mb-2">
          <span class="text-base">📈</span>
          <h3 class="text-sm md:text-base font-black text-indigo-950">削減資金の再投資インパクト</h3>
        </div>
        <p class="text-xs md:text-sm text-indigo-900 leading-relaxed font-medium">
          ${escapeHtml(investment_impact)}
        </p>
      </div>
      `
          : ""
      }
    </div>
  `;
}

function renderError(container, message) {
  container.innerHTML = `
    <div class="bg-red-50 border border-red-200 rounded-2xl p-5 text-center">
      <span class="text-2xl mb-1 block">⚠️</span>
      <p class="text-sm font-bold text-red-800 mb-1">AI診断を取得できませんでした</p>
      <p class="text-xs text-red-600 mb-4">${escapeHtml(message || "通信エラーが発生しました")}</p>
      <button
        onclick="window.retryAIAdvisor()"
        class="px-4 py-2 bg-red-600 text-white font-bold text-xs rounded-xl shadow hover:bg-red-700 transition-colors"
      >
        もう一度試す
      </button>
    </div>
  `;

  window.retryAIAdvisor = () => {
    triggerAnalysis(true);
  };
}

function escapeHtml(str) {
  if (!str) return "";
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}
