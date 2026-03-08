// custom-modal.js

let editingSubId = null; // 編集中のID
let app = {}; // app.js から渡される「データ操作用リモコン」を入れる箱

export function initCustomModal(callbacks) {
  app = callbacks; // リモコンを受け取る

  const customModal = document.getElementById("custom-modal");
  const btnOpenCustomModal = document.getElementById("btn-open-custom-modal");
  const btnCloseModal = document.querySelectorAll(".close-modal-btn");
  const btnSaveCustom = document.getElementById("btn-save-custom");
  const customPlanType = document.getElementById("custom-plan-type");
  const customCycleContainer = document.getElementById(
    "custom-cycle-container",
  );
  const customCycleNum = document.getElementById("custom-cycle-num");
  const customCycleUnit = document.getElementById("custom-cycle-unit");
  const searchInput = document.getElementById("search-input");

  // モーダルを開く
  window.openModal = () => {
    editingSubId = null;
    document.getElementById("btn-save-custom").textContent = "追加する";
    document.getElementById("custom-name").value = "";
    document.getElementById("custom-price").value = "";
    document.getElementById("custom-error-msg").classList.add("hidden");
    if (customCycleContainer) customCycleContainer.classList.add("hidden");
    customPlanType.value = "monthly";

    customModal.classList.remove("hidden");
    customModal.classList.add("flex");
    document.body.style.overflow = "hidden";
  };

  // モーダルを閉じる
  window.closeModal = () => {
    editingSubId = null;
    customModal.classList.add("hidden");
    customModal.classList.remove("flex");
    document.body.style.overflow = "";
  };

  // イベントリスナーの登録
  if (btnOpenCustomModal)
    btnOpenCustomModal.addEventListener("click", window.openModal);
  btnCloseModal.forEach((btn) =>
    btn.addEventListener("click", window.closeModal),
  );

  const modalOverlay = document.querySelector(".modal-overlay");
  if (modalOverlay) modalOverlay.addEventListener("click", window.closeModal);

  const btnEmptyAddCustom = document.getElementById("btn-empty-add-custom");
  if (btnEmptyAddCustom)
    btnEmptyAddCustom.addEventListener("click", window.openModal);
  // 保存（追加・更新）ボタンを押した時
  btnSaveCustom.addEventListener("click", () => {
    const name = document.getElementById("custom-name").value.trim();
    const price = document.getElementById("custom-price").value;
    const planType = customPlanType.value;
    const errorMsg = document.getElementById("custom-error-msg");

    if (!name || !price) {
      errorMsg.classList.remove("hidden");
      return;
    } else {
      errorMsg.classList.add("hidden");
    }

    let cycle = 1;
    if (planType === "monthly") {
      cycle = 1;
    } else if (planType === "yearly") {
      cycle = 12;
    } else if (planType === "custom") {
      const num = parseInt(customCycleNum.value, 10);
      const unit = customCycleUnit.value;
      if (unit === "weeks") cycle = num / 4.345;
      else if (unit === "months") cycle = num;
      else if (unit === "years") cycle = num * 12;
    }

    // app.js から最新のデータを取得
    let customSubs = app.getCustomSubs();
    let savedState = app.getSavedState();

    if (editingSubId) {
      const index = customSubs.findIndex((s) => s.id === editingSubId);
      if (index !== -1) {
        customSubs[index] = {
          ...customSubs[index],
          name,
          price,
          planType,
          cycle,
        };
      }
      editingSubId = null;
    } else {
      const newId = "c_" + Date.now();
      customSubs.push({ id: newId, name, price, planType, cycle });
      savedState[newId] = { checked: true, plan: planType };
    }

    // app.js にデータを返して、保存・再計算・再描画をお願いする
    app.setCustomSubs(customSubs);
    app.onUpdate();

    if (searchInput && searchInput.value !== "") {
      searchInput.value = "";
      searchInput.dispatchEvent(new Event("input"));
    }
    closeModal();
  });

  // 数字の選択肢を生成する関数
  function updateCycleNumOptions() {
    const unit = customCycleUnit.value;
    let max = 24;
    if (unit === "weeks") max = 12;
    if (unit === "years") max = 10;
    let html = "";
    for (let i = 1; i <= max; i++) {
      html += `<option value="${i}">${i}</option>`;
    }
    customCycleNum.innerHTML = html;
  }

  updateCycleNumOptions();
  customCycleUnit.addEventListener("change", updateCycleNumOptions);

  customPlanType.addEventListener("change", () => {
    if (customPlanType.value === "custom") {
      customCycleContainer.classList.remove("hidden");
    } else {
      customCycleContainer.classList.add("hidden");
    }
  });

  window.toggleEditMenu = function (id) {
    const menu = document.getElementById(`edit-menu-${id}`);
    const allMenus = document.querySelectorAll('[id^="edit-menu-"]');
    allMenus.forEach(
      (m) => m.id !== `edit-menu-${id}` && m.classList.add("hidden"),
    );
    if (menu) menu.classList.toggle("hidden");
  };

  window.editCustomSub = function (id) {
    let customSubs = app.getCustomSubs();
    const sub = customSubs.find((s) => s.id === id);
    if (!sub) return;

    editingSubId = id;
    document.getElementById("custom-name").value = sub.name;
    document.getElementById("custom-price").value = sub.price;
    customPlanType.value = sub.planType;

    if (sub.planType === "custom" && sub.cycle) {
      customCycleContainer.classList.remove("hidden");
      if (sub.cycle < 1) {
        customCycleUnit.value = "weeks";
        updateCycleNumOptions();
        customCycleNum.value = Math.round(sub.cycle * 4.345);
      } else if (sub.cycle >= 12 && sub.cycle % 12 === 0) {
        customCycleUnit.value = "years";
        updateCycleNumOptions();
        customCycleNum.value = sub.cycle / 12;
      } else {
        customCycleUnit.value = "months";
        updateCycleNumOptions();
        customCycleNum.value = Math.round(sub.cycle);
      }
    } else {
      customCycleContainer.classList.add("hidden");
    }

    document.getElementById("btn-save-custom").textContent = "更新する";
    customModal.classList.remove("hidden");
    customModal.classList.add("flex");
    document.body.style.overflow = "hidden";

    const editMenu = document.getElementById(`edit-menu-${id}`);
    if (editMenu) editMenu.classList.add("hidden");
  };

  window.deleteCustomSub = function (id) {
    let customSubs = app.getCustomSubs();
    let savedState = app.getSavedState();

    customSubs = customSubs.filter((sub) => sub.id !== id);
    if (savedState[id]) delete savedState[id];

    app.setCustomSubs(customSubs);
    app.onUpdate();

    window.showToast("delete-toast");
  };
}
