const express = require('express');
const Message = require('../models/Message');
const auth = require('../middleware/auth');
const router = express.Router();

// Get messages (optionally for a specific task)
router.get('/', auth, async (req, res) => {
  try {
    const { taskId } = req.query;
    const query = taskId ? { task: taskId } : {};
    const messages = await Message.find(query).sort({ createdAt: 1 });
    res.json(messages);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Post a new message
router.post('/', auth, async (req, res) => {
  try {
    const { content, task } = req.body;
    const message = new Message({
      content,
      sender: req.user,
      task: task || undefined,
    });
    await message.save();
    res.status(201).json(message);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

module.exports = router;
