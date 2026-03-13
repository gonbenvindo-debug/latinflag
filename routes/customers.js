const express = require('express');
const router = express.Router();
const Customer = require('../models/Customer');
const auth = require('../middleware/auth');
const jwt = require('jsonwebtoken');

// POST /api/customers/register - Register new customer
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, phone, company } = req.body;
    
    // Check if customer already exists
    const existingCustomer = await Customer.findOne({ email });
    if (existingCustomer) {
      return res.status(400).json({ error: 'Email já registado' });
    }
    
    const customer = new Customer({
      name,
      email,
      password,
      phone,
      company
    });
    
    await customer.save();
    
    // Generate token
    const token = customer.generateAuthToken();
    
    res.status(201).json({
      customer: {
        id: customer._id,
        name: customer.name,
        email: customer.email,
        phone: customer.phone,
        company: customer.company
      },
      token
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Erro ao registar cliente' });
  }
});

// POST /api/customers/login - Login customer
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Find customer by email
    const customer = await Customer.findOne({ email, isActive: true });
    if (!customer) {
      return res.status(401).json({ error: 'Credenciais inválidas' });
    }
    
    // Check password
    const isMatch = await customer.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Credenciais inválidas' });
    }
    
    // Update last login
    customer.lastLogin = new Date();
    await customer.save();
    
    // Generate token
    const token = customer.generateAuthToken();
    
    res.json({
      customer: {
        id: customer._id,
        name: customer.name,
        email: customer.email,
        phone: customer.phone,
        company: customer.company,
        addresses: customer.addresses
      },
      token
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Erro ao fazer login' });
  }
});

// GET /api/customers/profile - Get customer profile
router.get('/profile', auth.required, async (req, res) => {
  try {
    const customer = await Customer.findById(req.user.id)
      .select('-password -verificationToken -resetPasswordToken -resetPasswordExpires');
    
    if (!customer) {
      return res.status(404).json({ error: 'Cliente não encontrado' });
    }
    
    res.json(customer);
  } catch (error) {
    console.error('Profile error:', error);
    res.status(500).json({ error: 'Erro ao buscar perfil' });
  }
});

// PUT /api/customers/profile - Update customer profile
router.put('/profile', auth.required, async (req, res) => {
  try {
    const { name, phone, company, preferences } = req.body;
    
    const customer = await Customer.findByIdAndUpdate(
      req.user.id,
      { name, phone, company, preferences },
      { new: true, runValidators: true }
    ).select('-password');
    
    res.json(customer);
  } catch (error) {
    console.error('Profile update error:', error);
    res.status(500).json({ error: 'Erro ao atualizar perfil' });
  }
});

// POST /api/customers/addresses - Add new address
router.post('/addresses', auth.required, async (req, res) => {
  try {
    const customer = await Customer.findById(req.user.id);
    
    // If this is the first address or marked as default, make it default
    if (customer.addresses.length === 0 || req.body.isDefault) {
      customer.addresses.forEach(addr => addr.isDefault = false);
    }
    
    customer.addresses.push(req.body);
    await customer.save();
    
    res.json(customer.addresses);
  } catch (error) {
    console.error('Add address error:', error);
    res.status(500).json({ error: 'Erro ao adicionar morada' });
  }
});

// PUT /api/customers/addresses/:id - Update address
router.put('/addresses/:id', auth.required, async (req, res) => {
  try {
    const customer = await Customer.findById(req.user.id);
    const addressIndex = customer.addresses.findIndex(addr => addr._id.toString() === req.params.id);
    
    if (addressIndex === -1) {
      return res.status(404).json({ error: 'Morada não encontrada' });
    }
    
    // If setting as default, unset others
    if (req.body.isDefault) {
      customer.addresses.forEach(addr => addr.isDefault = false);
    }
    
    customer.addresses[addressIndex] = { ...customer.addresses[addressIndex], ...req.body };
    await customer.save();
    
    res.json(customer.addresses);
  } catch (error) {
    console.error('Update address error:', error);
    res.status(500).json({ error: 'Erro ao atualizar morada' });
  }
});

// DELETE /api/customers/addresses/:id - Delete address
router.delete('/addresses/:id', auth.required, async (req, res) => {
  try {
    const customer = await Customer.findById(req.user.id);
    customer.addresses = customer.addresses.filter(addr => addr._id.toString() !== req.params.id);
    
    // If we deleted the default address, set a new one
    if (customer.addresses.length > 0 && !customer.addresses.some(addr => addr.isDefault)) {
      customer.addresses[0].isDefault = true;
    }
    
    await customer.save();
    res.json(customer.addresses);
  } catch (error) {
    console.error('Delete address error:', error);
    res.status(500).json({ error: 'Erro ao eliminar morada' });
  }
});

// POST /api/customers/change-password - Change password
router.post('/change-password', auth.required, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    
    const customer = await Customer.findById(req.user.id);
    const isMatch = await customer.comparePassword(currentPassword);
    
    if (!isMatch) {
      return res.status(400).json({ error: 'Password atual incorreta' });
    }
    
    customer.password = newPassword;
    await customer.save();
    
    res.json({ message: 'Password alterada com sucesso' });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({ error: 'Erro ao alterar password' });
  }
});

module.exports = router;
