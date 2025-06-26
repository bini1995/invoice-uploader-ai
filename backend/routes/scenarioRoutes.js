const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../controllers/userController');
const { saveScenario, listScenarios, getScenario } = require('../controllers/scenarioController');

router.post('/', authMiddleware, saveScenario);
router.get('/', authMiddleware, listScenarios);
router.get('/:id', authMiddleware, getScenario);

module.exports = router;
