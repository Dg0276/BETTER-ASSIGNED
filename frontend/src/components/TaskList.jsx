// ── SVG Icons ──────────────────────────────────────────────
function IconClock() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  );
}
function IconCheck() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}
function IconUndo() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="9 14 4 9 9 4" />
      <path d="M20 20v-7a4 4 0 0 0-4-4H4" />
    </svg>
  );
}
function IconTrash() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
      <path d="M10 11v6M14 11v6" />
      <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
    </svg>
  );
}
function IconClipboard() {
  return (
    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
      <rect x="8" y="2" width="8" height="4" rx="1" ry="1" />
    </svg>
  );
}

const STRATEGY_LABELS = { balanced: "Balanced", urgent: "Urgent", roi: "ROI" };

export default function TaskList({ tasks, onViewHistory, onDelete, onToggleDone }) {
  if (tasks.length === 0) {
    return (
      <div className="tl-empty">
        <div className="tl-empty-icon"><IconClipboard /></div>
        No tasks yet. Create your first one.
      </div>
    );
  }

  return (
    <div>
      {tasks.map((task, idx) => (
        <div
          key={task.id}
          className={`tl-task ${task.is_done ? "is-done" : ""}`}
          style={{ animationDelay: `${idx * 50}ms` }}
        >
          <div className="tl-task-top">
            <span className="tl-task-rank">#{idx + 1}</span>
            <span className="tl-task-title">{task.title}</span>
            <span className={`tl-score-pill pill-${task.strategy}`}>
              {task.priority_score.toFixed(2)}
            </span>
          </div>

          <div className="tl-task-meta">
            <span className="tl-meta-chip">Impact {task.impact}</span>
            <span className="tl-meta-chip">Effort {task.effort}</span>
            <span className={`tl-meta-strat strat-${task.strategy}`}>
              {STRATEGY_LABELS[task.strategy] || task.strategy}
            </span>
            {task.is_done && <span className="tl-done-badge">Done</span>}
          </div>

          <div className="tl-task-actions">
            <button
              className="tl-action history"
              onClick={() => onViewHistory(task.id, task.title)}
            >
              <IconClock /> History
            </button>

            {task.is_done ? (
              <button className="tl-action undo" onClick={() => onToggleDone(task.id)}>
                <IconUndo /> Undo
              </button>
            ) : (
              <button className="tl-action done" onClick={() => onToggleDone(task.id)}>
                <IconCheck /> Done
              </button>
            )}

            <button className="tl-action delete" onClick={() => onDelete(task.id)}>
              <IconTrash /> Delete
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
