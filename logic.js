// logic.js(データの読み込み、保存、計算など、裏方の処理)

export function loadDataFromStorage() {
  let state = {};
  let custom = [];
  try {
    const rawState = localStorage.getItem("subscriptionStateV4");
    if (rawState) state = JSON.parse(rawState);
    const rawCustom = localStorage.getItem("customSubscriptions");
    if (rawCustom) custom = JSON.parse(rawCustom);
  } catch (e) {
    console.error("Loading error:", e);
  }
  return { state, custom };
}

export function saveDataToStorage(state, custom) {
  localStorage.setItem("subscriptionStateV4", JSON.stringify(state));
  localStorage.setItem("customSubscriptions", JSON.stringify(custom));
}

export function calculateAggregation(
  savedState,
  customSubscriptions,
  categories,
  subscriptions,
) {
  // もし何らかの理由で categories が届いていなければエラーを防ぐ
  if (!categories || !subscriptions) {
    console.error("Logic Error: categories or subscriptions is undefined");
    return {
      totalMonthly: 0,
      totalYearly: 0,
      genreTotals: {},
      selectedItems: [],
      top5: [],
    };
  }

  let totalMonthly = 0;
  let totalYearly = 0;
  let selectedItems = [];
  let genreTotals = {};

  categories.forEach((cat) => {
    genreTotals[cat.name] = { monthly: 0, yearly: 0, icon: cat.icon };
  });
  genreTotals["独自のサブスク"] = {
    monthly: 0,
    yearly: 0,
    icon: `<svg class="w-full h-full" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path></svg>`,
  };

  // ① 既存のサブスクの集計（新スキーマ plans と legacyIds を完全サポート）
  const processedSubIds = new Set();

  Object.keys(savedState).forEach((subId) => {
    const state = savedState[subId];
    if (!state || !state.checked) return;

    // 新IDまたは旧IDでサブスクデータを検索
    const subData = subscriptions.find(
      (s) => s.id === subId || (s.legacyIds && s.legacyIds.includes(subId))
    );
    if (!subData || processedSubIds.has(subData.id)) return;
    processedSubIds.add(subData.id);

    // 選択中のプランを解決
    let plan = null;
    const requestedPlanId = state.planId || state.plan;

    if (Array.isArray(subData.plans) && subData.plans.length > 0) {
      plan =
        subData.plans.find((p) => p.id === requestedPlanId) ||
        subData.plans.find((p) => p.id === subData.defaultPlanId) ||
        subData.plans[0];
    }

    let mCost = 0;
    let yCost = 0;

    if (plan) {
      mCost = Number(plan.monthly) || 0;
      yCost = Number(plan.yearly) || mCost * 12;
    } else {
      // フォールバック（旧構造）
      if (requestedPlanId === "yearly") {
        yCost = Number(subData.yearly) || (Number(subData.monthly || 0) * 12);
        mCost = Math.round(yCost / 12);
      } else {
        mCost = Number(subData.monthly) || 0;
        yCost = Number(subData.yearly) || mCost * 12;
      }
    }

    totalMonthly += mCost;
    totalYearly += yCost;

    const catInfo = categories.find((c) => c.id === subData.categoryId);
    const catName = catInfo ? catInfo.name : "その他";
    if (genreTotals[catName]) {
      genreTotals[catName].monthly += mCost;
      genreTotals[catName].yearly += yCost;
    }

    const displayName = plan && plan.name && plan.name !== "月額プラン" && plan.name !== "月払い"
      ? `${subData.name} (${plan.name})`
      : subData.name;

    selectedItems.push({
      id: subData.id,
      name: subData.name,
      displayName,
      planId: plan ? plan.id : requestedPlanId,
      planName: plan ? plan.name : "",
      isYearly: plan ? !!plan.yearly : requestedPlanId === "yearly",
      category: catName,
      categoryId: subData.categoryId,
      monthly: mCost,
      yearly: yCost,
    });
  });

  // ② 独自のサブスクの集計
  customSubscriptions.forEach((sub) => {
    const state = savedState[sub.id];
    if (state && state.checked) {
      const price = parseInt(sub.price, 10) || 0;
      let mCost = 0,
        yCost = 0;

      if (sub.planType === "monthly") {
        mCost = price;
        yCost = mCost * 12;
      } else if (sub.planType === "yearly") {
        yCost = price;
        mCost = Math.round(yCost / 12);
      } else {
        const cycle = sub.cycle > 0 ? sub.cycle : 1;
        mCost = Math.round(price / cycle);
        yCost = Math.round(mCost * 12);
      }

      totalMonthly += mCost;
      totalYearly += yCost;
      genreTotals["独自のサブスク"].monthly += mCost;
      genreTotals["独自のサブスク"].yearly += yCost;
      selectedItems.push({
        id: sub.id,
        name: sub.name,
        category: "独自のサブスク",
        categoryId: "lifestyle",
        monthly: mCost,
        yearly: yCost,
      });
    }
  });

  selectedItems.sort((a, b) => b.monthly - a.monthly);
  const top5 = selectedItems.slice(0, 5);
  return { totalMonthly, totalYearly, genreTotals, selectedItems, top5 };
}
