const { PrismaClient } = require('@prisma/client');
const jwt = require('jsonwebtoken');
const prisma = new PrismaClient();

// Helper to generate a unique order ID: ETH-YYMMDD-[5-char-random-alphanumeric]
async function generateUniqueOrderId(txClient) {
  const client = txClient || prisma;
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  const today = new Date();
  
  const yy = String(today.getFullYear()).slice(-2);
  const mm = String(today.getMonth() + 1).padStart(2, '0');
  const dd = String(today.getDate()).padStart(2, '0');
  const dateStr = `${yy}${mm}${dd}`;

  let isUnique = false;
  let orderId = '';

  while (!isUnique) {
    let randomStr = '';
    for (let i = 0; i < 5; i++) {
      randomStr += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    orderId = `ETH-${dateStr}-${randomStr}`;
    
    const existing = await client.order.findUnique({
      where: { id: orderId },
    });
    if (!existing) {
      isUnique = true;
    }
  }

  return orderId;
}

// Create new order (public checkout)
exports.createOrder = async (req, res) => {
  try {
    const { customerName, email, whatsapp, address, city, items, notes, paymentMethod, promoCode } = req.body;

    if (!customerName || !email || !whatsapp || !address || !city || !items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'Customer name, email, WhatsApp, address, city, and items are required' });
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
          color: item.color || 'Default',
        });
      }

      // Check Promo Code (Example: ETHEREAL10 - 10% Discount)
      let discountAmount = 0;
      if (promoCode && promoCode.toUpperCase() === 'ETHEREAL10') {
        discountAmount = totalAmount * 0.1; // 10%
        totalAmount -= discountAmount;
      }

      // Create Order with unique alphanumeric ID
      const uniqueId = await generateUniqueOrderId(tx);
      const order = await tx.order.create({
        data: {
          id: uniqueId,
          customerId: null,
          customerName,
          email,
          whatsapp,
          address,
          city,
          totalAmount,
          discountAmount,
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
    console.log(`Discount: IDR ${newOrder.discountAmount.toLocaleString()}`);
    console.log(`City: ${newOrder.city}`);
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
    if (!id) {
      return res.status(400).json({ error: 'Order ID is required' });
    }
    const normalizedId = id.trim().toUpperCase();
    const order = await prisma.order.findUnique({
      where: { id: normalizedId },
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

    if (!id) {
      return res.status(400).json({ error: 'Order ID is required' });
    }
    const normalizedId = id.trim().toUpperCase();

    const existingOrder = await prisma.order.findUnique({
      where: { id: normalizedId },
    });

    if (!existingOrder) {
      return res.status(404).json({ error: 'Order not found' });
    }

    const updatedOrder = await prisma.order.update({
      where: { id: normalizedId },
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

// Export Financial Excel (Admin)
exports.exportFinancialExcel = async (req, res) => {
  try {
    if (req.user.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Akses ditolak. Hanya untuk Admin.' });
    }

    const path = require('path');
    const fs = require('fs');
    const { exec } = require('child_process');
    const scriptPath = path.join(__dirname, '../../generate_financials.js');

    exec(`node "${scriptPath}"`, (error, stdout, stderr) => {
      if (error) {
        console.error('Failed to generate excel:', error);
        return res.status(500).json({ error: 'Gagal membuat file excel.' });
      }

      const filePath = path.join(__dirname, '../../../DATA KEUANGAN ETHEREAL HIJAB.xlsx');
      if (fs.existsSync(filePath)) {
        res.download(filePath, 'DATA_KEUANGAN_ETHEREAL_HIJAB.xlsx');
      } else {
        res.status(404).json({ error: 'File Excel tidak ditemukan.' });
      }
    });
  } catch (err) {
    console.error('Export Excel failed:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};
