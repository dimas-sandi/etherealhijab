const express = require('express');
const router = express.Router();
const customerController = require('../controllers/customerController');
const authMiddleware = require('../middleware/authMiddleware');

router.post('/', customerController.submitSurvey);
router.get('/stats', authMiddleware, customerController.getSurveyStats);
router.get('/', authMiddleware, customerController.getSurveys);

module.exports = router;
