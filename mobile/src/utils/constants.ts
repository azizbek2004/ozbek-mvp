/**
 * O'ZEK — Constants
 *
 * Habit templates, icon mappings, and app-wide configuration.
 */

// Onboarding habit templates — exact spec from blueprint
export const HABIT_TEMPLATES = [
  {
    name: "Kitob o'qish",
    nameRu: "Чтение книг",
    icon: "book-open",
    color: "#0A84FF",
    type: "good",
    targetType: "duration",
    targetValue: 30,
    frequencyType: "daily",
    timeOfDay: "morning",
  },
  {
    name: "Sport",
    nameRu: "Спорт",
    icon: "dumbbell",
    color: "#30D158",
    type: "good",
    targetType: "duration",
    targetValue: 45,
    frequencyType: "daily",
    timeOfDay: "morning",
  },
  {
    name: "Ingliz tili",
    nameRu: "Английский язык",
    icon: "globe",
    color: "#FF9F0A",
    type: "good",
    targetType: "count",
    targetValue: 1,
    frequencyType: "daily",
    timeOfDay: "afternoon",
  },
  {
    name: "5 vaqt namoz",
    nameRu: "5 намазов",
    icon: "mosque",
    color: "#1E8F5E",
    type: "good",
    targetType: "binary",
    frequencyType: "daily",
    timeOfDay: "evening",
  },
  {
    name: "Suv ichish",
    nameRu: "Пить воду",
    icon: "droplet",
    color: "#64D2FF",
    type: "good",
    targetType: "count",
    targetValue: 8,
    frequencyType: "daily",
    timeOfDay: "all_day",
  },
  {
    name: "Ertalab turish",
    nameRu: "Ранний подъём",
    icon: "sun",
    color: "#FFD60A",
    type: "good",
    targetType: "binary",
    frequencyType: "daily",
    timeOfDay: "morning",
  },
  {
    name: "Meditatsiya",
    nameRu: "Медитация",
    icon: "meditation",
    color: "#BF5AF2",
    type: "good",
    targetType: "duration",
    targetValue: 15,
    frequencyType: "daily",
    timeOfDay: "morning",
  },
  {
    name: "Ish",
    nameRu: "Работа",
    icon: "briefcase",
    color: "#FF453A",
    type: "good",
    targetType: "duration",
    targetValue: 60,
    frequencyType: "daily",
    timeOfDay: "afternoon",
  },
] as const;

// Icon map: name → emoji fallback (for rendering before icon library loads)
export const ICON_MAP: Record<string, string> = {
  "book-open": "📖",
  dumbbell: "🏋️",
  globe: "🌐",
  mosque: "🕌",
  droplet: "💧",
  sun: "☀️",
  meditation: "🧘",
  briefcase: "💼",
  palette: "🎨",
  music: "🎵",
  code: "💻",
  flower: "🌸",
  utensils: "🍴",
  gamepad: "🎮",
  moon: "🌙",
  // Additional icons for the picker
  heart: "❤️",
  star: "⭐",
  target: "🎯",
  fire: "🔥",
  trophy: "🏆",
  clock: "⏰",
  pencil: "✏️",
  camera: "📸",
  phone: "📱",
  run: "🏃",
};

// Icons available in the picker (5x3 grid = 15 icons)
export const PICKER_ICONS = [
  "book-open",
  "dumbbell",
  "droplet",
  "meditation",
  "run",
  "palette",
  "music",
  "code",
  "flower",
  "utensils",
  "gamepad",
  "moon",
  "pencil",
  "camera",
  "star",
];

// Time of day configuration
export const TIME_OF_DAY = {
  morning: {
    key: "morning",
    labelUz: "Ertalab",
    labelRu: "Утро",
    icon: "☀️",
    range: "06:00–12:00",
  },
  afternoon: {
    key: "afternoon",
    labelUz: "Kunduzi",
    labelRu: "День",
    icon: "🌤️",
    range: "12:00–18:00",
  },
  evening: {
    key: "evening",
    labelUz: "Kechqurun",
    labelRu: "Вечер",
    icon: "🌙",
    range: "18:00–22:00",
  },
  all_day: {
    key: "all_day",
    labelUz: "Butun kun",
    labelRu: "Весь день",
    icon: "🕐",
    range: "",
  },
} as const;

// Uzbek day abbreviations
export const DAY_ABBREVIATIONS_UZ = [
  "Ya", // Sunday
  "Du", // Monday
  "Se", // Tuesday
  "Ch", // Wednesday
  "Pa", // Thursday
  "Ju", // Friday
  "Sh", // Saturday
] as const;

export const DAY_ABBREVIATIONS_RU = [
  "Вс",
  "Пн",
  "Вт",
  "Ср",
  "Чт",
  "Пт",
  "Сб",
] as const;

// Target type options for add-habit form
export const TARGET_TYPE_OPTIONS = [
  { key: "binary", i18nKey: "targetBinary" },
  { key: "count", i18nKey: "targetCount" },
  { key: "duration", i18nKey: "targetDuration" },
] as const;

// Frequency options
export const FREQUENCY_OPTIONS = [
  { key: "daily", labelUz: "Har kuni", labelRu: "Каждый день" },
  { key: "weekdays", labelUz: "Hafta kunlari", labelRu: "Будние дни" },
  { key: "3x_week", labelUz: "Haftada 3 marta", labelRu: "3 раза в неделю" },
] as const;

// App version
export const APP_VERSION = "1.0.0";
export const APP_BUILD = "1";
