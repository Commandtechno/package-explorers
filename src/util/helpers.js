import { STOP_WORDS } from "../constants/STOP_WORDS";

const WORD_REGEX = /(?<=\s|^)\w+(?=\s|$)/g;

export function rangeArray(start, end) {
  if (!end) {
    end = start;
    start = 0;
  }

  return Array.from({ length: end - start }, (_, i) => i + start);
}

export function formatNum(num) {
  return num.toLocaleString();
}

export function formatCurrency(amount, currency) {
  return amount.toLocaleString(undefined, { style: "currency", currency });
}

export function getWords(text) {
  return (text.match(WORD_REGEX) ?? [])
    .map(word => word.toLowerCase())
    .filter(word => !STOP_WORDS.has(word));
}