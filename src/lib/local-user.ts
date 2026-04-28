const KEY = "lofigen.localUserId";

/**
 * Returns a stable per-browser UUID, generating one on first use. Used in place
 * of an authenticated user id so the tracks table can stay schema-compatible
 * while there's no sign-in flow.
 */
export const getLocalUserId = (): string => {
  let id = localStorage.getItem(KEY);
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem(KEY, id);
  }
  return id;
};
