const ALPHABET = "abcdefghijkmnopqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789";

/**
 * 32-character random token (SPEC.md section 9). Static stand-in: the server
 * creates tokens at integration (POST /api/chats/:id/invite).
 */
export function newInviteToken(): string {
  const bytes = crypto.getRandomValues(new Uint8Array(32));
  return Array.from(bytes, (b) => ALPHABET[b % ALPHABET.length]).join("");
}
