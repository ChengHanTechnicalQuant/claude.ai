import type { Task } from '../types';
import { SwipeRow, type SwipeAction } from './SwipeRow';

interface Props {
  task: Task;
  open: boolean;
  anyOpen: boolean;
  actions: SwipeAction[];
  onOpenChange: (id: string | null) => void;
  onEdit: () => void;
}

export function TaskCard({ task, open, anyOpen, actions, onOpenChange, onEdit }: Props) {
  return (
    <SwipeRow
      id={task.id}
      open={open}
      anyOpen={anyOpen}
      actions={actions}
      onOpenChange={onOpenChange}
      onTap={onEdit}
      wrapClass="card-wrap"
      frontClass={'card' + (task.done ? ' done' : '')}
    >
      <div className="row1">
        <div className="left">
          <span className="cat">{task.category}</span>
          {!task.done && task.delayDays > 0 && <span className="delay">延 {task.delayDays} 天</span>}
        </div>
        <span className="time">{task.time}</span>
      </div>
      <span className="title">{task.title}</span>
      {task.note && <span className="note">{task.note}</span>}
    </SwipeRow>
  );
}
