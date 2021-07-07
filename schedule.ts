import { assert } from './assert';

export enum ScheduleFrequency {
  // Yearly = 'Yearly',
  Monthly = 'Monthly',
  Weekly = 'Weekly',
  Daily = 'Daily',
}

export type TDateOnlyString = string;

// there is always at least 4 sets of every day of the week in a month. We can propose selecting either of them or the last one (-1)
export type TMonthWeekNumber = -1 | 1 | 2 | 3 | 4;

export function assertIsMonthWeekNumber(val: number): asserts val is TMonthWeekNumber {
  assert(val === -1 || (val >= 1 && val <= 4));
}

export type TRepeatFrequency = {
  interval: number,
  frequency: ScheduleFrequency,
  /** array of iso 8601 weekday number (1 is monday, 7 is sunday) */
  byWeekday?: number[],

  /**
   * If provided as a number, the exact day of the month (0 - 31).
   * If provided as an object, the specified weekday of the specified week of the month.
   */
  byMonthday?: number | {
    /** Week offset in the month, -1 means last week, 1 is first week */
    weekNum: TMonthWeekNumber,
    /** iso 8601 weekday number (1 is monday, 7 is sunday) */
    weekday: number,
  },
};

export type TSingleDateSchedule = {
  /** single date version */
  date: TDateOnlyString,
};

export type TCountEndDate = {
  count: number,
};

export type TUntilEndDate = {
  until: TDateOnlyString,
};

export type TSchedule = TSingleDateSchedule | ({
  /** repeat version */
  startDate: TDateOnlyString,
  endDate: null | TCountEndDate | TUntilEndDate,
} & TRepeatFrequency);

type TScheduleTemplateStart = {
  delayInDays: number,
  /** iso 8601 weekday number (1 is monday, 7 is sunday) */
  clampToWeekday: number | null,
};

export type TSingleDateScheduleTemplate = {
  /** single date version */
  date: TScheduleTemplateStart,
};

export type TScheduleTemplate = TSingleDateScheduleTemplate | TRepeatingScheduleTemplate;

export type TRepeatingScheduleTemplate = {
  /** repeat version */
  startDate: TScheduleTemplateStart,

  endDate: null | TCountEndDate,
} & TRepeatFrequency;
