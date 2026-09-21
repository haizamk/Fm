/**
 * Operating Hours Utility for Khairul Fresh Food
 * Schedule:
 * - Tuesday to Sunday: 7:00 AM – 6:00 PM
 * - Monday: CLOSED ("Cuti Hari Ini")
 */

export interface OperatingStatus {
  isOpen: boolean;
  status: 'open' | 'closed_monday' | 'closed_before' | 'closed_after';
  badgeTitle: string;
  badgeSubtext: string;
  hoursLabel: string;
  isMonday: boolean;
  nextOpenText: string;
}

export function getOperatingHoursStatus(date: Date = new Date()): OperatingStatus {
  // Use Malaysia time (Asia/Kuala_Lumpur, UTC+8)
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone: 'Asia/Kuala_Lumpur',
    weekday: 'short',
    hour: 'numeric',
    minute: 'numeric',
    hour12: false,
  });

  const parts = formatter.formatToParts(date);
  const weekdayPart = parts.find((p) => p.type === 'weekday')?.value; // 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'
  const hour = parseInt(parts.find((p) => p.type === 'hour')?.value || '0', 10);
  const minute = parseInt(parts.find((p) => p.type === 'minute')?.value || '0', 10);
  const currentMinutes = hour * 60 + minute;

  const isMonday = weekdayPart === 'Mon';
  const openMinutes = 7 * 60; // 7:00 AM
  const closeMinutes = 18 * 60; // 6:00 PM (18:00)

  const hoursLabel = 'Waktu operasi: Selasa – Ahad 7.00 pagi – 6.00 petang';

  if (isMonday) {
    return {
      isOpen: false,
      status: 'closed_monday',
      badgeTitle: 'Cuti Hari Ini',
      badgeSubtext: 'Kami buka semula esok (Selasa)',
      hoursLabel,
      isMonday: true,
      nextOpenText: 'Buka semula esok (Selasa) jam 7.00 pagi',
    };
  }

  // Tuesday - Sunday
  if (currentMinutes >= openMinutes && currentMinutes < closeMinutes) {
    return {
      isOpen: true,
      status: 'open',
      badgeTitle: 'Buka Hari Ini',
      badgeSubtext: 'Buka sehingga 6.00 petang',
      hoursLabel,
      isMonday: false,
      nextOpenText: 'Buka sekarang (tutup 6.00 petang)',
    };
  } else if (currentMinutes < openMinutes) {
    return {
      isOpen: false,
      status: 'closed_before',
      badgeTitle: 'Tutup Sekarang',
      badgeSubtext: 'Buka semula jam 7.00 pagi',
      hoursLabel,
      isMonday: false,
      nextOpenText: 'Buka semula jam 7.00 pagi hari ini',
    };
  } else {
    // After 6:00 PM
    const isSunday = weekdayPart === 'Sun';
    return {
      isOpen: false,
      status: 'closed_after',
      badgeTitle: 'Tutup Sekarang',
      badgeSubtext: isSunday ? 'Buka semula hari Selasa jam 7.00 pagi (Isnin Cuti)' : 'Buka semula esok jam 7.00 pagi',
      hoursLabel,
      isMonday: false,
      nextOpenText: isSunday ? 'Buka hari Selasa jam 7.00 pagi' : 'Buka semula esok jam 7.00 pagi',
    };
  }
}
