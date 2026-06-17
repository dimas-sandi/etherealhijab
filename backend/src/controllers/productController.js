const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Get all products (with filters)
exports.getProducts = async (req, res) => {
  try {
    const { category, search, minPrice, maxPrice, color } = req.query;

    const where = {};

    if (category && category !== 'All') {
      where.category = category;
    }

    if (search) {
      where.OR = [
        { name: { contains: search } },
        { description: { contains: search } },
      ];
    }

    if (minPrice || maxPrice) {
      where.price = {};
      if (minPrice) where.price.gte = parseFloat(minPrice);
      if (maxPrice) where.price.lte = parseFloat(maxPrice);
    }

    if (color) {
      where.colors = { contains: color };
    }

    const products = await prisma.product.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });

    res.json(products);
  } catch (err) {
    console.error('Error fetching products:', err);
    res.status(500).json({ error: 'Failed to fetch products' });
  }
};

// Get single product details
exports.getProductById = async (req, res) => {
  try {
    const { id } = req.params;
    const product = await prisma.product.findUnique({
      where: { id: parseInt(id) },
    });

    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    res.json(product);
  } catch (err) {
    console.error('Error fetching product details:', err);
    res.status(500).json({ error: 'Failed to fetch product details' });
  }
};

// Create product (Admin)
exports.createProduct = async (req, res) => {
  try {
    if (req.user?.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Akses ditolak. Hanya untuk administrator.' });
    }

    const { name, price, description, material, stock, colors, imageUrl, category } = req.body;

    if (!name || !price || !category || stock === undefined) {
      return res.status(400).json({ error: 'Name, price, category, and stock are required' });
    }

    const product = await prisma.product.create({
      data: {
        name,
        price: parseFloat(price),
        description: description || '',
        material: material || '',
        stock: parseInt(stock),
        colors: colors || '',
        imageUrl: imageUrl || '',
        category,
      },
    });

    res.status(201).json(product);
  } catch (err) {
    console.error('Error creating product:', err);
    res.status(500).json({ error: 'Failed to create product' });
  }
};

// Update product (Admin)
exports.updateProduct = async (req, res) => {
  try {
    if (req.user?.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Akses ditolak. Hanya untuk administrator.' });
    }

    const { id } = req.params;
    const { name, price, description, material, stock, colors, imageUrl, category } = req.body;

    const existingProduct = await prisma.product.findUnique({
      where: { id: parseInt(id) },
    });

    if (!existingProduct) {
      return res.status(404).json({ error: 'Product not found' });
    }

    const updatedProduct = await prisma.product.update({
      where: { id: parseInt(id) },
      data: {
        name: name !== undefined ? name : existingProduct.name,
        price: price !== undefined ? parseFloat(price) : existingProduct.price,
        description: description !== undefined ? description : existingProduct.description,
        material: material !== undefined ? material : existingProduct.material,
        stock: stock !== undefined ? parseInt(stock) : existingProduct.stock,
        colors: colors !== undefined ? colors : existingProduct.colors,
        imageUrl: imageUrl !== undefined ? imageUrl : existingProduct.imageUrl,
        category: category !== undefined ? category : existingProduct.category,
      },
    });

    res.json(updatedProduct);
  } catch (err) {
    console.error('Error updating product:', err);
    res.status(500).json({ error: 'Failed to update product' });
  }
};

// Delete product (Admin)
exports.deleteProduct = async (req, res) => {
  try {
    if (req.user?.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Akses ditolak. Hanya untuk administrator.' });
    }

    const { id } = req.params;

    const existingProduct = await prisma.product.findUnique({
      where: { id: parseInt(id) },
    });

    if (!existingProduct) {
      return res.status(404).json({ error: 'Product not found' });
    }

    await prisma.product.delete({
      where: { id: parseInt(id) },
    });

    res.json({ message: 'Product deleted successfully' });
  } catch (err) {
    console.error('Error deleting product:', err);
    res.status(500).json({ error: 'Failed to delete product' });
  }
};

// Upload product image (Admin)
exports.uploadImage = async (req, res) => {
  try {
    if (req.user?.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Akses ditolak. Hanya untuk administrator.' });
    }

    const { image } = req.body;
    if (!image) {
      return res.status(400).json({ error: 'Data gambar wajib disertakan.' });
    }

    // Check if base64 format is valid
    const matches = image.match(/^data:image\/([A-Za-z\-+]+);base64,(.+)$/);
    if (!matches || matches.length !== 3) {
      return res.status(400).json({ error: 'Format gambar tidak valid. Harus base64.' });
    }

    const imageExtension = matches[1];
    const imageBuffer = Buffer.from(matches[2], 'base64');

    // Limit size to 5MB
    if (imageBuffer.length > 5 * 1024 * 1024) {
      return res.status(400).json({ error: 'Ukuran gambar maksimal 5MB.' });
    }

    const fs = require('fs');
    const path = require('path');
    const filename = `product-${Date.now()}.${imageExtension}`;
    const uploadDir = path.join(__dirname, '../../uploads');

    // Create uploads directory if it doesn't exist
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    const filePath = path.join(uploadDir, filename);
    fs.writeFileSync(filePath, imageBuffer);

    const publicUrl = `/uploads/${filename}`;
    res.json({ imageUrl: publicUrl });
  } catch (err) {
    console.error('Upload error:', err);
    res.status(500).json({ error: 'Gagal mengunggah gambar.' });
  }
};
