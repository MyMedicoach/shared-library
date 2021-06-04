import memoizeOne from 'memoize-one';

export enum ExerciseType {
  // Physiotherapy
  CARDIO = 'CARDIO',
  STRETCHING = 'STRETCHING',
  STRENGTHENING = 'STRENGTHENING',
  BALANCE = 'BALANCE',
  BREATHING = 'BREATHING',
  OTHER_PHYSIO = 'OTHER_PHYSIO',

  // Dietetics
  HABITS = 'HABITS',
  NUTRITION = 'NUTRITION',
  OTHER_DIETETICS = 'OTHER_DIETETICS',

  // Occupational Therapy
  OTHER_OT = 'OTHER_OT',

  // Speech Therapy
  OTHER_ST = 'OTHER_ST',

  // Medicine
  OTHER_MEDICINE = 'OTHER_MEDICINE',

  // Psychotherapy
  OTHER_PSYCHOLOGY = 'OTHER_PSYCHOLOGY',

  // Other
  OTHER_OTHER = 'OTHER_OTHER',

  SC_CARDIO = 'SC_CARDIO',
  SC_STRENGTHENING = 'SC_STRENGTHENING',
  SC_STRETCHING = 'SC_STRETCHING',
  SC_BALANCE = 'SC_BALANCE',
  OTHER_SPORT_COACHING = 'OTHER_SPORT_COACHING',

  OTHER_TOBACCOLOGY = 'OTHER_TOBACCOLOGY',
}

export const EXERCISE_CATEGORIES = Object.freeze({
  physiotherapy: Object.freeze([
    ExerciseType.CARDIO,
    ExerciseType.STRETCHING,
    ExerciseType.STRENGTHENING,
    ExerciseType.BALANCE,
    ExerciseType.BREATHING,
    ExerciseType.OTHER_PHYSIO,
  ]),
  dietetics: Object.freeze([
    ExerciseType.HABITS,
    ExerciseType.NUTRITION,
    ExerciseType.OTHER_DIETETICS,
  ]),
  occupationalTherapy: Object.freeze([ExerciseType.OTHER_OT]),
  speechTherapy: Object.freeze([ExerciseType.OTHER_ST]),
  medicine: Object.freeze([ExerciseType.OTHER_MEDICINE]),
  psychology: Object.freeze([ExerciseType.OTHER_PSYCHOLOGY]),
  tobaccology: Object.freeze([ExerciseType.OTHER_TOBACCOLOGY]),
  sportCoaching: Object.freeze([
    ExerciseType.SC_CARDIO,
    ExerciseType.SC_STRENGTHENING,
    ExerciseType.SC_STRETCHING,
    ExerciseType.SC_BALANCE,
  ]),
  other: Object.freeze([ExerciseType.OTHER_OTHER]),
});

export enum ExerciseCategory {
  physiotherapy = 'physiotherapy',
  dietetics = 'dietetics',
  occupationalTherapy = 'occupationalTherapy',
  speechTherapy = 'speechTherapy',
  medicine = 'medicine',
  psychology = 'psychology',
  tobaccology = 'tobaccology',
  sportCoaching = 'sportCoaching',
  other = 'other',
}

export const exerciseCategoriesList = Object.freeze(Object.keys(EXERCISE_CATEGORIES));

export function categoryOrDefault(cat: string): ExerciseCategory {
  return EXERCISE_CATEGORIES[cat] ? (cat as ExerciseCategory) : ExerciseCategory.physiotherapy;
}

const getTypeToCatMapping = memoizeOne(() => {
  const typeToCat = {};

  for (const category of Object.keys(EXERCISE_CATEGORIES)) {
    const types = EXERCISE_CATEGORIES[category];

    for (const type of types) {
      typeToCat[type] = category;
    }
  }

  return typeToCat;
});

function warnUncategorizedType(exerciseType: string) {
  globalThis.MMC_WARNED_CATEGORIES = globalThis.MMC_WARNED_CATEGORIES || new Set();
  if (!globalThis.MMC_WARNED_CATEGORIES.has(exerciseType)) {
    globalThis.MMC_WARNED_CATEGORIES.add(exerciseType);
    console.error(`Exercise Type ${exerciseType} does not have an assigned category`);
  }
}

export function getCategory(exerciseType: ExerciseType | string): ExerciseCategory {
  const typeToCategories = getTypeToCatMapping();

  const cat = typeToCategories[exerciseType];

  // this can happen if the API adds new categories that
  // this version of the app doesn't support yet
  if (cat == null && process.env.NODE_ENV === 'development') {
    warnUncategorizedType(exerciseType);
  }

  return cat;
}

export function getExerciseMainCategory(
  exercise: { exerciseTypes: ExerciseType[] | string[] },
): ExerciseCategory {
  for (const type of exercise.exerciseTypes) {
    const cat = getCategory(type);

    if (cat != null) {
      return cat;
    }
  }

  return ExerciseCategory.other;
}

export function getCategories(exerciseTypes: ExerciseType[]): ExerciseCategory[] {
  const seen = {};
  const typeToCategories = getTypeToCatMapping();

  for (const exerciseType of exerciseTypes) {
    const cat = typeToCategories[exerciseType];
    if (cat == null) {
      if (process.env.NODE_ENV === 'development') {
        warnUncategorizedType(exerciseType);
      }

      continue;
    }

    seen[cat] = true;
  }

  return Object.keys(seen).sort((a, b) => {
    if (a === 'other') {
      return 1;
    }

    if (b === 'other') {
      return -1;
    }

    return a.localeCompare(b);
  }) as ExerciseCategory[];
}
