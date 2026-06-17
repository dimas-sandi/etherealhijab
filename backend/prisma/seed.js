const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database with new categories...');

  // 1. Create Admin User
  const adminPasswordHash = bcrypt.hashSync('admin123', 10);
  const admin = await prisma.user.upsert({
    where: { username: 'admin' },
    update: {},
    create: {
      username: 'admin',
      passwordHash: adminPasswordHash,
      role: 'ADMIN',
    },
  });
  console.log('Admin user seeded:', admin.username);

  // 2. Create Products
  const productsData = [
    {
      name: 'Ethereal Voal Square Premium',
      price: 85000,
      description: 'Hijab segi empat voal ultrafine premium yang tegak di dahi, tidak mudah lecek, halus, dan nyaman untuk penggunaan sehari-hari.',
      material: 'Voal Ultrafine',
      stock: 50,
      colors: 'Beige, Dusty Pink, Cream, Sage Green',
      imageUrl: 'https://images.unsplash.com/photo-1609357605129-26f69add5d6e?auto=format&fit=crop&q=80&w=600',
      category: 'Hijab Segi Empat (Square)',
    },
    {
      name: 'Silk Pashmina Shimmer',
      price: 110000,
      description: 'Pashmina dengan kilau elegan yang memberikan kesan mewah. Tekstur jatuh, lembut, dan sangat anggun untuk acara formal.',
      material: 'Silk Shimmer',
      stock: 30,
      colors: 'Rose Gold, Mocca, Pearl White, Soft Lilac',
      imageUrl: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&q=80&w=600',
      category: 'Pashmina',
    },
    {
      name: 'Bergo Maryam Instant Daily',
      price: 45000,
      description: 'Hijab instan daily bertali belakang dari bahan jersey premium yang dingin di kulit, menyerap keringat, dan menutup dada sempurna.',
      material: 'Jersey Premium',
      stock: 80,
      colors: 'Black, Navy, Dark Grey, Mocca',
      imageUrl: 'https://images.unsplash.com/photo-1560769629-975ec94e6a86?auto=format&fit=crop&q=80&w=600',
      category: 'Hijab Instan',
    },
    {
      name: 'Pashmina Inner 2-in-1 Ethereal',
      price: 75000,
      description: 'Inovasi pashmina instan yang sudah menyatu dengan ciput/inner ninja premium di dalamnya. Praktis, rapi, dan anti geser.',
      material: 'Ceruty Babydoll & Jersey Knit',
      stock: 40,
      colors: 'Khaki, Caramel, Black, Soft Pink',
      imageUrl: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?auto=format&fit=crop&q=80&w=600',
      category: 'Pashmina Instan (Pashmina Inner)',
    },
    {
      name: 'Turban Instant Pleated',
      price: 55000,
      description: 'Turban instan dengan detail lipatan pleated mewah yang rapi. Bahan elastis, sejuk, dan nyaman digunakan seharian tanpa pusing.',
      material: 'Cotton Ribbed Premium',
      stock: 35,
      colors: 'Maroon, Mocca, Black, Grey',
      imageUrl: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&q=80&w=600',
      category: 'Turban',
    },
    {
      name: 'Sport Hijab Active Air',
      price: 60000,
      description: 'Hijab olahraga instan dengan sirkulasi udara maksimal. Bahan berpori halus yang sejuk, menyerap keringat, dan antilepek saat aktif bergerak.',
      material: 'DryFit Polyester Spandex',
      stock: 60,
      colors: 'Dark Grey, Black, Navy, Neon Pink',
      imageUrl: 'https://images.unsplash.com/photo-1618220179428-22790b461013?auto=format&fit=crop&q=80&w=600',
      category: 'Hijab Olahraga (Sport Hijab)',
    },
    {
      name: 'Ciput Rajut Anti Bingung',
      price: 20000,
      description: 'Ciput inner rajut premium yang elastis dan nyaman sepanjang hari tanpa menekan telinga. Mencegah hijab utama bergeser.',
      material: 'Soft Knit Yarn',
      stock: 120,
      colors: 'Black, Cream, Grey, Brown',
      imageUrl: 'https://images.unsplash.com/photo-1512436991641-6745cdb1723f?auto=format&fit=crop&q=80&w=600',
      category: 'Ciput',
    },
  ];

  await prisma.product.deleteMany({});
  for (const prod of productsData) {
    const product = await prisma.product.create({ data: prod });
    console.log('Product seeded:', product.name);
  }

  // 3. Create Testimonials
  const testimonialsData = [
    {
      name: 'Sarah Amelia',
      review: 'Bahan voal square-nya bener-bener tegak di dahi dan lembut banget! Warnanya juga soft, sesuai ekspektasi.',
      rating: 5,
      imageUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=150',
      role: 'Pelanggan Setia',
    },
    {
      name: 'Nabila Putri',
      review: 'Pashmina inner 2-in-1 bener-bener ngebantu buat yang pengen sat-set! Ciputnya pas di kepala dan tidak menekan telinga.',
      rating: 5,
      imageUrl: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&q=80&w=150',
      role: 'Customer',
    },
    {
      name: 'Dian Lestari',
      review: 'Sport hijabnya adem dipakai pas lari pagi. Bahannya menyerap keringat dengan baik dan tetap rapi.',
      rating: 5,
      imageUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=150',
      role: 'Customer',
    },
  ];

  await prisma.testimonial.deleteMany({});
  for (const test of testimonialsData) {
    await prisma.testimonial.create({ data: test });
  }
  console.log('Testimonials seeded.');

  // 4. Create Customer Data (Survey Answers)
  const customersSurveyData = [
    { name: 'Aminah', age: 22, gender: 'Wanita', city: 'Jakarta', preference: 'Hijab Segi Empat (Square)', budget: 'IDR 100k - 200k', frequency: '2-3 kali' },
    { name: 'Rania', age: 19, gender: 'Wanita', city: 'Bandung', preference: 'Pashmina', budget: 'IDR 50k - 100k', frequency: '1 kali' },
    { name: 'Khadijah', age: 28, gender: 'Wanita', city: 'Surabaya', preference: 'Hijab Instan', budget: 'IDR 100k - 200k', frequency: '4-5 kali' },
    { name: 'Fatimah', age: 31, gender: 'Wanita', city: 'Medan', preference: 'Pashmina Instan (Pashmina Inner)', budget: 'Di atas IDR 200k', frequency: '2-3 kali' },
    { name: 'Aisyah', age: 24, gender: 'Wanita', city: 'Yogyakarta', preference: 'Pashmina', budget: 'IDR 50k - 100k', frequency: '2-3 kali' },
    { name: 'Zulfa', age: 26, gender: 'Wanita', city: 'Semarang', preference: 'Ciput', budget: 'Di bawah IDR 50k', frequency: '1 kali' },
    { name: 'Hani', age: 33, gender: 'Wanita', city: 'Jakarta', preference: 'Hijab Instan', budget: 'IDR 100k - 200k', frequency: '2-3 kali' },
    { name: 'Laila', age: 21, gender: 'Wanita', city: 'Makassar', preference: 'Hijab Segi Empat (Square)', budget: 'IDR 50k - 100k', frequency: '1 kali' },
    { name: 'Salma', age: 23, gender: 'Wanita', city: 'Bandung', preference: 'Turban', budget: 'IDR 100k - 200k', frequency: '4-5 kali' },
    { name: 'Wardah', age: 29, gender: 'Wanita', city: 'Surabaya', preference: 'Hijab Olahraga (Sport Hijab)', budget: 'Di atas IDR 200k', frequency: '4-5 kali' },
  ];

  await prisma.customerData.deleteMany({});
  for (const cust of customersSurveyData) {
    await prisma.customerData.create({ data: cust });
  }
  console.log('Customer survey dummy data seeded.');

  console.log('Database seeding finished successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
