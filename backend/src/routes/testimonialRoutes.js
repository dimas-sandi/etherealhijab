const express = require('express');
const router = express.Router();
const testimonialController = require('../controllers/testimonialController');

router.get('/', testimonialController.getTestimonials);
router.post('/', testimonialController.createTestimonial);

module.exports = router;
