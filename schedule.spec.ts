import { toArray } from './array-utils';
import type { TSchedule } from './schedule';
import {
  rruleSetToSchedules,
  ScheduleFrequency,
  scheduleTemplateToSchedule,
  scheduleToRruleSet,
} from './schedule';

describe('rruleSetToSchedules / scheduleToRrule', () => {
  function testConversion(rrule: string, schedule: TSchedule | TSchedule[]) {
    schedule = toArray(schedule);

    const out1 = scheduleToRruleSet(schedule).toString();
    expect(out1).toEqual(rrule);

    const out2 = rruleSetToSchedules(rrule);
    expect(out2).toMatchObject(schedule);
  }

  it('supports non-repeating dates', () => {
    testConversion('RDATE:20210101T000000Z', {
      date: '2021-01-01',
    });
  });

  it('supports null endDate', () => {
    const rrule = `DTSTART:20210101T000000Z
RRULE:FREQ=DAILY;INTERVAL=1`;

    const schedule = {
      startDate: '2021-01-01',
      endDate: null,
      frequency: ScheduleFrequency.Daily,
      interval: 1,
    };

    testConversion(rrule, schedule);
  });

  it('supports endDate.count', () => {
    const rrule = `DTSTART:20210101T000000Z
RRULE:COUNT=10;FREQ=DAILY;INTERVAL=1`;

    const schedule = {
      startDate: '2021-01-01',
      endDate: {
        count: 10,
      },
      frequency: ScheduleFrequency.Daily,
      interval: 1,
    };

    testConversion(rrule, schedule);
  });

  it('supports endDate.until', () => {
    const rrule = `DTSTART:20210101T000000Z
RRULE:UNTIL=20211001T000000Z;FREQ=DAILY;INTERVAL=1`;

    const schedule = {
      startDate: '2021-01-01',
      endDate: {
        until: '2021-10-01',
      },
      frequency: ScheduleFrequency.Daily,
      interval: 1,
    };

    testConversion(rrule, schedule);
  });

  it('supports weekly frequencies', () => {
    const rrule = `DTSTART:20210101T000000Z
RRULE:FREQ=WEEKLY;INTERVAL=1;BYDAY=MO,WE,SU`;

    const schedule = {
      startDate: '2021-01-01',
      endDate: null,
      frequency: ScheduleFrequency.Weekly,
      interval: 1,
      byWeekday: [1, 3, 7],
    };

    testConversion(rrule, schedule);
  });

  it('supports monthly frequencies + numeric-byMonthday', () => {
    const rrule = `DTSTART:20210101T000000Z
RRULE:FREQ=MONTHLY;INTERVAL=1;BYMONTHDAY=21`;

    const schedule = {
      startDate: '2021-01-01',
      endDate: null,
      frequency: ScheduleFrequency.Monthly,
      interval: 1,
      byMonthday: 21,
    };

    testConversion(rrule, schedule);
  });

  it('falls back to last day of month for months that do not have the requested day', () => {
    const rrule = `DTSTART:20210101T000000Z
RRULE:FREQ=MONTHLY;INTERVAL=1;BYMONTHDAY=28,29,30;BYSETPOS=-1`;

    const schedule = {
      startDate: '2021-01-01',
      endDate: null,
      frequency: ScheduleFrequency.Monthly,
      interval: 1,
      byMonthday: 30,
    };

    testConversion(rrule, schedule);
  });

  it('supports monthly frequencies + byweeday', () => {
    const rrule = `DTSTART:20210101T000000Z
RRULE:FREQ=MONTHLY;INTERVAL=1;BYDAY=+1MO`;

    const schedule: TSchedule = {
      startDate: '2021-01-01',
      endDate: null,
      frequency: ScheduleFrequency.Monthly,
      interval: 1,
      byMonthday: {
        weekday: 1,
        weekNum: 1,
      },
    };

    testConversion(rrule, schedule);
  });

  it('supports monthly frequencies + last byweeday', () => {
    const rrule = `DTSTART:20210101T000000Z
RRULE:FREQ=MONTHLY;INTERVAL=1;BYDAY=-1MO`;

    const schedule: TSchedule = {
      startDate: '2021-01-01',
      endDate: null,
      frequency: ScheduleFrequency.Monthly,
      interval: 1,
      byMonthday: {
        weekday: 1,
        weekNum: -1,
      },
    };

    testConversion(rrule, schedule);
  });
});

describe('scheduleToRrule', () => {

  it('throws for weekly frequencies that lack byWeekday', () => {
    expect(() => {
      scheduleToRruleSet({
        startDate: '2021-01-01',
        endDate: null,
        frequency: ScheduleFrequency.Weekly,
        interval: 1,
        byWeekday: [],
      });
    }).toThrow();
  });

  it('throws if byMonthday is not provided for monthly frequencies', () => {
    expect(() => {
      scheduleToRruleSet({
        startDate: '2021-01-01',
        endDate: null,
        frequency: ScheduleFrequency.Monthly,
        interval: 1,
      });
    }).toThrow();
  });
});

describe('scheduleTemplateToSchedule', () => {
  const date = new Date('2021-07-05');

  it('converts a non-repeating schedule template into a non-repeating schedule', () => {
    expect(scheduleTemplateToSchedule(date, {
      date: {
        delayInDays: 5,
        clampToWeekday: null,
      },
    })).toMatchObject([{
      date: '2021-07-10',
    }]);
  });

  it('converts a non-repeating schedule clamped to weekday template into a non-repeating schedule', () => {
    expect(scheduleTemplateToSchedule(date, {
      date: {
        delayInDays: 5,
        clampToWeekday: 1, // clamp to monday
      },
    })).toMatchObject([{
      // monday 12
      date: '2021-07-12',
    }]);
  });

  it('clamps weekday to same day if matches', () => {
    expect(scheduleTemplateToSchedule(date, {
      date: {
        delayInDays: 5,
        clampToWeekday: 6, // clamp to saturday
      },
    })).toMatchObject([{
      // saturday 10
      date: '2021-07-10',
    }]);
  });

  it('converts repeating schedules templates to repeating schedules', () => {
    expect(scheduleTemplateToSchedule(date, {
      startDate: {
        delayInDays: 5,
        clampToWeekday: 1, // clamp to monday
      },
      endDate: {
        count: 2,
      },
      frequency: ScheduleFrequency.Daily,
      interval: 2,
    })).toMatchObject([{
      // monday 12
      startDate: '2021-07-12',
      endDate: {
        count: 2,
      },
      frequency: ScheduleFrequency.Daily,
      interval: 2,
    }]);
  });
});
