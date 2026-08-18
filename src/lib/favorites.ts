export const FAVORITES_CHANNEL = "saqlanganlar_kanali";
export const CUSTOM_EVENT_NAME = "saqlanganlar_ozgardi";

export const getFavoritesStorageKey = (): string => {
  try {
    const savedUser = localStorage.getItem("user");
    if (savedUser) {
      const parsed = JSON.parse(savedUser);
      const userId = parsed.id || parsed.username || "guest";
      return `saqlanganUstalar_${userId}`;
    }
  } catch (e) {
    console.error(e);
  }
  return "saqlanganUstalar_guest";
};

export const getSavedUstaIds = (): string[] => {
  try {
    const key = getFavoritesStorageKey();
    const saved = localStorage.getItem(key);
    return saved ? JSON.parse(saved).map(String) : [];
  } catch {
    return [];
  }
};

export const isUstaSaved = (id: string | number): boolean => {
  const current = getSavedUstaIds();
  return current.includes(String(id));
};

export const toggleFavoriteUsta = (id: string | number): string[] => {
  const strId = String(id);
  const current = getSavedUstaIds();
  const exists = current.includes(strId);

  const updated = exists
    ? current.filter((item) => item !== strId)
    : [...current, strId];

  const key = getFavoritesStorageKey();
  localStorage.setItem(key, JSON.stringify(updated));

  // CustomEvent yuborish
  window.dispatchEvent(new CustomEvent(CUSTOM_EVENT_NAME, { detail: { id: strId, updated } }));

  try {
    const channel = new BroadcastChannel(FAVORITES_CHANNEL);
    channel.postMessage({ type: "updated", updated });
    channel.close();
  } catch (e) {
    console.error(e);
  }

  return updated;
};