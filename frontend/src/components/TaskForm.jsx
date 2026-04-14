import { useState } from "react";

// ── SVG Icons ──────────────────────────────────────────────
function IconScale() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="3" x2="12" y2="21" />
      <path d="M3 9l4-4 5 4 5-4 4 4" />
      <path d="M3 15l4 4 5-4 5 4 4-4" />
    </svg>
  );
}
function IconFlame() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z" />
    </svg>
  );
}
function IconTrending() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" />
      <polyline points="16 7 22 7 22 13" />
    </svg>
  );
}
function IconAlert() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
    </svg>
  );
}

// ── Strategy config ────────────────────────────────────────
const STRATEGIES = [
  {
    value: "balanced",
    label: "Balanced",
    formula: "(I + E) / 2",
    icon: <IconScale />,
    calc: (i, e) => ((i + e) / 2).toFixed(2),
  },
  {
    value: "urgent",
    label: "Urgent",
    formula: "I × 2 − E",
    icon: <IconFlame />,
    calc: (i, e) => (i * 2 - e).toFixed(2),
  },
  {
    value: "roi",
    label: "ROI",
    formula: "I ÷ E",
    icon: <IconTrending />,
    calc: (i, e) => (i / e).toFixed(2),
  },
];

export default function TaskForm({ onSubmit }) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [impact, setImpact] = useState(3);
  const [effort, setEffort] = useState(3);
  const [strategy, setStrategy] = useState("balanced");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const activeStrategy = STRATEGIES.find((s) => s.value === strategy);
  const liveScore = activeStrategy ? activeStrategy.calc(Number(impact), Number(effort)) : "—";

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await onSubmit({
        title,
        description: description || null,
        impact: Number(impact),
        effort: Number(effort),
        strategy,
      });
      setTitle("");
      setDescription("");
      setImpact(3);
      setEffort(3);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="tl-card tl-form-card">
      <div className="tl-form-title">+ New Task</div>

      {error && (
        <div className="tl-error">
          <IconAlert /> {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        {/* Title */}
        <div className="tl-form-group">
          <div className="tl-label">Task title</div>
          <input
            type="text"
            className="tl-input"
            placeholder="What needs doing?"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </div>

        {/* Description */}
        <div className="tl-form-group">
          <div className="tl-label">
            Description
            <span style={{ fontSize: 11, opacity: 0.5, fontStyle: "italic" }}>optional</span>
          </div>
          <input
            type="text"
            className="tl-input"
            placeholder="Add context..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>

        {/* Impact slider */}
        <div className="tl-form-group">
          <div className="tl-label">
            Impact
            <span className="tl-label-val">{impact}</span>
          </div>
          <input
            type="range"
            className="tl-range"
            min="1" max="5" step="1"
            value={impact}
            onChange={(e) => setImpact(Number(e.target.value))}
          />
          <div className="tl-range-dots">
            {[1, 2, 3, 4, 5].map((n) => (
              <span key={n} className="tl-range-dot">{n}</span>
            ))}
          </div>
        </div>

        {/* Effort slider */}
        <div className="tl-form-group">
          <div className="tl-label">
            Effort
            <span className="tl-label-val">{effort}</span>
          </div>
          <input
            type="range"
            className="tl-range"
            min="1" max="5" step="1"
            value={effort}
            onChange={(e) => setEffort(Number(e.target.value))}
          />
          <div className="tl-range-dots">
            {[1, 2, 3, 4, 5].map((n) => (
              <span key={n} className="tl-range-dot">{n}</span>
            ))}
          </div>
        </div>

        {/* Strategy picker */}
        <div className="tl-form-group">
          <div className="tl-label" style={{ marginBottom: 10 }}>Strategy</div>
          <div className="tl-strategy-grid">
            {STRATEGIES.map((s) => (
              <button
                key={s.value}
                type="button"
                className={`tl-strategy-btn ${strategy === s.value ? `active-${s.value}` : ""}`}
                onClick={() => setStrategy(s.value)}
              >
                <span className="tl-strategy-icon">{s.icon}</span>
                <span className="tl-strategy-label">{s.label}</span>
                <span className="tl-strategy-formula">{s.formula}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Live score preview */}
        <div className="tl-score-preview">
          <div>
            <div className="tl-score-meta">Priority Score</div>
            <div className="tl-score-sub">{activeStrategy?.label} formula</div>
          </div>
          <div className={`tl-score-value tl-score-${strategy}`}>{liveScore}</div>
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={loading}
          className={`tl-submit ${strategy !== "balanced" ? strategy : ""}`}
        >
          {loading ? (
            <svg className="tl-spin" width="20" height="20" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="10" stroke="white" strokeWidth="3" strokeOpacity="0.3" />
              <path d="M12 2a10 10 0 0 1 10 10" stroke="white" strokeWidth="3" strokeLinecap="round" />
            </svg>
          ) : (
            "Add Task"
          )}
        </button>
      </form>
    </div>
  );
}
