const express = require('express')
const route = express.Router()
const passport = require('passport')
const multer = require('multer')

const {storageImg}  =require('../configs/storage.configs')
const upload = multer({storage: storageImg})
const {ObjectId} = require('mongodb')
require('dotenv').config()
const {checkRoleEffect} = require('../middlewares/checkRoles.middleware')

const EmployeesController  = require('../controllers/Employee.controller')
const SharesController = require('../controllers/SharesCtr.controller')
const CategoriesController = require('../controllers/Categories.controller')
const CustomersController = require('../controllers/Customer.controller')
const OrdersController = require('../controllers/Order.controller')
const ProductsController = require('../controllers/Product.controller')
const SuppliersController = require('../controllers/Supplier.controller')


//Xử lý admin

//admin đăng nhập, cấu hình profile
// tạo token chủ sở hữu
route.post('/create-token-admin',EmployeesController.LoginPss)
// đăng nhập nhân viên
route.post('/login',EmployeesController.Login)
//xử lý tạo token khi login
route.get('/auth',passport.authenticate('jwt',{session: false}),EmployeesController.Auth)
//cập nhật token hết hạn
route.post('/refresh-token',EmployeesController.RefreshToken)
//lấy cấu hình admin
route.get('/profile/:id',passport.authenticate('jwt',{session: false}),EmployeesController.ProfileAdmin)
//cập nhật cấu hình admin
route.patch('/profile/:id',EmployeesController.UpdateAdmin)
//đăng xuất
route.delete('/logout',EmployeesController.Logout)



// admin cập nhật thông tin
function actionIn(action) {
    return  function fakeCollcection(req,res,next) {
        req.params.collection = 'employees',
        req.params.action = action
        return next()
    }

}
//chủ sở hữu tạo nhân viên
route.post('/create-admin',actionIn('ADD'),passport.authenticate('jwt',{session: false}),checkRoleEffect,EmployeesController.CreateAdmin)
//lấy danh sách nhân viên
route.get('/admin-list',actionIn('GET'),passport.authenticate('jwt',{session: false}),checkRoleEffect,EmployeesController.EmployeesList)

//admin cạp nhật thông tin cho nhân viên bằng admin
route.patch('/admin-update/:id',actionIn('UPDATE'),passport.authenticate('jwt',{session: false}),checkRoleEffect,EmployeesController.UpdateByAdmin)
route.patch('/admin-restore/:id',actionIn('UPDATE'),passport.authenticate('jwt',{session: false}),checkRoleEffect,EmployeesController.RestoreByAdmin)
route.delete('/admin-delete/:id',actionIn('DELETE'),passport.authenticate('jwt',{session: false}),checkRoleEffect,EmployeesController.DeleteByAdmin)
route.delete('/admin-destroy/:id',actionIn('DELETE'),passport.authenticate('jwt',{session: false}),checkRoleEffect,EmployeesController.DestroyByAdmin)



//Customer

//Order 
// route.get('/orders/:id',OrdersController.getOrderByAd)
// route.get('/orders',OrdersController.getOrders)


//Product
// route.get('/products',ProductsController.getProducts)



//Supplier
//xử lý dashboard

route.get('/dashboard',SharesController.Dashboard)

//Xử lý document
function handleCheckEmployee(req,res,next) {
    if(req.params.collection === 'employees') {
        return res.status(500).send({
            status: false,
            message: "Bạn đang truy cập dữ liệu không cho phép"
        })
    }
      return next()
    
}



route.get('/data/:collection',SharesController.getDocuments)
route.post('/data/:collection/:action/add',passport.authenticate('jwt',{session:false}),checkRoleEffect,handleCheckEmployee,SharesController.addDocument)

route.patch('/data/:collection/:action/update/:id',passport.authenticate('jwt',{session:false}),checkRoleEffect,handleCheckEmployee,SharesController.updateDocument)
route.patch('/data/:collection/:action/restore/:id',passport.authenticate('jwt',{session:false}),checkRoleEffect,handleCheckEmployee,SharesController.restoreDocument)
route.patch('/data/:collection/:action/restores',passport.authenticate('jwt',{session:false}),checkRoleEffect,handleCheckEmployee,SharesController.restoreDocuments)
route.patch('/data/:collection/:action/changeStatus/:id',passport.authenticate('jwt',{session:false}),checkRoleEffect,handleCheckEmployee,SharesController.changeActiveDocument)
route.patch('/data/:collection/:action/changeStatusM',passport.authenticate('jwt',{session:false}),checkRoleEffect,handleCheckEmployee,SharesController.changeActiveDocuments)

route.delete('/data/:collection/:action/delete/:id',passport.authenticate('jwt',{session:false}),checkRoleEffect,handleCheckEmployee,SharesController.deleteSoftDocument)
route.delete('/data/:collection/:action/deletes',passport.authenticate('jwt',{session:false}),checkRoleEffect,handleCheckEmployee,SharesController.deleteSoftDocuments)
route.delete('/data/:collection/:action/destroy/:id',passport.authenticate('jwt',{session:false}),checkRoleEffect,handleCheckEmployee,SharesController.destroyDocument)
route.delete('/data/:collection/:action/destroys',passport.authenticate('jwt',{session:false}),checkRoleEffect,handleCheckEmployee,SharesController.destroyDocuments)

//uploadImg 
route.post('/upload-single/:collection/:id',upload.single('file'),SharesController.uploadSingle)
route.post('/upload-multi/:collection/:id',upload.array('files'),SharesController.uploadMulti)



module.exports = route