import { WEEKDAYS_MON, weekDates } from '../lib/dates';

interface Props {
  day: string;
  marks: Set<string>; // 有小點的日子
  onPick: (iso: string) => void;
}

export function WeekStrip({ day, marks, onPick }: Props) {
  return (
    <div className="week" role="group" aria-label="選擇日期">
      {weekDates(day).map((iso, i) => (
        <button
          key={iso}
          type="button"
          className={'day' + (marks.has(iso) ? ' has' : '')}
          aria-pressed={iso === day}
          onClick={() => onPick(iso)}
        >
          <span className="wk">{WEEKDAYS_MON[i]}</span>
          <span className="n">{Number(iso.slice(8))}</span>
          <span className="dot" />
        </button>
      ))}
    </div>
  );
}
