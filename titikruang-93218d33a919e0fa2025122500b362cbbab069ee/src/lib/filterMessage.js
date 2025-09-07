import { blockedWords } from "./blockedWords";

/**
 * Mengganti kata terlarang dengan tanda bintang (****)
 * @param {string} text - Teks asli pesan
 * @returns {string} - Teks yang sudah difilter
 */
export function filterMessage(text) {
  if (!text) return "";
  let filtered = text;

  blockedWords.forEach(word => {
    // \b untuk batas kata, gi = global + case-insensitive
    const regex = new RegExp(`\\b${escapeRegExp(word)}\\b`, "gi");
    filtered = filtered.replace(regex, "*".repeat(word.length));
  });

  return filtered;
}

/**
 * Mengecek apakah pesan mengandung kata terlarang
 * @param {string} text - Teks yang akan dicek
 * @returns {boolean} - True jika mengandung kata terlarang
 */
export function containsBlockedWord(text) {
  if (!text) return false;
  return blockedWords.some(word =>
    new RegExp(`\\b${escapeRegExp(word)}\\b`, "i").test(text)
  );
}

/**
 * Escape karakter spesial agar aman untuk regex
 * @param {string} string - Kata yang akan di-escape
 * @returns {string}
 */
function escapeRegExp(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
