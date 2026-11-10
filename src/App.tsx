import { useMemo, useState } from 'react';
import { CalendarIcon, GearIcon, PlusIcon } from './components/Icons';
import { Notes } from './components/Notes';
import { TagBar } from './components/TagBar';
import { TaskCard } from './components/TaskCard';
import { WeekStrip } from './components/WeekStrip';
import { db } from './db/db';
import { addNote } from './db/maintenance';
import { useLive } from './db/useLive';
import { rangeText, todayISO, weekDates } from './lib/dates';
import { hasContent, visibleNotes, visibleTasks } from './lib/sort';
import type { Tag } from './types';

export default function App() {
  const tasks = useLive(() => db.tasks.toArray());
  const notes = useLive(() => db.notes.toArray());
  const [day, setDay] = useState(() => todayISO());
  const [tag, setTag] = useState<Tag>('全部');

  const marks = useMemo(() => {
    const s = new Set<string>();
    if (tasks && notes) for (const iso of weekDates(day)) if (hasContent(iso, tasks, notes)) s.add(iso);
    return s;
  }, [tasks, notes, day]);

  if (!tasks || !notes) return <div className="app" />;

  const shown = visibleTasks(tasks, day, tag);
  const dayNotes = visibleNotes(notes, day);

  return (
    <div className="app">
      <header className="header">
        <button type="button" className="gear" aria-label="設定">
          <GearIcon />
        </button>
        <span className="range">{rangeText(day)}</span>
      </header>

      <WeekStrip day={day} marks={marks} onPick={setDay} />
      <TagBar tag={tag} onPick={setTag} />

      <main className="main">
        {shown.map((t) => (
          <TaskCard key={t.id} task={t} />
        ))}
        {shown.length === 0 && <p className="empty">這天這類沒有安排，留點空白也很好。</p>}
        <Notes notes={dayNotes} onAdd={(text) => addNote(db, day, text)} />
      </main>

      <div className="bottom">
        <button type="button" className="btn-new">
          <PlusIcon />
          新增事項
        </button>
        <button type="button" className="btn-cal" aria-label="月曆檢視">
          <CalendarIcon />
        </button>
      </div>
    </div>
  );
}
