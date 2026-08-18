const quantityWords: Record<string, number> = {
  a: 1,
  an: 1,
  one: 1,
  two: 2,
  three: 3,
  four: 4,
  five: 5,
  six: 6,
  seven: 7,
  eight: 8,
  nine: 9,
  ten: 10,
  eleven: 11,
  twelve: 12
};

const weekdayNumbers: Record<string, number> = {
  sunday: 0,
  monday: 1,
  tuesday: 2,
  wednesday: 3,
  thursday: 4,
  friday: 5,
  saturday: 6
};

function localDay(referenceDate: Date): Date {
  return new Date(
    referenceDate.getFullYear(),
    referenceDate.getMonth(),
    referenceDate.getDate(),
    12,
    0,
    0,
    0
  );
}

function addDays(referenceDate: Date, days: number): Date {
  const result = localDay(referenceDate);
  result.setDate(result.getDate() + days);
  return result;
}

function addMonthsClamped(referenceDate: Date, months: number): Date {
  const source = localDay(referenceDate);
  const desiredDay = source.getDate();
  const targetMonth = source.getMonth() + months;
  const targetYear = source.getFullYear() + Math.floor(targetMonth / 12);
  const normalizedMonth = ((targetMonth % 12) + 12) % 12;
  const lastDay = new Date(targetYear, normalizedMonth + 1, 0).getDate();

  return new Date(
    targetYear,
    normalizedMonth,
    Math.min(desiredDay, lastDay),
    12,
    0,
    0,
    0
  );
}

function nextWeekday(referenceDate: Date, weekday: number): Date {
  const source = localDay(referenceDate);
  let daysAhead = (weekday - source.getDay() + 7) % 7;

  if (daysAhead === 0) {
    daysAhead = 7;
  }

  return addDays(source, daysAhead);
}

function formatDateOnly(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function quantity(value: string): number | undefined {
  if (/^\d+$/.test(value)) {
    const parsed = Number(value);
    return parsed > 0 && parsed <= 365 ? parsed : undefined;
  }

  return quantityWords[value];
}

function relativeQuantity(
  note: string,
  unitPattern: string
): number | undefined {
  const match = note.match(
    new RegExp(`\\bin\\s+(a|an|one|two|three|four|five|six|seven|eight|nine|ten|eleven|twelve|\\d+)\\s+${unitPattern}\\b`)
  );

  return match?.[1] ? quantity(match[1]) : undefined;
}

export function suggestFollowUpDueDate(
  note: string,
  referenceDate = new Date()
): string {
  const normalized = note.trim().toLowerCase();

  if (!normalized) return "";

  if (/\btomorrow\b/.test(normalized)) {
    return formatDateOnly(addDays(referenceDate, 1));
  }

  const days = relativeQuantity(normalized, "days?");
  if (days) {
    return formatDateOnly(addDays(referenceDate, days));
  }

  const weeks = relativeQuantity(normalized, "weeks?");
  if (weeks) {
    return formatDateOnly(addDays(referenceDate, weeks * 7));
  }

  const months = relativeQuantity(normalized, "months?");
  if (months) {
    return formatDateOnly(addMonthsClamped(referenceDate, months));
  }

  if (/\bnext week\b/.test(normalized)) {
    return formatDateOnly(addDays(referenceDate, 7));
  }

  if (/\bnext month\b/.test(normalized)) {
    return formatDateOnly(addMonthsClamped(referenceDate, 1));
  }

  const weekdayMatch = normalized.match(
    /\b(?:next\s+|this\s+)?(sunday|monday|tuesday|wednesday|thursday|friday|saturday)\b/
  );

  if (weekdayMatch?.[1]) {
    return formatDateOnly(nextWeekday(referenceDate, weekdayNumbers[weekdayMatch[1]]));
  }

  return "";
}
