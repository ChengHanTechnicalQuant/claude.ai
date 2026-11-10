export function Toast({ text, onUndo }: { text: string; onUndo: () => void }) {
  return (
    <div className="toast" role="status">
      <span>{text}</span>
      <button type="button" onClick={onUndo}>復原</button>
    </div>
  );
}
