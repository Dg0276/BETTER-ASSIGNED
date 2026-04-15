import { useState, useRef, useEffect } from "react";



const STRATEGY_LABELS = { balanced: "Balanced", urgent: "Urgent", roi: "ROI" };

// ── Icons ──────────────────────────────────────────────────
function IconBot() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="11" width="18" height="10" rx="2" />
      <circle cx="12" cy="5" r="2" />
      <path d="M12 7v4" />
      <line x1="8" y1="16" x2="8.01" y2="16" />
      <line x1="16" y1="16" x2="16.01" y2="16" />
    </svg>
  );
}
function IconClose() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
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
function IconSend() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="22" y1="2" x2="11" y2="13" />
      <polygon points="22 2 15 22 11 13 2 9 22 2" />
    </svg>
  );
}
function IconRefresh() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="23 4 23 10 17 10" />
      <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
    </svg>
  );
}

export default function ChatBot({ onTaskCreated }) {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [parsed, setParsed] = useState(null);     // successful parse result
  const [error, setError] = useState(null);        // user-visible error string
  const [success, setSuccess] = useState(false);  // task was just created
  const [creating, setCreating] = useState(false);
  const textareaRef = useRef(null);

  // Auto-grow textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "80px";
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 160) + "px";
    }
  }, [input]);

  // Clear success message after 3s
  useEffect(() => {
    if (!success) return;
    const t = setTimeout(() => setSuccess(false), 3000);
    return () => clearTimeout(t);
  }, [success]);

  const reset = () => {
    setParsed(null);
    setError(null);
    setSuccess(false);
    setInput("");
  };

  const handleParse = async () => {
    const text = input.trim();
    if (!text) return;

    setLoading(true);
    setError(null);
    setParsed(null);
    setSuccess(false);

    const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5001";
    try {
      const res = await fetch(`${API_URL}/parse-task`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Something went wrong. Please try again.");
      } else {
        setParsed(data);
      }
    } catch {
      setError("Could not reach the server. Make sure the backend is running.");
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    // Cmd/Ctrl + Enter submits
    if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
      e.preventDefault();
      handleParse();
    }
  };

  const handleConfirm = async () => {
    if (!parsed) return;
    setCreating(true);
    setError(null);
    try {
      await onTaskCreated(parsed);
      setSuccess(true);
      setParsed(null);
      setInput("");
    } catch (err) {
      setError(err.message || "Failed to create task.");
    } finally {
      setCreating(false);
    }
  };



  return (
    <div className="tl-card tl-chat-card">
      {/* Header */}
      <div className="tl-chat-header">
        <div className="tl-chat-header-left">
          <div className="tl-chat-avatar"><IconBot /></div>
          <div>
            <div className="tl-chat-title">AI Task Parser</div>
            <div className="tl-chat-subtitle">Describe it casually — I'll structure it</div>
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="tl-chat-body">
        {/* Hint + examples (shown when no result yet) */}
        {!parsed && !loading && (
          <>
            <p className="tl-chat-hint">
              Type anything — <b>casual, vague, messy</b>. The AI will figure out the title, description, priority score, and strategy for you.
            </p>

          </>
        )}

        {/* Input area */}
        <textarea
          ref={textareaRef}
          className="tl-chat-textarea"
          placeholder="e.g. the checkout flow is broken on safari and users are complaining"
          value={input}
          onChange={(e) => {
            setInput(e.target.value);
            if (parsed) setParsed(null);
            if (error) setError(null);
          }}
          onKeyDown={handleKeyDown}
          disabled={loading || creating}
        />

        <button
          className="tl-chat-send"
          onClick={handleParse}
          disabled={loading || !input.trim() || creating}
        >
          {loading ? (
            <>
              <svg className="tl-spin" width="16" height="16" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="10" stroke="white" strokeWidth="3" strokeOpacity="0.3" />
                <path d="M12 2a10 10 0 0 1 10 10" stroke="white" strokeWidth="3" strokeLinecap="round" />
              </svg>
              Analysing...
            </>
          ) : (
            <>
              <IconSend /> Parse with AI
              <span style={{ fontSize: 10, opacity: 0.6, marginLeft: 4 }}>⌘↵</span>
            </>
          )}
        </button>

        {/* Error */}
        {error && (
          <div className="tl-chat-error">{error}</div>
        )}

        {/* Success toast */}
        {success && (
          <div className="tl-chat-success">
            <IconCheck /> Task created and added to your queue!
          </div>
        )}

        {/* Parsed result preview */}
        {parsed && (
          <div className="tl-chat-result">
            <div className="tl-chat-result-header">
              <IconBot />
              Parsed Result
            </div>
            <div className="tl-chat-result-body">
              <div className="tl-chat-result-title">{parsed.title}</div>
              {parsed.description && (
                <div className="tl-chat-result-desc">{parsed.description}</div>
              )}
              <div className="tl-chat-result-chips">
                <span className={`tl-chat-chip chip-${parsed.strategy}`}>
                  {STRATEGY_LABELS[parsed.strategy]}
                </span>
                <span className="tl-chat-chip chip-neutral">Impact {parsed.impact}/5</span>
                <span className="tl-chat-chip chip-neutral">Effort {parsed.effort}/5</span>
              </div>
              <div className="tl-chat-result-actions">
                <button
                  className="tl-chat-confirm"
                  onClick={handleConfirm}
                  disabled={creating}
                >
                  {creating ? (
                    <svg className="tl-spin" width="14" height="14" viewBox="0 0 24 24" fill="none">
                      <circle cx="12" cy="12" r="10" stroke="white" strokeWidth="3" strokeOpacity="0.3" />
                      <path d="M12 2a10 10 0 0 1 10 10" stroke="white" strokeWidth="3" strokeLinecap="round" />
                    </svg>
                  ) : (
                    <IconCheck />
                  )}
                  Create Task
                </button>
                <button className="tl-chat-retry" onClick={reset}>
                  <IconRefresh /> Try again
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
