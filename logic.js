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
  genreTotals["独自のサブスク"] = { monthly: 0, yearly: 0, icon: "✨" };

  // ① 既存のサブスクの集計（HTMLを見ず、保存データから計算する）
  Object.keys(savedState).forEach((subId) => {
    const state = savedState[subId];
    if (!state || !state.checked) return;

    const subData = subscriptions.find((s) => s.id === subId);
    if (!subData) return;

    let selectedPlan = state.plan || (subData.monthly ? "monthly" : "yearly");
    let mCost = 0,
      yCost = 0;

    if (selectedPlan === "monthly") {
      mCost = subData.monthly || 0;
      yCost = subData.yearly || mCost * 12;
    } else {
      yCost = subData.yearly || subData.monthly * 12;
      mCost = Math.round(yCost / 12);
    }

    totalMonthly += mCost;
    totalYearly += yCost;

    const catInfo = categories.find((c) => c.id === subData.categoryId);
    const catName = catInfo ? catInfo.name : "その他";
    if (genreTotals[catName]) {
      genreTotals[catName].monthly += mCost;
      genreTotals[catName].yearly += yCost;
    }
    selectedItems.push({
      name: subData.name,
      category: catName,
      monthly: mCost,
      yearly: yCost,
    });
  });

  // ② 独自のサブスクの集計
  customSubscriptions.forEach((sub) => {
    const state = savedState[sub.id];
    if (state && state.checked) {
      const price = parseInt(sub.price, 10);
      let mCost = 0,
        yCost = 0;

      if (sub.planType === "monthly") {
        mCost = price;
        yCost = mCost * 12;
      } else if (sub.planType === "yearly") {
        yCost = price;
        mCost = Math.round(yCost / 12);
      } else {
        const cycle = sub.cycle || 1;
        mCost = Math.round(price / cycle);
        yCost = Math.round(mCost * 12);
      }

      totalMonthly += mCost;
      totalYearly += yCost;
      genreTotals["独自のサブスク"].monthly += mCost;
      genreTotals["独自のサブスク"].yearly += yCost;
      selectedItems.push({
        name: sub.name,
        category: "独自のサブスク",
        monthly: mCost,
        yearly: yCost,
      });
    }
  });

  selectedItems.sort((a, b) => b.monthly - a.monthly);
  const top5 = selectedItems.slice(0, 5);
  return { totalMonthly, totalYearly, genreTotals, selectedItems, top5 };
}
