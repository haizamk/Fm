import React, { useState } from 'react';
import { 
  Calendar as CalendarIcon, 
  CheckCircle2, 
  Clock, 
  Sparkles,
  AlertCircle,
  CalendarDays,
  ChevronDown
} from 'lucide-react';
import { OperatingDateOption, formatDeliveryDateBM, parseLocalDate, formatLocalDateStr } from '../utils/dateHelper';

interface DeliveryDateSelectorProps {
  selectedDate: string;
  minDateStr: string;
  isCutoffPassed: boolean;
  availableDates: OperatingDateOption[];
  onSelectDate: (dateStr: string) => void;
  fulfillmentType?: 'delivery' | 'pickup';
}

export const DeliveryDateSelector: React.FC<DeliveryDateSelectorProps> = ({
  selectedDate,
  minDateStr,
  isCutoffPassed,
  availableDates,
  onSelectDate,
  fulfillmentType = 'delivery',
}) => {
  const [showCustomDateInput, setShowCustomDateInput] = useState(false);
  const [customInputError, setCustomInputError] = useState<string | null>(null);

  // Maximum date allowed for scheduling (up to 30 days ahead)
  const maxDate = new Date();
  maxDate.setDate(maxDate.getDate() + 30);
  const maxDateStr = formatLocalDateStr(maxDate);

  const handleCustomDateChange = (val: string) => {
    if (!val) return;
    setCustomInputError(null);

    if (val < minDateStr) {
      setCustomInputError(
        isCutoffPassed
          ? 'Slot esok telah ditutup selepas jam 11:00 Malam. Tarikh paling awal ialah Lusa.'
          : 'Tarikh hari ini atau sebelum ini tidak dibuka untuk pesanan.'
      );
      return;
    }

    const d = parseLocalDate(val);
    if (d.getDay() === 1) {
      setCustomInputError('⚠️ Isnin pasar/kedai tutup. Sila pilih hari Selasa hingga Ahad.');
      return;
    }

    onSelectDate(val);
  };

  const isSelectedInAvailableList = availableDates.some((d) => d.dateStr === selectedDate);

  return (
    <div className="space-y-3">
      {/* 1. Header & Cut-off Context */}
      <div className="flex items-center justify-between">
        <label className="text-xs font-bold text-stone-700 dark:text-stone-300 flex items-center gap-1.5">
          <CalendarIcon className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
          <span>Pilih Tarikh {fulfillmentType === 'delivery' ? 'Penghantaran' : 'Pengambilan'}:</span>
        </label>
        
        <span className="text-[11px] font-semibold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 px-2 py-0.5 rounded-full inline-flex items-center gap-1">
          <Sparkles className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
          Sembelih & Hantar Segar
        </span>
      </div>

      {/* 2. Simple, Clear Date Cards (Up to 6 valid days: Tomorrow/Day After Tomorrow, excluding Mondays) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
        {availableDates.slice(0, 6).map((item, idx) => {
          const isSelected = selectedDate === item.dateStr;
          return (
            <button
              key={item.dateStr}
              type="button"
              onClick={() => {
                setCustomInputError(null);
                onSelectDate(item.dateStr);
              }}
              className={`p-3 rounded-2xl border-2 text-left transition-all cursor-pointer flex flex-col justify-between relative group ${
                isSelected
                  ? 'border-emerald-600 bg-emerald-50 dark:bg-emerald-950/50 shadow-md ring-2 ring-emerald-500/30'
                  : 'border-stone-200 dark:border-stone-700/80 bg-white dark:bg-stone-800/80 hover:border-emerald-400 hover:bg-stone-50 dark:hover:bg-stone-800'
              }`}
            >
              {/* Top relative tag & checkmark */}
              <div className="flex items-center justify-between gap-1 mb-1.5">
                {item.relativeTag ? (
                  <span
                    className={`text-[10px] font-black px-2 py-0.5 rounded-md ${
                      isSelected
                        ? 'bg-emerald-600 text-white shadow-xs'
                        : idx === 0
                        ? 'bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-200 border border-amber-300 dark:border-amber-800'
                        : 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300'
                    }`}
                  >
                    {item.relativeTag}
                  </span>
                ) : (
                  <span className="text-[10px] font-bold text-stone-500 dark:text-stone-400">
                    {item.dayName}
                  </span>
                )}

                <div
                  className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 transition-colors ${
                    isSelected
                      ? 'border-emerald-600 bg-emerald-600 text-white'
                      : 'border-stone-300 dark:border-stone-600 bg-white dark:bg-stone-700'
                  }`}
                >
                  {isSelected && <div className="w-1.5 h-1.5 bg-white rounded-full" />}
                </div>
              </div>

              {/* Main Day & Date display */}
              <div>
                <span className="block text-xs sm:text-sm font-extrabold text-stone-900 dark:text-white">
                  {item.displayLabel}
                </span>
                <span className="text-[10px] text-stone-500 dark:text-stone-400 mt-0.5 block">
                  Pagi Segar (7am - 12pm)
                </span>
              </div>
            </button>
          );
        })}
      </div>

      {/* 3. Selected Date Confirmation Banner */}
      <div className="p-3 rounded-2xl bg-emerald-600 text-white shadow-md flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center shrink-0 text-white">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-100 block">
              Tarikh Pilihan Anda:
            </span>
            <strong className="text-xs sm:text-sm font-extrabold block">
              {formatDeliveryDateBM(selectedDate, true)}
            </strong>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setShowCustomDateInput(!showCustomDateInput)}
          className="text-[11px] font-bold px-3 py-1.5 rounded-xl bg-white text-emerald-800 hover:bg-emerald-50 transition-colors shrink-0 flex items-center gap-1 cursor-pointer shadow-xs"
        >
          <CalendarDays className="w-3.5 h-3.5" />
          <span>{showCustomDateInput ? 'Tutup Pilihan Tarikh Lain' : 'Pilih Tarikh Lain'}</span>
        </button>
      </div>

      {/* 4. Optional Custom Date Input for planning in advance (clean dropdown/input without messy 1-month grid) */}
      {showCustomDateInput && (
        <div className="p-3.5 rounded-2xl bg-stone-50 dark:bg-stone-800/80 border border-stone-200 dark:border-stone-700 space-y-2 animate-fade-in">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-stone-800 dark:text-stone-200">
              Pilih Tarikh Tempahan Lain (Sehingga 30 hari ke hadapan):
            </label>
            <span className="text-[10px] text-rose-600 dark:text-rose-400 font-bold">
              * Isnin Tutup
            </span>
          </div>

          <div className="flex flex-col sm:flex-row gap-2">
            <input
              type="date"
              min={minDateStr}
              max={maxDateStr}
              value={selectedDate}
              onChange={(e) => handleCustomDateChange(e.target.value)}
              className="flex-1 bg-white dark:bg-stone-900 border border-stone-300 dark:border-stone-600 rounded-xl px-3 py-2 text-xs sm:text-sm text-stone-900 dark:text-white font-bold focus:border-emerald-500 focus:outline-hidden"
            />
            {!isSelectedInAvailableList && (
              <span className="self-center text-xs font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-950 px-3 py-2 rounded-xl border border-emerald-300 dark:border-emerald-800">
                ✓ {formatDeliveryDateBM(selectedDate, false)}
              </span>
            )}
          </div>

          {customInputError && (
            <div className="p-2 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs flex items-center gap-1.5">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{customInputError}</span>
            </div>
          )}
          
          <p className="text-[11px] text-stone-500 dark:text-stone-400">
            Tip: Pesanan diproses segar pada awal pagi tarikh yang dipilih. Pasar & ladang ditutup setiap hari Isnin.
          </p>
        </div>
      )}
    </div>
  );
};
