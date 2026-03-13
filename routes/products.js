const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const multer = require('multer');
const path = require('path');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/products/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + Math.round(Math.random() * 1E9) + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Apenas imagens são permitidas (JPEG, JPG, PNG, GIF, WebP)'));
    }
  }
});

// GET /api/products - Get all products with filters
router.get('/', async (req, res) => {
  try {
    const {
      category,
      subcategory,
      featured,
      search,
      minPrice,
      maxPrice,
      page = 1,
      limit = 12,
      sort = 'createdAt'
    } = req.query;

    // Build query
    const query = { status: 'active' };
    
    if (category) query.category = category;
    if (subcategory) query.subcategory = subcategory;
    if (featured === 'true') query.featured = true;
    
    if (search) {
      query.$text = { $search: search };
    }
    
    if (minPrice || maxPrice) {
      query.basePrice = {};
      if (minPrice) query.basePrice.$gte = parseFloat(minPrice);
      if (maxPrice) query.basePrice.$lte = parseFloat(maxPrice);
    }

    // Sort options
    const sortOptions = {};
    const sortField = sort === 'price' ? 'basePrice' : sort === 'name' ? 'name' : sort;
    sortOptions[sortField] = sort === 'price' ? 1 : -1;

    const skip = (page - 1) * limit;

    const products = await Product.find(query)
      .sort(sortOptions)
      .skip(skip)
      .limit(parseInt(limit))
      .select('-supplierInfo'); // Hide supplier info from public API

    const total = await Product.countDocuments(query);

    res.json({
      products,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / limit),
        total,
        limit: parseInt(limit)
      }
    });
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ error: 'Erro ao buscar produtos' });
  }
});

// GET /api/products/categories - Get all categories and subcategories
router.get('/categories', async (req, res) => {
  try {
    const categories = await Product.distinct('category');
    const result = {};
    
    for (const category of categories) {
      const subcategories = await Product.distinct('subcategory', { category, status: 'active' });
      result[category] = subcategories;
    }
    
    res.json(result);
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({ error: 'Erro ao buscar categorias' });
  }
});

// GET /api/products/featured - Get featured products
router.get('/featured', async (req, res) => {
  try {
    const products = await Product.find({ 
      featured: true, 
      status: 'active' 
    })
    .limit(8)
    .select('-supplierInfo')
    .sort({ createdAt: -1 });
    
    res.json(products);
  } catch (error) {
    console.error('Error fetching featured products:', error);
    res.status(500).json({ error: 'Erro ao buscar produtos destacados' });
  }
});

// GET /api/products/:slug - Get product by slug
router.get('/:slug', async (req, res) => {
  try {
    const product = await Product.findOne({ 
      slug: req.params.slug, 
      status: 'active' 
    }).select('-supplierInfo');
    
    if (!product) {
      return res.status(404).json({ error: 'Produto não encontrado' });
    }
    
    res.json(product);
  } catch (error) {
    console.error('Error fetching product:', error);
    res.status(500).json({ error: 'Erro ao buscar produto' });
  }
});

// POST /api/products - Create new product (Admin only)
router.post('/', upload.array('images', 5), async (req, res) => {
  try {
    const productData = JSON.parse(req.body.product);
    
    // Add image paths
    if (req.files) {
      productData.images = req.files.map(file => `/uploads/products/${file.filename}`);
    }
    
    // Generate slug
    productData.slug = productData.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
    
    const product = new Product(productData);
    await product.save();
    
    res.status(201).json(product);
  } catch (error) {
    console.error('Error creating product:', error);
    res.status(500).json({ error: 'Erro ao criar produto' });
  }
});

// PUT /api/products/:id - Update product (Admin only)
router.put('/:id', upload.array('images', 5), async (req, res) => {
  try {
    const productData = JSON.parse(req.body.product);
    
    // Add new image paths if any
    if (req.files && req.files.length > 0) {
      const newImages = req.files.map(file => `/uploads/products/${file.filename}`);
      productData.images = [...(productData.existingImages || []), ...newImages];
    }
    
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      productData,
      { new: true, runValidators: true }
    );
    
    if (!product) {
      return res.status(404).json({ error: 'Produto não encontrado' });
    }
    
    res.json(product);
  } catch (error) {
    console.error('Error updating product:', error);
    res.status(500).json({ error: 'Erro ao atualizar produto' });
  }
});

// DELETE /api/products/:id - Delete product (Admin only)
router.delete('/:id', async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      { status: 'inactive' },
      { new: true }
    );
    
    if (!product) {
      return res.status(404).json({ error: 'Produto não encontrado' });
    }
    
    res.json({ message: 'Produto desativado com sucesso' });
  } catch (error) {
    console.error('Error deleting product:', error);
    res.status(500).json({ error: 'Erro ao desativar produto' });
  }
});

module.exports = router;
