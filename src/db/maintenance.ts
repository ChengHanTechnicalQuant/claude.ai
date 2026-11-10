import { addDays } from '../lib/dates';
import { newId } from '../lib/id';
import { planRollover } from '../lib/rollover';
import type { Note, Task } from '../types';
import type { AppDB } from './db';

export const PURGE_AFTER_MS = 14 * 24 * 60 * 60 * 1000;

/** 軟刪除超過 14 天就該真正清掉 */
export function isExpired(deletedAt: number | undefined, now: number): boolean {
  return deletedAt !== undefined && now - deletedAt > PURGE_AFTER_MS;
}

export async function purgeExpired(db: AppDB, now: number = Date.now()): Promise<void> {
  const tasks = await db.tasks.toArray();
  const notes = await db.notes.toArray();
  await db.tasks.bulkDelete(tasks.filter((t) => isExpired(t.deletedAt, now)).map((t) => t.id));
  await db.notes.bulkDelete(notes.filter((n) => isExpired(n.deletedAt, now)).map((n) => n.id));
  await db.firedReminders.where('firedAt').below(now - PURGE_AFTER_MS).delete();
}

/** 範例資料：日期都相對於「今天」，每次第一次開啟才放一次 */
export function buildSampleData(today: string, now: number): { tasks: Task[]; notes: Note[] } {
  const base = { done: false, delayDays: 0, createdAt: now, updatedAt: now };
  const mk = (
    n: number,
    offset: number,
    time: Task['time'],
    category: Task['category'],
    title: string,
    note: string,
    extra: Partial<Task> = {},
  ): Task => ({
    ...base,
    id: newId(),
    date: addDays(today, offset),
    time,
    category,
    title,
    note,
    createdAt: now + n, // 讓同時間的事項保持固定順序
    ...extra,
  });
  const doneAt = { done: true, doneAt: now };
  const tasks: Task[] = [
    mk(1, -1, '10:00', '會議', '週一部門會議', '確認本週優先順序', doneAt),
    mk(2, -1, '16:00', '待辦', '更新專案進度表', '', doneAt),
    mk(3, 0, '09:30', '會議', '晨會', '準備上週進度三點', doneAt),
    mk(4, 0, '12:00', '待辦', '廠商報價', '已寄出，等對方回覆修改後的價格', { delayDays: 1 }),
    mk(5, 0, '14:00', '會議', '與設計組對稿', '會議室 B，帶上週的版面稿'),
    mk(6, 0, '下午', '待辦', '整理 Q4 預算表', '寄給主管過目'),
    mk(7, 0, '18:30', '私人', '幫家人訂週末餐廳', '週六晚上，四個人'),
    mk(8, 1, '', '待辦', '法務合約審閱', '週三前沒回就再追一次'),
    mk(9, 3, '15:00', '待辦', '週報', '本週完成事項與下週計畫'),
  ];
  const at = (h: number, m: number) => {
    const [y, mo, d] = today.split('-').map(Number);
    return new Date(y, mo - 1, d, h, m).getTime();
  };
  const notes: Note[] = [
    { id: newId(), date: today, text: '影印機碳粉快沒了，下午記得跟總務說。', createdAt: at(8, 52), updatedAt: at(8, 52) },
    { id: newId(), date: today, text: '新版合約範本放在共用資料夾的「法務」裡。', createdAt: at(10, 15), updatedAt: at(10, 15) },
  ];
  return { tasks, notes };
}

const SEEDED = 'seeded';

export async function seedIfFirstRun(db: AppDB, today: string, now: number = Date.now()): Promise<boolean> {
  return db.transaction('rw', db.tasks, db.notes, db.kv, async () => {
    if (await db.kv.get(SEEDED)) return false;
    const { tasks, notes } = buildSampleData(today, now);
    await db.tasks.bulkAdd(tasks);
    await db.notes.bulkAdd(notes);
    await db.kv.put({ key: SEEDED, value: true });
    return true;
  });
}

export async function addNote(db: AppDB, date: string, text: string, now: number = Date.now()): Promise<void> {
  await db.notes.add({ id: newId(), date, text, createdAt: now, updatedAt: now });
}

/** 沒做完自動延到今天（每次打開 App、日期跨過午夜時呼叫）。回傳被移動的事項數。 */
export async function rolloverDb(db: AppDB, today: string, now: number = Date.now()): Promise<number> {
  return db.transaction('rw', db.tasks, async () => {
    const changed = planRollover(await db.tasks.toArray(), today, now);
    if (changed.length) await db.tasks.bulkPut(changed);
    return changed.length;
  });
}
