const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Get testimonials
exports.getTestimonials = async (req, res) => {
  try {
    const testimonials = await prisma.testimonial.findMany({
      orderBy: { createdAt: 'desc' },
    });
    res.json(testimonials);
  } catch (err) {
    console.error('Error fetching testimonials:', err);
    res.status(500).json({ error: 'Failed to fetch testimonials' });
  }
};

// Create new testimonial
exports.createTestimonial = async (req, res) => {
  try {
    const { name, review, rating, imageUrl, role } = req.body;

    if (!name || !review || !rating) {
      return res.status(400).json({ error: 'Name, review, and rating are required' });
    }

    const testimonial = await prisma.testimonial.create({
      data: {
        name,
        review,
        rating: parseInt(rating),
        imageUrl: imageUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=150',
        role: role || 'Customer',
      },
    });

    res.status(201).json(testimonial);
  } catch (err) {
    console.error('Error creating testimonial:', err);
    res.status(500).json({ error: 'Failed to submit testimonial' });
  }
};
