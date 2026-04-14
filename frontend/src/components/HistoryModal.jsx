import { useState, useEffect, useRef } from "react";
import { fetchTaskLogs } from "../api";

function IconClose() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}

function IconPlus() {
  return (
    <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round">
      <line x1="12" y1="4" x2="12" y2="20" /><line x1="4" y1="12" x2="20" y2="12" />
    </svg>
  );
}

function getDotColor(action) {
  if (action === "created") return "var(--accent-done)";
  if (action === "marked_done") return "var(--accent-balanced)";
  if (action === "marked_undone") return "var(--accent-urgent)";
  return "var(--accent-roi)";
}

export default function HistoryModal({ taskId, taskTitle, onClose }) {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const overlayRef = useRef(null);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await fetchTaskLogs(taskId);
        setLogs(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [taskId]);

  useEffect(() => {
    const handleKey = (e) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [onClose]);

  const handleOverlayClick = (e) => {
    if (e.target === overlayRef.current) onClose();
  };

  const formatDate = (dateStr) => {
    const d = new Date(dateStr);
    return d.toLocaleString("en-US", {
      month: "short", day: "numeric",
      hour: "2-digit", minute: "2-digit",
    });
  };

  return (
    <div className="tl-overlay" ref={overlayRef} onClick={handleOverlayClick}>
      <div className="tl-modal">
        <div className="tl-modal-header">
          <div>
            <div className="tl-modal-title">Activity Log</div>
            <div className="tl-modal-sub" title={taskTitle}>{taskTitle}</div>
          </div>
          <button className="tl-modal-close" onClick={onClose}>
            <IconClose />
          </button>
        </div>

        {loading && (
          <div style={{ display: "flex", justifyContent: "center", padding: "2rem" }}>
            <svg className="tl-spin" width="24" height="24" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="10" stroke="var(--accent-balanced)" strokeWidth="3" strokeOpacity="0.2" />
              <path d="M12 2a10 10 0 0 1 10 10" stroke="var(--accent-balanced)" strokeWidth="3" strokeLinecap="round" />
            </svg>
          </div>
        )}

        {error && (
          <div style={{ color: "var(--accent-urgent)", fontSize: 13, padding: "1rem 0" }}>
            {error}
          </div>
        )}

        {!loading && !error && logs.length === 0 && (
          <div style={{ color: "var(--text-tertiary)", fontSize: 13, padding: "1rem 0" }}>
            No activity logs found.
          </div>
        )}

        {!loading && !error && logs.length > 0 && (
          <div>
            {logs.map((log) => (
              <div className="tl-log-item" key={log.id}>
                <div
                  className="tl-log-dot"
                  style={{ background: getDotColor(log.action) }}
                />
                <div>
                  <div className="tl-log-action" style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    {log.action === "created" && <IconPlus />}
                    {log.action.replace(/_/g, " ")}
                  </div>
                  <div className="tl-log-time">{formatDate(log.timestamp)}</div>
                  {log.details && (
                    <div className="tl-log-details">{log.details}</div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="tl-modal-footer">
          <button className="tl-modal-footer-btn" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
