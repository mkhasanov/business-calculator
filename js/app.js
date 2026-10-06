(function () {
  const { calculators, categoryGroups, defaultSettings } = window.BusinessCalcData;
  const { storage, STORAGE_KEYS } = window.BusinessCalcStorage;
  const { formatMoney, formatPercent, parseNumber, formatDate } = window.BusinessCalcUtils;
  const { calculateById } = window.BusinessCalcCalculators;
  const { addHistoryEntry, readHistory, removeEntry, clearHistory, exportCsv } = window.BusinessCalcHistory;
  const { renderExpenseChart } = window.BusinessCalcCharts;

  const state = {
    favorites: [],
    recent: [],
    settings: Object.assign({}, defaultSettings)
  };

  function getDefaultSettings() {
    return JSON.parse(JSON.stringify(defaultSettings));
  }

  function hydrateState() {
    state.favorites = storage.get(STORAGE_KEYS.favorites, []);
    state.recent = storage.get(STORAGE_KEYS.recent, []);
    state.settings = Object.assign(getDefaultSettings(), storage.get(STORAGE_KEYS.settings, {}));
    window.BusinessCalcData.defaultRates = Object.assign({}, state.settings.rates || window.BusinessCalcData.defaultRates);
    document.body.classList.toggle('dark-mode', state.settings.theme === 'dark');
  }

  function persistFavorites() {
    storage.set(STORAGE_KEYS.favorites, state.favorites);
  }

  function persistRecent() {
    storage.set(STORAGE_KEYS.recent, state.recent);
  }

  function persistSettings() {
    window.BusinessCalcData.defaultRates = Object.assign({}, state.settings.rates || window.BusinessCalcData.defaultRates);
    storage.set(STORAGE_KEYS.settings, state.settings);
  }

  function showToast(message) {
    const stack = document.getElementById('toastStack');
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.textContent = message;
    stack.appendChild(toast);
    window.setTimeout(function () {
      toast.remove();
    }, 2200);
  }

  function showConfirmModal(title, message, onConfirm) {
    const modalRoot = document.getElementById('modalRoot');
    modalRoot.innerHTML = `
      <div class="modal-backdrop">
        <div class="modal">
          <h3>${title}</h3>
          <p>${message}</p>
          <div class="confirm-actions">
            <button type="button" class="ghost-button" data-action="cancel-modal">Bekor qilish</button>
            <button type="button" class="danger-button" data-action="confirm-modal">Tasdiqlash</button>
          </div>
        </div>
      </div>
    `;

    const confirmButton = modalRoot.querySelector('[data-action="confirm-modal"]');
    confirmButton.addEventListener('click', function () {
      modalRoot.innerHTML = '';
      onConfirm();
    });

    modalRoot.querySelector('[data-action="cancel-modal"]').addEventListener('click', function () {
      modalRoot.innerHTML = '';
    });
  }

  function showView(targetView) {
    const views = ['dashboard', 'calculator', 'history', 'settings'];
    views.forEach(function (viewName) {
      const element = document.getElementById(`${viewName}-view`);
      if (element) {
        element.classList.toggle('hidden', viewName !== targetView);
        element.classList.toggle('active', viewName === targetView);
      }
    });

    const navButtons = document.querySelectorAll('.nav-item');
    navButtons.forEach(function (button) {
      button.classList.toggle('active', button.dataset.view === targetView);
    });

    const sidebar = document.getElementById('sidebar');
    if (sidebar) {
      sidebar.classList.remove('open');
    }
  }

  function addRecentCalculator(calculatorId) {
    const trimmed = state.recent.filter(function (id) {
      return id !== calculatorId;
    });
    trimmed.unshift(calculatorId);
    state.recent = trimmed.slice(0, 6);
    persistRecent();
  }

  function isFavorite(calculatorId) {
    return state.favorites.includes(calculatorId);
  }

  function toggleFavorite(calculatorId) {
    if (isFavorite(calculatorId)) {
      state.favorites = state.favorites.filter(function (id) {
        return id !== calculatorId;
      });
      showToast('Kalkulyator sevimlilardan olib tashlandi.');
    } else {
      state.favorites.push(calculatorId);
      showToast('Kalkulyator sevimlilarga qo‘shildi.');
    }

    persistFavorites();
    renderDashboard();
    renderSidebarFavorites();
    const active = document.getElementById('calculatorForm');
    if (active && active.dataset.calculatorId === calculatorId) {
      renderCalculator(calculatorId);
    }
  }

  function getCalculatorById(id) {
    return calculators.find(function (calculator) {
      return calculator.id === id;
    });
  }

  function renderSidebarFavorites() {
    const container = document.getElementById('sidebarFavorites');
    if (!container) {
      return;
    }

    const favoriteCalculators = state.favorites
      .map(getCalculatorById)
      .filter(Boolean)
      .slice(0, 5);

    if (!favoriteCalculators.length) {
      container.innerHTML = '<div class="empty-state">Sevimli kalkulyatorlar mavjud emas.</div>';
      return;
    }

    container.innerHTML = favoriteCalculators.map(function (calculator) {
      return `
        <div class="item-row">
          <span>${calculator.title}</span>
          <button type="button" data-action="open-calculator" data-calculator-id="${calculator.id}">Ochiq</button>
        </div>
      `;
    }).join('');
  }

  function buildStats() {
    const totalCalculators = calculators.length;
    const used = state.recent.length;
    const saved = readHistory().length;
    const favorites = state.favorites.length;

    return [
      { label: 'Jami kalkulyatorlar', value: totalCalculators },
      { label: 'Ishlatilgan kalkulyatorlar', value: used },
      { label: 'Saqlangan hisob-kitoblar', value: saved },
      { label: 'Sevimlilar', value: favorites }
    ];
  }

  function renderStats() {
    const container = document.getElementById('statsGrid');
    container.innerHTML = buildStats().map(function (stat) {
      return `
        <div class="stat-card">
          <div class="stat-label">${stat.label}</div>
          <div class="stat-value">${stat.value}</div>
        </div>
      `;
    }).join('');
  }

  function renderRecentList() {
    const container = document.getElementById('recentList');
    const recent = state.recent
      .map(getCalculatorById)
      .filter(Boolean);

    if (!recent.length) {
      container.innerHTML = '<div class="empty-state">Yaqin-yaqin ishlatilgan kalkulyatorlar yo‘q.</div>';
      return;
    }

    container.innerHTML = recent.map(function (calculator) {
      return `
        <div class="item-row">
          <div>
            <strong>${calculator.title}</strong>
            <small>${calculator.category}</small>
          </div>
          <button type="button" data-action="open-calculator" data-calculator-id="${calculator.id}">Ochiq</button>
        </div>
      `;
    }).join('');
  }

  function renderFavoriteList() {
    const container = document.getElementById('favoriteList');
    const favorites = state.favorites.map(getCalculatorById).filter(Boolean);

    if (!favorites.length) {
      container.innerHTML = '<div class="empty-state">Sevimli kalkulyatorlar yo‘q. Boshqaruv panelidagi yulduzchani bosing.</div>';
      return;
    }

    container.innerHTML = favorites.map(function (calculator) {
      return `
        <div class="item-row">
          <div>
            <strong>${calculator.title}</strong>
            <small>${calculator.category}</small>
          </div>
          <button type="button" data-action="open-calculator" data-calculator-id="${calculator.id}">Ochiq</button>
        </div>
      `;
    }).join('');
  }

  function renderDashboard() {
    const query = (document.getElementById('searchInput') || {}).value || '';
    const normalizedQuery = query.trim().toLowerCase();
    const filteredCategories = categoryGroups.map(function (group) {
      const matches = group.calculatorIds
        .map(getCalculatorById)
        .filter(Boolean)
        .filter(function (calculator) {
          if (!normalizedQuery) {
            return true;
          }
          const haystack = `${calculator.title} ${calculator.description} ${calculator.category}`.toLowerCase();
          return haystack.includes(normalizedQuery);
        });

      return { ...group, calculators: matches };
    }).filter(function (group) {
      return group.calculators.length > 0;
    });

    const categoryGrid = document.getElementById('categoryGrid');

    if (!filteredCategories.length) {
      categoryGrid.innerHTML = '<div class="empty-state">Hech qanday kalkulyator topilmadi. Qidiruv so‘zini o‘zgartirib ko‘ring.</div>';
    } else {
      categoryGrid.innerHTML = filteredCategories.map(function (group) {
        return `
          <div class="category-block">
            <h3 class="category-title">${group.title}</h3>
            <div class="category-card-grid">
              ${group.calculators.map(function (calculator) {
                const favorite = isFavorite(calculator.id) ? '★' : '☆';
                return `
                  <div class="calculator-card">
                    <div class="card-top">
                      <span class="badge">${calculator.category}</span>
                      <button type="button" class="favorite-toggle" data-action="toggle-favorite" data-calculator-id="${calculator.id}" aria-label="Sevimlilar">${favorite}</button>
                    </div>
                    <h4>${calculator.title}</h4>
                    <p>${calculator.description}</p>
                    <div class="card-actions">
                      <button type="button" class="card-btn" data-action="open-calculator" data-calculator-id="${calculator.id}">Ochiq</button>
                    </div>
                  </div>
                `;
              }).join('')}
            </div>
          </div>
        `;
      }).join('');
    }

    renderStats();
    renderRecentList();
    renderFavoriteList();
    renderSidebarFavorites();
  }

  function getInputMarkup(field) {
    if (field.type === 'select') {
      const options = (field.options || []).map(function (option) {
        const selected = option === field.value ? 'selected' : '';
        return `<option value="${option}" ${selected}>${option}</option>`;
      }).join('');

      return `
        <div class="form-field">
          <label for="${field.name}">${field.label}</label>
          <select id="${field.name}" name="${field.name}">${options}</select>
        </div>
      `;
    }

    const attributes = `id="${field.name}" name="${field.name}" type="number" step="${field.step || '0.01'}" value="${field.value || '0'}"`;
    return `
      <div class="form-field">
        <label for="${field.name}">${field.label}</label>
        <input ${attributes} />
      </div>
    `;
  }

  function renderCalculator(calculatorId) {
    const calculator = getCalculatorById(calculatorId);
    if (!calculator) {
      return;
    }

    const isFav = isFavorite(calculatorId);
    const resultsHtml = `
      <div class="result-card">
        <h4 class="result-heading">Natija</h4>
        <p class="result-value">Hisoblash uchun maydonlarni to‘ldiring.</p>
      </div>
    `;

    const fieldsHtml = calculator.fields.map(getInputMarkup).join('');

    document.getElementById('calculatorContent').innerHTML = `
      <div class="calculator-shell">
        <div class="calculator-header">
          <h3>${calculator.title}</h3>
          <button type="button" class="secondary-button" data-action="toggle-favorite" data-calculator-id="${calculator.id}">${isFav ? 'Sevimli' : 'Sevimlaga qo‘shish'}</button>
        </div>
        <p class="calculator-description">${calculator.description}</p>
        <form id="calculatorForm" data-calculator-id="${calculator.id}">
          <div class="field-grid">${fieldsHtml}</div>
          <div class="form-actions">
            <button class="primary-button" type="submit">Hisoblash</button>
            <button class="ghost-button" type="button" data-action="reset-calculator">Tozalash</button>
          </div>
        </form>
        <div id="calculatorResults">${resultsHtml}</div>
        <div class="formula-box">
          <h4>Formula</h4>
          <p>${calculator.formula}</p>
        </div>
        <div class="tips-box">
          <h4>Yordam</h4>
          <ul>${(calculator.hints || []).map(function (hint) {
            return `<li>${hint}</li>`;
          }).join('')}</ul>
        </div>
      </div>
    `;

    addRecentCalculator(calculatorId);
    renderDashboard();
  }

  function summarizeInputs(values) {
    return Object.keys(values)
      .map(function (key) {
        const label = key.replace(/([A-Z])/g, ' $1');
        return `${label}: ${values[key]}`;
      }).join('; ');
  }

  function renderResultCard(result, calculator) {
    const firstValue = result.rows && result.rows.length ? result.rows[0].value : result.summary || '—';
    const resultRows = (result.rows || []).map(function (row) {
      return `
        <div class="result-row">
          <span class="label">${row.label}</span>
          <span class="value">${row.value}</span>
        </div>
      `;
    }).join('');

    const chartHtml = result.chartData ? `<div class="meta-box"><h4>Har bir kategoriya ulushi</h4>${renderExpenseChart(result.chartData)}</div>` : '';

    return `
      <div class="result-card">
        <h4 class="result-heading">${result.estimate ? 'Taxminiy natija' : 'Natija'}</h4>
        <p class="result-value">${firstValue}</p>
        <div class="result-grid">${resultRows}</div>
        ${chartHtml}
      </div>
    `;
  }

  function handleCalculatorSubmit(event) {
    event.preventDefault();
    const form = event.target;
    const calculatorId = form.dataset.calculatorId;
    const calculator = getCalculatorById(calculatorId);
    if (!calculator) {
      return;
    }

    const formData = new FormData(form);
    const values = {};
    calculator.fields.forEach(function (field) {
      const rawValue = formData.get(field.name);
      values[field.name] = rawValue;
    });

    const result = calculateById(calculatorId, values);
    const resultsContainer = document.getElementById('calculatorResults');

    if (!result || !result.success) {
      resultsContainer.innerHTML = `
        <div class="result-card">
          <h4 class="result-heading">Xatolik</h4>
          <p class="result-value">${result ? result.message : 'Kiritilgan maʼlumotlar to‘g‘ri emas.'}</p>
        </div>
      `;
      showToast(result ? result.message : 'Xatolik yuz berdi.');
      return;
    }

    resultsContainer.innerHTML = renderResultCard(result, calculator);

    const mainResult = result.rows[0] ? result.rows[0].value : result.summary;
    addHistoryEntry(calculatorId, calculator.title, mainResult, summarizeInputs(values));
    renderSidebarFavorites();
    renderDashboard();
    showToast('Hisob-kitob saqlandi.');
  }

  function resetCalculator(calculatorId) {
    const calculator = getCalculatorById(calculatorId);
    if (!calculator) {
      return;
    }

    const form = document.getElementById('calculatorForm');
    if (form) {
      form.reset();
      const resultBox = document.getElementById('calculatorResults');
      resultBox.innerHTML = `
        <div class="result-card">
          <h4 class="result-heading">Natija</h4>
          <p class="result-value">Hisoblash uchun maydonlarni to‘ldiring.</p>
        </div>
      `;
    }

    showToast(`${calculator.title} tozalandi.`);
  }

  function renderSettings() {
    const settingsContent = document.getElementById('settingsContent');
    settingsContent.innerHTML = `
      <div class="settings-card">
        <h3>Sozlamalar</h3>
        <form id="settingsForm">
          <div class="settings-grid">
            <div class="settings-field">
              <label for="theme">Mavzu</label>
              <select id="theme" name="theme">
                <option value="light" ${state.settings.theme === 'light' ? 'selected' : ''}>Yorug‘</option>
                <option value="dark" ${state.settings.theme === 'dark' ? 'selected' : ''}>Tungi</option>
              </select>
            </div>
            <div class="settings-field">
              <label for="currency">Standart valyuta</label>
              <select id="currency" name="currency">
                ${['UZS', 'USD', 'EUR', 'GBP', 'RUB'].map(function (currency) {
                  return `<option value="${currency}" ${state.settings.currency === currency ? 'selected' : ''}>${currency}</option>`;
                }).join('')}
              </select>
            </div>
            <div class="settings-field">
              <label for="numberFormat">Raqam formati</label>
              <select id="numberFormat" name="numberFormat">
                <option value="space" ${state.settings.numberFormat === 'space' ? 'selected' : ''}>Bo‘shliq</option>
                <option value="comma" ${state.settings.numberFormat === 'comma' ? 'selected' : ''}>Vergul</option>
              </select>
            </div>
          </div>
          <div class="settings-card" style="margin-top:18px;">
            <h3>Valyuta kurslari</h3>
            <div class="settings-grid">
              ${Object.entries(state.settings.rates).map(function ([currency, value]) {
                return `
                  <div class="settings-field">
                    <label for="rate_${currency}">${currency}</label>
                    <input id="rate_${currency}" name="rate_${currency}" type="number" step="0.01" value="${value}" />
                  </div>
                `;
              }).join('')}
            </div>
          </div>
          <div class="form-actions">
            <button class="primary-button" type="submit">Saqlash</button>
            <button class="danger-button" type="button" id="resetDataButton">Ma’lumotlarni tiklash</button>
          </div>
        </form>
      </div>
    `;
  }

  function renderHistory() {
    const history = readHistory();
    const container = document.getElementById('historyContent');

    if (!history.length) {
      container.innerHTML = `
        <div class="empty-state">Tarixda hech qanday hisob-kitoblar mavjud emas.</div>
        <div class="form-actions">
          <button type="button" class="danger-button" data-action="clear-history">Tarixni tozalash</button>
        </div>
      `;
      return;
    }

    container.innerHTML = `
      <div class="form-actions" style="margin-bottom:16px;">
        <button type="button" class="danger-button" data-action="clear-history">Tarixni tozalash</button>
      </div>
      ${history.map(function (entry) {
        return `
          <div class="history-item">
            <div class="history-item-header">
              <div>
                <strong>${entry.calculatorName}</strong>
                <div class="history-meta">${formatDate(entry.createdAt)}</div>
              </div>
              <div class="history-meta">${entry.resultValue}</div>
            </div>
            <div class="history-meta">${entry.inputSummary || 'Maʼlumotlar yo‘q'}</div>
            <div class="history-actions">
              <button type="button" class="ghost-button" data-action="open-calculator" data-calculator-id="${entry.calculatorId}">Ko‘rish</button>
              <button type="button" class="danger-button" data-action="delete-history" data-history-id="${entry.id}">O‘chirish</button>
            </div>
          </div>
        `;
      }).join('')}
    `;
  }

  function handleSettingsSubmit(event) {
    event.preventDefault();
    const formData = new FormData(event.target);
    state.settings.theme = formData.get('theme') || 'light';
    state.settings.currency = formData.get('currency') || 'UZS';
    state.settings.numberFormat = formData.get('numberFormat') || 'space';
    state.settings.rates = Object.assign({}, state.settings.rates, Object.fromEntries(
      Object.entries(state.settings.rates).map(function ([currency]) {
        const rawValue = formData.get(`rate_${currency}`);
        return [currency, Number(rawValue) || 1];
      })
    ));

    window.BusinessCalcData.defaultRates = Object.assign({}, state.settings.rates);
    document.body.classList.toggle('dark-mode', state.settings.theme === 'dark');
    updateThemeToggleText();
    persistSettings();
    showToast('Sozlamalar saqlandi.');
    renderDashboard();
  }

  function updateThemeToggleText() {
    const button = document.getElementById('themeToggle');
    if (button) {
      button.textContent = state.settings.theme === 'dark' ? 'Yorug‘ rejim' : 'Tungi rejim';
    }
  }

  function loadApp() {
    hydrateState();
    bindEvents();
    updateThemeToggleText();
    renderSettings();
    renderDashboard();
    renderHistory();
    renderSidebarFavorites();
    showView('dashboard');
  }

  function bindEvents() {
    document.getElementById('themeToggle').addEventListener('click', function () {
      state.settings.theme = state.settings.theme === 'dark' ? 'light' : 'dark';
      document.body.classList.toggle('dark-mode', state.settings.theme === 'dark');
      updateThemeToggleText();
      persistSettings();
      renderSettings();
      renderDashboard();
    });

    document.getElementById('settingsButton').addEventListener('click', function () {
      renderSettings();
      showView('settings');
    });

    document.querySelectorAll('.nav-item').forEach(function (button) {
      button.addEventListener('click', function () {
        const view = button.dataset.view;
        if (view === 'dashboard') {
          showView('dashboard');
        }
        if (view === 'favorites') {
          showView('dashboard');
          document.getElementById('searchInput').focus();
        }
        if (view === 'history') {
          renderHistory();
          showView('history');
        }
        if (view === 'settings') {
          renderSettings();
          showView('settings');
        }
      });
    });

    document.getElementById('backToDashboard').addEventListener('click', function () {
      showView('dashboard');
    });

    document.getElementById('searchInput').addEventListener('input', renderDashboard);

    document.getElementById('sidebarToggle').addEventListener('click', function () {
      const sidebar = document.getElementById('sidebar');
      sidebar.classList.toggle('open');
    });

    document.getElementById('exportHistoryBtn').addEventListener('click', function () {
      const exported = exportCsv();
      if (exported) {
        showToast('CSV fayli yuklab olindi.');
      } else {
        showToast('Export qilinadigan tarix yo‘q.');
      }
    });

    document.addEventListener('click', function (event) {
      const actionTarget = event.target.closest('[data-action]');
      if (!actionTarget) {
        return;
      }

      const action = actionTarget.dataset.action;
      const calculatorId = actionTarget.dataset.calculatorId;
      const historyId = actionTarget.dataset.historyId;

      if (action === 'open-calculator' && calculatorId) {
        openCalculator(calculatorId);
      }

      if (action === 'toggle-favorite' && calculatorId) {
        toggleFavorite(calculatorId);
      }

      if (action === 'delete-history' && historyId) {
        removeEntry(historyId);
        renderHistory();
        renderDashboard();
        showToast('Tarix yozuvi o‘chirildi.');
      }

      if (action === 'clear-history') {
        showConfirmModal('Tarixni tozalash', 'Barcha hisob-kitoblar tarixini tozalashni xohlaysizmi?', function () {
          clearHistory();
          renderHistory();
          renderDashboard();
          showToast('Tarix tozalandi.');
        });
      }

      if (action === 'reset-calculator') {
        resetCalculator(document.getElementById('calculatorForm').dataset.calculatorId);
      }
    });

    document.addEventListener('submit', function (event) {
      if (event.target.id === 'calculatorForm') {
        handleCalculatorSubmit(event);
      }

      if (event.target.id === 'settingsForm') {
        handleSettingsSubmit(event);
      }
    });

    document.addEventListener('click', function (event) {
      const target = event.target.closest('#resetDataButton');
      if (!target) {
        return;
      }

      storage.reset();
      state.favorites = [];
      state.recent = [];
      state.settings = getDefaultSettings();
      window.BusinessCalcData.defaultRates = Object.assign({}, state.settings.rates);
      document.body.classList.toggle('dark-mode', state.settings.theme === 'dark');
      updateThemeToggleText();
      renderDashboard();
      renderSettings();
      renderHistory();
      renderSidebarFavorites();
      showToast('Maʼlumotlar tiklandi.');
    });
  }

  function openCalculator(calculatorId) {
    renderCalculator(calculatorId);
    showView('calculator');
  }

  loadApp();
}());
