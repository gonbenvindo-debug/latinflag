const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Order = require('../models/Order');
const Customer = require('../models/Customer');
const Product = require('../models/Product');

// All admin routes require authentication and admin privileges
router.use(auth.required, auth.admin);

// GET /api/admin/dashboard - Dashboard statistics
router.get('/dashboard', async (req, res) => {
  try {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);
    
    // Current month stats
    const currentMonthOrders = await Order.find({
      createdAt: { $gte: startOfMonth }
    });
    
    const currentMonthRevenue = currentMonthOrders
      .filter(order => order.payment.status === 'paid')
      .reduce((sum, order) => sum + order.totals.total, 0);
    
    // Last month stats
    const lastMonthOrders = await Order.find({
      createdAt: { $gte: startOfLastMonth, $lte: endOfLastMonth }
    });
    
    const lastMonthRevenue = lastMonthOrders
      .filter(order => order.payment.status === 'paid')
      .reduce((sum, order) => sum + order.totals.total, 0);
    
    // Overall stats
    const totalOrders = await Order.countDocuments();
    const totalCustomers = await Customer.countDocuments({ isGuest: false });
    const totalProducts = await Product.countDocuments({ status: 'active' });
    
    // Recent orders
    const recentOrders = await Order.find()
      .sort({ createdAt: -1 })
      .limit(10)
      .populate('customer', 'name email')
      .populate('items.product', 'name');
    
    // Orders by status
    const ordersByStatus = await Order.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);
    
    res.json({
      stats: {
        currentMonth: {
          orders: currentMonthOrders.length,
          revenue: currentMonthRevenue
        },
        lastMonth: {
          orders: lastMonthOrders.length,
          revenue: lastMonthRevenue
        },
        total: {
          orders: totalOrders,
          customers: totalCustomers,
          products: totalProducts
        }
      },
      recentOrders,
      ordersByStatus: ordersByStatus.reduce((acc, item) => {
        acc[item._id] = item.count;
        return acc;
      }, {})
    });
  } catch (error) {
    console.error('Dashboard error:', error);
    res.status(500).json({ error: 'Erro ao carregar dashboard' });
  }
});

// GET /api/admin/orders - Get all orders (admin view)
router.get('/orders', async (req, res) => {
  try {
    const { page = 1, limit = 20, status, search } = req.query;
    
    const query = {};
    if (status) query.status = status;
    
    if (search) {
      query.$or = [
        { orderNumber: { $regex: search, $options: 'i' } },
        { 'customer.name': { $regex: search, $options: 'i' } },
        { 'customer.email': { $regex: search, $options: 'i' } }
      ];
    }
    
    const orders = await Order.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .populate('customer', 'name email phone company')
      .populate('items.product', 'name');
    
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
    console.error('Admin orders error:', error);
    res.status(500).json({ error: 'Erro ao buscar encomendas' });
  }
});

// PUT /api/admin/orders/:id - Update order (admin)
router.put('/orders/:id', async (req, res) => {
  try {
    const { status, supplierInfo, notes } = req.body;
    
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ error: 'Encomenda não encontrada' });
    }
    
    if (status && status !== order.status) {
      order.status = status;
      order.tracking.push({
        status,
        notes: notes || `Status atualizado para ${status}`
      });
    }
    
    if (supplierInfo) {
      order.supplier = { ...order.supplier, ...supplierInfo };
    }
    
    if (notes) {
      order.notes = notes;
    }
    
    await order.save();
    await order.populate('customer', 'name email phone');
    
    res.json(order);
  } catch (error) {
    console.error('Update order error:', error);
    res.status(500).json({ error: 'Erro ao atualizar encomenda' });
  }
});

// GET /api/admin/customers - Get all customers (admin view)
router.get('/customers', async (req, res) => {
  try {
    const { page = 1, limit = 20, search, isGuest } = req.query;
    
    const query = {};
    if (isGuest !== undefined) query.isGuest = isGuest === 'true';
    
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { 'company.name': { $regex: search, $options: 'i' } }
      ];
    }
    
    const customers = await Customer.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .select('-password');
    
    const total = await Customer.countDocuments(query);
    
    res.json({
      customers,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / limit),
        total,
        limit: parseInt(limit)
      }
    });
  } catch (error) {
    console.error('Admin customers error:', error);
    res.status(500).json({ error: 'Erro ao buscar clientes' });
  }
});

// GET /api/admin/products - Get all products (admin view)
router.get('/products', async (req, res) => {
  try {
    const { page = 1, limit = 20, category, status, search } = req.query;
    
    const query = {};
    if (category) query.category = category;
    if (status) query.status = status;
    
    if (search) {
      query.$text = { $search: search };
    }
    
    const products = await Product.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));
    
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
    console.error('Admin products error:', error);
    res.status(500).json({ error: 'Erro ao buscar produtos' });
  }
});

// POST /api/admin/supplier/order - Place order with supplier
router.post('/supplier/order', async (req, res) => {
  try {
    const { orderId, supplierOrderData } = req.body;
    
    const order = await Order.findById(orderId).populate('items.product');
    if (!order) {
      return res.status(404).json({ error: 'Encomenda não encontrada' });
    }
    
    // Here you would integrate with Adivin's API or portal
    // For now, we'll simulate the order placement
    
    order.supplier = {
      orderReference: `AD-${Date.now()}`,
      ...supplierOrderData,
      notes: 'Encomenda colocada automaticamente'
    };
    
    order.status = 'supplier_ordered';
    order.tracking.push({
      status: 'supplier_ordered',
      notes: 'Encomenda enviada para fornecedor'
    });
    
    await order.save();
    
    res.json({
      message: 'Encomenda enviada para fornecedor com sucesso',
      order
    });
  } catch (error) {
    console.error('Supplier order error:', error);
    res.status(500).json({ error: 'Erro ao enviar encomenda para fornecedor' });
  }
});

module.exports = router;
