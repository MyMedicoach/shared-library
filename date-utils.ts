import { assert } from './assert.js';
import { padNumber } from './number-utils.js';

export function toRfc3339DateLocal(date: Date): string {
  const day = padNumber(date.getDate(), 2);
  const month = padNumber(date.getMonth() + 1, 2);

  return `${date.getFullYear()}-${month}-${day}`;
}

export function toRfc3339TimeLocal(time: Date): string {
  const hours = padNumber(time.getHours(), 2);
  const minutes = padNumber(time.getMinutes(), 2);
  const seconds = padNumber(time.getSeconds(), 2);
  const ms = String(time.getMilliseconds()).padEnd(3, '0');

  return `${hours}:${minutes}:${seconds}.${ms}`;
}

export function toRfc3339DatetimeLocal(datetime: Date): string {
  // The format is "yyyy-MM-ddThh:mm" followed by optional ":ss" or ":ss.SSS".
  const datePart = toRfc3339DateLocal(datetime);
  const timePart = toRfc3339TimeLocal(datetime);

  return `${datePart}T${timePart}`;
}

export function toRfc3339DateUtc(date: Date): string {
  const day = padNumber(date.getUTCDate(), 2);
  const month = padNumber(date.getUTCMonth() + 1, 2);

  return `${date.getUTCFullYear()}-${month}-${day}`;
}

export function toRfc3339TimeUtc(time: Date): string {
  const hours = padNumber(time.getUTCHours(), 2);
  const minutes = padNumber(time.getUTCMinutes(), 2);
  const seconds = padNumber(time.getUTCSeconds(), 2);
  const ms = String(time.getUTCMilliseconds()).padEnd(3, '0');

  return `${hours}:${minutes}:${seconds}.${ms}`;
}

export function toRfc3339DatetimeUtc(datetime: Date): string {
  // The format is "yyyy-MM-ddThh:mm" followed by optional ":ss" or ":ss.SSS".
  const datePart = toRfc3339DateUtc(datetime);
  const timePart = toRfc3339TimeUtc(datetime);

  return `${datePart}T${timePart}`;
}

/**
 * @returns {Date} the first date, after or equal to {date}, for which the weekday is equal to {isoWeekday}.
 *  (eg. "Tell me what date next friday is")
 *
 * @param {Date} date - the starting date
 * @param {number} isoWeekday - a number representing the weekday where 1 is monday and 7 is sunday.
 */
export function getClosestWeekdayForwardLocal(date: Date, isoWeekday: number): Date {
  assertIsIsoWeekday(isoWeekday);

  const jsWeekday = isoWeekdayToJsWeekday(isoWeekday);

  const out = new Date(date);

  out.setDate(out.getDate() + (7 + jsWeekday - date.getDay()) % 7);

  return out;
}

export function isoWeekdayToJsWeekday(isoWeekday: number): number {
  assertIsIsoWeekday(isoWeekday);

  if (isoWeekday === 7) {
    return 0;
  }

  return isoWeekday;
}

/**
 * Converts legacy JS Date weekday numbers (0 -> 6, where 0 is sunday, 6 is saturday)
 * into ISO 8601 weekdays (1 -> 7, where 1 is monday, 7 is sunday)
 * @param {number} jsWeekday
 * @returns {number}
 */
export function jsWeekdayToIsoWeekday(jsWeekday: number): number {
  assertIsJsWeekday(jsWeekday);

  if (jsWeekday === 0) {
    return 7;
  }

  return jsWeekday;
}

export function assertIsIsoWeekday(weekday: number): void {
  assert(Number.isSafeInteger(weekday) && weekday >= 1 && weekday <= 7);
}

export function assertIsJsWeekday(weekday: number): void {
  assert(Number.isSafeInteger(weekday) && weekday >= 0 && weekday <= 6);
}

export const ISO_DATE_ONLY_REGEX = /^[0-9]{4}-[0-9]{2}-[0-9]{2}$/;

export function isIsoDateOnlyString(input: string): boolean {
  return ISO_DATE_ONLY_REGEX.test(input);
}

export function isoDateOnlyToTimestampLocal(dateStr: string): number {
  if (!isIsoDateOnlyString(dateStr)) {
    throw new Error('date must not have time specified (yyyy-mm-dd)');
  }

  // Date.parse chooses the timeZone depending on the input format:
  // 'yyyy-mm-dd' => UTC
  // 'yyyy-mm-ddThh:MM:ss' => local timeZone
  // 'yyyy-mm-ddThh:MM:ssZ' => UTC
  return Date.parse(`${dateStr}T00:00:00`);
}

export function isoDateOnlyToTimestampUtc(dateStr: string): number {
  if (!isIsoDateOnlyString(dateStr)) {
    throw new Error('date must not have time specified (yyyy-mm-dd)');
  }

  return Date.parse(dateStr);
}

export function isoDateOnlyToJsDateLocal(dateStr: string): Date {
  return new Date(isoDateOnlyToTimestampLocal(dateStr));
}

export function isoDateOnlyToJsDateUtc(dateStr: string): Date {
  return new Date(isoDateOnlyToTimestampUtc(dateStr));
}

export function latestDate(mandatoryDate: Date, ...dates: Array<Date | null | undefined>): Date {
  let mostRecent: Date = mandatoryDate;

  for (const date of dates) {
    if (date == null) {
      continue;
    }

    if (date.getTime() > mostRecent.getTime()) {
      mostRecent = date;
    }
  }

  return mostRecent;
}

export function earliestDate(mandatoryDate: Date, ...dates: Array<Date | null | undefined>): Date {
  let oldest: Date = mandatoryDate;

  for (const date of dates) {
    if (date == null) {
      continue;
    }

    if (date.getTime() < oldest.getTime()) {
      oldest = date;
    }
  }

  return oldest;
}
