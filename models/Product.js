const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  slug: {
    type: String,
    required: true,
    unique: true
  },
  description: {
    type: String,
    required: true
  },
  category: {
    type: String,
    required: true,
    enum: ['flags', 'fly-banners', 'banners', 'gazebos', 'displays', 'masts']
  },
  subcategory: {
    type: String,
    required: true
  },
  basePrice: {
    type: Number,
    required: true,
    min: 0
  },
  images: [{
    type: String,
    required: true
  }],
  specifications: {
    width: Number,
    height: Number,
    material: String,
    printing: String,
    finishing: String
  },
  customizationOptions: {
    allowsCustomDesign: {
      type: Boolean,
      default: true
    },
    maxFileSize: {
      type: Number,
      default: 10485760 // 10MB
    },
    acceptedFormats: [{
      type: String,
      enum: ['jpg', 'jpeg', 'png', 'pdf', 'ai', 'eps']
    }],
    colorOptions: [{
      name: String,
      code: String,
      price: Number
    }],
    sizeOptions: [{
      name: String,
      width: Number,
      height: Number,
      price: Number
    }]
  },
  supplierInfo: {
    supplierCode: String,
    supplierPrice: Number,
    supplierUrl: String,
    leadTime: {
      type: Number,
      default: 24 // hours
    }
  },
  stock: {
    available: {
      type: Boolean,
      default: true
    },
    quantity: {
      type: Number,
      default: 999
    }
  },
  seo: {
    title: String,
    description: String,
    keywords: [String]
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'draft'],
    default: 'active'
  },
  featured: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Index for search
productSchema.index({ name: 'text', description: 'text' });
productSchema.index({ category: 1, subcategory: 1 });
productSchema.index({ slug: 1 });

module.exports = mongoose.model('Product', productSchema);
