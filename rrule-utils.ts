import { RRule, RRuleSet, Weekday } from 'rrule';
import { combinedIterator } from './array-utils.js';
import { assert } from './assert.js';

type TClampOptions = {
  startDate?: Date,
  endDate?: Date,

  shiftEndDate?: boolean,
};

type TSetClampOptions = TClampOptions & {
  keepOutOfRangeRDates?: boolean,
};

// todo: add to RRuleSet.map, RRuleSet.mapRDates, RRuleSet.mapRRules
export function mapRruleSet(rruleSet: RRuleSet, cb: (rrule: RRule | Date) => RRule | Date | null): RRuleSet {
  const newSet = new RRuleSet();

  if (rruleSet.exrules().length > 0) {
    throw new Error('mapRruleSet does not support EXRULE');
  }

  if (rruleSet.exdates().length > 0) {
    throw new Error('mapRruleSet does not support EXDATE');
  }

  for (const date of combinedIterator<Date | RRule>(rruleSet.rdates(), rruleSet.rrules())) {
    const out = cb(date);

    if (out == null) {
      continue;
    }

    if (out instanceof Date) {
      newSet.rdate(out);
    } else {
      newSet.rrule(out);
    }
  }

  return newSet;
}

export function restrictRruleSetDates(rruleSet: RRuleSet, clampOptions: TSetClampOptions): RRuleSet {
  return mapRruleSet(rruleSet, dateOrRule => {
    if (dateOrRule instanceof Date) {
      if (clampOptions.keepOutOfRangeRDates) {
        return dateOrRule;
      }

      if (clampOptions.startDate && dateOrRule.getTime() < clampOptions.startDate.getTime()) {
        return null;
      }

      if (clampOptions.endDate && dateOrRule.getTime() > clampOptions.endDate.getTime()) {
        return null;
      }

      return dateOrRule;
    }

    // rrule
    const newRrule = restrictRruleDates(dateOrRule, clampOptions);
    if (newRrule.first() == null) {
      return null;
    }

    return newRrule;
  });
}

/**
 * Restricts an RRule to a [start, end] range.
 *
 * When moving the startDate, the endDate could move too if using COUNT instead of UNTIL. COUNT is not truncated!
 *
 * If the RRule uses COUNT and finishes after the new endDate, COUNT will be replaced with UNTIL
 *
 * @param {RRule} rrule
 * @param {TClampOptions} clampOptions
 * @returns {RRule}
 */
export function restrictRruleDates(rrule: RRule, clampOptions: TClampOptions): RRule {
  if (clampOptions.shiftEndDate && clampOptions.endDate) {
    throw new Error('Cannot provide both shiftEndDate & endDate options at the same time');
  }

  const newOptions = { ...rrule.origOptions };

  // if (!newOptions.dtstart) {
  //   throw new Error(`Invalid RRule received: ${rrule.toString()} is missing DTSTART`);
  // }

  const { startDate, endDate, shiftEndDate } = clampOptions;

  if (startDate && (!newOptions.dtstart || newOptions.dtstart.getTime() < startDate.getTime())) {
    // TODO: might need a disambiguation for COUNT which causes it to be truncated (COUNT reduced by amount of days
    //  removed after changing DTSTART) instead of shifted (same COUNT but new dates because of new startDate).
    // clamp the startDate to the existing schedule so dates are not offset (such as in a "every two days" schedule)
    const clampedStartDate = newOptions.dtstart ? rrule.after(startDate, true) : startDate;

    newOptions.dtstart = clampedStartDate;
  }

  if (endDate) {
    // have to use newOptions because startDate could cause endTime to move when using .count
    const tmpRrule = new RRule({ ...newOptions, until: endDate, count: null });

    const tmpRruleCount = tmpRrule.count();

    const usedCount = rrule.origOptions.count != null;
    if (usedCount || tmpRruleCount === 0) {
      newOptions.count = tmpRruleCount;
    } else {
      newOptions.until = tmpRrule.last();
    }
  } else if (rrule.isFinite()) {
    if (shiftEndDate) {
      // shift "UNTIL" to keep the same amount of occurrences.
      // "COUNT" is already shifted by default.
      if (newOptions.until) {
        const tmpRrule = new RRule({ ...newOptions, until: null, count: rrule.count() });

        newOptions.until = tmpRrule.last();
      }
    } else if (newOptions.count) {
      // truncate "COUNT" to keep the same endDate.
      // "UNTIL" already keeps the same endDate by default.

      const tmpRrule = new RRule({ ...newOptions, until: rrule.last(), count: null });

      newOptions.count = tmpRrule.count();
    }
  }

  return new RRule(newOptions);
}

export function isoWeekdayToRRuleWeekday(weekDay: number, weekNum?: number): Weekday {
  assert(weekDay >= 1 && weekDay <= 7, `weekDay ${weekDay} is not withing range [1, 7]`);
  assert(weekNum !== 0, `weekNum ${weekNum} cannot be = 0`);

  // iso weekday is monday=1, sunday=7
  // rrule weekday is monday=0, sunday=6
  return new Weekday(weekDay - 1, weekNum);
}

export function rruleWeekdayToIsoWeekday(weekDay: number): number {
  assert(weekDay >= 0 && weekDay <= 6);

  // iso weekday is monday=1, sunday=7
  // rrule weekday is monday=0, sunday=6
  return weekDay + 1;
}
