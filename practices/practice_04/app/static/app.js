// VkusMart Web Client & MCP Live Runner

let state = {
  products: [],
  themes: [],
  cart: {}, // { "prod-1": 2, ... }
  cartCalculation: null
};

// Пресеты для быстрой демонстрации ревьюверу
const MCP_PRESETS = {
  vv_search_grechka: {
    tool: "vkusvill_products_search",
    args: { "q": "гречка", "limit": 5 }
  },
  vv_recipes_syrniki: {
    tool: "vkusvill_recipes",
    args: { "q": "сырники" }
  },
  vv_discount_search: {
    tool: "vkusvill_products_discount",
    args: { "q": "молоко", "limit": 5 }
  },
  vv_error_empty: {
    tool: "vkusvill_products_search",
    args: { "q": "" }
  },
  success_theme: {
    tool: "get_theme_bundles",
    args: { "theme_id": "theme-student", "max_budget": 500 }
  }
};

document.addEventListener("DOMContentLoaded", () => {
  initTabs();
  initMCPConsole();
  loadCatalogData();
  setupEventListeners();
});

function initTabs() {
  const tabs = document.querySelectorAll(".tab-btn");
  tabs.forEach(btn => {
    btn.addEventListener("click", () => {
      tabs.forEach(b => b.classList.remove("active"));
      document.querySelectorAll(".tab-pane").forEach(p => p.classList.remove("active"));
      btn.classList.add("active");
      const targetId = btn.getAttribute("data-tab");
      const targetPane = document.getElementById(targetId);
      if (targetPane) targetPane.classList.add("active");
    });
  });

  const cartBtn = document.getElementById("cartBtn");
  if (cartBtn) {
    cartBtn.addEventListener("click", () => {
      document.querySelector('[data-tab="cartTab"]')?.click();
    });
  }
}

async function loadCatalogData() {
  try {
    const res = await fetch("/api/catalog");
    const data = await res.json();
    state.products = data.products || [];
    state.themes = data.themes || [];
    renderThemes();
    renderProducts(state.products);
  } catch (err) {
    console.error("Ошибка загрузки каталога:", err);
  }
}

function renderThemes() {
  const container = document.getElementById("themesGrid");
  if (!container) return;

  const allergenFilter = document.getElementById("themeAllergenFilter")?.value || "";

  let filteredThemes = state.themes;
  container.innerHTML = "";

  state.themes.forEach(theme => {
    // Получаем товары темы
    let themeProds = theme.product_ids
      .map(id => state.products.find(p => p.id === id))
      .filter(Boolean);

    if (allergenFilter) {
      themeProds = themeProds.filter(p => !p.allergens.includes(allergenFilter));
    }

    const price = themeProds.reduce((sum, p) => sum + p.price, 0);
    const calories = themeProds.reduce((sum, p) => sum + p.calories, 0);

    const card = document.createElement("div");
    card.className = "theme-card";
    card.innerHTML = `
      <div>
        <div class="theme-card-top">
          <span class="theme-icon">${theme.icon}</span>
          <div>
            <h3 class="theme-title">${theme.title}</h3>
            <p class="theme-desc">${theme.description}</p>
          </div>
        </div>
        <div class="theme-products-preview">
          ${themeProds.map(p => `
            <div class="preview-item">
              <span>${p.name}</span>
              <strong>${p.price} ₽</strong>
            </div>
          `).join("")}
        </div>
      </div>
      <div>
        <div class="theme-card-bottom">
          <div class="theme-price-info">
            <span class="theme-price">${price.toFixed(0)} ₽</span>
            <span class="theme-cals">${calories} ккал • ${themeProds.length} поз.</span>
          </div>
          <button class="btn btn-primary add-bundle-btn" data-theme-id="${theme.id}">+ В корзину</button>
        </div>
      </div>
    `;

    card.querySelector(".add-bundle-btn")?.addEventListener("click", () => {
      themeProds.forEach(p => addToCart(p.id, 1));
      showToast(`Набор «${theme.title}» добавлен в корзину!`);
    });

    container.appendChild(card);
  });
}

function renderProducts(products) {
  const container = document.getElementById("productsGrid");
  const countText = document.getElementById("productsCountText");
  if (!container) return;

  if (countText) countText.textContent = `Найдено: ${products.length} товаров`;
  container.innerHTML = "";

  if (products.length === 0) {
    container.innerHTML = `<div class="empty-state" style="grid-column: 1/-1;">Ничего не найдено. Попробуйте ослабить фильтры.</div>`;
    return;
  }

  products.forEach(p => {
    const card = document.createElement("div");
    card.className = "product-card";
    card.innerHTML = `
      <div>
        <div class="product-header">
          <h4 class="product-name">${p.name}</h4>
          <div class="product-meta">${p.weight} • ${p.calories} ккал</div>
        </div>
        <p style="font-size: 13px; color: var(--text-muted);">${p.description}</p>
        <div class="product-tags">
          ${p.tags.map(t => `<span class="tag">#${t}</span>`).join("")}
          ${p.allergens.map(a => `<span class="tag tag-allergen">⚠️ ${a}</span>`).join("")}
        </div>
      </div>
      <div class="product-bottom">
        <span class="product-price">${p.price} ₽</span>
        <button class="btn btn-secondary add-prod-btn" data-id="${p.id}">+ Купить</button>
      </div>
    `;

    card.querySelector(".add-prod-btn")?.addEventListener("click", () => {
      addToCart(p.id, 1);
      showToast(`«${p.name}» добавлен в корзину`);
    });

    container.appendChild(card);
  });
}

function setupEventListeners() {
  document.getElementById("themeAllergenFilter")?.addEventListener("change", () => {
    renderThemes();
  });

  document.getElementById("applyFiltersBtn")?.addEventListener("click", async () => {
    const q = document.getElementById("searchInput")?.value.trim() || undefined;
    const cat = document.getElementById("categoryFilter")?.value || undefined;
    const maxP = parseFloat(document.getElementById("maxPriceInput")?.value) || undefined;
    const checkedAllergens = Array.from(document.querySelectorAll('input[name="catalogAllergen"]:checked')).map(cb => cb.value);

    try {
      const res = await fetch("/api/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: jsonClean({
          query: q,
          category: cat,
          max_price: maxP,
          exclude_allergens: checkedAllergens.length > 0 ? checkedAllergens : undefined
        })
      });
      const data = await res.json();
      if (res.ok) {
        renderProducts(data.products || []);
      } else {
        alert("Ошибка поиска: " + (data.message || "Неверные параметры"));
      }
    } catch (e) {
      console.error(e);
    }
  });

  document.getElementById("resetFiltersBtn")?.addEventListener("click", () => {
    document.getElementById("searchInput").value = "";
    document.getElementById("categoryFilter").value = "";
    document.getElementById("maxPriceInput").value = "";
    document.querySelectorAll('input[name="catalogAllergen"]').forEach(cb => cb.checked = false);
    renderProducts(state.products);
  });

  document.getElementById("clearCartBtn")?.addEventListener("click", () => {
    state.cart = {};
    updateCartUI();
  });
}

function addToCart(productId, qty = 1) {
  state.cart[productId] = (state.cart[productId] || 0) + qty;
  updateCartUI();
}

function removeFromCart(productId, qty = 1) {
  if (state.cart[productId]) {
    state.cart[productId] -= qty;
    if (state.cart[productId] <= 0) {
      delete state.cart[productId];
    }
  }
  updateCartUI();
}

async function updateCartUI() {
  const items = Object.entries(state.cart).map(([pid, qty]) => ({ product_id: pid, quantity: qty }));
  const totalCount = items.reduce((s, i) => s + i.quantity, 0);

  const badge = document.getElementById("cartCountBadge");
  if (badge) badge.textContent = totalCount;

  const emptyState = document.getElementById("cartEmptyState");
  const itemsList = document.getElementById("cartItemsList");

  if (totalCount === 0) {
    if (emptyState) emptyState.classList.remove("hidden");
    if (itemsList) itemsList.innerHTML = "";
    updateSummaryUI(null);
    return;
  }

  if (emptyState) emptyState.classList.add("hidden");

  try {
    const res = await fetch("/api/cart/calculate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ items })
    });
    const data = await res.json();
    if (res.ok && data.cart) {
      state.cartCalculation = data.cart;
      renderCartList(data.cart.items_detail);
      updateSummaryUI(data.cart);
    }
  } catch (e) {
    console.error("Cart calculate error:", e);
  }
}

function renderCartList(details) {
  const container = document.getElementById("cartItemsList");
  if (!container) return;
  container.innerHTML = "";

  details.forEach(item => {
    const row = document.createElement("div");
    row.className = "cart-item-row";
    row.innerHTML = `
      <div class="cart-item-info">
        <h4>${item.name}</h4>
        <span>${item.price} ₽/шт • ${item.calories} ккал</span>
      </div>
      <div class="cart-item-actions">
        <strong style="color: var(--primary); font-size: 15px;">${item.line_price} ₽</strong>
        <div class="qty-control">
          <button class="qty-btn dec-btn" data-id="${item.product_id}">-</button>
          <span class="qty-val">${item.quantity}</span>
          <button class="qty-btn inc-btn" data-id="${item.product_id}">+</button>
        </div>
      </div>
    `;

    row.querySelector(".dec-btn")?.addEventListener("click", () => removeFromCart(item.product_id, 1));
    row.querySelector(".inc-btn")?.addEventListener("click", () => addToCart(item.product_id, 1));

    container.appendChild(row);
  });
}

function updateSummaryUI(cart) {
  if (!cart) {
    document.getElementById("summaryCount").textContent = "0 шт";
    document.getElementById("summarySubtotal").textContent = "0.00 ₽";
    document.getElementById("summaryFinalPrice").textContent = "0.00 ₽";
    document.getElementById("summaryCalories").textContent = "0";
    document.getElementById("summaryProtein").textContent = "0.0 г";
    document.getElementById("summaryFat").textContent = "0.0 г";
    document.getElementById("summaryCarbs").textContent = "0.0 г";
    document.getElementById("discountRow")?.classList.add("hidden");
    document.getElementById("barProtein").style.width = "0%";
    document.getElementById("barFat").style.width = "0%";
    document.getElementById("barCarbs").style.width = "0%";
    document.getElementById("cartAllergensList").textContent = "нет";
    return;
  }

  document.getElementById("summaryCount").textContent = `${cart.total_items} шт`;
  document.getElementById("summarySubtotal").textContent = `${cart.subtotal.toFixed(2)} ₽`;
  document.getElementById("summaryFinalPrice").textContent = `${cart.final_price.toFixed(2)} ₽`;
  document.getElementById("summaryCalories").textContent = cart.total_calories;
  document.getElementById("summaryProtein").textContent = `${cart.protein} г`;
  document.getElementById("summaryFat").textContent = `${cart.fat} г`;
  document.getElementById("summaryCarbs").textContent = `${cart.carbs} г`;

  const discountRow = document.getElementById("discountRow");
  if (cart.discount_rub > 0) {
    discountRow?.classList.remove("hidden");
    document.getElementById("summaryDiscount").textContent = `-${cart.discount_rub.toFixed(2)} ₽ (${cart.discount_percent}%)`;
  } else {
    discountRow?.classList.add("hidden");
  }

  const macroSum = (cart.protein * 4) + (cart.fat * 9) + (cart.carbs * 4);
  if (macroSum > 0) {
    document.getElementById("barProtein").style.width = `${((cart.protein * 4) / macroSum * 100).toFixed(0)}%`;
    document.getElementById("barFat").style.width = `${((cart.fat * 9) / macroSum * 100).toFixed(0)}%`;
    document.getElementById("barCarbs").style.width = `${((cart.carbs * 4) / macroSum * 100).toFixed(0)}%`;
  }

  const allgNotice = document.getElementById("cartAllergensList");
  if (allgNotice) {
    allgNotice.textContent = cart.allergens.length > 0 ? cart.allergens.join(", ") : "нет (гипоаллергенно)";
  }
}

// MCP Live Console logic
function initMCPConsole() {
  const toolSelect = document.getElementById("mcpToolSelect");
  const argsInput = document.getElementById("mcpArgsInput");
  const execBtn = document.getElementById("mcpExecuteBtn");
  const outputPre = document.getElementById("mcpOutputPre");
  const statusBadge = document.getElementById("mcpStatusBadge");

  // Пресеты
  document.querySelectorAll(".preset-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      const pKey = btn.getAttribute("data-preset");
      const preset = MCP_PRESETS[pKey];
      if (preset) {
        toolSelect.value = preset.tool;
        argsInput.value = JSON.stringify(preset.args, null, 2);
        execBtn.click();
      }
    });
  });

  execBtn?.addEventListener("click", async () => {
    const toolName = toolSelect.value;
    let args = {};
    try {
      args = JSON.parse(argsInput.value);
    } catch (e) {
      alert("Некорректный JSON в аргументах: " + e.message);
      return;
    }

    statusBadge.className = "status-badge badge-idle";
    statusBadge.textContent = "Выполняется...";
    outputPre.textContent = `[JSON-RPC Request]\nMethod: tools/call\nTool: ${toolName}\nParams: ${JSON.stringify(args, null, 2)}\n\nОтправка запроса на MCP сервер...`;

    try {
      const res = await fetch("/api/mcp/call", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: toolName, arguments: args })
      });
      const data = await res.json();
      const isErr = data.isError;

      statusBadge.className = isErr ? "status-badge badge-error" : "status-badge badge-success";
      statusBadge.textContent = isErr ? "Ошибка (Handled Error)" : "Успех (200 OK)";

      outputPre.textContent = JSON.stringify(data, null, 2);
    } catch (err) {
      statusBadge.className = "status-badge badge-error";
      statusBadge.textContent = "Сбой сети";
      outputPre.textContent = "Network Error: " + err.message;
    }
  });
}

function jsonClean(obj) {
  return JSON.stringify(obj, (k, v) => v === undefined ? null : v);
}

function showToast(msg) {
  const t = document.createElement("div");
  t.style.cssText = "position:fixed;bottom:20px;right:20px;background:#065f46;color:#fff;padding:12px 20px;border-radius:8px;font-size:14px;box-shadow:0 4px 12px rgba(0,0,0,0.15);z-index:9999;";
  t.textContent = msg;
  document.body.appendChild(t);
  setTimeout(() => t.remove(), 2500);
}
