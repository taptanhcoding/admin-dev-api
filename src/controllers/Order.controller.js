const Product = require("../models/Products.model");
const Category = require("../models/Categories.model");
const Supplier = require("../models/Suppliers.model");
const Order = require("../models/Orders.model");
const Customer = require('../models/Customers.model');
const { mailCreatedOrder, mailAgreeOrder } = require("../helpers/mail.helpers");

class OrdersController {
  //-admin side
  //[GET] /Order/get
  async getOrders(req, res, next) {
    try {
      let query = {};
      if (Object.keys(req.query).length > 0) {
        query = { $and: [] };
        if (req.query.status) {
          query["$and"].push({ status: req.query.status });
          if (req.query.fdate) {
            query["$and"].push({ createdDate: { $gte: req.query.fdate } });
          }
          if (req.query.tdate) {
            query["$and"].push({ createdDate: { $lte: req.query.tdate } });
          }
        }

        if (req.query.now) {
          query["$and"].push({ createdDate: Date.now() });
        }

        if (req.query.payment) {
          query["$and"].push({ paymentType: req.query.payment });
        }
      }

      let data = await Order.find(query)
        .populate({
          path: "orderDetails.product",
          select: { name: 1, price: 1, stock: 1, discount: 1 },
        })
        .populate({ path: "customer" })
        .populate({ path: "employee" });
      res.send({
        status: true,
        data,
      });
    } catch (err) {
      console.log(err);
      return res.send({
        status: false,
        data: null,
      });
    }
  }

  //[GET] /Order/get/:id
  async getOrderByAd(req, res, next) {
    Order.findOne({ _id: req.params.id })
      .then((data) =>
        res.send({
          status: true,
          data,
        })
      )
      .catch((err) => {
        console.log(err);
        return res.send({
          status: false,
          data: null,
        });
      });
  }

  //[GET] /Order/getDeleted/:id
  async getOrderDeleted(req, res, next) {
    Order.findDeleted({})
      .then((data) =>
        res.send({
          status: true,
          data,
        })
      )
      .catch((err) => {
        console.log(err);
        return res.send({
          status: false,
          data: null,
        });
      });
  }

  // [POST] /Order/add
  async addOrder(req, res, next) {
    let newOrder = new Order(req.body);
    newOrder
      .save()
      .then(() =>
        res.send({
          status: true,
          message: "Thêm mới thành công",
        })
      )
      .catch((err) => {
        console.log(err);
        return res.send({
          status: false,
          message: "Thêm mới thất bại",
        });
      });
  }

  // [PUT] /Order/update/:id
  async updateOrder(req, res, next) {
    Order.updateOne({ _id: req.params.id }, { $set: req.body })
      .then(() =>
        res.send({
          status: true,
          message: "Cập nhật thành công",
        })
      )
      .catch((err) => {
        console.log(err);
        return res.send({
          status: false,
          message: "Cập nhật thất bại",
        });
      });
  }

  //-web-side
  //[GET] /api/order/get/:id?status=WAITING
  async getOrderByClient(req, res, next) {
    try {
      const { id } = req.user
      const {status} = req.query
      console.log(id);
      let dataOrder = await Order.findOne({ $and: [{ customerId: id }, { status: status || 'WAITING' }] })
      if (!dataOrder) {
        const customer = await Customer.findOne({ $and: [{ _id: id }, { active: true }] })
        if (!customer) return res.status(500).send({
          status: false,
          message: "Bạn đang truy xuất dữ liệu bất hợp pháp"
        })
        const formatDataOrder = {

        }
        const newOrder = new Order(formatDataOrder)
        dataOrder = await newOrder.save()
      }
      return res.send({
        status: true,
        data: dataOrder
      })
    } catch (error) {
      console.log(error);
      return res.send({
        status: false,
        message: error.toString(),
        data: null,
      });
    }
  }
  // [PUT] /Order/update-wallin
  async updateOrderByWallIn(req, res, next) {
    try {
      const newOrder = new Order(req.body)
      let rsOrder = await newOrder.save()
      console.log('kết quả ', rsOrder);
      mailCreatedOrder(rsOrder)
      return res.send({
        status: true,
        message: "Đặt hàng thành công",
        rsOrder
      })
    } catch (error) {
      console.log(error);
      return res.status(500).send({
        status: false,
        message: error,
      });
    }
  }

  // [PUT] /Order/update/:id
  async updateOrderByClient(req, res, next) {
    try {
      const { id } = req.user
      let oldOrder = await Order.findOne({ $and: [{ customerId: id }, { status: "WAITING" }] })
      if (!oldOrder) {
        const customer = await Customer.findOne({ $and: [{ _id: id }, { active: true }] })
        if (!customer) return res.status(400).send({
          status: false,
          message: "Tài khoản chưa xác thực"
        })
        const newOrder = new Order({ ...req.body, customerId: id })
        oldOrder = await newOrder.save()
      }
       await Order.updateOne({ $and: [{ customerId: id }, { status: "WAITING" }] }, { $set: req.body })
      if (req.body.status == "ORDER") {
        const {orderDetails}  =req.body
        if(orderDetails) {
          orderDetails.forEach(async (pr) => {

            let product = await Product.findOne({code: pr.productCode})

            let newops = product.options.map(op => {
              console.log(op.color);
              console.log(pr.option.color === op.color);
              if(op.color === pr.option.color) {
                console.log(op);
                let newop = {...op,stock: Number.parseInt(op.stock) - pr.option.quanity}
                console.log(newop);
                return newop
              }else return op
            })
            product.options = newops
            await Product.updateOne({code: pr.productCode}, {$set: product})

          })
        }
        mailCreatedOrder(req.body)
      }
      if (req.body.status == "AGREE") {
        mailAgreeOrder(req.body.contactInformation.email, req.body.orderDetails)
      }
      return res.send({
        status: true,
        message: "Cập nhật thành công",
      })
    } catch (error) {
      console.log(error);
      return res.status(500).send({
        status: false,
        message: error,
      });
    }
  }
}

module.exports = new OrdersController();
