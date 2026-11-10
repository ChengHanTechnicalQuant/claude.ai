import type { Task } from '../types';

export function TaskCard({ task }: { task: Task }) {
  return (
    <div className="card-wrap">
      <article className={'card' + (task.done ? ' done' : '')}>
        <div className="row1">
          <div className="left">
            <span className="cat">{task.category}</span>
            {!task.done && task.delayDays > 0 && <span className="delay">延 {task.delayDays} 天</span>}
          </div>
          <span className="time">{task.time}</span>
        </div>
        <span className="title">{task.title}</span>
        {task.note && <span className="note">{task.note}</span>}
      </article>
    </div>
  );
}
