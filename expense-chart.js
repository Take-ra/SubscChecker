// expense-chart.js(支出内訳グラフの描画と切り替えボタンの管理)

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
  const canvas = document.getElementById("resultChart");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
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
    "#64748b",
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

  const isEmpty = chartData.length === 0;
  if (isEmpty) {
    labels = ["選択なし"];
    chartData = [1];
    bgColors = ["#f1f5f9"];
  }

  if (resultChart) resultChart.destroy();

  const totalSum = chartData.reduce((a, b) => a + b, 0);

  // スライス上にパーセンテージを描画するプラグイン（データセット直後に描画することで、吹き出しが上に重なり自然に隠れる）
  const slicePercentagePlugin = {
    id: "slicePercentagePlugin",
    afterDatasetDraw(chart) {
      if (isEmpty || totalSum <= 0) return;
      const { ctx } = chart;
      const meta = chart.getDatasetMeta(0);
      if (!meta || !meta.data) return;

      const dataset = chart.data.datasets[0];
      const sum = dataset.data.reduce((a, b) => a + b, 0);
      if (sum === 0) return;

      ctx.save();
      ctx.font = "bold 11px system-ui, -apple-system, sans-serif";
      ctx.fillStyle = "#ffffff";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";

      meta.data.forEach((element, index) => {
        const value = dataset.data[index] || 0;
        const pct = (value / sum) * 100;

        // 6%以上の面積があるスライスにパーセントを描画
        if (pct >= 6.0) {
          const pos = element.getCenterPoint();
          const text = `${pct.toFixed(1)}%`;

          ctx.shadowColor = "rgba(0, 0, 0, 0.6)";
          ctx.shadowBlur = 4;
          ctx.shadowOffsetX = 0;
          ctx.shadowOffsetY = 1;

          ctx.fillText(text, pos.x, pos.y);
        }
      });
      ctx.restore();
    },
  };

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
    plugins: [slicePercentagePlugin],
    options: {
      responsive: true,
      maintainAspectRatio: true,
      plugins: {
        legend: {
          position: "bottom",
          labels: {
            padding: 10,
            usePointStyle: true,
            pointStyle: "circle",
            generateLabels: function (chart) {
              const originalLabels =
                Chart.overrides?.pie?.plugins?.legend?.labels?.generateLabels?.(chart) ||
                Chart.defaults?.plugins?.legend?.labels?.generateLabels?.(chart) ||
                [];

              if (isEmpty || totalSum <= 0) return originalLabels;

              const dataset = chart.data.datasets[0];
              return originalLabels.map((item, i) => {
                const val = dataset.data[i] || 0;
                const pct = ((val / totalSum) * 100).toFixed(1);
                return {
                  ...item,
                  text: `${item.text} (${pct}%)`,
                };
              });
            },
          },
        },
        tooltip: {
          enabled: !isEmpty,
          backgroundColor: "#0f172a", // 100%完全不透明なソリッド背景（下の白文字を完全に覆う）
          borderColor: "rgba(255, 255, 255, 0.15)",
          borderWidth: 1,
          padding: 10,
          cornerRadius: 12,
          caretPadding: 8,
          caretSize: 6,
          boxPadding: 4,
          titleFont: { weight: "bold", size: 12 },
          bodyFont: { weight: "bold", size: 12 },
          callbacks: {
            label: function (context) {
              const value = context.raw;
              const sum = context.dataset.data.reduce((a, b) => a + b, 0);
              const percentage = sum > 0 ? ((value * 100) / sum).toFixed(1) + "%" : "0.0%";
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
