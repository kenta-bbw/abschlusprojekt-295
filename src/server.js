// Author: Kenta Waibel
// Assisted by: ChatGPT
// Date: 19.06.204

// server.js
const express = require('express');
const bodyParser = require('body-parser');
const session = require('express-session');
const crypto = require('crypto');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('../swagger/swagger');
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

// Serve Swagger UI
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

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

/**
 * @openapi
 * /login:
 *   post:
 *     summary: Logs in a user
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Login successful
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal Server Error
 */

app.post('/login', (req, res, next) => {
  try {
    const { username, password } = req.body;
    
    if (password === 'error') {
      throw new Error('Simulated error in login');
    }

    if (password === 'm295') {
      const token = generateToken();
      req.session.user = { username: username, token: token };
      res.json({ message: 'Login successful', username: username, token: token });
    } else {
      res.sendStatus(401);
    }
  } catch (err) {
    console.error(`Error in login endpoint: ${err.message}`);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

/**
 * @openapi
 * /verify:
 *   get:
 *     summary: Verifies the session token
 *     responses:
 *       200:
 *         description: Token is still usable
 *       403:
 *         description: Forbidden
 *       500:
 *         description: Internal Server Error
 */

app.get('/verify', authenticate, (req, res, next) => {
  try {
    res.json({ token: req.session.user.token, message: 'Token is still usable' });
  } catch (err) {
    console.error(`Error in verify endpoint: ${err.message}`);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

/**
 * @openapi
 * /logout:
 *   delete:
 *     summary: Logs out the current user
 *     responses:
 *       204:
 *         description: Logout successful
 *       500:
 *         description: Internal Server Error
 */

app.delete('/logout', authenticate, (req, res, next) => {
  try {
    req.session.destroy(err => {
      if (err) {
        console.error(`Error destroying session: ${err.message}`);
        return res.sendStatus(500);
      }
      res.sendStatus(204);
    });
  } catch (err) {
    console.error(`Error in logout endpoint: ${err.message}`);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

/**
 * @openapi
 * /tasks:
 *   get:
 *     summary: Retrieves all tasks
 *     responses:
 *       200:
 *         description: List of tasks
 *       500:
 *         description: Internal Server Error
 *   post:
 *     summary: Creates a new task
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               done:
 *                 type: boolean
 *               dueDate:
 *                 type: string
 *     responses:
 *       201:
 *         description: Created task
 *       400:
 *         description: Bad request (e.g., missing title)
 *       500:
 *         description: Internal Server Error
 */

app.route('/tasks')
  .get(authenticate, (req, res, next) => {
    try {
      res.json(tasks);
    } catch (err) {
      console.error(`Error listing tasks: ${err.message}`);
      res.status(500).json({ message: 'Internal Server Error' });
    }
  })
  .post(authenticate, (req, res, next) => {
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

/**
 * @openapi
 * /tasks/{id}:
 *   get:
 *     summary: Retrieves a specific task by ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Retrieved task
 *       404:
 *         description: Task not found
 *       500:
 *         description: Internal Server Error
 *   patch:
 *     summary: Updates a task by ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               done:
 *                 type: boolean
 *               dueDate:
 *                 type: string
 *     responses:
 *       200:
 *         description: Updated task
 *       404:
 *         description: Task not found
 *       500:
 *         description: Internal Server Error
 *   delete:
 *     summary: Deletes a task by ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Deleted task
 *       404:
 *         description: Task not found
 *       500:
 *         description: Internal Server Error
 */

app.route('/tasks/:id')
  .get(authenticate, (req, res, next) => {
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
  })
  .patch(authenticate, (req, res, next) => {
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
  })
  .delete(authenticate, (req, res, next) => {
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

// Endpoint not found handler
app.use((req, res, next) => {
  console.error(`404 - Endpoint not found: ${req.originalUrl}`);
  res.status(404).json({ message: 'Endpoint not found' });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(`An error occurred: ${err.message}`);
  res.status(500).json({ message: 'Internal Server Error' });
});

// Swagger definition for all other routes
/**
 * @openapi
 * /:
 *   get:
 *     summary: Returns list of available endpoints
 *     responses:
 *       200:
 *         description: List of endpoints
 */
app.get('/', (req, res) => {
  const endpoints = [
    { method: 'POST', path: '/login', description: 'Logs in a user' },
    { method: 'GET', path: '/verify', description: 'Verifies the session token' },
    { method: 'DELETE', path: '/logout', description: 'Logs out the current user' },
    { method: 'GET', path: '/tasks', description: 'Retrieves all tasks' },
    { method: 'POST', path: '/tasks', description: 'Creates a new task' },
    { method: 'GET', path: '/tasks/{id}', description: 'Retrieves a specific task by ID' },
    { method: 'PATCH', path: '/tasks/{id}', description: 'Updates a task by ID' },
    { method: 'DELETE', path: '/tasks/{id}', description: 'Deletes a task by ID' }
  ];
  res.json(endpoints);
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});

