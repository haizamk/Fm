export interface OperatingDateOption {
  dateStr: string;           // YYYY-MM-DD in local time
  displayLabel: string;      // e.g. "Selasa (15 Sep)"
  fullDisplayLabel: string;  // e.g. "Selasa, 15 September 2026"
  dayName: string;           // "Selasa"
  relativeTag: string;       // "Esok (Paling Awal)" or "Lusa"
  isTomorrow: boolean;
  isDayAfterTomorrow: boolean;
}

export interface CutoffInfo {
  isCutoffPassed: boolean;
  cutoffHour: number;        // 23 (11:00 PM)
  cutoffTimeLabel: string;   // "11:00 Malam"
  availableDates: OperatingDateOption[];
  minDateStr: string;
  todayStr: string;
}

const DAYS_BM = ['Ahad', 'Isnin', 'Selasa', 'Rabu', 'Khamis', 'Jumaat', 'Sabtu'];
const MONTHS_BM_SHORT = ['Jan', 'Feb', 'Mac', 'Apr', 'Mei', 'Jun', 'Jul', 'Ogo', 'Sep', 'Okt', 'Nov', 'Dis'];
const MONTHS_BM_FULL = [
  'Januari', 'Februari', 'Mac', 'April', 'Mei', 'Jun',
  'Julai', 'Ogos', 'September', 'Oktober', 'November', 'Disember'
];

/**
 * Format local date object to YYYY-MM-DD
 */
export function formatLocalDateStr(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

/**
 * Parses YYYY-MM-DD as local date safely without UTC timezone drift
 */
export function parseLocalDate(dateStr: string): Date {
  const [y, m, d] = dateStr.split('-').map(Number);
  return new Date(y, m - 1, d);
}

/**
 * Format YYYY-MM-DD into readable BM date format (e.g. "Selasa, 15 Sep 2026")
 */
export function formatDeliveryDateBM(dateStr: string, isFullMonth: boolean = true): string {
  if (!dateStr) return '';
  try {
    const d = parseLocalDate(dateStr);
    const dayName = DAYS_BM[d.getDay()];
    const dayNum = d.getDate();
    const monthName = isFullMonth ? MONTHS_BM_FULL[d.getMonth()] : MONTHS_BM_SHORT[d.getMonth()];
    const year = d.getFullYear();
    return `${dayName}, ${dayNum} ${monthName} ${year}`;
  } catch {
    return dateStr;
  }
}

/**
 * Calculate operating dates and cut-off strictly based on local time.
 * Rules:
 * 1. Orders placed TODAY before 11:00 PM (23:00) -> Earliest delivery/pickup is TOMORROW (+1 day, excluding Mondays).
 * 2. Orders placed TODAY at or after 11:00 PM (>= 23:00) -> Cut-off passed, earliest delivery/pickup is DAY AFTER TOMORROW (+2 days, excluding Mondays).
 * 3. Today is NEVER a delivery date (same-day delivery is closed).
 * 4. Mondays are closed (Isnin Tutup) - skipped automatically.
 */
export function getCutoffInfo(count: number = 7): CutoffInfo {
  const now = new Date();
  const currentHour = now.getHours();
  
  // Cut-off is 11:00 PM (23:00)
  const isCutoffPassed = currentHour >= 23;
  
  // Before 11pm: offset starts tomorrow (+1). After 11pm: offset starts day after tomorrow (+2).
  const startDayOffset = isCutoffPassed ? 2 : 1;
  const todayStr = formatLocalDateStr(now);

  const availableDates: OperatingDateOption[] = [];
  let offset = startDayOffset;

  // Generate valid operating dates
  while (availableDates.length < count && offset < 60) {
    const targetDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() + offset);
    const dayOfWeek = targetDate.getDay(); // 0 = Ahad, 1 = Isnin, 2 = Selasa, ...
    const dateStr = formatLocalDateStr(targetDate);
    const dayName = DAYS_BM[dayOfWeek];

    // Store is closed on Mondays (dayOfWeek === 1)
    if (dayOfWeek !== 1) {
      let relativeTag = '';
      if (offset === 1) {
        relativeTag = 'Esok (Paling Awal)';
      } else if (offset === 2) {
        relativeTag = isCutoffPassed ? 'Lusa (Paling Awal)' : 'Lusa';
      }

      availableDates.push({
        dateStr,
        displayLabel: `${dayName} (${targetDate.getDate()} ${MONTHS_BM_SHORT[targetDate.getMonth()]})`,
        fullDisplayLabel: `${dayName}, ${targetDate.getDate()} ${MONTHS_BM_FULL[targetDate.getMonth()]} ${targetDate.getFullYear()}`,
        dayName,
        relativeTag,
        isTomorrow: offset === 1,
        isDayAfterTomorrow: offset === 2,
      });
    }
    offset++;
  }

  const minDateStr = availableDates[0]?.dateStr || formatLocalDateStr(new Date(now.getFullYear(), now.getMonth(), now.getDate() + startDayOffset));

  return {
    isCutoffPassed,
    cutoffHour: 23,
    cutoffTimeLabel: '11:00 Malam',
    availableDates,
    minDateStr,
    todayStr,
  };
}
