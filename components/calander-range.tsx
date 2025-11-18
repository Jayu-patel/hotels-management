"use client";
import { useEffect, useState } from "react";
import {
  addMonths,
  subMonths,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  format,
  isBefore,
  isSameDay,
  isWithinInterval,
} from "date-fns";
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from "lucide-react";
import { DateRange } from "react-day-picker";

interface CalendarRangeProps {
    onChange?: (range: { from: Date | undefined; to: Date | undefined }) => void;
    dates: DateRange | undefined;
    setDates: React.Dispatch<React.SetStateAction<DateRange | undefined>>;
}

export function CalendarRange({ dates, setDates }: CalendarRangeProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [dateRange, setDateRange] = useState<{ from: Date | undefined; to: Date | undefined }>({
    from: dates?.from,
    to: dates?.to,
  });

  const [selecting, setSelecting] = useState<"start" | "end">("start");

  const goPrev = () => setCurrentMonth((m) => startOfMonth(subMonths(m, 1)));
  const goNext = () => setCurrentMonth((m) => startOfMonth(addMonths(m, 1)));

  const prevMonthStart = startOfMonth(subMonths(currentMonth, 1));
  const todayMonthStart = startOfMonth(new Date());

  const disablePrev = isBefore(prevMonthStart, todayMonthStart);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  function getDaysForMonth(month: Date) {
    const start = startOfMonth(month);
    const end = endOfMonth(month);
    return eachDayOfInterval({ start, end });
  }

  const months = [currentMonth, addMonths(currentMonth, 1)];

  function normalizeDay(day: Date) {
    const d = new Date(day);
    d.setHours(0, 0, 0, 0);
    return d;
  }

//   function handleSelect(day: Date) {
//     if (isBefore(day, today)) return;

//     const { from, to } = dateRange;

//     if (!from || selecting === "start") {
//       const newRange = { from: day, to: undefined };
//       setDateRange(newRange);
//       setDates(newRange)
//       setSelecting("end");
//       return;
//     }

//     if (selecting === "end") {
//       let newRange;
//       if (isBefore(day, from)) {
//         newRange = { from: day, to: from };
//       } else if (isSameDay(day, from)) {
//         newRange = { from: day, to: undefined };
//         setSelecting("start");
//         setDateRange(newRange);
//         setDates(newRange)
//         return;
//       } else {
//         newRange = { from, to: day };
//       }

//       setDateRange(newRange);
//       setDates(newRange)
//       setSelecting("start");
//     }
//   }

    // function handleSelect(day: Date) {
    //     if (isBefore(day, today)) return;

    //     const { from, to } = dateRange;

    //     // Start fresh if starting new range
    //     if (!from || selecting === "start") {
    //         const newRange = { from: day, to: undefined };
    //         setDateRange(newRange);
    //         setSelecting("end");
    //         console.log("lol", newRange)
    //         return; // don't call parent yet
    //     }

    //     // Second click (select end)
    //     if (selecting === "end") {
    //         let newRange;

    //         if (isBefore(day, from)) {
    //             newRange = { from: day, to: from };
    //         } else if (isSameDay(day, from)) {
    //         // Same date clicked again -> restart
    //             setSelecting("start");
    //             setDateRange({ from: day, to: undefined });
    //             return;
    //         } else {
    //             newRange = { from, to: day };
    //         }

    //         setDateRange(newRange);
    //         setSelecting("start");

    //         // ✅ Only now we notify parent (valid range)
    //         setDates?.(newRange);

    //         console.log("lol", newRange)
    //     }
    // }

  function handleSelect(day: Date) {
    const dayMidnight = normalizeDay(day);  // <-- normalize

    if (isBefore(dayMidnight, today)) return;

    const { from, to } = dateRange;

    if (!from || selecting === "start") {
        const newRange = { from: dayMidnight, to: undefined };
        setDateRange(newRange);
        setSelecting("end");
        return;
    }

    if (selecting === "end") {
        let newRange;

        if (isBefore(dayMidnight, from)) {
          newRange = { from: dayMidnight, to: from };
        } 
        else if (isSameDay(dayMidnight, from)) {
          setSelecting("start");
          setDateRange({ from: dayMidnight, to: undefined });
          return;
        } else {
          newRange = { from, to: dayMidnight };
        }
        
        setDateRange(newRange);
        setSelecting("start");
        setDates?.(newRange);
    }
  }


  return (
    <div className="p-5 border rounded-xl bg-white w-fit shadow-sm">
      <div className="flex justify-between items-center mb-3">
        <button
          onClick={goPrev}
          className="p-2 rounded-lg border hover:bg-gray-100 disabled:opacity-40 transition"
          disabled={disablePrev}
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2 text-lg font-semibold">
          <CalendarIcon className="w-5 h-5 text-blue-500" />
          Select Dates
        </div>

        <button
          onClick={goNext}
          className="p-2 rounded-lg border hover:bg-gray-100 transition"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      <div className="flex gap-8">
        {months.map((month, i) => {
          const days = getDaysForMonth(month);
          return (
            <div key={i} className="text-center">
              <div className="font-medium mb-1">{format(month, "MMMM yyyy")}</div>
              <div className="grid grid-cols-7 text-xs text-gray-500 mb-1">
                {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((d) => (
                  <div key={d}>{d}</div>
                ))}
              </div>

              <div className="grid grid-cols-7 gap-1">
                {days.map((day) => {
                  const selected =
                    (dateRange.from && isSameDay(day, dateRange.from)) ||
                    (dateRange.to && isSameDay(day, dateRange.to));
                  const inRange =
                    dateRange.from &&
                    dateRange.to &&
                    isWithinInterval(day, { start: dateRange.from, end: dateRange.to });
                  const disabled = isBefore(day, today);

                  return (
                    <button
                      key={day.toISOString()}
                      onClick={() => handleSelect(day)}
                      disabled={disabled}
                      className={`p-2 rounded-md text-sm transition ${
                        selected
                          ? "bg-blue-500 text-white"
                          : inRange
                          ? "bg-blue-100"
                          : disabled
                          ? "text-gray-300"
                          : "hover:bg-gray-100"
                      }`}
                    >
                      {format(day, "d")}
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      <div className="flex justify-between items-center mt-4 text-sm text-gray-700">
        <div>
          <span className="font-medium">Check-in:</span>{" "}
          {dateRange.from ? format(dateRange.from, "dd MMM yyyy") : "--"}
        </div>
        <div>
          <span className="font-medium">Check-out:</span>{" "}
          {dateRange.to ? format(dateRange.to, "dd MMM yyyy") : "--"}
        </div>
      </div>
    </div>
  );
}
