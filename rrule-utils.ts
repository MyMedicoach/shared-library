import { RRule, RRuleSet } from 'rrule';

type TClampOptions = {
  startDate?: Date,
  endDate?: Date,

  shiftEndDate?: boolean,
};

type TSetClampOptions = TClampOptions & {
  keepOutOfRangeRDates?: boolean,
};

export function restrictRruleSetDates(rruleSet: RRuleSet, clampOptions: TSetClampOptions): RRuleSet {
  const newSet = new RRuleSet();

  if (rruleSet.exrules().length > 0) {
    throw new Error('clampRruleSet does not support EXRULE');
  }

  if (rruleSet.exdates().length > 0) {
    throw new Error('clampRruleSet does not support EXDATE');
  }

  for (const date of rruleSet.rdates()) {
    if (!clampOptions.keepOutOfRangeRDates) {
      if (clampOptions.startDate && date.getTime() < clampOptions.startDate.getTime()) {
        continue;
      }

      if (clampOptions.endDate && date.getTime() > clampOptions.endDate.getTime()) {
        continue;
      }
    }

    newSet.rdate(date);
  }

  for (const rrule of rruleSet.rrules()) {
    const newRrule = restrictRruleDates(rrule, clampOptions);
    if (newRrule.first() == null) {
      continue;
    }

    newSet.rrule(newRrule);
  }

  return newSet;
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

  if (!newOptions.dtstart) {
    throw new Error(`Invalid RRule received: ${rrule.toString()} is missing DTSTART`);
  }

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

    const usedCount = rrule.origOptions.count != null;
    if (usedCount) {
      newOptions.count = tmpRrule.count();
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