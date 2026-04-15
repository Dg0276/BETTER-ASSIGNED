import { useEffect, useState } from "react";
import { fetchTasks, createTask, deleteTask, markTaskDone } from "./api";
import TaskForm from "./components/TaskForm";
import TaskList from "./components/TaskList";
import HistoryModal from "./components/HistoryModal";
import ChatBot from "./components/ChatBot";

// SVG: Lightning bolt logo icon
function IconBolt() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
    </svg>
  );
}

function App() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState({ id: null, title: "" });
  const [filter, setFilter] = useState("all");
  const [initialLoad, setInitialLoad] = useState(true);

  const loadTasks = async () => {
    setLoading(true);
    try {
      const data = await fetchTasks();
      setTasks(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
      setInitialLoad(false);
    }
  };

  useEffect(() => { loadTasks(); }, []);

  const handleCreate = async (taskData) => {
    await createTask(taskData);
    await loadTasks();
  };

  const handleDelete = async (taskId) => {
    await deleteTask(taskId);
    setTasks((prev) => prev.filter((t) => t.id !== taskId));
  };

  const handleToggleDone = async (taskId) => {
    const updated = await markTaskDone(taskId);
    setTasks((prev) => prev.map((t) => (t.id === taskId ? updated : t)));
  };

  const handleViewHistory = (taskId, taskTitle) => {
    setSelectedTask({ id: taskId, title: taskTitle });
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setSelectedTask({ id: null, title: "" });
  };

  const doneCount = tasks.filter((t) => t.is_done).length;
  const activeCount = tasks.length - doneCount;

  return (
    <>
      {/* Ambient glow orbs */}
      <div className="orbs">
        <div className="orb orb1" />
        <div className="orb orb2" />
        <div className="orb orb3" />
      </div>

      <div className="tl-app">
        {/* Header */}
        <header className="tl-header">
          <div className="tl-logo">
            <div className="tl-logo-icon">
              <IconBolt />
            </div>
            <div className="tl-logo-text">TaskLift <span>Pro</span></div>
          </div>
          <div className="tl-header-stats">
            <div className="tl-hstat">
              <div className="tl-hstat-val">{tasks.length}</div>
              <div className="tl-hstat-label">Total</div>
            </div>
            <div className="tl-hstat">
              <div className="tl-hstat-val" style={{ color: "var(--accent-done)" }}>{doneCount}</div>
              <div className="tl-hstat-label">Done</div>
            </div>
            <div className="tl-hstat">
              <div className="tl-hstat-val" style={{ color: "var(--accent-balanced)" }}>{activeCount}</div>
              <div className="tl-hstat-label">Active</div>
            </div>
          </div>
        </header>

        {/* 3-column layout */}
        <div className="tl-layout">
          <div className="tl-left-col">
            <TaskForm onSubmit={handleCreate} />
          </div>

          <div className="tl-middle-col">
            <div className="tl-card tl-tasks-card">
              <div className="tl-tasks-header">
              <div className="tl-tasks-title">Priority Queue</div>
              <div className="tl-tasks-meta">
                {doneCount > 0 && (
                  <span className="tl-done-count">{doneCount} done</span>
                )}
                <span className="tl-count">
                  {tasks.length} {tasks.length === 1 ? "task" : "tasks"}
                </span>
              </div>
            </div>

            <div className="tl-tabs">
              <button 
                className={`tl-tab ${filter === "all" ? "active" : ""}`} 
                onClick={() => setFilter("all")}
              >
                All
              </button>
              <button 
                className={`tl-tab ${filter === "active" ? "active" : ""}`} 
                onClick={() => setFilter("active")}
              >
                Active
              </button>
              <button 
                className={`tl-tab ${filter === "done" ? "active" : ""}`} 
                onClick={() => setFilter("done")}
              >
                Done
              </button>
            </div>

            {loading ? (
              <div style={{ display: "flex", justifyContent: "center", padding: "3rem" }}>
                <svg className="tl-spin" width="28" height="28" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="10" stroke="var(--accent-balanced)" strokeWidth="3" strokeOpacity="0.2" />
                  <path d="M12 2a10 10 0 0 1 10 10" stroke="var(--accent-balanced)" strokeWidth="3" strokeLinecap="round" />
                </svg>
              </div>
            ) : (() => {
              const filteredTasks = tasks.filter((t) => {
                if (filter === "active") return !t.is_done;
                if (filter === "done") return t.is_done;
                return true;
              });
              
              return (
                <TaskList
                  tasks={filteredTasks}
                  onViewHistory={handleViewHistory}
                  onDelete={handleDelete}
                  onToggleDone={handleToggleDone}
                />
              );
            })()}
            </div>
          </div>

          <div className="tl-right-col">
            <ChatBot onTaskCreated={handleCreate} />
          </div>
        </div>
      </div>

      {modalOpen && selectedTask.id && (
        <HistoryModal
          taskId={selectedTask.id}
          taskTitle={selectedTask.title}
          onClose={handleCloseModal}
        />
      )}
    </>
  );
}

export default App;
