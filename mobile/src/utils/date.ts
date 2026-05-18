import { format, differenceInDays, startOfWeek, addDays } from "date-fns";
import { DAY_ABBREVIATIONS_UZ } from "./constants";

export function getToday(): string {
  return format(new Date(), "yyyy-MM-dd");
}

export function formatUzbekDate(date: Date): string {
  const months = [
    "yanvar",
    "fevral",
    "mart",
    "aprel",
    "may",
    "iyun",
    "iyul",
    "avgust",
    "sentyabr",
    "oktyabr",
    "noyabr",
    "dekabr",
  ];
  const days = [
    "yakshanba",
    "dushanba",
    "seshanba",
    "chorshanba",
    "payshanba",
    "juma",
    "shanba",
  ];
  return `${date.getDate()}-${months[date.getMonth()]}, ${days[date.getDay()]}`;
}

export function getWeekDates(centerDate: Date = new Date()) {
  const today = format(new Date(), "yyyy-MM-dd");
  const weekStart = startOfWeek(centerDate, { weekStartsOn: 1 });
  return Array.from({ length: 7 }, (_, i) => {
    const d = addDays(weekStart, i);
    const dateStr = format(d, "yyyy-MM-dd");
    return {
      date: dateStr,
      dayNumber: d.getDate(),
      dayAbbr: DAY_ABBREVIATIONS_UZ[d.getDay()],
      isToday: dateStr === today,
    };
  });
}

export function getDayGap(olderDate: string, newerDate: string): number {
  return differenceInDays(
    new Date(newerDate + "T12:00:00"),
    new Date(olderDate + "T12:00:00"),
  );
}

export function formatDuration(minutes: number): string {
  if (minutes < 60) return `${minutes} daqiqa`;
  const h = Math.floor(minutes / 60),
    m = minutes % 60;
  return m === 0 ? `${h} soat` : `${h} soat ${m} daqiqa`;
}
