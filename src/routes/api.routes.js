const express = require('express')
const ExtractJwt = require("passport-jwt").ExtractJwt;
const route = express.Router()

const CustomersController = require('../controllers/Customer.controller')
const CategoriesController = require('../controllers/Categories.controller')
const ProductsController = require('../controllers/Product.controller')
const SuppliersController = require('../controllers/Supplier.controller')
const SharesController = require('../controllers/SharesCtr.controller')
const OrdersController = require('../controllers/Order.controller')
const SliderController = require('../controllers/Sliders.controller');
const { getUser } = require('../middlewares/customer.middleware');


//xử lý người dùng
route.post('/customer/register', CustomersController.registerCustomer)
route.get('/customer/auth', async (req, res, next) => {
    if (req.headers.authorization) {

        let jwtFromRequest = req.headers.authorization.split(' ')[1];
        req.token = jwtFromRequest
    }
    next()
}, CustomersController.AuthCustomer)
route.post('/customer/refresh-token', CustomersController.RefreshCustomer)
route.post('/customer/login', CustomersController.loginCustomer)
route.patch('/customer/update',getUser, CustomersController.updateCustomer)
route.get('/customer/re/:email', CustomersController.forgotCustomer)
route.get('/customer/active=:id', CustomersController.activeCustomer)

//Xử lý data trả về web fe
//1. sản phẩm
route.get('/products', ProductsController.getProductsByClient)
route.get('/products/:slug', ProductsController.getProductByClient)
//2. danh mục
route.get('/categories', CategoriesController.getCategoriesByClient)

//3. giỏ hàng
route.patch('/order/update',getUser, OrdersController.updateOrderByClient)
route.patch('/order/update-wallin', OrdersController.updateOrderByWallIn)
route.get('/order/get',getUser, OrdersController.getOrderByClient)

//4. slider
route.get('/sliders', SliderController.getSlidersByClient)

module.exports = route