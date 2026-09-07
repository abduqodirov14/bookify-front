/**
 * Uzbek tilida oylar ro'yxati
 */
export const UZBEK_MONTHS = [
  'yanvar', 'fevral', 'mart', 'aprel', 'may', 'iyun',
  'iyul', 'avgust', 'sentyabr', 'oktyabr', 'noyabr', 'dekabr'
];

/**
 * Volontyorlik boshlangan sanadan oxirigacha (yoki bugungi kungacha) xizmat davrini hisoblash.
 * Universitetlar, xalqaro grantlar va diplom ilovasi uchun aniq yillik muddatni taqdim etadi.
 * Masalan: "2025-yil sentyabr — 2026-yil sentyabr (1 yil to'liq faoliyat)"
 */
export function calculateVolunteerPeriod(
  startDateInput?: string | Date | null,
  endDateInput?: string | Date | null
): {
  startDateFormatted: string;
  endDateFormatted: string;
  durationMonths: number;
  durationText: string;
  fullPeriodText: string;
  academicYearText: string;
} {
  // Boshlanish sanasi (agar ko'rsatilmagan bo'lsa, o'quv yili boshlanishi: 2025-09-01)
  let start: Date;
  if (startDateInput) {
    start = typeof startDateInput === 'string' ? new Date(startDateInput) : startDateInput;
    if (isNaN(start.getTime())) {
      start = new Date(2025, 8, 1); // 2025-09-01
    }
  } else {
    start = new Date(2025, 8, 1);
  }

  // Yakunlash sanasi (agar ko'rsatilmagan bo'lsa, bugun)
  let end: Date;
  if (endDateInput) {
    end = typeof endDateInput === 'string' ? new Date(endDateInput) : endDateInput;
    if (isNaN(end.getTime())) {
      end = new Date();
    }
  } else {
    end = new Date();
  }

  const startYear = start.getFullYear();
  const endYear = end.getFullYear();

  // Oylar farqi
  let totalMonths = (endYear - startYear) * 12 + (end.getMonth() - start.getMonth());
  if (totalMonths < 1) totalMonths = 1;

  const years = Math.floor(totalMonths / 12);
  const remMonths = totalMonths % 12;

  let durationText = '';
  if (years > 0 && remMonths === 0) {
    durationText = `${years} yil (${totalMonths} oy)`;
  } else if (years > 0) {
    durationText = `${years} yil ${remMonths} oy (${totalMonths} oy)`;
  } else {
    durationText = `${totalMonths} oy`;
  }

  const startMonth = UZBEK_MONTHS[start.getMonth()];
  const endMonth = UZBEK_MONTHS[end.getMonth()];

  const startDateFormatted = `${start.getDate()}-${startMonth}, ${startYear}`;
  const endDateFormatted = `${end.getDate()}-${endMonth}, ${endYear}`;

  const fullPeriodText = `${startYear}-yil ${startMonth} — ${endYear}-yil ${endMonth} (${durationText} to'liq faoliyat)`;
  const academicYearText = `${startYear}/${endYear}-o'quv yili (${durationText})`;

  return {
    startDateFormatted,
    endDateFormatted,
    durationMonths: totalMonths,
    durationText,
    fullPeriodText,
    academicYearText
  };
}
