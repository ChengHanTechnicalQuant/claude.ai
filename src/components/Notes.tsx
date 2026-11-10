import { useState } from 'react';
import { formatHM } from '../lib/dates';
import type { Note } from '../types';

interface Props {
  notes: Note[];
  onAdd: (text: string) => void;
}

export function Notes({ notes, onAdd }: Props) {
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
          <div className="note-row" key={n.id}>
            <p>{n.text}</p>
            <span className="at">{formatHM(n.createdAt)}</span>
          </div>
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
