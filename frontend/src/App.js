import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";

// Hardcoded backend API URL as requested.
const API_URL = "http://localhost:5000/tasks";

function App() {
  const [tasks, setTasks] = useState([]);
  const [title, setTitle] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [priority, setPriority] = useState("Medium");
  const [searchTerm, setSearchTerm] = useState("");
  const [filter, setFilter] = useState("All");
  const [darkMode, setDarkMode] = useState(false);
  const [editTaskId, setEditTaskId] = useState(null);

  // Fetch all tasks from backend API.
  const fetchTasks = async () => {
    try {
      const response = await axios.get(API_URL);
      setTasks(response.data);
    } catch (error) {
      console.error("Error fetching tasks:", error.message);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  // Add new task or update existing task based on edit mode.
  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!title.trim()) return;

    const payload = {
      title: title.trim(),
      dueDate: dueDate || null,
      priority
    };

    try {
      if (editTaskId) {
        await axios.put(`${API_URL}/${editTaskId}`, payload);
      } else {
        await axios.post(API_URL, payload);
      }

      resetForm();
      fetchTasks();
    } catch (error) {
      console.error("Error saving task:", error.message);
    }
  };

  const resetForm = () => {
    setTitle("");
    setDueDate("");
    setPriority("Medium");
    setEditTaskId(null);
  };

  // Toggle completed/incomplete status.
  const toggleTaskStatus = async (task) => {
    try {
      await axios.put(`${API_URL}/${task._id}`, {
        completed: !task.completed
      });
      fetchTasks();
    } catch (error) {
      console.error("Error updating task status:", error.message);
    }
  };

  // Delete task by ID.
  const deleteTask = async (id) => {
    try {
      await axios.delete(`${API_URL}/${id}`);
      fetchTasks();
    } catch (error) {
      console.error("Error deleting task:", error.message);
    }
  };

  // Prefill form when user clicks edit.
  const startEdit = (task) => {
    setEditTaskId(task._id);
    setTitle(task.title);
    setDueDate(task.dueDate ? task.dueDate.split("T")[0] : "");
    setPriority(task.priority);
  };

  // Client-side search and filter for better user experience.
  const visibleTasks = useMemo(() => {
    return tasks.filter((task) => {
      const searchMatch = task.title.toLowerCase().includes(searchTerm.toLowerCase());
      const filterMatch =
        filter === "All" ||
        (filter === "Completed" && task.completed) ||
        (filter === "Pending" && !task.completed);

      return searchMatch && filterMatch;
    });
  }, [tasks, searchTerm, filter]);

  return (
    <div className={`app ${darkMode ? "dark" : ""}`}>
      <div className="container">
        <header className="header">
          <h1>To-Do List Manager</h1>
          <button className="dark-toggle" onClick={() => setDarkMode((prev) => !prev)}>
            {darkMode ? "Light Mode" : "Dark Mode"}
          </button>
        </header>

        <form className="task-form" onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Enter task title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
          <input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
          <select value={priority} onChange={(e) => setPriority(e.target.value)}>
            <option value="Low">Low</option>
            <option value="Medium">Medium</option>
            <option value="High">High</option>
          </select>
          <button type="submit">{editTaskId ? "Update Task" : "Add Task"}</button>
          {editTaskId && (
            <button type="button" className="cancel-btn" onClick={resetForm}>
              Cancel Edit
            </button>
          )}
        </form>

        <div className="controls">
          <input
            type="text"
            placeholder="Search tasks by title..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <div className="filter-buttons">
            {["All", "Completed", "Pending"].map((option) => (
              <button
                key={option}
                type="button"
                className={filter === option ? "active" : ""}
                onClick={() => setFilter(option)}
              >
                {option}
              </button>
            ))}
          </div>
        </div>

        <section className="task-list">
          {visibleTasks.length === 0 ? (
            <p className="empty-state">No tasks found.</p>
          ) : (
            visibleTasks.map((task) => (
              <article key={task._id} className="task-card">
                <div className="task-main">
                  <h3 className={task.completed ? "completed" : ""}>{task.title}</h3>
                  <p>
                    <strong>Due:</strong>{" "}
                    {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : "No due date"}
                  </p>
                  <p>
                    <strong>Priority:</strong> {task.priority}
                  </p>
                  <p>
                    <strong>Status:</strong> {task.completed ? "Completed" : "Pending"}
                  </p>
                </div>
                <div className="task-actions">
                  <button type="button" onClick={() => toggleTaskStatus(task)}>
                    {task.completed ? "Mark Pending" : "Mark Complete"}
                  </button>
                  <button type="button" onClick={() => startEdit(task)}>
                    Edit
                  </button>
                  <button type="button" className="delete-btn" onClick={() => deleteTask(task._id)}>
                    Delete
                  </button>
                </div>
              </article>
            ))
          )}
        </section>
      </div>
    </div>
  );
}

export default App;
