const mongoose = require("mongoose");


const productSchema = new mongoose.Schema({
    businessId: { type: mongoose.Schema.Types.ObjectId, ref: 'Business', required: true },

    sku: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    description: String,
    category: { type: String, required: true },
    price: {
        base: { type: Number, required: true },
        currency: { type: String, default: 'NGN' },
        profit: { type: Number, required: true }
    },
    images: [{ type: String }]
    ,
    inventory: {
        quantity: { type: Number, required: true },
        lowStockThreshold: { type: Number, default: 10 },
        lastRestocked: Date
    },
    salesData: {
        totalSold: { type: Number, default: 0 },
        lastSold: Date
    },
    status: { type: String, enum: ['active', 'discontinued', 'out-of-stock'], default: 'active' },
    supplierInfo: {
        name: String,
        contact: String
    },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Product', productSchema)