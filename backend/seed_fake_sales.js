const mysql = require('mysql2/promise');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config();

const dbUrl = process.env.DATABASE_URL || 'mysql://root:@localhost:3306/ethereal_hijab';

// Helper to generate a unique order ID: ETH-YYMMDD-[5-char-random-alphanumeric]
function generateUniqueOrderId(date) {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  const yy = String(date.getFullYear()).slice(-2);
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  const dateStr = `${yy}${mm}${dd}`;

  let randomStr = '';
  for (let i = 0; i < 5; i++) {
    randomStr += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return `ETH-${dateStr}-${randomStr}`;
}

async function main() {
  console.log('Connecting to database:', dbUrl);
  const connection = await mysql.createConnection(dbUrl);
  
  try {
    console.log('Clearing old orders and order items...');
    await connection.query('SET FOREIGN_KEY_CHECKS = 0');
    await connection.query('TRUNCATE TABLE `OrderItem`');
    await connection.query('TRUNCATE TABLE `Order`');
    await connection.query('SET FOREIGN_KEY_CHECKS = 1');
    console.log('Old orders cleared.');

    // Fetch products to get prices
    const [products] = await connection.query('SELECT * FROM `Product`');
    if (products.length === 0) {
      console.error('No products found. Please seed products first.');
      process.exit(1);
    }
    console.log(`Found ${products.length} products to use.`);

    const customerNames = [
      'Siti Rahma', 'Dewi Lestari', 'Aulia Zahra', 'Rina Wijaya', 'Fitri Handayani',
      'Indah Permata', 'Nani Suryani', 'Megawati', 'Kartika Sari', 'Sri Wahyuni',
      'Desi Ratnasari', 'Yuni Shara', 'Krisdayanti', 'Mulan Jameela', 'Maia Estianty',
      'Anggun C. Sasmi', 'Rossa', 'Isyana Sarasvati', 'Raisa Andriana', 'Laudya Cynthia'
    ];

    const cities = ['Jakarta', 'Bandung', 'Surabaya', 'Medan', 'Yogyakarta', 'Palembang', 'Semarang', 'Makassar'];
    const streets = ['Jl. Sudirman No. 12', 'Jl. Merdeka No. 45', 'Jl. Thamrin No. 89', 'Jl. Gajah Mada No. 3', 'Jl. Diponegoro No. 17'];
    const domains = ['gmail.com', 'yahoo.com', 'outlook.com'];
    const paymentMethods = ['WhatsApp Checkout', 'Bank Transfer', 'QRIS'];

    // Generate 20 orders
    for (let i = 0; i < 20; i++) {
      // Pick random date in May or June 2026
      const isJune = Math.random() > 0.4;
      const day = Math.floor(Math.random() * 28) + 1;
      const month = isJune ? 5 : 4; // 0-indexed: 4 is May, 5 is June
      const date = new Date(2026, month, day, 10 + Math.floor(Math.random() * 8), Math.floor(Math.random() * 60));
      
      const orderId = generateUniqueOrderId(date);
      const customerName = customerNames[i];
      const email = `${customerName.toLowerCase().replace(' ', '')}@${domains[Math.floor(Math.random() * domains.length)]}`;
      const whatsapp = `0812${Math.floor(10000000 + Math.random() * 90000000)}`;
      const city = cities[Math.floor(Math.random() * cities.length)];
      const address = `${streets[Math.floor(Math.random() * streets.length)]}, ${city}`;
      const paymentMethod = paymentMethods[Math.floor(Math.random() * paymentMethods.length)];
      
      // Let's decide status distribution based on time
      let status = 'COMPLETED';
      if (month === 5 && day > 15) {
        const rand = Math.random();
        if (rand < 0.2) status = 'PENDING';
        else if (rand < 0.4) status = 'PROCESSED';
        else if (rand < 0.6) status = 'SHIPPED';
        else status = 'COMPLETED';
      }

      const trackingNumber = status === 'SHIPPED' || status === 'COMPLETED' ? `JN-${Math.floor(100000000 + Math.random() * 900000000)}` : null;

      // Determine items
      const numItems = Math.floor(Math.random() * 3) + 1; // 1 to 3 items
      const shuffledProds = [...products].sort(() => 0.5 - Math.random());
      
      let totalAmount = 0;
      const itemsToInsert = [];

      for (let j = 0; j < numItems; j++) {
        const prod = shuffledProds[j];
        const qty = Math.floor(Math.random() * 2) + 1; // 1 or 2
        const color = prod.colors.split(',')[Math.floor(Math.random() * prod.colors.split(',').length)].trim();
        const price = prod.price;
        
        totalAmount += price * qty;
        itemsToInsert.push({
          productId: prod.id,
          quantity: qty,
          price,
          color
        });
      }

      // Check Promo Code (Example: ETHEREAL10 - 10% Discount)
      let discountAmount = 0;
      let promoCode = null;
      if (Math.random() < 0.3) {
        promoCode = 'ETHEREAL10';
        discountAmount = totalAmount * 0.1;
        totalAmount -= discountAmount;
      }

      const formattedCreatedAt = date.toISOString().slice(0, 19).replace('T', ' ');

      // Insert Order
      const [orderResult] = await connection.query(
        `INSERT INTO \`Order\` 
         (id, customerId, customerName, email, whatsapp, address, city, totalAmount, discountAmount, notes, paymentMethod, status, trackingNumber, promoCode, createdAt, updatedAt) 
         VALUES (?, NULL, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [orderId, customerName, email, whatsapp, address, city, totalAmount, discountAmount, 'Catatan pesanan', paymentMethod, status, trackingNumber, promoCode, formattedCreatedAt, formattedCreatedAt]
      );

      // Insert Items
      for (const item of itemsToInsert) {
        await connection.query(
          `INSERT INTO \`OrderItem\` (orderId, productId, quantity, price, color) VALUES (?, ?, ?, ?, ?)`,
          [orderId, item.productId, item.quantity, item.price, item.color]
        );
      }
    }
    console.log('Successfully seeded 20 fake orders.');

    // Clear old customer survey data first to prevent duplicate seeding bloat
    console.log('Clearing old customer survey data...');
    await connection.query('TRUNCATE TABLE `CustomerData`');

    console.log('Seeding customer survey answers...');
    const extraSurveys = [
      { name: 'Sari', age: 24, gender: 'Wanita', city: 'Palembang', preference: 'Hijab Segi Empat (Square)', budget: 'IDR 50k - 100k', frequency: '2-3 kali' },
      { name: 'Meutia', age: 21, gender: 'Wanita', city: 'Palembang', preference: 'Pashmina', budget: 'IDR 100k - 200k', frequency: '4-5 kali' },
      { name: 'Annisa', age: 23, gender: 'Wanita', city: 'Palembang', preference: 'Pashmina Instan (Pashmina Inner)', budget: 'IDR 50k - 100k', frequency: '2-3 kali' },
      { name: 'Fitria', age: 27, gender: 'Wanita', city: 'Palembang', preference: 'Hijab Instan', budget: 'IDR 100k - 200k', frequency: '1 kali' },
      { name: 'Rani', age: 25, gender: 'Wanita', city: 'Palembang', preference: 'Hijab Segi Empat (Square)', budget: 'Di atas IDR 200k', frequency: '2-3 kali' },
      { name: 'Zahra', age: 20, gender: 'Wanita', city: 'Jakarta', preference: 'Pashmina', budget: 'IDR 100k - 200k', frequency: '4-5 kali' },
      { name: 'Nabila', age: 22, gender: 'Wanita', city: 'Bandung', preference: 'Hijab Instan', budget: 'IDR 50k - 100k', frequency: '2-3 kali' },
      { name: 'Dina', age: 30, gender: 'Wanita', city: 'Surabaya', preference: 'Hijab Olahraga (Sport Hijab)', budget: 'IDR 100k - 200k', frequency: '1 kali' },
      { name: 'Lia', age: 26, gender: 'Wanita', city: 'Medan', preference: 'Turban', budget: 'IDR 50k - 100k', frequency: '2-3 kali' },
      { name: 'Salma', age: 19, gender: 'Wanita', city: 'Yogyakarta', preference: 'Pashmina', budget: 'IDR 50k - 100k', frequency: '4-5 kali' }
    ];

    for (const survey of extraSurveys) {
      await connection.query(
        `INSERT INTO \`CustomerData\` (name, age, gender, city, preference, budget, frequency, createdAt) VALUES (?, ?, ?, ?, ?, ?, ?, NOW())`,
        [survey.name, survey.age, survey.gender, survey.city, survey.preference, survey.budget, survey.frequency]
      );
    }
    console.log('Seeded customer survey data.');

  } catch (err) {
    console.error('Error seeding fake sales data:', err);
  } finally {
    await connection.end();
  }
}

main();
