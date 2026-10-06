(function () {
  const STORAGE_KEYS = {
    theme: 'businessCalcTheme',
    favorites: 'businessCalcFavorites',
    history: 'businessCalcHistory',
    settings: 'businessCalcSettings',
    recent: 'businessCalcRecent'
  };

  function safeParse(value, fallback) {
    try {
      return value ? JSON.parse(value) : fallback;
    } catch (_error) {
      return fallback;
    }
  }

  const storage = {
    get(key, fallback) {
      try {
        const raw = localStorage.getItem(key);
        return safeParse(raw, fallback);
      } catch (_error) {
        return fallback;
      }
    },
    set(key, value) {
      try {
        localStorage.setItem(key, JSON.stringify(value));
        return true;
      } catch (_error) {
        return false;
      }
    },
    remove(key) {
      try {
        localStorage.removeItem(key);
        return true;
      } catch (_error) {
        return false;
      }
    },
    reset() {
      Object.keys(STORAGE_KEYS).forEach(function (key) {
        this.remove(STORAGE_KEYS[key]);
      }, this);
    }
  };

  window.BusinessCalcStorage = { STORAGE_KEYS, storage };
}());
