const swaggerJsdoc = require('swagger-jsdoc');

const swaggerDefinition = {
  openapi: '3.0.0',
  info: {
    title: 'Task Management API',
    version: '1.0.0',
    description: 'API endpoints for managing tasks',
  },
  servers: [
    {
      url: 'http://localhost:3000', 
      description: 'Development server',
    },
  ],
  components: {
    securitySchemes: {
      sessionAuth: {
        type: 'apiKey',
        in: 'header',
        name: 'Authorization',
        description: 'Enter your session token in the format "Bearer <token>"',
      },
    },
  },
  security: [
    {
      sessionAuth: [],
    },
  ],
};

const options = {
  swaggerDefinition,
  apis: ['../src/server.js'], 
};

const swaggerSpec = swaggerJsdoc(options);

module.exports = swaggerSpec;
