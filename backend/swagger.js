const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: require('./docs/swagger.json'),
  apis: [],
};

module.exports = swaggerJsdoc(options);
