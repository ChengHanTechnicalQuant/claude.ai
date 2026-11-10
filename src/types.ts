export type Category = '會議' | '待辦' | '私人';
export type Tag = '全部' | Category | '已完成';
/** '' = 不設時間；'上午'／'下午'；'HH:mm' = 指定時間 */
export type TimeValue = '' | '上午' | '下午' | `${string}:${string}`;

export interface Task {
  id: string;
  date: string; // 'YYYY-MM-DD'
  time: TimeValue;
  category: Category;
  title: string;
  note: string;
  done: boolean;
  doneAt?: number;
  delayDays: number; // 累計延後天數，> 0 時顯示「延 N 天」
  createdAt: number;
  updatedAt: number;
  deletedAt?: number; // 軟刪除，14 天後才真正清掉
}

export interface Note {
  id: string;
  date: string; // 每天獨立
  text: string;
  createdAt: number; // 顯示為 HH:mm
  updatedAt: number;
  deletedAt?: number;
}

export interface Settings {
  morningTime: string; // 預設 '08:30'
  leadMinutes: number; // 預設 10
  notificationsEnabled: boolean;
  push: { endpoint: string; vapidPublicKey: string }; // 預設都是空字串
}

export const DEFAULT_SETTINGS: Settings = {
  morningTime: '08:30',
  leadMinutes: 10,
  notificationsEnabled: false,
  push: { endpoint: '', vapidPublicKey: '' },
};

export const CATEGORIES: Category[] = ['會議', '待辦', '私人'];
export const TAGS: Tag[] = ['全部', '會議', '待辦', '私人', '已完成'];
