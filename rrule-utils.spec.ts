import { parseRrule, parseRRuleSet } from './parse-rrule.js';
import { restrictRruleDates, restrictRruleSetDates } from './rrule-utils.js';

describe('restrictRruleDates', () => {
  it('restricts: UNTIL, start & end', () => {
    // 2 week interval (monday 2021-02-01 -> 2021-02-14)
    const rrule = parseRrule(`
      DTSTART:20210201T000000Z
      RRULE:FREQ=WEEKLY;INTERVAL=1;BYDAY=MO,WE,SU;UNTIL=20210214T235959Z
    `);

    const newRrule = restrictRruleDates(rrule, {
      startDate: new Date('2021-02-03T00:00:00Z'),
      endDate: new Date('2021-02-10T23:59:59Z'),
    });

    expect(newRrule.toString()).toEqual(`
DTSTART:20210203T000000Z
RRULE:FREQ=WEEKLY;INTERVAL=1;BYDAY=MO,WE,SU;UNTIL=20210210T000000Z
    `.trim());
  });

  it('restricts: UNTIL, start, no end shift', () => {
    // this will return mo 5, wed 7, fr 9, sunday 11, tue 13
    const rrule = parseRrule(`
      DTSTART:20210705T000000Z
      RRULE:FREQ=DAILY;INTERVAL=2;UNTIL=20210713T000000Z
    `);

    const newRrule = restrictRruleDates(rrule, {
      startDate: new Date('2021-07-06T00:00:00Z'),
      shiftEndDate: false,
    });

    expect(rrule.all().map(date => date.toISOString())).toEqual([
      '2021-07-05T00:00:00.000Z',
      '2021-07-07T00:00:00.000Z',
      '2021-07-09T00:00:00.000Z',
      '2021-07-11T00:00:00.000Z',
      '2021-07-13T00:00:00.000Z',
    ]);

    expect(newRrule.all().map(date => date.toISOString())).toEqual([
      // no 2021-07-05
      '2021-07-07T00:00:00.000Z',
      '2021-07-09T00:00:00.000Z',
      '2021-07-11T00:00:00.000Z',
      '2021-07-13T00:00:00.000Z',
    ]);

    expect(newRrule.toString()).toEqual(`
DTSTART:20210707T000000Z
RRULE:FREQ=DAILY;INTERVAL=2;UNTIL=20210713T000000Z
    `.trim());
  });

  it('restricts: UNTIL, start, end shift', () => {
    // this will return mo 5, wed 7, fr 9, sunday 11, tue 13
    const rrule = parseRrule(`
      DTSTART:20210705T000000Z
      RRULE:FREQ=DAILY;INTERVAL=2;UNTIL=20210713T000000Z
    `);

    const newRrule = restrictRruleDates(rrule, {
      startDate: new Date('2021-07-06T00:00:00Z'),
      shiftEndDate: true,
    });

    expect(rrule.all().map(date => date.toISOString())).toEqual([
      '2021-07-05T00:00:00.000Z',
      '2021-07-07T00:00:00.000Z',
      '2021-07-09T00:00:00.000Z',
      '2021-07-11T00:00:00.000Z',
      '2021-07-13T00:00:00.000Z',
    ]);

    expect(newRrule.all().map(date => date.toISOString())).toEqual([
      // no 2021-07-05
      '2021-07-07T00:00:00.000Z',
      '2021-07-09T00:00:00.000Z',
      '2021-07-11T00:00:00.000Z',
      '2021-07-13T00:00:00.000Z',
      '2021-07-15T00:00:00.000Z',
    ]);

    expect(newRrule.toString()).toEqual(`
DTSTART:20210707T000000Z
RRULE:FREQ=DAILY;INTERVAL=2;UNTIL=20210715T000000Z
    `.trim());
  });

  it('restricts: COUNT, start & end', () => {
    // the whole first workweek
    const rrule = parseRrule(`
      DTSTART:20210201T000000Z
      RRULE:FREQ=WEEKLY;INTERVAL=1;BYDAY=MO,TU,WE,TH,FR,SA,SU;COUNT=5
    `);

    expect(rrule.all()).toHaveLength(5);

    const newRrule = restrictRruleDates(rrule, {
      // if only endDate changed, we'd still be fine as it would end on friday
      // but moving startDate by one day means the count changes to 4 so endDate must be set
      startDate: new Date('2021-02-02T00:00:00Z'),
      endDate: new Date('2021-02-10T23:59:59Z'),
    });

    expect(newRrule.toString()).toEqual(`
DTSTART:20210202T000000Z
RRULE:FREQ=WEEKLY;INTERVAL=1;BYDAY=MO,TU,WE,TH,FR,SA,SU;COUNT=9
    `.trim());

    expect(newRrule.last().toISOString()).toEqual('2021-02-10T00:00:00.000Z');
  });

  it('restricts: COUNT, start, no end shift', () => {
    // this will return mo 5, wed 7, fr 9, sunday 11, tue 13
    const rrule = parseRrule(`
      DTSTART:20210705T000000Z
      RRULE:FREQ=DAILY;INTERVAL=2;COUNT=5
    `);

    const newRrule = restrictRruleDates(rrule, {
      startDate: new Date('2021-07-06T00:00:00Z'),
      shiftEndDate: false,
    });

    expect(rrule.all().map(date => date.toISOString())).toEqual([
      '2021-07-05T00:00:00.000Z',
      '2021-07-07T00:00:00.000Z',
      '2021-07-09T00:00:00.000Z',
      '2021-07-11T00:00:00.000Z',
      '2021-07-13T00:00:00.000Z',
    ]);

    expect(newRrule.all().map(date => date.toISOString())).toEqual([
      // no 2021-07-05
      '2021-07-07T00:00:00.000Z',
      '2021-07-09T00:00:00.000Z',
      '2021-07-11T00:00:00.000Z',
      '2021-07-13T00:00:00.000Z',
    ]);

    expect(newRrule.toString()).toEqual(`
DTSTART:20210707T000000Z
RRULE:FREQ=DAILY;INTERVAL=2;COUNT=4
    `.trim());
  });

  it('restricts: COUNT, start, end shift', () => {
    // this will return mo 5, wed 7, fr 9, sunday 11, tue 13
    const rrule = parseRrule(`
      DTSTART:20210705T000000Z
      RRULE:FREQ=DAILY;INTERVAL=2;COUNT=5
    `);

    const newRrule = restrictRruleDates(rrule, {
      startDate: new Date('2021-07-06T00:00:00Z'),
      shiftEndDate: true,
    });

    expect(rrule.all().map(date => date.toISOString())).toEqual([
      '2021-07-05T00:00:00.000Z',
      '2021-07-07T00:00:00.000Z',
      '2021-07-09T00:00:00.000Z',
      '2021-07-11T00:00:00.000Z',
      '2021-07-13T00:00:00.000Z',
    ]);

    expect(newRrule.all().map(date => date.toISOString())).toEqual([
      // no 2021-07-05
      '2021-07-07T00:00:00.000Z',
      '2021-07-09T00:00:00.000Z',
      '2021-07-11T00:00:00.000Z',
      '2021-07-13T00:00:00.000Z',
      '2021-07-15T00:00:00.000Z',
    ]);

    expect(newRrule.toString()).toEqual(`
DTSTART:20210707T000000Z
RRULE:FREQ=DAILY;INTERVAL=2;COUNT=5
    `.trim());
  });

  it('restricts: <no-end> to same-day end', () => {
    const rrule = parseRrule(`
      DTSTART:20210705T000000Z
      RRULE:FREQ=DAILY;INTERVAL=2
    `);

    const newRrule = restrictRruleDates(rrule, {
      endDate: new Date('2021-07-05T00:00:00Z'),
    });

    expect(newRrule.toString()).toEqual(`DTSTART:20210705T000000Z
RRULE:FREQ=DAILY;INTERVAL=2;UNTIL=20210705T000000Z`);
  });

  it('restricts: <no-end> to before-start end', () => {
    const rrule = parseRrule(`
      DTSTART:20210705T000000Z
      RRULE:FREQ=DAILY;INTERVAL=2
    `);

    const newRrule = restrictRruleDates(rrule, {
      endDate: new Date('2021-07-04T23:23:59Z'),
    });

    expect(newRrule.toString()).toEqual(`DTSTART:20210705T000000Z
RRULE:FREQ=DAILY;INTERVAL=2;COUNT=0`);
  });
});

describe('restrictRruleSetDates', () => {
  it('removes rrules with 0 occurrences', () => {
    const rrule = parseRRuleSet(`
      DTSTART:20210705T000000Z
      RRULE:FREQ=DAILY;INTERVAL=1
    `);

    const newRrule = restrictRruleSetDates(rrule, {
      endDate: new Date('2021-07-04T23:23:59Z'),
    });

    expect(newRrule.toString()).toEqual('');
  });
});
