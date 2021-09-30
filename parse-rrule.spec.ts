import { parseRRuleSet } from './parse-rrule.js';

describe('parseRRuleSet', () => {
  it('fixes https://github.com/jakubroztocil/rrule/issues/332', () => {
    const rruleSet = parseRRuleSet(`
      DTSTART:20210201T000000Z
      RRULE:FREQ=WEEKLY;INTERVAL=1;BYDAY=MO,WE;UNTIL=20210207T000000Z
      DTSTART:20210208T000000Z
      RRULE:FREQ=WEEKLY;INTERVAL=3;BYDAY=TU,TH;UNTIL=20210214T000000Z
    `);

    expect(rruleSet.toString()).toEqual(`
DTSTART:20210201T000000Z
RRULE:FREQ=WEEKLY;INTERVAL=1;BYDAY=MO,WE;UNTIL=20210207T000000Z
DTSTART:20210208T000000Z
RRULE:FREQ=WEEKLY;INTERVAL=3;BYDAY=TU,TH;UNTIL=20210214T000000Z
`.trim());
  });

  it('Supports RDATE', () => {
    const rruleSet = parseRRuleSet(`
      RDATE:20210201T000000Z,20210601T000000Z
    `);

    expect(rruleSet.rrules()).toHaveLength(0);
    expect(rruleSet.exrules()).toHaveLength(0);
    expect(rruleSet.exdates()).toHaveLength(0);

    expect(rruleSet.rdates()).toHaveLength(2);
    expect(rruleSet.rdates()[0].toISOString()).toEqual('2021-02-01T00:00:00.000Z');
    expect(rruleSet.rdates()[1].toISOString()).toEqual('2021-06-01T00:00:00.000Z');
  });
});
