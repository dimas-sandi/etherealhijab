const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const authMiddleware = require('../middleware/authMiddleware');

router.post('/', orderController.createOrder);
router.get('/track', orderController.trackOrderByWhatsapp);
router.get('/stats', authMiddleware, orderController.getSalesStats);
router.get('/', authMiddleware, orderController.getOrders);
router.get('/my-orders', authMiddleware, orderController.getMyOrders);
router.get('/:id', orderController.getOrderById);
router.put('/:id/status', authMiddleware, orderController.updateOrderStatus);

module.exports = router;
