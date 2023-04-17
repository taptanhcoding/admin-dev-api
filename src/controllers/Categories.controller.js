const Categories = require("../models/Categories.model");
const {client} = require('../configs/redis.configs')


class CategoriesController {
  //[GET] /category
  async getCategoriesByAdmin(req, res, next) {
    try {
      let query = {};
      let data = []
      if(Object.keys(req.query).length > 0) {
        query = {$and: []}
        if(req.query.id) {
          query['$and'].push({
            _id: req.query.id
          })
        }
        if(req.query.status) {
          query['$and'].push({
            active: req.query.status
          })
        }
      }
      let countD = await Category.countDeleted({});
      data = await Category.find(query).populate('supplierIds.supplierId')

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
  //- xử lý phía admin

  //-xử lý phía web
  async getCategoriesByClient(req,res,next) {
    try {
      const dataMg = await Categories.find({active: true},{name:1,slug:1,coverImgUrl:1,description:1})
      return res.send({
        status: true,
        data: dataMg
      })
    } catch (error) {
      console.log('lỗi lấy danh mục :: ',error);
      return res.status(500).send({
        status: false,
        message: error.toString()
      })
    }
  }
}

module.exports = new CategoriesController();
