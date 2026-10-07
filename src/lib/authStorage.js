const STORAGE_KEY = 'pos.auth';

export function clear() {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (err) {
    // localStorage can throw in private mode or when disabled
  }
}

export function save(session) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
  } catch (err) {
    // localStorage can throw in private mode or when disabled
  }
}

export function load() {
  let raw;
  try {
    raw = localStorage.getItem(STORAGE_KEY);
  } catch (err) {
    return null;
  }

  if (!raw) {
    return null;
  }

  try {
    const session = JSON.parse(raw);
    if (
      session.expires_at &&
      new Date(session.expires_at).getTime() <= Date.now()
    ) {
      clear();
      return null;
    }
    return session;
  } catch (err) {
    clear();
    return null;
  }
}

export function getToken() {
  const session = load();
  return session ? session.token : null;
}
