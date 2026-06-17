const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'ethereal_hijab_secret_key_123456';

// Register Customer
exports.register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Nama, email, dan password wajib diisi.' });
    }

    // Check if email already registered
    const existing = await prisma.customer.findUnique({ where: { email } });
    if (existing) {
      return res.status(400).json({ error: 'Email sudah terdaftar. Silakan masuk.' });
    }

    const passwordHash = bcrypt.hashSync(password, 10);

    const customer = await prisma.customer.create({
      data: {
        name,
        email,
        passwordHash,
        provider: 'CREDENTIALS',
      },
    });

    const token = jwt.sign(
      { id: customer.id, email: customer.email, name: customer.name, role: 'CUSTOMER' },
      JWT_SECRET,
      { expiresIn: '30d' }
    );

    res.status(201).json({
      message: 'Registrasi berhasil',
      token,
      customer: {
        id: customer.id,
        name: customer.name,
        email: customer.email,
        provider: customer.provider,
      },
    });
  } catch (err) {
    console.error('Customer registration error:', err);
    res.status(500).json({ error: 'Gagal melakukan registrasi' });
  }
};

// Login Customer
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email dan password wajib diisi.' });
    }

    const customer = await prisma.customer.findUnique({ where: { email } });
    if (!customer || customer.provider !== 'CREDENTIALS') {
      return res.status(401).json({ error: 'Email atau password salah.' });
    }

    const validPassword = await bcrypt.compare(password, customer.passwordHash);
    if (!validPassword) {
      return res.status(401).json({ error: 'Email atau password salah.' });
    }

    const token = jwt.sign(
      { id: customer.id, email: customer.email, name: customer.name, role: 'CUSTOMER' },
      JWT_SECRET,
      { expiresIn: '30d' }
    );

    res.json({
      message: 'Login berhasil',
      token,
      customer: {
        id: customer.id,
        name: customer.name,
        email: customer.email,
        provider: customer.provider,
      },
    });
  } catch (err) {
    console.error('Customer login error:', err);
    res.status(500).json({ error: 'Gagal melakukan login' });
  }
};

// Google Login Mock
exports.googleLogin = async (req, res) => {
  try {
    const { name, email } = req.body;

    if (!name || !email) {
      return res.status(400).json({ error: 'Google profile data is required' });
    }

    // Upsert customer
    const customer = await prisma.customer.upsert({
      where: { email },
      update: {
        name, // Sync name
      },
      create: {
        email,
        name,
        provider: 'GOOGLE',
      },
    });

    const token = jwt.sign(
      { id: customer.id, email: customer.email, name: customer.name, role: 'CUSTOMER' },
      JWT_SECRET,
      { expiresIn: '30d' }
    );

    res.json({
      message: 'Google login successful',
      token,
      customer: {
        id: customer.id,
        name: customer.name,
        email: customer.email,
        provider: customer.provider,
      },
    });
  } catch (err) {
    console.error('Customer Google Login error:', err);
    res.status(500).json({ error: 'Gagal melakukan login Google' });
  }
};
