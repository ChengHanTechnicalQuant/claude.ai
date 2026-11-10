import { useState } from 'react';
import { formatHM } from '../lib/dates';
import type { Note } from '../types';
import { SwipeRow, type SwipeAction } from './SwipeRow';

interface Props {
  notes: Note[];
  openId: string | null;
  actionsFor: (n: Note) => SwipeAction[];
  onOpenChange: (id: string | null) => void;
  onAdd: (text: string) => void;
}

export function Notes({ notes, openId, actionsFor, onOpenChange, onAdd }: Props) {
  const [draft, setDraft] = useState('');
  const submit = () => {
    const text = draft.trim();
    if (!text) return;
    onAdd(text);
    setDraft('');
  };
  return (
    <section className="notes" aria-label="隨手記">
      <h2>隨手記</h2>
      <div className="notes-card">
        {notes.map((n) => (
          <SwipeRow
            key={n.id}
            id={n.id}
            open={openId === n.id}
            anyOpen={openId !== null}
            actions={actionsFor(n)}
            onOpenChange={onOpenChange}
            wrapClass="note-wrap"
            frontClass="note-row"
          >
            <p>{n.text}</p>
            <span className="at">{formatHM(n.createdAt)}</span>
          </SwipeRow>
        ))}
        <div className="note-input">
          <label htmlFor="note" className="sr-only">寫一則隨手記</label>
          <input
            id="note"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.nativeEvent.isComposing) submit();
            }}
            placeholder="想到什麼先記下來…"
            enterKeyHint="done"
          />
          <button type="button" onClick={submit}>記下</button>
        </div>
      </div>
    </section>
  );
}
