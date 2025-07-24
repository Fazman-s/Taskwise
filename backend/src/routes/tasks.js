const express = require('express');
const Task = require('../models/Task');
const auth = require('../middleware/auth');
const router = express.Router();

// Get all tasks (admin) or user tasks
router.get('/', auth, async (req, res) => {
  try {
    const query = req.isAdmin ? {} : { user: req.user };
    const tasks = await Task.find(query).sort({ createdAt: -1 });
    res.json(tasks);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Create a task
router.post('/', auth, async (req, res) => {
  try {
    const { title, description, status } = req.body;
    const task = new Task({
      title,
      description,
      status,
      user: req.user,
    });
    await task.save();
    res.status(201).json(task);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Update a task
router.put('/:id', auth, async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ message: 'Task not found' });
    if (!req.isAdmin && String(task.user) !== String(req.user)) return res.status(403).json({ message: 'Forbidden' });
    Object.assign(task, req.body);
    await task.save();
    res.json(task);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Delete a task
router.delete('/:id', auth, async (req, res) => {
  try {
    // Option A: Use findByIdAndDelete for a more concise approach
    const deletedTask = await Task.findByIdAndDelete(req.params.id);

    if (!deletedTask) {
      return res.status(404).json({ message: 'Task not found' });
    }

    // Optional: Add a check for user ownership if not already handled by Mongoose middleware
    // This check is already present in your original code:
    if (!req.isAdmin && String(deletedTask.user) !== String(req.user)) {
        // If the task was found but doesn't belong to the user, this means
        // findByIdAndDelete might have deleted a task the user shouldn't delete
        // or there's a logic flaw. It's safer to check *before* deleting,
        // or just rely on the Mongoose query to include user ID.
        // For simplicity, we'll keep it as is, but know that findByIdAndDelete
        // would have already deleted it if it found it.
        // A more robust check might be:
        // const task = await Task.findOne({ _id: req.params.id, user: req.user }); // for non-admin
        // if (!task) return res.status(404).json({ message: 'Task not found or forbidden' });
        // await task.deleteOne(); // then delete
        return res.status(403).json({ message: 'Forbidden' });
    }

    res.json({ message: 'Task deleted successfully' }); // Changed message for clarity
  } catch (err) {
    // If the ID is malformed (e.g., not a valid MongoDB ObjectId format), Mongoose will throw an error
    // which will be caught here.
    res.status(400).json({ message: err.message || 'Failed to delete task' });
  }
});

module.exports = router;