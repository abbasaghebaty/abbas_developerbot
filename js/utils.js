export function toEnglishDigits(value) {
  return String(value).replace(/[۰-۹]/g, digit => String.fromCharCode(digit.charCodeAt(0) - 1728));
}

export function toPersianDigits(value) {
  return String(value).replace(/[0-9]/g, digit => String.fromCharCode(digit.charCodeAt(0) + 1728));
}

export function normalizeText(value) {
  return String(value ?? "").replace(/\u200c/g, " ").replace(/\s+/g, " ").trim();
}

export function normalizeNumericInput(value) {
  return toEnglishDigits(String(value ?? "")).replace(/[,_\s]/g, "");
}

export function isPositiveInteger(value) {
  return /^\d+$/.test(normalizeNumericInput(value));
}

export function removeDuplicateWords(value) {
  const words = normalizeText(value).split(" ").filter(Boolean);
  const result = [];
  for (const word of words) {
    if (word !== result[result.length - 1]) result.push(word);
  }
  return result.join(" ");
}

export function matchesPrefix(text, prefix) {
  if (text === prefix) return true;
  return text.startsWith(prefix) && /\s/.test(text.charAt(prefix.length));
}
