const API_URL = "http://localhost:5001";

export async function fetchTasks() {
  const res = await fetch(`${API_URL}/tasks`);
  if (!res.ok) throw new Error("Failed to load tasks");
  return res.json();
}

export async function createTask(task) {
  const res = await fetch(`${API_URL}/tasks`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(task),
  });
  const data = await res.json();
  if (!res.ok) {
    if (data.details && data.details.length > 0) {
      throw new Error(data.details[0].msg);
    }
    throw new Error(data.error || "Failed to create task");
  }
  return data;
}

export async function deleteTask(taskId) {
  const res = await fetch(`${API_URL}/tasks/${taskId}`, { method: "DELETE" });
  if (!res.ok) throw new Error("Failed to delete task");
}

export async function markTaskDone(taskId) {
  const res = await fetch(`${API_URL}/tasks/${taskId}/done`, { method: "PATCH" });
  if (!res.ok) throw new Error("Failed to update task");
  return res.json();
}

export async function fetchTaskLogs(taskId) {
  const res = await fetch(`${API_URL}/tasks/${taskId}/logs`);
  if (!res.ok) throw new Error("Failed to load activity logs");
  return res.json();
}
