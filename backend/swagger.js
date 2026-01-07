
import swaggerJsdoc from 'swagger-jsdoc';
import swaggerDefinition from './docs/swagger.json' assert { type: 'json' };
const options = {
  definition: swaggerDefinition,
  apis: [],
};

export default swaggerJsdoc(options);
