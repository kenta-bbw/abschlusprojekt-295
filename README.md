# Node.js Server Application

Author: Kenta Waibel  
Assisted by: ChatGPT  
Date: 19.06.204

---

## Description

This Node.js application serves as a robust server offering RESTful API endpoints for efficient management of tasks and user sessions. It leverages Express.js for streamlined routing, integrates session management using `express-session`, and features Swagger for comprehensive API documentation.

---

## Features

- **Authentication**: Secure user login/logout functionality with session management.
- **Task Management**: Comprehensive CRUD operations for tasks (Create, Read, Update, Delete).
- **API Documentation**: Utilizes Swagger UI for clear and accessible endpoint exploration.

---

## Installation

1. **Clone the repository:**

   ```bash
   git clone <repository-url>
   cd <repository-directory>
   ```

2. **Install dependencies:**

   ```bash
   npm install
   ```

3. **Start the server:**

   ```bash
   node server.js
   ```

   The server will be accessible at `http://localhost:3000`.

---

## API Endpoints

Explore the API documentation at [https:localhost:3000/api-docs](https:localhost:3000/api-docs)

---

## Dependencies

The project utilizes the following dependencies:

- Express.js
- body-parser
- express-session
- crypto
- swagger-ui-express

---

## Notes

- **Session Management**: Sessions are managed securely using `express-session` with a randomly generated secret key.
- **Security**: Basic error handling is implemented, emphasizing the importance of additional security measures such as input validation and HTTPS deployment in production environments.

---

## License

This project is licensed under the MIT License. See the LICENSE file for details.

