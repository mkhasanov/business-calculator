(function () {
  const { storage, STORAGE_KEYS } = window.BusinessCalcStorage;

  function readHistory() {
    return storage.get(STORAGE_KEYS.history, []);
  }

  function saveHistory(history) {
    storage.set(STORAGE_KEYS.history, history);
  }

  function addHistoryEntry(calculatorId, calculatorName, resultValue, inputSummary) {
    const history = readHistory();
    const entry = {
      id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
      calculatorId: calculatorId,
      calculatorName: calculatorName,
      resultValue: resultValue,
      inputSummary: inputSummary,
      createdAt: new Date().toISOString()
    };

    history.unshift(entry);
    saveHistory(history.slice(0, 50));
    return entry;
  }

  function removeEntry(id) {
    const history = readHistory().filter(function (entry) {
      return entry.id !== id;
    });
    saveHistory(history);
  }

  function clearHistory() {
    saveHistory([]);
  }

  function exportCsv() {
    const history = readHistory();
    if (!history.length) {
      return false;
    }

    const rows = [
      ['Kalkulyator', 'Sana', 'Natija', 'Maʼlumotlar']
    ];

    history.forEach(function (entry) {
      rows.push([
        entry.calculatorName,
        new Date(entry.createdAt).toLocaleString('uz-UZ'),
        entry.resultValue,
        entry.inputSummary || ''
      ]);
    });

    const csv = rows.map(function (row) {
      return row.map(function (cell) {
        const value = String(cell ?? '').replace(/"/g, '""');
        return `"${value}"`;
      }).join(',');
    }).join('\n');

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'biznes-kalkulyatorlari-tarixi.csv';
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
    return true;
  }

  window.BusinessCalcHistory = {
    readHistory,
    addHistoryEntry,
    removeEntry,
    clearHistory,
    exportCsv
  };
}());
