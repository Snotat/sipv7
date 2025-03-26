const mongoose = require("mongoose");


const saleSchema = new mongoose.Schema({
    businessId: { type: mongoose.Schema.Types.ObjectId, ref: 'Business', required: true },
    storeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Store' },
    products: [{
        productId: { type: String },
        quantity: { type: Number, required: true },
        priceAtSale: Number
    }],
    totalAmount: { type: Number, required: true },
    paymentMethod: { type: String, enum: ['cash', 'card', "transfer", 'online'] },
    customerInfo: {
        type: { type: String, enum: ['walk-in', 'member', 'online'] },
        id: String
    },
    salesDate: { type: Date, default: Date.now },
    salesPerson: String,
    transactionId: { type: String }
});

module.exports = mongoose.model('Sale', saleSchema);