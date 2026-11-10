import 'fake-indexeddb/auto';
import { beforeEach, describe, expect, it } from 'vitest';
import { AppDB } from './db';
import { PURGE_AFTER_MS, addNote, buildSampleData, isExpired, purgeExpired, seedIfFirstRun } from './maintenance';

const DAY = 24 * 60 * 60 * 1000;
let db: AppDB;
let n = 0;
beforeEach(async () => {
  db = new AppDB('test-' + n++);
  await db.open();
});

describe('軟刪除清理', () => {
  it('超過 14 天才算過期', () => {
    const now = 1_000_000_000_000;
    expect(isExpired(undefined, now)).toBe(false);
    expect(isExpired(now - PURGE_AFTER_MS, now)).toBe(false);
    expect(isExpired(now - PURGE_AFTER_MS - 1, now)).toBe(true);
  });

  it('啟動時只清掉過期的，其餘保留', async () => {
    const now = Date.now();
    const base = { date: '2026-11-10', time: '' as const, category: '待辦' as const, note: '', done: false, delayDays: 0, createdAt: 1, updatedAt: 1 };
    await db.tasks.bulkAdd([
      { ...base, id: 'old', title: 'old', deletedAt: now - 15 * DAY },
      { ...base, id: 'recent', title: 'recent', deletedAt: now - 13 * DAY },
      { ...base, id: 'live', title: 'live' },
    ]);
    await db.notes.bulkAdd([
      { id: 'n-old', date: '2026-11-10', text: 'x', createdAt: 1, updatedAt: 1, deletedAt: now - 20 * DAY },
      { id: 'n-live', date: '2026-11-10', text: 'y', createdAt: 1, updatedAt: 1 },
    ]);
    await purgeExpired(db, now);
    expect((await db.tasks.toArray()).map((t) => t.id).sort()).toEqual(['live', 'recent']);
    expect((await db.notes.toArray()).map((x) => x.id)).toEqual(['n-live']);
  });
});

describe('範例資料與隨手記', () => {
  it('只在第一次開啟時放範例資料', async () => {
    expect(await seedIfFirstRun(db, '2026-11-10')).toBe(true);
    const count = await db.tasks.count();
    expect(count).toBe(9);
    expect(await seedIfFirstRun(db, '2026-11-10')).toBe(false);
    expect(await db.tasks.count()).toBe(count);
  });

  it('範例資料日期相對於今天，且有一筆「延 1 天」', () => {
    const { tasks, notes } = buildSampleData('2026-11-10', Date.now());
    expect(tasks.filter((t) => t.date === '2026-11-10').length).toBe(5);
    expect(tasks.filter((t) => t.delayDays > 0).length).toBe(1);
    expect(notes.every((x) => x.date === '2026-11-10')).toBe(true);
  });

  it('新增隨手記會存進資料庫並記下時間', async () => {
    await addNote(db, '2026-11-12', '買電池', 12345);
    const rows = await db.notes.toArray();
    expect(rows).toHaveLength(1);
    expect(rows[0]).toMatchObject({ date: '2026-11-12', text: '買電池', createdAt: 12345 });
  });
});
