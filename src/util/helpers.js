import dayjs from "dayjs";
import { STOP_WORDS } from "../constants/STOP_WORDS";

const WORD_REGEX = /(?<=\s|^)\w+(?=\s|$)/g;

export function $(id) {
  return document.getElementById(id);
}

export function rangeNum(start, end, fn = i => i) {
  if (!end) {
    end = start;
    start = 0;
  }

  return Array.from({ length: end - start }, (_, i) => fn(i + start));
}

/**
 * @param {dayjs.Dayjs} start
 * @param {dayjs.Dayjs} end
 * @param {dayjs.ManipulateType} unit
 */
export function rangeDate(start, end, unit) {
  const dates = [];
  for (let current = start; current.isBefore(end); current = current.add(1, unit)) dates.push(current);
  return dates;
}

let dummyDate = dayjs();
export function formatHour(hour) {
  return dummyDate.hour(hour).format("h A");
}

export function formatNum(num) {
  return num.toLocaleString();
}

export function formatCurrency(amount, currency) {
  return amount.toLocaleString(undefined, { style: "currency", currency });
}

export function getWords(text) {
  return (text.match(WORD_REGEX) ?? []).map(word => word.toLowerCase()).filter(word => !STOP_WORDS.has(word));
}