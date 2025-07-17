const express = require('express');
const http = require('http');
const cors = require('cors');
const connectDB = require('./db');
const Message = require('./models/Message');
const User = require('./models/User');
const jwt = require('jsonwebtoken');
const JWT_SECRET = 'TASK_MANAGER_SECRET'; // hard-coded
const PORT = 5000; // hard-coded
const bcrypt = require('bcryptjs');

const app = express();
const server = http.createServer(app);
const { Server } = require('socket.io');
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
});

// Middleware
app.use(cors());
app.use(express.json());

// Connect to MongoDB
connectDB();

// Routes
const taskRoutes = require('./routes/tasks');
const chatRoutes = require('./routes/chat');
app.use('/api/tasks', taskRoutes);
app.use('/api/chat', chatRoutes);

// Auth routes
app.post('/api/auth/register', async (req, res) => {
  try {
    const { email, password, role } = req.body;
    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ message: 'User already exists' });
    const hash = await bcrypt.hash(password, 10);
    const user = new User({ email, password: hash, role: role || 'user' });
    await user.save();
    res.status(201).json({ message: 'User registered' });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: 'Invalid credentials' });
    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(400).json({ message: 'Invalid credentials' });
    const token = jwt.sign({ id: user._id, role: user.role }, JWT_SECRET, { expiresIn: '1d' });
    res.json({ token, user: { id: user._id, email: user.email, role: user.role } });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Socket.io events
io.on('connection', (socket) => {
  console.log('A user connected:', socket.id);

  socket.on('chatMessage', async (data) => {
    try {
      const message = new Message({
        content: data.content,
        sender: data.sender,
        task: data.task || undefined,
      });
      await message.save();
      io.emit('chatMessage', message);
    } catch (err) {
      console.error('Error saving message:', err.message);
    }
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});