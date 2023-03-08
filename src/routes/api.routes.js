const express  =require('express')
const route = express.Router()

const CustomersController = require('../controllers/Customer.controller')
const CategoriesController = require('../controllers/Categories.controller')
const ProductsController = require('../controllers/Product.controller')
const SuppliersController = require('../controllers/Supplier.controller')
const SharesController = require('../controllers/SharesCtr.controller')
const OrdersController = require('../controllers/Order.controller')

//xử lý người dùng
route.post('/customer/register',CustomersController.registerCustomer)
route.post('/customer/login',CustomersController.loginCustomer)
route.patch('/customer/update',CustomersController.updateCustomer)
route.get('/customer/re/:email',CustomersController.forgotCustomer)
route.get('/customer/active=:id',CustomersController.activeCustomer)

//Xử lý data trả về web fe
//1. sản phẩm
route.get('/products',ProductsController.getProductsByClient)
route.get('/products/:slug',ProductsController.getProductByClient)
//2. danh mục
route.get('/categories',CategoriesController.getCategoriesByClient)

//3. giỏ hàng
route.patch('/order/update/:id',OrdersController.updateOrderByClient)
route.get('/order/get/:id',OrdersController.getOrderByClient)

//4. slider
// route.get()

module.exports= route