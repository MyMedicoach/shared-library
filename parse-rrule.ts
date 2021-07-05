import { RRule, RRuleSet, rrulestr } from 'rrule';
import { pythonSplit } from '../utils/util';
import { assert } from './assert';

export function parseRRuleSetArray(rruleStrs: string[]) {
  const finalSet = new RRuleSet();

  for (const str of rruleStrs) {
    const set = parseRRuleSet(str);

    assert(set.exrules().length === 0, 'exrules is not supported');
    assert(set.exdates().length === 0, 'exdates is not supported');

    for (const rrule of set.rrules()) {
      finalSet.rrule(rrule);
    }

    for (const rdate of set.rdates()) {
      finalSet.rdate(rdate);
    }
  }

  return finalSet;
}

/**
 * Parse a rrule string as a RRuleSet.
 *
 * This also fixes a bug in {@link rrulestr} where the dtstart of the rrules following the first one are lost.
 * {@link https://github.com/jakubroztocil/rrule/issues/332}
 *
 * Does not support EXRULE, RDATE, or EXDATE
 *
 * @throws Error if the rrule cannot be parsed into a rruleset.
 * @param {string} rruleStr
 * @returns {RRuleSet}
 */
export function parseRRuleSet(rruleStr: string): RRuleSet {
  const set = new RRuleSet();

  rruleStr = rruleStr.trim();

  let dtStart = '';
  for (let line of rruleStr.split('\n')) {
    line = line.trim();

    const { name, value, parms } = breakDownLine(line);

    if (name !== 'RRULE' && dtStart) {
      throw new Error('Incorrectly placed DTSTART found. Must be placed one line before RRULE');
    }

    switch (name) {
      case 'RDATE': {
        const dates = parseRDate(value, parms);

        for (const date of dates) {
          set.rdate(date);
        }

        break;
      }

      case 'DTSTART':
        dtStart = line;
        continue;

      case 'RRULE': {
        const rrule = parseRrule(`${dtStart}\n${line}`);
        set.rrule(rrule);
        dtStart = '';
        break;
      }

      default:
        throw new Error('parseRRuleSet only supports DTSTART, RDATE & RRULE for now');
    }
  }

  return set;
}

export function parseRrule(rruleStr: string): RRule {
  const rrule = rrulestr(rruleStr);

  if (!(rrule instanceof RRule)) {
    throw new Error('Cannot parse input as RRule. Is it an RRuleSet?');
  }

  return rrule;
}

function extractName(line) {
  if (line.indexOf(':') === -1) {
    return {
      name: 'RRULE',
      value: line,
    };
  }

  const [name, value] = pythonSplit(line, ':', 1);

  return {
    name,
    value,
  };
}

function breakDownLine(line) {
  const { name, value } = extractName(line);
  const parms = name.split(';');
  if (!parms) {
    throw new Error('empty property name');
  }

  return {
    name: parms[0].toUpperCase(),
    parms: parms.slice(1),
    value,
  };
}

function parseRDate(rdateval, parms): Date[] {
  validateDateParm(parms);

  return rdateval
    .split(',')
    .map(datestr => {
      return parseRRuleDate(datestr);
    });
}

function parseRRuleDate(until: string): Date {
  const re = /^(\d{4})(\d{2})(\d{2})(T(\d{2})(\d{2})(\d{2})Z?)?$/;
  const bits = re.exec(until);
  if (!bits) {
    throw new Error(`Invalid RRule Date value: ${until}`);
  }

  const parseInt = Number.parseInt;

  return new Date(Date.UTC(
    parseInt(bits[1], 10),
    parseInt(bits[2], 10) - 1,
    parseInt(bits[3], 10),
    parseInt(bits[5], 10) || 0,
    parseInt(bits[6], 10) || 0,
    parseInt(bits[7], 10) || 0,
  ));
}

function validateDateParm(parms) {
  parms.forEach(parm => {
    if (!/(VALUE=DATE(-TIME)?)|(TZID=)/.test(parm)) {
      throw new Error(`unsupported RDATE/EXDATE parm: ${parm}`);
    }
  });
}
