const Product = require("../models/Products.model");
const Category = require("../models/Categories.model");
const Supplier = require("../models/Suppliers.model");
const sanitize = require('mongo-sanitize')

class ProductsController {
  //-xử lý phía admin
  //[GET] /products
  async getProducts(req, res, next) {
    try {
      let query = {};
      if (Object.keys(req.query).length > 0) {
        query = {
          $and: [],
        };
      }
      let productPromise;
      let countD = await Product.countDeleted({});
      if (req.query.stockless) {
        query["$and"].push({ stock: { $gte: req.query.stockless } });
      }
      if (req.query.discountless) {
        query["$and"].push({ discount: { $gte: req.query.discountless } });
      }
      if (req.query.id) {
        query["$and"].push({ _id: req.query.id });
      }
      if (req.query.category) {
        const category = await Category.findOne({ slug: req.query.category });
        query["$and"].push({ categoryId: category._id });
      }

      if (req.query.supplier) {
        const supplier = await Supplier.findOne({ slug: req.query.supplier });
        query["$and"].push({ supplierId: supplier._id });
      }

      console.log("query::", query);
      let data = await Product.findWithDeleted(query)
        .populate("category", "name")
        .populate("supplier", "name");
      if (req.query.priceDiscountless) {
        const s = { $subtract: [100, "$discount"] };
        const m = { $multiply: ["$price", s] };
        const d = { $divide: [m, 100] };
        data = await Product.aggregate([
          { $match: { $expr: { $lte: [d, req.query.priceDiscountless] } } },
        ]);
      }

      if (req.query.q) {
        data = await Product.aggregate([
          { $match: { $expr: { $in: [req.query.q, "$name"] } } },
        ]);
      }
      res.send({
        status: true,
        data,
        deleted: countD,
      });
    } catch (err) {
      console.log(err);
      return res.send({
        status: false,
        data: null,
      });
    }
  }

  // xử lý phía client
  //[GET] /products
  async getProductsByClient(req, res, next) {
    try {
      let quanity = 0
      const { page,number,sortBy } = req.query;
       let p = page != undefined ? page : 1
      let n = number != undefined ? number*(p-1) : 0
      let sl = number != undefined ? number : 30
      let sB = sortBy != undefined ? sortBy : '_id'
      let query = {
        $and: [{ active: true }],
      };
      let options =  { createDate: 0, createBy: 0, updateDate: 0, active: 0, deleted: 0, createdAt: 0, updatedAt: 0, updateBy: 0 }
      if (req.query.category) {
        const category = await Category.findOne({ slug: req.query.category }, { _id: 1 });
        options.sliderImageUrl = 0
        options.description = 0 
        options.spec=0
        query["$and"].push({ categoryId: category._id });
      }

      if (req.query.supplier) {
        options.sliderImageUrl = 0
        options.description = 0 
        options.options=0
        options.spec=0
        const supplier = await Supplier.findOne({ slug: req.query.supplier }, { _id: 1 });
        query["$and"].push({ supplierId: supplier._id });
      }

      if (req.query.position) {
        options.sliderImageUrl = 0
        options.description = 0 
        options.spec=0
        query["$and"].push({promotionPosition: req.query.position});

      }
      if (req.query.q) {
        query = { active: true, $text: { $search: req.query.q } }
      }
      let data = await Product.find(query,options).skip(n).limit(sl)
      quanity = await Product.count(query)
      if (req.query.priceDiscount_less) {
        const s = { $subtract: [100, "$discount"] };
        const m = { $multiply: ["$price", s] };
        const d = { $divide: [m, 100] };
        data = await Product.aggregate([
          { $match: { $expr: { $lte: [d, req.query.priceDiscountless] } } },
        ]).sort({[sB]: -1 }).skip(n).limit(sl);
        let n= await Product.aggregate([
          { $match: { $expr: { $lte: [d, req.query.priceDiscountless] } } },
          {
            $count: "number"
          }
        ])
        quanity = n.number
      }
      if (req.query.priceDiscount_more) {
        const s = { $subtract: [100, "$discount"] };
        const m = { $multiply: ["$price", s] };
        const d = { $divide: [m, 100] };
        data = await Product.aggregate([
          { $match: { $expr: { $gte: [d, req.query.priceDiscountless] } } },
        ]).sort({[sB]: -1 }).skip(n).limit(sl);
        let n= await Product.aggregate([
          { $match: { $expr: { $gte: [d, req.query.priceDiscountless] } } },
          {
            $count: "number"
          }
        ])
        quanity = n.number

      }

     
      res.send({
        status: true,
        data,
        quanity
      });
    } catch (err) {
      console.log(err);
      return res.send({
        status: false,
        message: err,
        data: null,
        quanity: 0
      });
    }
  }

  //[GET] /product/get/:slug
  async getProductByClient(req, res, next) {
    Product.findOne({ $and: [{ slug: req.params.slug }, { active: true }] })
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

}

module.exports = new ProductsController();
