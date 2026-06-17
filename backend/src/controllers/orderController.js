const { PrismaClient } = require('@prisma/client');
const jwt = require('jsonwebtoken');
const prisma = new PrismaClient();

// Create new order (public checkout)
exports.createOrder = async (req, res) => {
  try {
    const { customerName, email, whatsapp, address, items, notes, paymentMethod, promoCode } = req.body;

    if (!customerName || !email || !whatsapp || !address || !items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'Customer name, email, WhatsApp, address, and items are required' });
    }

    // Run transaction
    const newOrder = await prisma.$transaction(async (tx) => {
      let totalAmount = 0;
      const orderItemsToCreate = [];

      // Validate products, stock, and calculate subtotal
      for (const item of items) {
        const product = await tx.product.findUnique({
          where: { id: parseInt(item.productId) },
        });

        if (!product) {
          throw new Error(`Product with ID ${item.productId} not found`);
        }

        if (product.stock < item.quantity) {
          throw new Error(`Stok produk "${product.name}" tidak mencukupi (Tersisa: ${product.stock})`);
        }

        // Decrease stock
        await tx.product.update({
          where: { id: product.id },
          data: { stock: product.stock - item.quantity },
        });

        const itemSubtotal = product.price * item.quantity;
        totalAmount += itemSubtotal;

        orderItemsToCreate.push({
          productId: product.id,
          quantity: item.quantity,
          price: product.price,
        });
      }

      // Check Promo Code (Example: ETHEREAL10 - 10% Discount)
      let discount = 0;
      if (promoCode && promoCode.toUpperCase() === 'ETHEREAL10') {
        discount = totalAmount * 0.1; // 10%
        totalAmount -= discount;
      }

      // Create Order
      const order = await tx.order.create({
        data: {
          customerId: null,
          customerName,
          email,
          whatsapp,
          address,
          totalAmount,
          notes: notes || '',
          paymentMethod,
          promoCode: promoCode || null,
          status: 'PENDING',
          items: {
            create: orderItemsToCreate,
          },
        },
        include: {
          items: {
            include: {
              product: true,
            },
          },
        },
      });

      return order;
    });

    // Generate and send HTML invoice
    const emailService = require('../services/emailService');
    const invoiceUrl = await emailService.sendInvoiceEmail(newOrder);

    // Mock Email/WhatsApp Notification
    console.log('==================================================');
    console.log(`NOTIFICATION: New Order Placed! ID: #${newOrder.id}`);
    console.log(`To: Admin (etherealhijab@gmail.com) & Customer WhatsApp (${newOrder.whatsapp}) & Email (${newOrder.email})`);
    console.log(`Customer: ${newOrder.customerName}`);
    console.log(`Total Payment: IDR ${newOrder.totalAmount.toLocaleString()}`);
    console.log(`Payment Method: ${newOrder.paymentMethod}`);
    console.log(`Invoice Static URL: ${invoiceUrl}`);
    console.log('==================================================');

    res.status(201).json({
      message: 'Order created successfully',
      order: newOrder,
      invoiceUrl: invoiceUrl || null,
    });
  } catch (err) {
    console.error('Order creation transaction failed:', err);
    res.status(400).json({ error: err.message || 'Failed to place order' });
  }
};

// Get order details for tracking (public)
exports.getOrderById = async (req, res) => {
  try {
    const { id } = req.params;
    const order = await prisma.order.findUnique({
      where: { id: parseInt(id) },
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
    });

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    res.json(order);
  } catch (err) {
    console.error('Error fetching order details:', err);
    res.status(500).json({ error: 'Failed to fetch order details' });
  }
};

// Search order tracking by WhatsApp number (public)
exports.trackOrderByWhatsapp = async (req, res) => {
  try {
    const { whatsapp } = req.query;

    if (!whatsapp) {
      return res.status(400).json({ error: 'WhatsApp number is required' });
    }

    const orders = await prisma.order.findMany({
      where: { whatsapp },
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json(orders);
  } catch (err) {
    console.error('Error tracking order by Whatsapp:', err);
    res.status(500).json({ error: 'Failed to search order' });
  }
};

// Get all orders (Admin)
exports.getOrders = async (req, res) => {
  try {
    const orders = await prisma.order.findMany({
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
    res.json(orders);
  } catch (err) {
    console.error('Error fetching orders:', err);
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
};

// Update order status (Admin)
exports.updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, trackingNumber } = req.body;

    const existingOrder = await prisma.order.findUnique({
      where: { id: parseInt(id) },
    });

    if (!existingOrder) {
      return res.status(404).json({ error: 'Order not found' });
    }

    const updatedOrder = await prisma.order.update({
      where: { id: parseInt(id) },
      data: {
        status: status || existingOrder.status,
        trackingNumber: trackingNumber !== undefined ? trackingNumber : existingOrder.trackingNumber,
      },
    });

    res.json(updatedOrder);
  } catch (err) {
    console.error('Error updating order status:', err);
    res.status(500).json({ error: 'Failed to update order status' });
  }
};

// Get sales stats (Admin)
exports.getSalesStats = async (req, res) => {
  try {
    // Total stats
    const totalOrdersCount = await prisma.order.count();
    
    const revenueAggregate = await prisma.order.aggregate({
      _sum: {
        totalAmount: true
      },
      where: {
        status: { not: 'CANCELLED' }
      }
    });
    const totalRevenue = revenueAggregate._sum.totalAmount || 0;

    // Count pending vs completed
    const pendingOrdersCount = await prisma.order.count({ where: { status: 'PENDING' } });
    const processedOrdersCount = await prisma.order.count({ where: { status: 'PROCESSED' } });
    const shippedOrdersCount = await prisma.order.count({ where: { status: 'SHIPPED' } });
    const completedOrdersCount = await prisma.order.count({ where: { status: 'COMPLETED' } });

    // Top selling products count
    const orderItems = await prisma.orderItem.findMany({
      include: {
        product: true
      }
    });

    const productSalesMap = {};
    orderItems.forEach(item => {
      const pId = item.productId;
      if (!productSalesMap[pId]) {
        productSalesMap[pId] = {
          name: item.product.name,
          category: item.product.category,
          quantity: 0,
          revenue: 0,
        };
      }
      productSalesMap[pId].quantity += item.quantity;
      productSalesMap[pId].revenue += item.price * item.quantity;
    });

    const topSellingProducts = Object.keys(productSalesMap)
      .map(key => productSalesMap[key])
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 5);

    // Category sales distribution
    const categorySalesMap = {};
    Object.values(productSalesMap).forEach(item => {
      categorySalesMap[item.category] = (categorySalesMap[item.category] || 0) + item.quantity;
    });

    res.json({
      totalOrders: totalOrdersCount,
      totalRevenue,
      statusCounts: {
        PENDING: pendingOrdersCount,
        PROCESSED: processedOrdersCount,
        SHIPPED: shippedOrdersCount,
        COMPLETED: completedOrdersCount,
      },
      topProducts: topSellingProducts,
      categoryDistribution: Object.keys(categorySalesMap).map(cat => ({
        label: cat,
        value: categorySalesMap[cat]
      }))
    });
  } catch (err) {
    console.error('Error fetching sales statistics:', err);
    res.status(500).json({ error: 'Failed to compile sales stats' });
  }
};

// Get logged-in customer's orders
exports.getMyOrders = async (req, res) => {
  try {
    if (req.user.role !== 'CUSTOMER') {
      return res.status(403).json({ error: 'Akses ditolak. Hanya untuk pelanggan.' });
    }
    const customerId = req.user.id;
    const orders = await prisma.order.findMany({
      where: { customerId },
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
    res.json(orders);
  } catch (err) {
    console.error('Error fetching customer orders:', err);
    res.status(500).json({ error: 'Gagal mengambil data pesanan' });
  }
};
