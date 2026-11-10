import { useEffect } from 'react';
import { quickDates, type EditorForm, type TimeMode } from '../lib/editor';
import { CATEGORIES, type Category } from '../types';

interface Props {
  form: EditorForm;
  today: string;
  onChange: (patch: Partial<EditorForm>) => void;
  onCancel: () => void;
  onSave: () => void;
}

const TIME_CHIPS: [TimeMode, string][] = [['', '不設'], ['上午', '上午'], ['下午', '下午'], ['pick', '指定']];

export function EditSheet({ form, today, onChange, onCancel, onSave }: Props) {
  const quick = quickDates(today);
  const isQuick = quick.includes(form.date);
  const canSave = form.title.trim().length > 0;
  const isNew = form.mode === 'new';

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onCancel();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onCancel]);

  return (
    <div className="overlay">
      <button type="button" className="scrim" aria-label="關閉" onClick={onCancel} />
      <section className="sheet" role="dialog" aria-modal="true" aria-labelledby="sheet-title">
        <span className="grabber" aria-hidden="true" />
        <h2 id="sheet-title" className="sheet-title">{isNew ? '新增事項' : '編輯事項'}</h2>

        <div className="field">
          <label htmlFor="ed-title" className="field-label">事項</label>
          <input
            id="ed-title"
            className="text-input"
            value={form.title}
            onChange={(e) => onChange({ title: e.target.value })}
            placeholder="例如：與設計組對稿"
          />
        </div>

        <div className="field" role="group" aria-labelledby="ed-date-l">
          <span id="ed-date-l" className="field-label">日期</span>
          <div className="chips">
            {(['今天', '明天', '後天'] as const).map((label, i) => (
              <button key={label} type="button" className="chip" aria-pressed={form.date === quick[i]} onClick={() => onChange({ date: quick[i] })}>
                {label}
              </button>
            ))}
            <label htmlFor="ed-date" className="sr-only">選日期</label>
            <input
              id="ed-date"
              type="date"
              className={'chip date-chip' + (!isQuick ? ' on' : '')}
              value={form.date}
              onChange={(e) => e.target.value && onChange({ date: e.target.value })}
            />
          </div>
        </div>

        <div className="field" role="group" aria-labelledby="ed-time-l">
          <span id="ed-time-l" className="field-label">時間</span>
          <div className="chips">
            {TIME_CHIPS.map(([v, label]) => (
              <button key={label} type="button" className="chip" aria-pressed={form.timeMode === v} onClick={() => onChange({ timeMode: v })}>
                {label}
              </button>
            ))}
          </div>
          {form.timeMode === 'pick' && (
            <>
              <label htmlFor="ed-time" className="sr-only">指定時間</label>
              <input id="ed-time" type="time" className="text-input time-input" value={form.timeVal} onChange={(e) => onChange({ timeVal: e.target.value })} />
            </>
          )}
        </div>

        <div className="field" role="group" aria-labelledby="ed-cat-l">
          <span id="ed-cat-l" className="field-label">分類</span>
          <div className="chips">
            {CATEGORIES.map((c: Category) => (
              <button key={c} type="button" className="chip" aria-pressed={form.category === c} onClick={() => onChange({ category: c })}>
                {c}
              </button>
            ))}
          </div>
        </div>

        <div className="sheet-actions">
          <button type="button" className="btn-ghost" onClick={onCancel}>取消</button>
          <button type="button" className="btn-primary" disabled={!canSave} onClick={onSave}>
            {isNew ? '記下' : '儲存'}
          </button>
        </div>
      </section>
    </div>
  );
}
