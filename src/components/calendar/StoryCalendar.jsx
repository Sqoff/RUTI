import { format, addMonths, subMonths, startOfMonth, endOfMonth, startOfWeek, endOfWeek, isSameMonth, isSameDay, addDays } from 'date-fns';
import { ko } from 'date-fns/locale';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { HapticService } from '../../services/hapticService';

export function StoryCalendar({
  currentMonth,
  setCurrentMonth,
  selectedDate,
  onSelectDate,
  workoutDates = []
}) {
  const nextMonth = () => {
    HapticService.light();
    setCurrentMonth(addMonths(currentMonth, 1));
  };

  const prevMonth = () => {
    HapticService.light();
    setCurrentMonth(subMonths(currentMonth, 1));
  };

  // Generate 7x5 or 7x6 Calendar Grid
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart, { weekStarts: 0 });
  const endDate = endOfWeek(monthEnd, { weekStarts: 0 });

  const days = [];
  let day = startDate;

  while (day <= endDate) {
    for (let i = 0; i < 7; i++) {
      const cloneDay = day;
      const formattedDate = format(cloneDay, 'd');
      const dateStr = format(cloneDay, 'yyyy-MM-dd');
      const isCurrentMonth = isSameMonth(cloneDay, monthStart);
      const isToday = isSameDay(cloneDay, new Date());
      const isSelected = isSameDay(cloneDay, selectedDate);
      const hasWorkout = workoutDates.includes(dateStr);

      let cellClass = 'cal-day-cell';
      if (!isCurrentMonth) cellClass += ' other-month';
      if (isSelected) cellClass += ' selected';
      if (isToday && !isSelected) cellClass += ' today';

      days.push(
        <div
          key={cloneDay.toString()}
          className={cellClass}
          onClick={() => {
            HapticService.light();
            onSelectDate(cloneDay);
          }}
        >
          <span className="cal-day-num">{formattedDate}</span>
          {hasWorkout && <div className="cal-event-dot" />}
        </div>
      );
      day = addDays(day, 1);
    }
  }

  const weekDayLabels = ['일', '월', '화', '수', '목', '금', '토'];

  return (
    <section className="athletic-calendar-card">
      <div className="cal-nav-header">
        <h2 className="cal-current-month-title">
          {format(currentMonth, 'yyyy년 M월', { locale: ko })}
        </h2>
        <div className="cal-nav-btns">
          <button className="cal-arrow-btn" onClick={prevMonth} aria-label="이전 달">
            <ChevronLeft size={18} />
          </button>
          <button className="cal-arrow-btn" onClick={nextMonth} aria-label="다음 달">
            <ChevronRight size={18} />
          </button>
        </div>
      </div>

      <div className="cal-weekdays-row">
        {weekDayLabels.map((d, i) => (
          <div key={i} className="cal-weekday-label">
            {d}
          </div>
        ))}
      </div>

      <div className="cal-days-grid">{days}</div>
    </section>
  );
}
