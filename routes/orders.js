const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const Customer = require('../models/Customer');
const auth = require('../middleware/auth');
const multer = require('multer');
const path = require('path');

// Configure multer for design file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/designs/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + Math.round(Math.random() * 1E9) + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|pdf|ai|eps/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype) || 
                    file.mimetype === 'application/pdf' ||
                    file.mimetype === 'application/illustrator';
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Apenas ficheiros de design são permitidos (JPEG, JPG, PNG, PDF, AI, EPS)'));
    }
  }
});

// POST /api/orders - Create new order
router.post('/', auth.optional, upload.array('designFiles', 10), async (req, res) => {
  try {
    const { items, shippingAddress, billingAddress, paymentMethod, notes } = req.body;
    
    // Find or create customer
    let customer;
    if (req.user && !req.user.isGuest) {
      customer = await Customer.findById(req.user.id);
    } else {
      // Create guest customer
      customer = new Customer({
        name: shippingAddress.name,
        email: shippingAddress.email,
        phone: shippingAddress.phone,
        company: shippingAddress.company,
        isGuest: true,
        addresses: [shippingAddress]
      });
      await customer.save();
    }
    
    // Process items with design files
    const processedItems = items.map((item, index) => {
      const designFile = req.files && req.files[index];
      return {
        ...item,
        customization: {
          ...item.customization,
          designFile: designFile ? `/uploads/designs/${designFile.filename}` : null
        }
      };
    });
    
    // Calculate totals
    const subtotal = processedItems.reduce((sum, item) => sum + item.subtotal, 0);
    const shipping = subtotal > 100 ? 0 : 15; // Free shipping over 100€
    const tax = subtotal * 0.23; // 23% IVA
    const total = subtotal + shipping + tax;
    
    const order = new Order({
      customer: customer._id,
      items: processedItems,
      shippingAddress,
      billingAddress: billingAddress || shippingAddress,
      totals: {
        subtotal,
        shipping,
        tax,
        total
      },
      payment: {
        method: paymentMethod,
        status: 'pending'
      },
      notes
    });
    
    await order.save();
    
    // Populate customer data for response
    await order.populate('customer', 'name email phone');
    
    res.status(201).json(order);
  } catch (error) {
    console.error('Error creating order:', error);
    res.status(500).json({ error: 'Erro ao criar encomenda' });
  }
});

// GET /api/orders - Get customer orders
router.get('/', auth.required, async (req, res) => {
  try {
    const { page = 1, limit = 10, status } = req.query;
    
    const query = { customer: req.user.id };
    if (status) query.status = status;
    
    const orders = await Order.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .populate('items.product', 'name images');
    
    const total = await Order.countDocuments(query);
    
    res.json({
      orders,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / limit),
        total,
        limit: parseInt(limit)
      }
    });
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({ error: 'Erro ao buscar encomendas' });
  }
});

// GET /api/orders/:id - Get specific order
router.get('/:id', auth.required, async (req, res) => {
  try {
    const order = await Order.findOne({ 
      _id: req.params.id, 
      customer: req.user.id 
    })
    .populate('items.product', 'name images specifications')
    .populate('customer', 'name email phone');
    
    if (!order) {
      return res.status(404).json({ error: 'Encomenda não encontrada' });
    }
    
    res.json(order);
  } catch (error) {
    console.error('Error fetching order:', error);
    res.status(500).json({ error: 'Erro ao buscar encomenda' });
  }
});

// PUT /api/orders/:id/payment - Update payment status
router.put('/:id/payment', auth.required, async (req, res) => {
  try {
    const { transactionId, status } = req.body;
    
    const order = await Order.findOne({ 
      _id: req.params.id, 
      customer: req.user.id 
    });
    
    if (!order) {
      return res.status(404).json({ error: 'Encomenda não encontrada' });
    }
    
    order.payment.transactionId = transactionId;
    order.payment.status = status;
    
    if (status === 'paid') {
      order.payment.paidAt = new Date();
      order.status = 'paid';
      order.tracking.push({
        status: 'paid',
        notes: 'Pagamento confirmado'
      });
    }
    
    await order.save();
    
    res.json(order);
  } catch (error) {
    console.error('Error updating payment:', error);
    res.status(500).json({ error: 'Erro ao atualizar pagamento' });
  }
});

// POST /api/orders/:id/cancel - Cancel order
router.post('/:id/cancel', auth.required, async (req, res) => {
  try {
    const order = await Order.findOne({ 
      _id: req.params.id, 
      customer: req.user.id 
    });
    
    if (!order) {
      return res.status(404).json({ error: 'Encomenda não encontrada' });
    }
    
    if (!['pending', 'paid'].includes(order.status)) {
      return res.status(400).json({ error: 'Esta encomenda não pode ser cancelada' });
    }
    
    order.status = 'cancelled';
    order.tracking.push({
      status: 'cancelled',
      notes: req.body.reason || 'Cancelado pelo cliente'
    });
    
    await order.save();
    
    res.json({ message: 'Encomenda cancelada com sucesso' });
  } catch (error) {
    console.error('Error cancelling order:', error);
    res.status(500).json({ error: 'Erro ao cancelar encomenda' });
  }
});

module.exports = router;
