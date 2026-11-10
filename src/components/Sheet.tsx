import { useRef, useState, type ReactNode } from 'react';

interface Props {
  closing: boolean;
  onClose: () => void;
  labelledBy: string;
  scrimLabel: string;
  className?: string;
  children: ReactNode;
}

/** 往下拖超過這個距離（px）放開，就關閉面板 */
const CLOSE_DRAG = 90;

/** 底部面板：從下面滑上來、遮罩淡入；握把那一條可以往下拖來關閉 */
export function Sheet({ closing, onClose, labelledBy, scrimLabel, className = '', children }: Props) {
  const [dragY, setDragY] = useState(0);
  const [dragging, setDragging] = useState(false);
  const startY = useRef<number | null>(null);

  const end = (cancelled: boolean) => {
    if (startY.current === null) return;
    startY.current = null;
    setDragging(false);
    if (!cancelled && dragY > CLOSE_DRAG) onClose(); // 保留目前的位置，從這裡繼續滑出去
    else setDragY(0);
  };

  return (
    <div className={'overlay' + (closing ? ' closing' : '')}>
      <button type="button" className="scrim" aria-label={scrimLabel} onClick={onClose} />
      <section
        className={'sheet ' + className}
        role="dialog"
        aria-modal="true"
        aria-labelledby={labelledBy}
        style={{
          transform: closing ? 'translateY(100%)' : `translateY(${dragY}px)`,
          transition: dragging ? 'none' : 'transform 0.3s cubic-bezier(0.32, 0.72, 0, 1)',
        }}
      >
        <div
          className="grabber-zone"
          onPointerDown={(e) => {
            startY.current = e.clientY;
            setDragging(true);
            try {
              e.currentTarget.setPointerCapture(e.pointerId);
            } catch {
              /* 不支援就算了 */
            }
          }}
          onPointerMove={(e) => {
            if (startY.current !== null) setDragY(Math.max(0, e.clientY - startY.current));
          }}
          onPointerUp={() => end(false)}
          onPointerCancel={() => end(true)}
        >
          <span className="grabber" aria-hidden="true" />
        </div>
        {children}
      </section>
    </div>
  );
}
