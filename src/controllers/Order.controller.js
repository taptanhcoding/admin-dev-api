const Product = require("../models/Products.model");
const Category = require("../models/Categories.model");
const Supplier = require("../models/Suppliers.model");
const Order = require("../models/Orders.model");
const Customer  = require('../models/Customers.model')

class OrdersController {
  //-admin side
  //[GET] /Order/get
  async getOrders(req, res, next) {
    try {
      let query = {};
      if(Object.keys(req.query).length > 0) {
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
          message: "Th??m m???i th??nh c??ng",
        })
      )
      .catch((err) => {
        console.log(err);
        return res.send({
          status: false,
          message: "Th??m m???i th???t b???i",
        });
      });
  }

  // [PUT] /Order/update/:id
  async updateOrder(req, res, next) {
    Order.updateOne({ _id: req.params.id }, { $set: req.body })
      .then(() =>
        res.send({
          status: true,
          message: "C???p nh???t th??nh c??ng",
        })
      )
      .catch((err) => {
        console.log(err);
        return res.send({
          status: false,
          message: "C???p nh???t th???t b???i",
        });
      });
  }

  //-web-side
  //[GET] /api/order/get/:id?status=WAITING
  async getOrderByClient(req, res, next) {
    try {
      const {id} =req.params
      let dataOrder = await Order.findOne({$and: [{customerId: id},{status: req.query.status}]})
      // if(!dataOrder) {
      //   const customer = await Customer.findOne({$and: [{_id: id},{active: true}]})
      //   if(!customer) return res.status(500).send({
      //     status: false,
      //     message: "B???n ??ang truy xu???t d??? li???u b???t h???p ph??p"
      //   })
      //   const formatDataOrder = {

      //   }
      //   const newOrder = new Order(formatDataOrder)
      //   dataOrder = await newOrder.save()
      // }
      return res.send({
        status: true,
        data:dataOrder
      })
    } catch (error) {
      console.log(error);
        return res.send({
          status: false,
          message:error.toString(),
          data: null,
        });
    }
  }
  // [PUT] /Order/update/:id
  async updateOrderByClient(req, res, next) {
    try {
      const {id} = req.params
      const oldOrder = await Order.findOne({$and: [{customerId:id},{status:"WAITING"}]})
      if(!oldOrder) {
        const customer = await Customer.findOne({$and: [{_id: id},{active: true}]})
        if(!customer) return res.status(400).send({
          status: false,
          message: "T??i kho???n ch??a x??c th???c"
        })
        const newOrder = new Order(req.body)
        oldOrder = await newOrder.save()
      }
      await Order.updateOne({$and: [{customerId:id},{status:"WAITING"}]}, { $set: req.body })
      return res.send({
        status: true,
        message: "C???p nh???t th??nh c??ng",
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
