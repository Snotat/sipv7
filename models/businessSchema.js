
const mongoose = require('mongoose')

const businessSchema = new mongoose.Schema({
    // From Registration Form
    businessName: { type: String, required: true },
    registrationNumber: String,
    businessType: { type: String, required: true },
    establishmentDate: Date,

    // Contact Details
    address: {
        street: String,
        city: String,
        state: String,
        zip: String,
        country: String
    },
    phone: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    website: String,

    // Owner Details
    owner: {
        name: { type: String, required: true },
        email: { type: String, required: true },
        phone: { type: String, required: true }
    },

    // Account Security
    password: { type: String, required: true },

    // System Fields
    stores: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Store' }],
    createdAt: { type: Date, default: Date.now },
    lastLogin: { type: Date, default: Date.now },
    status: { type: String, enum: ['active', 'suspended'], default: 'active' }
});


//2024-01-15T12:30:00Z
// blogSchema.post('save', async function (doc, next) {
//     try {
//         await mongoose.model('User').findByIdAndUpdate(doc.user, {
//             $push: { blogs: doc._id }
//         });
//         next();
//     } catch (error) {
//         next(error);
//     }
// });
// blogSchema.post('findByIdAndDelete', async function (doc, next) {
//     if (doc) {
//         await User.findByIdAndUpdate(doc.user, { $pull: { blogs: doc._id } });
//         next()
//     }
// });

module.exports = mongoose.model('Business', businessSchema)