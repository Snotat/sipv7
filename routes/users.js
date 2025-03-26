var express = require('express');
var bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken');

const Business = require('../models/businessSchema');
const Store = require('../models/storeSchema');
const Product = require('../models/productSchema');

const { JWT_SECRET } = require('../utils/config');
const MiddleWare = require("../authorizationSection/dataExtractor");
const Sale = require('../models/saleSchema');
const { default: mongoose } = require('mongoose');
var BusinessRouter = express.Router();

/* GET users listing. */
BusinessRouter.get('/getalldata', async function (req, res, next) {
  await Business.find().then(data => {
    console.log(data)
    return res.status(200).json(data)
  }).catch(err => {
    console.log(err)
  })
});

BusinessRouter.post('/register', async function (req, res, next) {
  console.log("user router post", req.body)
  let { businessName, registrationNumber, businessType, establishmentDate, street, city, state, zip, country, phone, email, website, ownerName, ownerEmail, ownerPhone, password, confirmPassword, acceptedTerms } = req.body
  const SALTROUND = 10;


  const hashPassword = await bcrypt.hash(confirmPassword, SALTROUND)
  let newUser = {
    businessName, registrationNumber, businessType, establishmentDate, address: {
      street,
      city,
      state,
      zip,
      country
    }, phone, email, website, owner: {
      name: ownerName,
      email: ownerEmail,
      phone: ownerPhone
    }, password: hashPassword
  }

  let checkExist = await Business.findOne({ email })
  console.log('check exist', checkExist, !checkExist)
  if (!checkExist) {
    let newBusiness = await new Business(newUser)
    await newBusiness.save().then(data => {
      return res.status(200).json({ ...data, message: 'Business registered successfully' })
    }).catch(err => {
      console.log(err)
      return res.status(400).json({ ...err, message: 'An error occurred, please retry' })
    })
  } else if (!!checkExist) {
    res.status(400).json({ message: 'Email already registered' })
  }
});


BusinessRouter.post('/login', async (req, res, next) => {
  let { email, password } = req.body;
  let findUser = await Business.findOne({ email })
  console.log('finduser', findUser)
  if (!!findUser) {
    let comparePassword = await bcrypt.compare(password, findUser.password)
    console.log("comparePassword", comparePassword)
    if (comparePassword) {

      console.log("comparePassword", comparePassword)
      let userForToken = {
        user: findUser.email,
        id: findUser._id
      }
      let token = jwt.sign(userForToken, JWT_SECRET)
      res.status(200).json({ ...findUser, token, message: "Login successful" })
    } else {

      return res.status(400).json({ message: 'Incorrect password' })
    }
  }
})

BusinessRouter.get('/getuserdata', MiddleWare.tokenExtractor, MiddleWare.userExtractor, async (req, res, next) => {
  console.log('userdetails', req.user, req.token)
  res.status(200).send(req.user)
})


BusinessRouter.post('/addstore', MiddleWare.tokenExtractor, MiddleWare.userExtractor, async (req, res, next) => {
  console.log('userdetails', req.user, req.token)
  let {
    name, type, description,
    address,
    city,
    state,
    country,
    phone,
    email,
    openingHours,
    manager,
    location,
    status
  } = req.body

  let storeDetails = { businessId: req.user._id, storeName: name, location, address: { address, city, state, country }, storeType: type, openingHours, description, manager, phone, email, status }
  let newStore = new Store(storeDetails);
  await newStore.save().then(data => {
    return res.status(200).json({ ...data, message: 'Store data saved successfully' })
  }).catch(err => {
    console.log(err)

    return res.status(400).json({ ...err, message: 'An error occurred, please retry' })
  })
})

BusinessRouter.post('/addproduct', MiddleWare.tokenExtractor, MiddleWare.userExtractor, async (req, res, next) => {
  console.log('userdetails', req.body)
  let {
    name,
    sku,
    description,
    category,
    price,
    costPrice,
    quantity,
    lowStockThreshold,
    supplier,
    images, supplierEmail
  } = req.body

  let storeDetails = {
    businessId: req.user._id,
    storeId: null,
    sku,
    name,
    description,
    category,
    price: {
      base: costPrice,
      currency: 'NGN',
      profit: price - costPrice
    },
    inventory: {
      quantity,
      lowStockThreshold,
      lastRestocked: ''
    },
    salesData: {
      totalSold: 0,
      lastSold: ''
    },

    supplierInfo: {
      name: supplier,
      contact: supplierEmail
    },
    images
  }
  let newStore = new Product(storeDetails);
  await newStore.save().then(data => {
    return res.status(200).json({ ...data, message: 'Product data saved successfully' })
  }).catch(err => {
    console.log(err)

    return res.status(400).json({ ...err, message: 'An error occurred, please retry' })
  })
})
BusinessRouter.post('/addsales', MiddleWare.tokenExtractor, MiddleWare.userExtractor, async (req, res, next) => {
  console.log('userdetails', req.user, req.token,)
  let {
    saleItems,
    paymentMethod,
    customerType,
    saleDate,
    total
  } = req.body

  let saleDetails = {
    businessId: req.user._id,
    storeId: null,
    // products: [{
    //   productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' }, 
    //   quantity: { type: Number, required: true },
    //   priceAtSale: Number
    // }],
    products: saleItems.map(data => {
      return {
        productId: data.product,
        quantity: data.quantity,
        priceAtSale: data.price
      }
    })
    ,
    totalAmount: total,
    paymentMethod,
    customerInfo: {
      type: customerType,
      id: ''
    },
    salesDate: saleDate,
    transactionId: Math.random() * 1000000
  }

  let newSale = new Sale(saleDetails);
  await newSale.save().then(data => {
    return res.status(200).json({ ...data, message: 'Product data saved successfully' })
  }).catch(err => {
    console.log(err)

    return res.status(400).json({ ...err, message: 'An error occurred, please retry' })
  })
})

BusinessRouter.get('/getproducts', MiddleWare.tokenExtractor, MiddleWare.userExtractor, async (req, res) => {
  await Product.find({ businessId: req.user._id }).then(data => {
    return res.status(200).json(data)
  }).catch(err => {
    console.log(err)
    return res.status(400).json({ message: 'An error occurred,please retry by refreshing your browser' })
  })
})

BusinessRouter.get('/getsales', MiddleWare.tokenExtractor, MiddleWare.userExtractor, async (req, res) => {
  await Sale.find({ businessId: req.user._id }).then(data => {
    console.log('router sales data', data)
    return res.status(200).send(data)
  }).catch(err => {
    console.log(err)
    return res.status(400).json({ message: 'An error occurred,please retry by refreshing your browser' })
  })
})
BusinessRouter.get('/getstores', MiddleWare.tokenExtractor, MiddleWare.userExtractor, async (req, res) => {
  await Store.find({ businessId: req.user._id })
    .then(data => {
      return res.status(200).send(data)
    }).catch(err => {
      console.log(err)
      return res.status(400).json({ message: 'An error occurred,please retry by refreshing your browser' })
    })
})
BusinessRouter.put('/editprofile', MiddleWare.tokenExtractor, MiddleWare.userExtractor, async (req, res) => {
  console.log("user router post", req.body)
  let { businessName, registrationNumber, businessType, establishmentDate, street, city, state, zip, country, email, website, ownerName, ownerEmail, ownerPhone } = req.body


  let updateProfile = {
    businessId: req.user._id,
    storeId: null,
    sku,
    name,
    description,
    category,
    price: {
      base: costPrice,
      currency: 'NGN',
      profit: price - costPrice
    },
    inventory: {
      quantity,
      lowStockThreshold,
      lastRestocked: ''
    },
    salesData: {
      totalSold: 0,
      lastSold: ''
    },

    supplierInfo: {
      name: supplier,
      contact: supplierEmail
    },
    images
  }

  await Business.findByIdAndUpdate(req.user._id, updateProfile).then(data => {
    console.log('editprofile data', data)
    return res.status(200).json({ ...data, message: 'Profile updated successfully' })
  }).catch(err => {
    console.log('editprofile error', err)
    res.status(400).json({ ...err, message: 'An error occurred please try again' })
  })

})


BusinessRouter.put('/editproduct', MiddleWare.tokenExtractor, MiddleWare.userExtractor, async (req, res) => {
  console.log("user router post", req.body)
  let {
    name,
    sku,
    description,
    category,
    price,
    costPrice,
    quantity,
    lowStockThreshold,
    supplier,
    images,
    supplierEmail, productId
  } = req.body

  let saleDetails = {
    businessId: req.user._id,
    storeId: null,
    sku,
    name,
    description,
    category,
    price: {
      base: costPrice,
      currency: 'NGN',
      profit: price - costPrice
    },
    inventory: {
      quantity,
      lowStockThreshold,
      lastRestocked: ''
    },
    salesData: {
      totalSold: 0,
      lastSold: ''
    },

    supplierInfo: {
      name: supplier,
      contact: supplierEmail
    },
    images
  }

  await Product.findByIdAndUpdate(productId, saleDetails).then(data => {
    console.log('editprofile data', data)
    return res.status(200).json({ ...data, message: 'Profile updated successfully' })
  }).catch(err => {
    console.log('editprofile error', err)
    res.status(400).json({ ...err, message: 'An error occurred please try again' })
  })
})

BusinessRouter.get('/getproduct/:id', MiddleWare.tokenExtractor, MiddleWare.userExtractor, async (req, res) => {
  try {
    let data = await Product.findById(req.params.id)
    res.status(200).json(data)
  } catch (err) {
    console.log('editprofile error', err)
    res.status(400).json({ ...err, message: 'An error occurred please try again' })
  }
})

BusinessRouter.delete('/deleteproduct/:id', MiddleWare.tokenExtractor, MiddleWare.userExtractor, async (req, res) => {
  try {
    let data = await Product.findByIdAndDelete(req.params.id)
    res.status(200).json({ message: 'Product deleted successfully', ...data })
  } catch (err) {
    console.log('editprofile error', err)
    res.status(400).json({ ...err, message: 'An error occurred please try again' })
  }
})
BusinessRouter.get('/dashboard', MiddleWare.tokenExtractor, MiddleWare.userExtractor, async (req, res) => {
  try {
    let storeCount = await Store.countDocuments({ businessId: req.user._id })
    const businessId = req.user._id;
    const now = new Date();

    // Calculate date ranges
    const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const currentMonthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
    const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59);

    const monthlySales = await Sale.aggregate([
      {
        $match: {
          businessId: new mongoose.Types.ObjectId(businessId),
          salesDate: {
            $gte: lastMonthStart,
            $lte: currentMonthEnd
          }
        }
      },
      { $unwind: "$products" },
      {
        $addFields: {
          monthPeriod: {
            $cond: [
              {
                $and: [
                  { $gte: ["$salesDate", currentMonthStart] },
                  { $lte: ["$salesDate", currentMonthEnd] }
                ]
              },
              "current",
              "last"
            ]
          }
        }
      },
      {
        $group: {
          _id: {
            productId: "$products.productId",
            month: "$monthPeriod"
          },
          totalQuantity: { $sum: "$products.quantity" },
          totalSales: {
            $sum: {
              $multiply: ["$products.quantity", "$products.priceAtSale"]
            }
          }
        }
      },
      {
        $group: {
          _id: "$_id.productId",
          periods: {
            $push: {
              period: "$_id.month",
              quantity: "$totalQuantity",
              sales: "$totalSales"
            }
          }
        }
      },
      {
        $project: {
          productId: "$_id",
          lastMonth: {
            $ifNull: [
              {
                $arrayElemAt: [
                  {
                    $filter: {
                      input: "$periods",
                      as: "period",
                      cond: { $eq: ["$$period.period", "last"] }
                    }
                  },
                  0
                ]
              },
              { quantity: 0, sales: 0 }
            ]
          },
          currentMonth: {
            $ifNull: [
              {
                $arrayElemAt: [
                  {
                    $filter: {
                      input: "$periods",
                      as: "period",
                      cond: { $eq: ["$$period.period", "current"] }
                    }
                  },
                  0
                ]
              },
              { quantity: 0, sales: 0 }
            ]
          }
        }
      }
    ]);
    //


    const productCount = await Product.aggregate([
      {
        $match: {
          businessId: new mongoose.Types.ObjectId(businessId)
        }
      },
      {
        $group: {
          _id: null,
          totalProducts: { $sum: 1 },
          lowStockCount: {
            $sum: {
              $cond: [
                { $lt: ["$inventory.quantity", "$inventory.lowStockThreshold"] },
                1,
                0
              ]
            }
          }
        }
      },
      {
        $project: {
          _id: 0,
          totalProducts: 1,
          lowStockCount: 1
        }
      }
    ]);

    // Handle case with no products
    const stats = productCount[0] || { totalProducts: 0, lowStockCount: 0 };

    res.status(200).json({ stats: stats, monthly: monthlySales, productCount: productCount })

  } catch (err) {
    console.log('editprofile error', err)
    res.status(400).json({ ...err, message: 'An error occurred please try again' })
  }
})


module.exports = BusinessRouter;