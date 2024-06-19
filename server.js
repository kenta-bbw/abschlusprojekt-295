// Author: Kenta Waibel
// Assisted by: ChatGPT
// Date: 19.06.204

const express = require('express');
const bodyParser = require('body-parser');
const session = require('express-session');
const crypto = require('crypto');

const app = express();
const port = 3000;

app.use(bodyParser.json());

const secretKey = crypto.randomBytes(64).toString('hex');

app.use(session({
  secret: secretKey,
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false }
}));

let users = [
  { id: 1, username: 'user', password: 'password' }
];

let tasks = [];

function authenticate(req, res, next) {
  if (req.session && req.session.user) {
    next();
  } else {
    res.status(403).json({ message: 'Forbidden: Authentication required' });
  }
}

function generateToken() {
  return Math.random().toString(36).substr(2);
}

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(`An error occurred: ${err.message}`);
  res.status(500).json({ message: 'Internal Server Error' });
});

// Login endpoint
app.post('/login', (req, res, next) => {
  try {
    const { username, password } = req.body;
    
    // Simulating an error for testing logging
    if (password === 'error') {
      throw new Error('Simulated error in login');
    }

    if (password === 'm295') {
      const token = generateToken();
      req.session.user = { username: username, token: token };
      res.json({ message: 'Login successful', username: username, token: token });
    } else {
      res.sendStatus(401); // Unauthorized
    }
  } catch (err) {
    console.error(`Error in login endpoint: ${err.message}`);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

// Verify endpoint
app.get('/verify', authenticate, (req, res, next) => {
  try {
    res.json({ token: req.session.user.token, message: 'Token is still usable' });
  } catch (err) {
    console.error(`Error in verify endpoint: ${err.message}`);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

// Logout endpoint
app.delete('/logout', authenticate, (req, res, next) => {
  try {
    req.session.destroy(err => {
      if (err) {
        console.error(`Error destroying session: ${err.message}`);
        return res.sendStatus(500); // Internal Server Error
      }
      res.sendStatus(204); // No Content
    });
  } catch (err) {
    console.error(`Error in logout endpoint: ${err.message}`);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

// List all tasks endpoint
app.get('/tasks', authenticate, (req, res, next) => {
  try {
    res.json(tasks);
  } catch (err) {
    console.error(`Error listing tasks: ${err.message}`);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

// Create a new task endpoint
app.post('/tasks', authenticate, (req, res, next) => {
  try {
    const { title, description, done, dueDate } = req.body;

    if (!title) {
      return res.status(400).json({ message: 'Task title cannot be empty' });
    }

    const newTask = {
      id: tasks.length + 1,
      title: title,
      description: description,
      done: done || false,
      dueDate: dueDate
    };

    tasks.push(newTask);
    res.status(201).json(newTask);
  } catch (err) {
    console.error(`Error creating task: ${err.message}`);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

// Get a specific task endpoint
app.get('/tasks/:id', authenticate, (req, res, next) => {
  try {
    const id = parseInt(req.params.id);
    const task = tasks.find(task => task.id === id);

    if (!task) {
      res.status(404).json({ message: 'Task not found' });
    } else {
      res.json(task);
    }
  } catch (err) {
    console.error(`Error retrieving task: ${err.message}`);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

// Update a specific task endpoint
app.patch('/tasks/:id', authenticate, (req, res, next) => {
  try {
    const id = parseInt(req.params.id);
    const taskIndex = tasks.findIndex(task => task.id === id);

    if (taskIndex === -1) {
      res.status(404).json({ message: 'Task not found' });
    } else {
      tasks[taskIndex].title = req.body.title || tasks[taskIndex].title;
      tasks[taskIndex].description = req.body.description || tasks[taskIndex].description;
      tasks[taskIndex].done = req.body.done || tasks[taskIndex].done;
      tasks[taskIndex].dueDate = req.body.dueDate || tasks[taskIndex].dueDate;

      res.json(tasks[taskIndex]);
    }
  } catch (err) {
    console.error(`Error updating task: ${err.message}`);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

// Delete a specific task endpoint
app.delete('/tasks/:id', authenticate, (req, res, next) => {
  try {
    const id = parseInt(req.params.id);
    const taskIndex = tasks.findIndex(task => task.id === id);

    if (taskIndex === -1) {
      res.status(404).json({ message: 'Task not found' });
    } else {
      const deletedTask = tasks.splice(taskIndex, 1);
      res.json(deletedTask[0]);
    }
  } catch (err) {
    console.error(`Error deleting task: ${err.message}`);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

// Middleware for handling undefined routes
app.use((req, res, next) => {
  console.error(`404 - Endpoint not found: ${req.originalUrl}`);
  res.status(404).json({ message: 'Endpoint not found' });
});

// Start server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
