(function () {
  function renderExpenseChart(data) {
    const entries = Object.entries(data || {});
    const total = entries.reduce(function (sum, entry) {
      return sum + (Number(entry[1]) || 0);
    }, 0);

    if (!entries.length || total <= 0) {
      return '<div class="empty-state">Xarajatlar mavjud emas.</div>';
    }

    const rows = entries.map(function (entry) {
      const label = entry[0];
      const value = Number(entry[1]) || 0;
      const share = total === 0 ? 0 : (value / total) * 100;
      return `
        <div class="chart-row">
          <div class="chart-label">${label}</div>
          <div class="chart-bar"><span class="chart-bar-fill" style="width: ${share}%"></span></div>
          <div class="chart-value">${window.BusinessCalcUtils.formatMoney(value, 'UZS')}</div>
        </div>
      `;
    }).join('');

    return `<div class="chart-wrap">${rows}</div>`;
  }

  window.BusinessCalcCharts = { renderExpenseChart };
}());
