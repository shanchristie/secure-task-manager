import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getTasks, createTask, updateTask, deleteTask } from "../api/tasks";
import { getFriendlyError } from "../api/friendlyError";

/**
 * Tasks.jsx
 *
 * Protected tasks page:
 * - Displays user tasks
 * - Allows create, toggle, delete
 * - UX polish:
 *   - Disable Add unless input has real text
 *   - Confirm before deleting
 *   - Mark all complete + clear completed
 *   - Logout is the only top-right action
 *   - Bulk task actions live below the add-task input
 * - Friendly errors:
 *   - Shows user-friendly messages
 *   - Auto-logout + redirect on 401
 */

export default function Tasks() {
  const navigate = useNavigate();
  const { clearToken } = useAuth();

  const [tasks, setTasks] = useState([]);
  const [title, setTitle] = useState("");

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const remainingCount = useMemo(
    () => tasks.filter((t) => !Boolean(t.completed)).length,
    [tasks]
  );

  const canAdd = title.trim().length > 0 && !isSubmitting;

  function handleUnauthorized() {
    clearToken();
    navigate("/login");
  }

  async function loadTasks() {
    setError("");
    setLoading(true);

    try {
      const data = await getTasks();
      const list = Array.isArray(data) ? data : data?.tasks;
      setTasks(Array.isArray(list) ? list : []);
    } catch (err) {
      if (err?.status === 401) {
        handleUnauthorized();
        return;
      }
      setError(getFriendlyError(err));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadTasks();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleAdd(e) {
    e.preventDefault();
    setError("");

    const trimmed = title.trim();
    if (!trimmed) {
      setError("Task title cannot be empty.");
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await createTask({ title: trimmed });
      const task = result?.task ?? result;

      setTasks((prev) => [task, ...prev]);
      setTitle("");
    } catch (err) {
      if (err?.status === 401) {
        handleUnauthorized();
        return;
      }

      const details = err?.data?.details;
      if (Array.isArray(details) && details.length) {
        setError(details.map((d) => `${d.field}: ${d.message}`).join("\n"));
      } else {
        setError(getFriendlyError(err));
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleToggle(task) {
    setError("");

    try {
      const result = await updateTask(task.id, {
        completed: !Boolean(task.completed),
      });
      const updated = result?.task ?? result;

      setTasks((prev) => prev.map((t) => (t.id === task.id ? updated : t)));
    } catch (err) {
      if (err?.status === 401) {
        handleUnauthorized();
        return;
      }
      setError(getFriendlyError(err));
    }
  }

  async function handleDelete(task) {
    setError("");

    const ok = window.confirm(
      `Delete this task?\n\n"${task.title || "(untitled task)"}"`
    );
    if (!ok) return;

    try {
      await deleteTask(task.id);
      setTasks((prev) => prev.filter((t) => t.id !== task.id));
    } catch (err) {
      if (err?.status === 401) {
        handleUnauthorized();
        return;
      }
      setError(getFriendlyError(err));
    }
  }

  async function handleClearCompleted() {
    setError("");

    const completed = tasks.filter((t) => Boolean(t.completed));
    if (completed.length === 0) return;

    const ok = window.confirm(`Clear ${completed.length} completed task(s)?`);
    if (!ok) return;

    try {
      await Promise.all(completed.map((t) => deleteTask(t.id)));
      setTasks((prev) => prev.filter((t) => !Boolean(t.completed)));
    } catch (err) {
      if (err?.status === 401) {
        handleUnauthorized();
        return;
      }
      setError(getFriendlyError(err));
    }
  }

  async function handleMarkAllComplete() {
    setError("");

    const incomplete = tasks.filter((t) => !Boolean(t.completed));
    if (incomplete.length === 0) return;

    const ok = window.confirm(`Mark ${incomplete.length} task(s) as completed?`);
    if (!ok) return;

    try {
      const updates = await Promise.all(
        incomplete.map((t) => updateTask(t.id, { completed: true }))
      );

      const normalized = updates.map((u) => u?.task ?? u);

      setTasks((prev) =>
        prev.map((t) => normalized.find((u) => u.id === t.id) ?? t)
      );
    } catch (err) {
      if (err?.status === 401) {
        handleUnauthorized();
        return;
      }
      setError(getFriendlyError(err));
    }
  }

  function handleLogout() {
    clearToken();
    navigate("/login");
  }

  return (
    <div className="stm-container">
      <div className="stm-row">
        <div>
          <h1>Secure Task Manager</h1>
          <p>{loading ? "Loading…" : `${remainingCount} remaining`}</p>
        </div>

        <button onClick={handleLogout}>Logout</button>
      </div>

      {error && <p className="stm-error">{error}</p>}

      <form onSubmit={handleAdd} className="stm-row" style={{ marginTop: 16 }}>
        <input
          type="text"
          placeholder="Add a new task…"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          aria-label="New task title"
        />

        <button type="submit" disabled={!canAdd}>
          {isSubmitting ? "Adding…" : "Add"}
        </button>
      </form>

      <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 12 }}>
        <button
          className="stm-btn-secondary"
          onClick={handleMarkAllComplete}
          disabled={loading || tasks.length === 0}
        >
          Mark all complete
        </button>

        <button
          className="stm-btn-secondary"
          onClick={handleClearCompleted}
          disabled={loading || tasks.every((t) => !t.completed)}
        >
          Clear completed
        </button>
      </div>

      <div className="stm-gap-12" style={{ marginTop: 20 }}>
        {loading ? (
          <p>Loading tasks…</p>
        ) : tasks.length === 0 ? (
          <p>No tasks yet. Add your first one above.</p>
        ) : (
          tasks.map((task) => (
            <div key={task.id} className="stm-task">
              <div className="stm-task-left">
                <input
                  type="checkbox"
                  checked={Boolean(task.completed)}
                  onChange={() => handleToggle(task)}
                  aria-label={`Mark "${task.title || "task"}" as completed`}
                />

                <span
                  className={`stm-task-title ${
                    task.completed ? "completed" : ""
                  }`}
                  title={task.title || ""}
                >
                  {task.title || "(untitled task)"}
                </span>
              </div>

              <button onClick={() => handleDelete(task)}>Delete</button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}