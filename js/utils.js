(function () {
  const currencySymbols = {
    UZS: 'so‘m',
    USD: 'USD',
    EUR: 'EUR',
    GBP: 'GBP',
    RUB: 'RUB'
  };

  function parseNumber(value) {
    if (value === null || value === undefined || value === '') {
      return 0;
    }

    const cleaned = String(value).replace(/\s+/g, '').replace(',', '.');
    const number = Number(cleaned);
    return Number.isFinite(number) ? number : 0;
  }

  function formatNumber(value, maximumFractionDigits) {
    const safeValue = Number.isFinite(Number(value)) ? Number(value) : 0;
    const fraction = typeof maximumFractionDigits === 'number' ? maximumFractionDigits : 2;

    return new Intl.NumberFormat('uz-UZ', {
      maximumFractionDigits: fraction,
      minimumFractionDigits: 0
    }).format(safeValue);
  }

  function formatMoney(value, currency) {
    const safeCurrency = currency || 'UZS';
    const currentValue = Number.isFinite(Number(value)) ? Number(value) : 0;
    const formatted = formatNumber(currentValue, 2);
    return `${formatted} ${currencySymbols[safeCurrency] || safeCurrency}`;
  }

  function formatPercent(value) {
    const safeValue = Number.isFinite(Number(value)) ? Number(value) : 0;
    return `${formatNumber(safeValue, 2)}%`;
  }

  function formatDate(dateString) {
    const date = new Date(dateString);
    if (Number.isNaN(date.getTime())) {
      return '—';
    }

    return new Intl.DateTimeFormat('uz-UZ', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  }

  function escapeHtml(value) {
    return String(value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function safeClamp(value, min, max) {
    if (!Number.isFinite(value)) {
      return min;
    }
    return Math.min(Math.max(value, min), max);
  }

  window.BusinessCalcUtils = {
    parseNumber,
    formatNumber,
    formatMoney,
    formatPercent,
    formatDate,
    escapeHtml,
    safeClamp,
    currencySymbols
  };
}());
