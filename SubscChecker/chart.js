// chart.js(グラフの描画と切り替えボタンの管理)

let resultChart = null;
let currentChartType = "sub";
let getLatestData = null; // app.jsから最新のデータを取得するための関数

// 1. 初期設定（ボタンのイベント登録と、データ取得関数の受け取り）
export function initChartControls(dataCallback) {
  getLatestData = dataCallback; // app.jsから渡された「データ取得用リモコン」を保存

  const btnGenre = document.getElementById("btn-chart-genre");
  const btnSub = document.getElementById("btn-chart-sub");

  if (btnGenre) {
    btnGenre.addEventListener("click", (e) => {
      currentChartType = "genre";
      updateButtonStyles(e.target, btnSub);
      const data = getLatestData();
      if (data) renderChart(data, currentChartType);
    });
  }

  if (btnSub) {
    btnSub.addEventListener("click", (e) => {
      currentChartType = "sub";
      updateButtonStyles(e.target, btnGenre);
      const data = getLatestData();
      if (data) renderChart(data, currentChartType);
    });
  }
}

// ボタンの見た目（白背景や影）を切り替えるお助け関数
function updateButtonStyles(activeBtn, inactiveBtn) {
  activeBtn.classList.replace("text-slate-500", "text-slate-800");
  activeBtn.classList.replace("hover:text-slate-700", "shadow-sm");
  activeBtn.classList.add("bg-white");

  if (inactiveBtn) {
    inactiveBtn.classList.replace("text-slate-800", "text-slate-500");
    inactiveBtn.classList.replace("shadow-sm", "hover:text-slate-700");
    inactiveBtn.classList.remove("bg-white");
  }
}

// 2. グラフを描画する関数
export function renderChart(data, type = currentChartType) {
  currentChartType = type; // 外部（app.js）から直接呼ばれた時のために更新しておく
  const ctx = document.getElementById("resultChart").getContext("2d");
  let labels = [];
  let chartData = [];
  let bgColors = [
    "#3b82f6",
    "#ef4444",
    "#10b981",
    "#f59e0b",
    "#8b5cf6",
    "#ec4899",
    "#14b8a6",
    "#f97316",
    "#6366f1",
    "#84cc16",
  ];

  if (type === "genre") {
    const validGenres = Object.keys(data.genreTotals).filter(
      (g) => data.genreTotals[g].monthly > 0,
    );
    validGenres.sort(
      (a, b) => data.genreTotals[b].monthly - data.genreTotals[a].monthly,
    );
    validGenres.forEach((genre) => {
      labels.push(genre);
      chartData.push(data.genreTotals[genre].monthly);
    });
  } else {
    data.selectedItems.forEach((item, index) => {
      if (index < 10) {
        labels.push(item.name);
        chartData.push(item.monthly);
      } else if (index === 10) {
        labels.push("その他まとめ");
        chartData.push(item.monthly);
      } else {
        chartData[10] += item.monthly;
      }
    });
  }

  if (chartData.length === 0) {
    labels = ["選択なし"];
    chartData = [1];
    bgColors = ["#f1f5f9"];
  }

  if (resultChart) resultChart.destroy();
  resultChart = new Chart(ctx, {
    type: "pie",
    data: {
      labels: labels,
      datasets: [
        {
          data: chartData,
          backgroundColor: bgColors,
          borderWidth: 2,
          borderColor: "#ffffff",
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: true,
      plugins: {
        legend: { position: "bottom" },
        datalabels: { display: false },
        tooltip: {
          enabled: true,
          callbacks: {
            label: function (context) {
              const value = context.raw;
              const sum = context.dataset.data.reduce((a, b) => a + b, 0);
              const percentage = ((value * 100) / sum).toFixed(1) + "%";
              return ` ${value.toLocaleString()}円 (${percentage})`;
            },
          },
        },
      },
    },
  });
}
// グラフをリセット（消去）する関数
export function clearChart() {
  if (resultChart) {
    resultChart.destroy();
    resultChart = null;
  }
}
