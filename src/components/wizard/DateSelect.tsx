"use client";

/**
 * DateSelect — styled day/month/year selects that output an ISO "YYYY-MM-DD" string.
 * Replaces <input type="date"> so the UI fully inherits the site's design tokens
 * instead of the browser's native date picker popup.
 */

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

function daysInMonth(month: number, year: number): number {
  return new Date(year, month, 0).getDate();
}

interface DateSelectProps {
  value: string | null;       // "YYYY-MM-DD" or null
  onChange: (v: string | null) => void;
  min?: string;               // "YYYY-MM-DD" — dates before this are disabled
  id?: string;
}

export function DateSelect({ value, onChange, min, id }: DateSelectProps) {
  const today = new Date();
  const minDate = min ? new Date(min) : today;

  // Parse current value
  const [selYear, selMonth, selDay] = value
    ? value.split("-").map(Number)
    : [null, null, null];

  const currentYear = today.getFullYear();
  const years = Array.from({ length: 5 }, (_, i) => currentYear + i);

  const monthOptions = MONTHS.map((name, i) => ({ value: i + 1, label: name }));

  const maxDay = selYear && selMonth ? daysInMonth(selMonth, selYear) : 31;
  const days = Array.from({ length: maxDay }, (_, i) => i + 1);

  function emit(y: number | null, m: number | null, d: number | null) {
    if (!y || !m || !d) { onChange(null); return; }
    // Clamp day if month changed
    const max = daysInMonth(m, y);
    const clamped = Math.min(d, max);
    const iso = `${y}-${String(m).padStart(2, "0")}-${String(clamped).padStart(2, "0")}`;
    // Respect min date
    if (min && iso < min) { onChange(min); return; }
    onChange(iso);
  }

  const selectClass =
    "h-10 rounded-[var(--r-input)] border border-input bg-input px-2 py-1 text-sm outline-none " +
    "transition-[border-color,box-shadow] duration-[var(--dur-fast)] " +
    "focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/25 " +
    "disabled:opacity-40 cursor-pointer";

  return (
    <div className="flex gap-2" id={id}>
      {/* Day */}
      <select
        aria-label="Day"
        className={selectClass}
        style={{ flex: "1 1 0", minWidth: 0, color: selDay ? "var(--foreground)" : "var(--muted-foreground)" }}
        value={selDay ?? ""}
        onChange={(e) => emit(selYear, selMonth, e.target.value ? Number(e.target.value) : null)}
      >
        <option value="" disabled>Day</option>
        {days.map((d) => (
          <option key={d} value={d}>
            {String(d).padStart(2, "0")}
          </option>
        ))}
      </select>

      {/* Month */}
      <select
        aria-label="Month"
        className={selectClass}
        style={{ flex: "2 1 0", minWidth: 0, color: selMonth ? "var(--foreground)" : "var(--muted-foreground)" }}
        value={selMonth ?? ""}
        onChange={(e) => emit(selYear, e.target.value ? Number(e.target.value) : null, selDay)}
      >
        <option value="" disabled>Month</option>
        {monthOptions.map((m) => (
          <option key={m.value} value={m.value}>{m.label}</option>
        ))}
      </select>

      {/* Year */}
      <select
        aria-label="Year"
        className={selectClass}
        style={{ flex: "1.5 1 0", minWidth: 0, color: selYear ? "var(--foreground)" : "var(--muted-foreground)" }}
        value={selYear ?? ""}
        onChange={(e) => emit(e.target.value ? Number(e.target.value) : null, selMonth, selDay)}
      >
        <option value="" disabled>Year</option>
        {years.map((y) => (
          <option key={y} value={y}>{y}</option>
        ))}
      </select>
    </div>
  );
}
