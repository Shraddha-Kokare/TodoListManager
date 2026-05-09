const express = require("express");
const Task = require("../models/Task");

const router = express.Router();

// GET /tasks -> Fetch all tasks sorted by creation time (latest first).
router.get("/", async (req, res) => {
  try {
    const tasks = await Task.find().sort({ createdAt: -1 });
    res.status(200).json(tasks);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch tasks", error: error.message });
  }
});

// POST /tasks -> Create a new task.
router.post("/", async (req, res) => {
  try {
    const { title, completed, dueDate, priority } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({ message: "Task title is required" });
    }

    const newTask = new Task({
      title: title.trim(),
      completed: completed ?? false,
      dueDate: dueDate || null,
      priority: priority || "Medium"
    });

    const savedTask = await newTask.save();
    res.status(201).json(savedTask);
  } catch (error) {
    res.status(500).json({ message: "Failed to create task", error: error.message });
  }
});

// PUT /tasks/:id -> Update existing task fields.
router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { title, completed, dueDate, priority } = req.body;

    const updatedTask = await Task.findByIdAndUpdate(
      id,
      {
        ...(title !== undefined ? { title: title.trim() } : {}),
        ...(completed !== undefined ? { completed } : {}),
        ...(dueDate !== undefined ? { dueDate: dueDate || null } : {}),
        ...(priority !== undefined ? { priority } : {})
      },
      { new: true, runValidators: true }
    );

    if (!updatedTask) {
      return res.status(404).json({ message: "Task not found" });
    }

    res.status(200).json(updatedTask);
  } catch (error) {
    res.status(500).json({ message: "Failed to update task", error: error.message });
  }
});

// DELETE /tasks/:id -> Remove a task from database.
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const deletedTask = await Task.findByIdAndDelete(id);

    if (!deletedTask) {
      return res.status(404).json({ message: "Task not found" });
    }

    res.status(200).json({ message: "Task deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete task", error: error.message });
  }
});

module.exports = router;
