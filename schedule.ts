import RRule, { Options, RRuleSet } from 'rrule';
import { lastItem, toArray } from './array-utils';
import { assert } from './assert';
import { getClosestWeekdayForwardLocal, toRfc3339DateLocal, toRfc3339DateUtc } from './date-utils';
import { range } from './number-utils';
import { isObject } from './object-utils';
import { parseRRuleSet } from './parse-rrule';
import { isoWeekdayToRRuleWeekday, rruleWeekdayToIsoWeekday } from './rrule-utils';
import { TwoWayMap } from './two-way-map';

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

export type TDateTemplate = {
  delayInDays: number,
  /** iso 8601 weekday number (1 is monday, 7 is sunday) */
  clampToWeekday?: number | null,
};

export type TSingleDateScheduleTemplate = {
  /** single date version */
  date: TDateTemplate,
};

export type TScheduleTemplate = TSingleDateScheduleTemplate | TRepeatingScheduleTemplate;

export type TRepeatingScheduleTemplate = {
  /** repeat version */
  startDate: TDateTemplate,

  endDate: null | TCountEndDate,
} & TRepeatFrequency;

const rruleFrequencyMap = new TwoWayMap({
  // @ts-expect-error
  [ScheduleFrequency.Daily]: RRule.DAILY,
  // @ts-expect-error
  [ScheduleFrequency.Monthly]: RRule.MONTHLY,
  // @ts-expect-error
  [ScheduleFrequency.Weekly]: RRule.WEEKLY,
});

export function rruleSetToSchedules(rruleSet: string | RRuleSet): TSchedule[] {
  if (typeof rruleSet === 'string') {
    rruleSet = parseRRuleSet(rruleSet);
  }

  const out: TSchedule[] = [];

  for (const date of rruleSet.rdates()) {
    out.push({ date: toRfc3339DateUtc(date) });
  }

  for (const rrule of rruleSet.rrules()) {
    assert(rrule.options.wkst === 0);
    assert(rrule.options.tzid == null);
    assert(rrule.options.bymonth == null);
    assert(rrule.options.byyearday == null);
    assert(rrule.options.byweekno == null);
    assert(rrule.options.byhour.length === 1 && rrule.options.byhour[0] === 0);
    assert(rrule.options.byminute.length === 1 && rrule.options.byminute[0] === 0);
    assert(rrule.options.bysecond.length === 1 && rrule.options.bysecond[0] === 0);
    assert(rrule.options.byeaster == null);
    assert(rrule.options.bynmonthday.length === 0);

    const options = rrule.origOptions;
    let endDate: TCountEndDate | TUntilEndDate = null;
    if (options.count) {
      endDate = { count: options.count };

      assert(options.until == null);
    } else if (options.until) {
      endDate = { until: toRfc3339DateUtc(options.until) };

      assert(options.count == null);
    }

    assert(rruleFrequencyMap.hasValue(options.freq), `freq${options.freq} is not supported in TSchedule`);

    const schedule: TSchedule = {
      startDate: toRfc3339DateUtc(options.dtstart),
      endDate,
      interval: options.interval,
      frequency: rruleFrequencyMap.revGet(options.freq),
    };

    if (schedule.frequency === ScheduleFrequency.Daily || schedule.frequency === ScheduleFrequency.Monthly) {
      assert(rrule.options.byweekday == null);
    }

    if (schedule.frequency === ScheduleFrequency.Daily || schedule.frequency === ScheduleFrequency.Weekly) {
      assert(rrule.options.bysetpos == null);
      assert(rrule.options.bymonthday == null || rrule.options.bymonthday.length === 0);
      assert(rrule.options.bynweekday == null || rrule.options.bynweekday.length === 0);
    }

    switch (schedule.frequency) {
      case ScheduleFrequency.Weekly: {
        schedule.byWeekday = toArray(rrule.options.byweekday).map(weekday => rruleWeekdayToIsoWeekday(weekday));
        break;
      }

      case ScheduleFrequency.Monthly: {
        if ((rrule.options.bynweekday?.length ?? 0) > 0) {
          assert(rrule.options.bynweekday.length === 1);
          assert(rrule.options.bysetpos == null);
          assert(rrule.options.bymonthday == null || rrule.options.bymonthday.length === 0);

          const nWeekday = rrule.options.bynweekday[0];

          assertIsMonthWeekNumber(nWeekday[1]);

          schedule.byMonthday = {
            weekNum: nWeekday[1],
            weekday: rruleWeekdayToIsoWeekday(nWeekday[0]),
          };
        } else {
          assert(rrule.options.bymonthday?.length >= 1);
          assert(rrule.options.bynweekday == null || rrule.options.bynweekday.length === 0);
          assert(rrule.options.bysetpos == null || rrule.options.bysetpos.length === 1);

          const bysetpos = rrule.options.bysetpos?.[0] ?? 0;
          assert(bysetpos === 0 || bysetpos === -1);

          if (bysetpos === -1) {
            schedule.byMonthday = lastItem(rrule.options.bymonthday);
          } else {
            schedule.byMonthday = rrule.options.bymonthday[0];
          }
        }

        break;
      }

      default:
    }

    out.push(schedule);
  }

  return out;
}

export function scheduleToRruleSet(schedules: TSchedule | TSchedule[]): RRuleSet {
  const out = new RRuleSet();

  schedules = toArray(schedules);
  for (const schedule of schedules) {
    if (isSingleDateSchedule(schedule)) {
      out.rdate(new Date(schedule.date));

      continue;
    }

    const rruleOptions: Partial<Options> = {
      dtstart: new Date(schedule.startDate),
      until: isUntilEndDate(schedule.endDate) ? new Date(schedule.endDate?.until) : null,
      count: isCountEndDate(schedule.endDate) ? schedule.endDate.count : null,
      freq: rruleFrequencyMap.get(schedule.frequency),
      interval: schedule.interval,
    };

    if (schedule.frequency === ScheduleFrequency.Monthly) {
      assert(schedule.byMonthday != null);

      // by a specific month day number (eg, the 23rd)
      if (typeof schedule.byMonthday === 'number') {
        // always at least 28 days in a month
        if (schedule.byMonthday <= 28) {
          rruleOptions.bymonthday = schedule.byMonthday;
        } else {
          // rrule that falls back to the last day of the month if there are less then {schedule.byMonthday} days
          // https://stackoverflow.com/questions/35757778/rrule-for-repeating-monthly-on-the-31st-or-closest-day
          rruleOptions.bymonthday = [...range(28, schedule.byMonthday)];
          rruleOptions.bysetpos = -1;
        }
      } else {
        // by a given day of a given week ("first friday")
        rruleOptions.byweekday = isoWeekdayToRRuleWeekday(schedule.byMonthday.weekday, schedule.byMonthday.weekNum);
      }
    }

    if (schedule.frequency === ScheduleFrequency.Weekly) {
      assert(Array.isArray(schedule.byWeekday) && schedule.byWeekday.length > 0);
      rruleOptions.byweekday = schedule.byWeekday.map(day => isoWeekdayToRRuleWeekday(day));
    }

    out.rrule(new RRule(rruleOptions));
  }

  return out;
}

export function scheduleTemplateToSchedule(date: Date,
  scheduleTemplate: TScheduleTemplate | TScheduleTemplate[]): TSchedule[] {

  scheduleTemplate = toArray(scheduleTemplate);

  return scheduleTemplate.map(template => {
    if (isSingleDateSchedule(template)) {
      return {
        date: templateDateToDate(date, template.date),
      };
    }

    return {
      ...template,
      startDate: templateDateToDate(date, template.startDate),
    };
  });
}

function templateDateToDate(date: Date, scheduleDate: TDateTemplate): string {
  const out = new Date(date);

  out.setDate(out.getDate() + scheduleDate.delayInDays);

  if (scheduleDate.clampToWeekday) {
    return toRfc3339DateLocal(getClosestWeekdayForwardLocal(out, scheduleDate.clampToWeekday));
  }

  return toRfc3339DateLocal(out);
}

export function isSingleDateSchedule(val: any): val is TSingleDateSchedule | TSingleDateScheduleTemplate {
  return isObject(val) && 'date' in val;
}

export function isCountEndDate(val: any): val is TCountEndDate {
  return isObject(val) && 'count' in val;
}

export function isUntilEndDate(val: any): val is TUntilEndDate {
  return isObject(val) && 'until' in val;
}

export function isScheduleTemplate(val: any): val is TScheduleTemplate {
  // @ts-expect-error
  return isObject(val) && (isObject(val.startDate) || isObject(val.date));
}
