import React, { useState } from 'react';
import { 
  ChevronLeft, 
  ChevronRight, 
  Calendar as CalendarIcon, 
  CheckCircle2, 
  Clock, 
  Sparkles,
  AlertCircle
} from 'lucide-react';

interface OperatingDateOption {
  dateStr: string;
  displayLabel: string;
  dayName: string;
  relativeTag: string;
  isTomorrow: boolean;
  isDayAfterTomorrow: boolean;
}

interface InteractiveDeliveryCalendarProps {
  selectedDate: string;
  minDateStr: string;
  isCutoffPassed: boolean;
  availableQuickDates: OperatingDateOption[];
  onSelectDate: (dateStr: string) => void;
}

const MONTH_NAMES_BM = [
  'Januari', 'Februari', 'Mac', 'April', 'Mei', 'Jun',
  'Julai', 'Ogos', 'September', 'Oktober', 'November', 'Disember'
];

const DAY_NAMES_SHORT = ['Ahd', 'Isn', 'Sel', 'Rab', 'Kha', 'Jum', 'Sab'];
const DAY_NAMES_FULL = ['Ahad', 'Isnin', 'Selasa', 'Rabu', 'Khamis', 'Jumaat', 'Sabtu'];

export const InteractiveDeliveryCalendar: React.FC<InteractiveDeliveryCalendarProps> = ({
  selectedDate,
  minDateStr,
  isCutoffPassed,
  availableQuickDates,
  onSelectDate,
}) => {
  // Parse initial view month from selected date or minDateStr
  const initialDate = selectedDate ? new Date(selectedDate + 'T00:00:00') : new Date(minDateStr + 'T00:00:00');
  
  const [currentMonthDate, setCurrentMonthDate] = useState<Date>(
    new Date(initialDate.getFullYear(), initialDate.getMonth(), 1)
  );
  const [hoveredDate, setHoveredDate] = useState<string | null>(null);

  const year = currentMonthDate.getFullYear();
  const month = currentMonthDate.getMonth();

  // Days in current month
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  // First day offset (0 = Sunday, 1 = Monday, ...)
  const firstDayIndex = new Date(year, month, 1).getDay();

  // Min and Max navigation limit (allow up to 2 months in advance)
  const today = new Date();
  const currentRealMonth = new Date(today.getFullYear(), today.getMonth(), 1);
  const maxMonth = new Date(today.getFullYear(), today.getMonth() + 2, 1);

  const canGoPrev = currentMonthDate > currentRealMonth;
  const canGoNext = currentMonthDate < maxMonth;

  const handlePrevMonth = () => {
    if (canGoPrev) {
      setCurrentMonthDate(new Date(year, month - 1, 1));
    }
  };

  const handleNextMonth = () => {
    if (canGoNext) {
      setCurrentMonthDate(new Date(year, month + 1, 1));
    }
  };

  const formatFullDateBM = (dateStr: string) => {
    if (!dateStr) return '';
    const d = new Date(dateStr + 'T00:00:00');
    const dayName = DAY_NAMES_FULL[d.getDay()];
    const dayNum = d.getDate();
    const monthName = MONTH_NAMES_BM[d.getMonth()];
    const yr = d.getFullYear();
    return `${dayName}, ${dayNum} ${monthName} ${yr}`;
  };

  // Build grid of days
  const calendarDays = [];
  // 1. Empty padding cells
  for (let i = 0; i < firstDayIndex; i++) {
    calendarDays.push({ key: `pad-${i}`, isEmpty: true });
  }

  // 2. Month dates
  for (let day = 1; day <= daysInMonth; day++) {
    const dayDate = new Date(year, month, day);
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    const dayOfWeek = dayDate.getDay();
    const isMonday = dayOfWeek === 1;

    // Check availability
    // Past dates and today are disabled
    const isPastOrToday = dateStr < minDateStr;
    const isBeforeEarliestCutoff = dateStr < minDateStr;
    const isSelectable = !isMonday && !isBeforeEarliestCutoff;
    const isSelected = selectedDate === dateStr;

    // Special labels
    let badgeText = '';
    if (isMonday) {
      badgeText = 'Isnin Tutup';
    } else if (dateStr === minDateStr) {
      badgeText = isCutoffPassed ? 'Lusa (Awal)' : 'Esok (Awal)';
    }

    calendarDays.push({
      key: dateStr,
      isEmpty: false,
      dayNumber: day,
      dateStr,
      dayOfWeek,
      isMonday,
      isPastOrToday,
      isSelectable,
      isSelected,
      badgeText,
    });
  }

  return (
    <div className="rounded-2xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-900/90 overflow-hidden shadow-xs">
      
      {/* Calendar Header Navigation */}
      <div className="p-3.5 bg-stone-50 dark:bg-stone-800/80 border-b border-stone-200 dark:border-stone-700 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-emerald-600 dark:bg-emerald-500 text-white flex items-center justify-center shrink-0 shadow-xs">
            <CalendarIcon className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs sm:text-sm font-black text-stone-900 dark:text-white capitalize">
              {MONTH_NAMES_BM[month]} {year}
            </h4>
            <span className="text-[10px] text-stone-500 dark:text-stone-400 block -mt-0.5">
              Pilih tarikh penghantaran / pengambilan
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={handlePrevMonth}
            disabled={!canGoPrev}
            className="p-1.5 rounded-lg border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-900 text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
            title="Bulan Sebelumnya"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={handleNextMonth}
            disabled={!canGoNext}
            className="p-1.5 rounded-lg border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-900 text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
            title="Bulan Seterusnya"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Weekday Names Header */}
      <div className="grid grid-cols-7 border-b border-stone-200 dark:border-stone-700/80 bg-stone-100/60 dark:bg-stone-800/40 text-center py-2 text-[11px] font-extrabold text-stone-600 dark:text-stone-400">
        {DAY_NAMES_SHORT.map((dayName, idx) => (
          <div key={dayName} className={idx === 1 ? 'text-rose-600 dark:text-rose-400' : ''}>
            {dayName}
          </div>
        ))}
      </div>

      {/* Interactive Month Grid */}
      <div className="p-2.5 grid grid-cols-7 gap-1.5 sm:gap-2">
        {calendarDays.map((cell) => {
          if (cell.isEmpty) {
            return <div key={cell.key} className="h-14 sm:h-16 rounded-xl bg-transparent" />;
          }

          const isSelected = cell.isSelected;
          const isSelectable = cell.isSelectable;
          const isMonday = cell.isMonday;
          const isEarliest = cell.dateStr === minDateStr;

          return (
            <button
              key={cell.key}
              type="button"
              disabled={!isSelectable}
              onClick={() => {
                if (isSelectable && cell.dateStr) {
                  onSelectDate(cell.dateStr);
                }
              }}
              onMouseEnter={() => cell.dateStr && setHoveredDate(cell.dateStr)}
              onMouseLeave={() => setHoveredDate(null)}
              className={`h-14 sm:h-16 rounded-xl p-1 flex flex-col justify-between items-center text-center transition-all relative ${
                isSelected
                  ? 'bg-emerald-600 text-white font-black shadow-md ring-2 ring-emerald-500/40 scale-[1.02] z-10'
                  : isSelectable
                  ? 'bg-stone-50 dark:bg-stone-800/70 hover:bg-emerald-50 dark:hover:bg-emerald-950/50 hover:border-emerald-500 border border-stone-200 dark:border-stone-700/70 text-stone-800 dark:text-stone-200 cursor-pointer'
                  : isMonday
                  ? 'bg-rose-50/50 dark:bg-rose-950/20 border border-rose-200/50 dark:border-rose-900/30 text-stone-400 dark:text-stone-600 cursor-not-allowed opacity-60'
                  : 'bg-stone-100/40 dark:bg-stone-900/30 border border-stone-200/30 dark:border-stone-800/30 text-stone-400 dark:text-stone-600 cursor-not-allowed opacity-40'
              }`}
            >
              <div className="w-full flex items-center justify-between px-1">
                <span className={`text-xs sm:text-sm font-extrabold ${isSelected ? 'text-white' : ''}`}>
                  {cell.dayNumber}
                </span>
                {isSelected && (
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-200 shrink-0" />
                )}
              </div>

              {/* Status or Tag on the cell */}
              <div className="w-full">
                {isMonday ? (
                  <span className="text-[9px] font-bold text-rose-600 dark:text-rose-400 block truncate">
                    Tutup
                  </span>
                ) : isEarliest ? (
                  <span className={`text-[8px] sm:text-[9px] font-bold px-1 py-0.2 rounded-sm block truncate ${
                    isSelected 
                      ? 'bg-emerald-800 text-emerald-100' 
                      : 'bg-amber-100 dark:bg-amber-950 text-amber-900 dark:text-amber-200 border border-amber-300 dark:border-amber-800'
                  }`}>
                    {isCutoffPassed ? 'Lusa' : 'Esok'}
                  </span>
                ) : isSelectable ? (
                  <span className={`text-[8px] font-medium block truncate ${isSelected ? 'text-emerald-100' : 'text-stone-400 dark:text-stone-500'}`}>
                    Dibuka
                  </span>
                ) : (
                  <span className="text-[8px] text-stone-400 dark:text-stone-600 block">
                    -
                  </span>
                )}
              </div>
            </button>
          );
        })}
      </div>

      {/* Quick Select Buttons below calendar */}
      <div className="p-3 bg-stone-50/80 dark:bg-stone-800/50 border-t border-stone-200 dark:border-stone-700/80 space-y-2.5">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold text-stone-600 dark:text-stone-300">
            Pilihan Pantas (Slot Terdekat):
          </span>
          <span className="text-[10px] text-emerald-700 dark:text-emerald-400 font-semibold flex items-center gap-1">
            <Sparkles className="w-3 h-3" />
            Sembelih & Hantar Segar Pagi
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {availableQuickDates.map((q, idx) => {
            const isSelected = selectedDate === q.dateStr;
            return (
              <button
                key={q.dateStr}
                type="button"
                onClick={() => onSelectDate(q.dateStr)}
                className={`p-2 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                  isSelected
                    ? 'border-emerald-600 bg-emerald-600 text-white font-bold shadow-xs'
                    : 'border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-900 hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-800 dark:text-stone-200'
                }`}
              >
                <div className="flex items-center justify-between gap-1">
                  <span className="text-[11px] font-extrabold truncate">{q.displayLabel}</span>
                  {q.relativeTag && (
                    <span className={`text-[8px] font-bold px-1 py-0.2 rounded-sm shrink-0 ${
                      isSelected
                        ? 'bg-emerald-800 text-white'
                        : idx === 0
                        ? 'bg-amber-200 dark:bg-amber-900 text-amber-900 dark:text-amber-100'
                        : 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300'
                    }`}>
                      {q.relativeTag}
                    </span>
                  )}
                </div>
                <span className={`text-[9px] mt-0.5 ${isSelected ? 'text-emerald-100' : 'text-stone-400'}`}>
                  {q.dayName}
                </span>
              </button>
            );
          })}
        </div>

        {/* Selected Date Summary Display */}
        <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <div className="text-xs text-stone-800 dark:text-stone-200">
              <span className="text-[10px] text-emerald-800 dark:text-emerald-400 font-bold block uppercase tracking-wider">
                Tarikh Penghantaran Dipilih:
              </span>
              <strong className="text-stone-900 dark:text-white font-extrabold text-xs sm:text-sm">
                {formatFullDateBM(selectedDate)}
              </strong>
            </div>
          </div>
          <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-emerald-600 text-white shrink-0">
            Ayam Segar Pagi
          </span>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap items-center gap-3 pt-1 text-[10px] text-stone-500 dark:text-stone-400">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-sm bg-emerald-600 inline-block" />
            <span>Tarikh Dipilih</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-sm bg-stone-100 dark:bg-stone-800 border border-stone-300 dark:border-stone-700 inline-block" />
            <span>Dibuka (Selasa - Ahad)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-sm bg-rose-200 dark:bg-rose-900/50 inline-block" />
            <span>Isnin (Pasar Tutup)</span>
          </div>
        </div>

      </div>

    </div>
  );
};
