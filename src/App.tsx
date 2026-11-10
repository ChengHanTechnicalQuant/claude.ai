import { useEffect, useMemo, useRef, useState } from 'react';
import { CalendarSheet } from './components/CalendarSheet';
import { EditSheet } from './components/EditSheet';
import { CalendarIcon, GearIcon, PlusIcon } from './components/Icons';
import { Notes } from './components/Notes';
import type { SwipeAction } from './components/SwipeRow';
import { TagBar } from './components/TagBar';
import { TaskCard } from './components/TaskCard';
import { Toast } from './components/Toast';
import { WeekStrip } from './components/WeekStrip';
import { commit } from './db/changes';
import { db } from './db/db';
import { addNote, rolloverDb } from './db/maintenance';
import { useLive } from './db/useLive';
import * as A from './lib/actions';
import type { Action, Changes } from './lib/changes';
import { rangeText, weekDates } from './lib/dates';
import { formFromTask, newForm, type EditorForm } from './lib/editor';
import { newId } from './lib/id';
import { hasContent, visibleNotes, visibleTasks } from './lib/sort';
import { useToday } from './lib/useToday';
import type { Note, Tag, Task } from './types';

const BLUE = '#2E4A6B';
const GREY = '#6F6A60';
const RED = '#A4554B';
const TOAST_MS = 4000;

export default function App() {
  const tasks = useLive(() => db.tasks.toArray());
  const notes = useLive(() => db.notes.toArray());
  const today = useToday();
  const [day, setDay] = useState(today);
  const [tag, setTag] = useState<Tag>('全部');
  const [openId, setOpenId] = useState<string | null>(null);
  const [form, setForm] = useState<EditorForm | null>(null);
  const [calOpen, setCalOpen] = useState(false);
  const [toast, setToast] = useState<{ text: string; undo: Changes } | null>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout>>(undefined);

  // 跨日（或回到前景發現已經過了午夜）：沒做完的延到今天；原本停在「今天」的就跟著換到新的一天
  const prevToday = useRef(today);
  useEffect(() => {
    const prev = prevToday.current;
    prevToday.current = today;
    void rolloverDb(db, today);
    if (prev !== today) setDay((d) => (d === prev ? today : d));
  }, [today]);

  const marks = useMemo(() => {
    const s = new Set<string>();
    if (tasks && notes) for (const iso of weekDates(day)) if (hasContent(iso, tasks, notes)) s.add(iso);
    return s;
  }, [tasks, notes, day]);

  if (!tasks || !notes) return <div className="app" />;

  const showToast = (text: string, undo: Changes) => {
    clearTimeout(toastTimer.current);
    setToast({ text, undo });
    toastTimer.current = setTimeout(() => setToast(null), TOAST_MS);
  };

  /** 執行一個動作，並出現可以復原的提示（一次只保留最近一個） */
  const run = async (a: Action) => {
    setOpenId(null);
    const undo = await commit(db, a.changes);
    showToast(a.message, undo);
  };

  const undo = async () => {
    if (!toast) return;
    clearTimeout(toastTimer.current);
    const inverse = toast.undo;
    setToast(null);
    setOpenId(null);
    await commit(db, inverse);
  };

  const taskActions = (t: Task): SwipeAction[] =>
    t.done
      ? [
          { label: '恢復', color: BLUE, run: () => run(A.restoreTask(t, Date.now())) },
          { label: '刪除', color: RED, run: () => run(A.deleteTask(t, Date.now())) },
        ]
      : [
          { label: '完成', color: BLUE, run: () => run(A.completeTask(t, Date.now())) },
          { label: '延後', color: GREY, run: () => run(A.delayTask(t, Date.now())) },
          { label: '刪除', color: RED, run: () => run(A.deleteTask(t, Date.now())) },
        ];

  const noteActions = (n: Note): SwipeAction[] => [
    { label: '轉待辦', color: BLUE, run: () => run(A.noteToTask(n, Date.now(), newId())) },
    { label: '延後', color: GREY, run: () => run(A.delayNote(n, Date.now())) },
    { label: '刪除', color: RED, run: () => run(A.deleteNote(n, Date.now())) },
  ];

  const save = () => {
    if (!form) return;
    const existing = form.id ? tasks.find((t) => t.id === form.id) : undefined;
    const action = A.saveForm(form, existing, Date.now(), newId());
    if (!action) return;
    setForm(null);
    void run(action);
  };

  const pickDay = (iso: string) => {
    setDay(iso);
    setOpenId(null);
  };

  const shown = visibleTasks(tasks, day, tag);
  const dayNotes = visibleNotes(notes, day);

  return (
    <div
      className="app"
      // 點到打開的那一列以外的地方，就收合
      onPointerDownCapture={(e) => {
        if (!openId) return;
        const inside = (e.target as HTMLElement).closest(`[data-swipe-id="${CSS.escape(openId)}"]`);
        if (!inside) setOpenId(null);
      }}
    >
      <header className="header">
        <button type="button" className="gear" aria-label="設定">
          <GearIcon />
        </button>
        <span className="range">{rangeText(day)}</span>
      </header>

      <WeekStrip day={day} marks={marks} onPick={pickDay} />
      <TagBar tag={tag} onPick={(t) => { setTag(t); setOpenId(null); }} />

      <main className="main">
        {shown.map((t) => (
          <TaskCard
            key={t.id}
            task={t}
            open={openId === t.id}
            anyOpen={openId !== null}
            actions={taskActions(t)}
            onOpenChange={setOpenId}
            onEdit={() => setForm(formFromTask(t))}
          />
        ))}
        {shown.length === 0 && <p className="empty">這天這類沒有安排，留點空白也很好。</p>}
        <Notes
          notes={dayNotes}
          openId={openId}
          actionsFor={noteActions}
          onOpenChange={setOpenId}
          onAdd={(text) => addNote(db, day, text)}
        />
      </main>

      <div className="bottom">
        <button type="button" className="btn-new" onClick={() => { setOpenId(null); setForm(newForm(day)); }}>
          <PlusIcon />
          新增事項
        </button>
        <button type="button" className="btn-cal" aria-label="月曆檢視" onClick={() => { setOpenId(null); setCalOpen(true); }}>
          <CalendarIcon />
        </button>
      </div>

      {toast && <Toast text={toast.text} onUndo={undo} />}

      {form && (
        <EditSheet
          form={form}
          today={today}
          onChange={(patch) => setForm((f) => (f ? { ...f, ...patch } : f))}
          onCancel={() => setForm(null)}
          onSave={save}
        />
      )}

      {calOpen && (
        <CalendarSheet
          day={day}
          today={today}
          marks={(iso) => hasContent(iso, tasks, notes)}
          onPick={(iso) => { pickDay(iso); setCalOpen(false); }}
          onToday={() => { pickDay(today); setCalOpen(false); }}
          onClose={() => setCalOpen(false)}
        />
      )}
    </div>
  );
}
