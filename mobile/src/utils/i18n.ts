import i18n from "i18next";
import { initReactI18next } from "react-i18next";

const resources = {
  uz: {
    translation: {
      // Navigation
      today: "Bugun",
      stats: "Statistika",
      profile: "Profil",
      home: "Asosiy",
      more: "Yana",

      // Actions
      start: "Boshlash",
      save: "Saqlash",
      continue: "Davom etish",
      cancel: "Bekor qilish",
      delete: "O'chirish",
      edit: "Tahrirlash",
      close: "Yopish",
      done: "Bajarildi",
      undo: "Bekor qilish",
      share: "Ulashish",

      // Onboarding
      appName: "O'zbek",
      tagline: "Har kuni bir qadam",
      subtitle: "Odatlaringizni kuzating, tartib yaratishni boshlang",
      pick3Habits: "3 ta odat tanlang",
      pickHabitsSubtitle: "Boshlash uchun eng yaxshilari",
      signInWithGoogle: "Google bilan kirish",
      gmailRequiredHint: "Faqat Gmail (@gmail.com) hisoblari qabul qilinadi",
      gmailRequired: "Iltimos, Gmail hisobingiz bilan kiring.",
      authError: "Kirish xatosi",
      signInFailed: "Kirish amalga oshmadi. Qayta urinib ko'ring.",
      signInRequired: "Saqlash uchun tizimga kiring",
      googleNotConfigured:
        "Google OAuth sozlanmagan. EXPO_PUBLIC_GOOGLE_* o'zgaruvchilarini tekshiring.",
      skipForNow: "Hozircha o'tkazib yuborish",
      monthlyActivity: "Oylik faollik",
      completed: "Bajarildi",
      syncing: "Sinxronlash...",
      pendingOps: "ta o'zgarish kutilmoqda",
      changeLanguage: "Tilni o'zgartirish",

      // Time of day
      morning: "Ertalab",
      afternoon: "Kunduzi",
      evening: "Kechqurun",
      allDay: "Butun kun",

      // Target type
      targetBinary: "Bajarildi",
      targetCount: "Sanoq",
      targetDuration: "Vaqt (daq.)",
      targetValue: "Maqsad miqdori",

      // Frequency
      daily: "Har kuni",
      weekdays: "Hafta kunlari",
      threePerWeek: "Haftada 3 marta",
      weeklyDiscipline: "Haftalik tartib",

      // Habit creation
      newHabit: "Yangi odat",
      habitNamePlaceholder: "Masalan: Kitob o'qish",
      name: "Nomi",
      icon: "Ikonka",
      color: "Rang",
      frequency: "Takrorlanish",
      timeOfDay: "Vaqti",
      reminder: "Eslatma",
      reminderTime: "Eslatma vaqti",

      // Stats
      week: "Hafta",
      month: "Oy",
      tartibScore: "TARTIB",
      weeklyActivity: "Haftalik faollik",
      habitIndicators: "Odatlar ko'rsatkichi",
      comparedToLastWeek: "o'tgan haftaga nisbatan",
      shareViaTelegram: "Telegram orqali ulashish",
      shareError: "Ulashishda xato yuz berdi",
      notEnoughData: "Ma'lumot yetarli emas",
      trackForAWeek: "Bir hafta kuzatib boring, statistika shakllanadi",

      // Home
      noHabitsToday: "Bugun hech narsa yo'q",
      noHabitsSubtitle: "Yangi odat qo'shing va tartibni boshlang",
      addFirstHabit: "Birinchi odatni yaratish",

      // Streaks
      streakSaved: "Ketma-ketlik saqlandi!",
      shieldsLeft: "ta qalqon qoldi",
      dayStreak: "kun",
      bestStreak: "Eng yaxshi ketma-ketlik",

      // Profile
      settings: "Sozlamalar",
      language: "Til",
      theme: "Mavzu",
      darkTheme: "Qorong'i",
      lightTheme: "Yorug'",
      notifications: "Eslatmalar",
      data: "Ma'lumotlar",
      exportData: "Eksport qilish",
      deleteAccount: "Hisobni o'chirish",
      aboutApp: "Ilova haqida",
      helpCenter: "Yordam markazi",
      terms: "Foydalanish shartlari",
      privacy: "Maxfiylik siyosati",
      version: "Versiya",
      signOut: "Chiqish",

      // Network
      noInternet: "Internet aloqasi yo'q",
      dataSyncLater: "Ma'lumotlar keyinroq sinxronlanadi",

      // New features
      editHabit: "Odatni tahrirlash",
      deleteHabit: "Odatni o'chirish",
      deleteHabitConfirm: "Bu odatni o'chirishni tasdiqlaysizmi?",
      habitActions: "Odat amallari",
      synced: "Sinxronlandi",

      // Misc
      minutes: "daqiqa",
      glasses: "stakan",
      lesson: "dars",
    },
  },
  ru: {
    translation: {
      // Navigation
      today: "Сегодня",
      stats: "Статистика",
      profile: "Профиль",
      home: "Главная",
      more: "Ещё",

      // Actions
      start: "Начать",
      save: "Сохранить",
      continue: "Продолжить",
      cancel: "Отменить",
      delete: "Удалить",
      edit: "Изменить",
      close: "Закрыть",
      done: "Готово",
      undo: "Отменить",
      share: "Поделиться",

      // Onboarding
      appName: "O'zbek",
      tagline: "Каждый день — один шаг",
      subtitle: "Отслеживайте привычки, создайте порядок",
      pick3Habits: "Выберите 3 привычки",
      pickHabitsSubtitle: "Лучшие для начала",
      signInWithGoogle: "Войти через Google",
      gmailRequiredHint: "Принимаются только аккаунты Gmail (@gmail.com)",
      gmailRequired: "Войдите с аккаунтом Gmail.",
      authError: "Ошибка входа",
      signInFailed: "Не удалось войти. Попробуйте снова.",
      signInRequired: "Войдите, чтобы сохранить",
      googleNotConfigured: "Google OAuth не настроен.",
      skipForNow: "Пропустить",
      monthlyActivity: "Активность за месяц",
      completed: "Готово",
      syncing: "Синхронизация...",
      pendingOps: "ожидающих изменений",
      changeLanguage: "Сменить язык",

      // Time of day
      morning: "Утро",
      afternoon: "День",
      evening: "Вечер",
      allDay: "Весь день",

      // Target type
      targetBinary: "Выполнено",
      targetCount: "Количество",
      targetDuration: "Время (мин.)",
      targetValue: "Целевое значение",

      // Frequency
      daily: "Каждый день",
      weekdays: "Будние дни",
      threePerWeek: "3 раза в неделю",
      weeklyDiscipline: "Недельная дисциплина",

      // Habit creation
      newHabit: "Новая привычка",
      habitNamePlaceholder: "Например: Чтение книг",
      name: "Название",
      icon: "Иконка",
      color: "Цвет",
      frequency: "Повторение",
      timeOfDay: "Время суток",
      reminder: "Напоминание",
      reminderTime: "Время напоминания",

      // Stats
      week: "Неделя",
      month: "Месяц",
      tartibScore: "ПОРЯДОК",
      weeklyActivity: "Активность за неделю",
      habitIndicators: "Показатели привычек",
      comparedToLastWeek: "по сравнению с прошлой неделей",
      shareViaTelegram: "Поделиться в Telegram",
      shareError: "Ошибка при отправке",
      notEnoughData: "Недостаточно данных",
      trackForAWeek: "Отслеживайте неделю, чтобы увидеть статистику",

      // Home
      noHabitsToday: "На сегодня ничего нет",
      noHabitsSubtitle: "Добавьте новую привычку",
      addFirstHabit: "Создать первую привычку",

      // Streaks
      streakSaved: "Серия сохранена!",
      shieldsLeft: "щитов осталось",
      dayStreak: "дней",
      bestStreak: "Лучшая серия",

      // Profile
      settings: "Настройки",
      language: "Язык",
      theme: "Тема",
      darkTheme: "Тёмная",
      lightTheme: "Светлая",
      notifications: "Уведомления",
      data: "Данные",
      exportData: "Экспортировать",
      deleteAccount: "Удалить аккаунт",
      aboutApp: "О приложении",
      helpCenter: "Центр помощи",
      terms: "Условия использования",
      privacy: "Политика конфиденциальности",
      version: "Версия",
      signOut: "Выйти",

      // Network
      noInternet: "Нет подключения к интернету",
      dataSyncLater: "Данные синхронизируются позже",

      // New features
      editHabit: "Редактировать привычку",
      deleteHabit: "Удалить привычку",
      deleteHabitConfirm: "Вы уверены, что хотите удалить эту привычку?",
      habitActions: "Действия с привычкой",
      synced: "Синхронизировано",

      // Misc
      minutes: "минут",
      glasses: "стаканов",
      lesson: "урок",
    },
  },
  en: {
    translation: {
      today: "Today",
      stats: "Statistics",
      profile: "Profile",
      home: "Home",
      more: "More",
      start: "Start",
      save: "Save",
      continue: "Continue",
      cancel: "Cancel",
      delete: "Delete",
      edit: "Edit",
      close: "Close",
      done: "Done",
      undo: "Undo",
      share: "Share",
      appName: "O'zbek",
      tagline: "One step every day",
      subtitle: "Track your habits, build discipline",
      pick3Habits: "Pick 3 habits",
      pickHabitsSubtitle: "Best ones to start with",
      signInWithGoogle: "Sign in with Google",
      gmailRequiredHint: "Only Gmail (@gmail.com) accounts are accepted",
      gmailRequired: "Please sign in with a Gmail account.",
      authError: "Sign-in error",
      signInFailed: "Could not sign in. Please try again.",
      signInRequired: "Sign in to save",
      googleNotConfigured: "Google OAuth is not configured.",
      skipForNow: "Skip for now",
      monthlyActivity: "Monthly activity",
      completed: "Done",
      syncing: "Syncing...",
      pendingOps: "pending changes",
      changeLanguage: "Change language",
      morning: "Morning",
      afternoon: "Afternoon",
      evening: "Evening",
      allDay: "All Day",
      targetBinary: "Done",
      targetCount: "Count",
      targetDuration: "Duration (min)",
      targetValue: "Target value",
      daily: "Daily",
      weekdays: "Weekdays",
      threePerWeek: "3 times a week",
      weeklyDiscipline: "Weekly discipline",
      newHabit: "New habit",
      habitNamePlaceholder: "e.g., Read a book",
      name: "Name",
      icon: "Icon",
      color: "Color",
      frequency: "Frequency",
      timeOfDay: "Time of day",
      reminder: "Reminder",
      reminderTime: "Reminder time",
      week: "Week",
      month: "Month",
      tartibScore: "ORDER",
      weeklyActivity: "Weekly activity",
      habitIndicators: "Habit indicators",
      comparedToLastWeek: "compared to last week",
      shareViaTelegram: "Share via Telegram",
      shareError: "Error sharing",
      notEnoughData: "Not enough data",
      trackForAWeek: "Track for a week to see statistics",
      noHabitsToday: "Nothing for today",
      noHabitsSubtitle: "Add a new habit to get started",
      addFirstHabit: "Create first habit",
      streakSaved: "Streak saved!",
      shieldsLeft: "shields left",
      dayStreak: "days",
      bestStreak: "Best streak",
      settings: "Settings",
      language: "Language",
      theme: "Theme",
      darkTheme: "Dark",
      lightTheme: "Light",
      notifications: "Notifications",
      data: "Data",
      exportData: "Export data",
      deleteAccount: "Delete account",
      aboutApp: "About",
      helpCenter: "Help center",
      terms: "Terms of service",
      privacy: "Privacy policy",
      version: "Version",
      signOut: "Sign out",
      noInternet: "No internet connection",
      dataSyncLater: "Data will sync later",
      editHabit: "Edit habit",
      deleteHabit: "Delete habit",
      deleteHabitConfirm: "Are you sure you want to delete this habit?",
      habitActions: "Habit actions",
      synced: "Synced",

      minutes: "min",
      glasses: "glasses",
      lesson: "lesson",
    },
  },
};

i18n.use(initReactI18next).init({
  resources,
  lng: "uz", // Uzbek is default — non-negotiable
  fallbackLng: "en",
  interpolation: {
    escapeValue: false,
  },
  react: {
    useSuspense: false,
  },
});

export default i18n;
