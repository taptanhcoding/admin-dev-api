const connectDB = require("../configs/connectDb.configs");
const { ObjectId } = require("mongodb");
const { removeDir } = require("../helpers/deletedFiles.helpers");
const collections = require("../models/index.model");
const sanitize = require("mongo-sanitize");
const { client } = require("../configs/redis.configs");
const path = require("path");
const rootPath = require("app-root-path").path;
const fs = require("fs");
const {
  addDocumentsToRes
} = require("../helpers/redis.helpers");
const connectMongoDB = require("../configs/mongoDb.configs");

class SharesCtr {
  //------------------v1---------------------

  //[GET] /:collection
  async getDocuments(req, res, next) {
    try {
      const { collection} = req.params;
      const {id } = req.query;
      let options = {}
      let data = []
      let query = {$and:[]}
      if(id) {
        query['$and'].push({_id:sanitize(id)})
      }
      switch (collection) {
        case "categories":
          data = await collections[collection].findWithDeleted(query, options).populate({ path: 'supplierIds.supplierId', self: "name" }).sort({ _id: -1 })
          break;
        case "products":
          data = await collections[collection].findWithDeleted(query, options).populate("category").populate("supplier").sort({ _id: -1 })
          if (req.query.active)
          query['$and'].push({ active: true })
            data = await collections[collection].find(query).sort({ _id: -1 })
          break;
        case "orders":
          query['$and'].push({ status: { $ne: 'WAITING' } })
          if (req.query.startDate) {
            query['$and'].push({ createDate: { $gte: req.query.startDate } })
          }
          if (req.query.endDate) {
            query['$and'].push({ createDate: { $lt: req.query.endDate } })
          }
          data = await collections[collection].findWithDeleted(query, options).populate({ path: "orderDetails.product", select: "name code price discount options" }).sort({ _id: -1 })
          break;
        case "customers":

          data = await collections[collection].findWithDeleted(query, options).sort({ _id: -1 })
          if (req.query.active) {
            let { active } = req.query
            options = { fullname: 1, code: 1, firstName: 1, lastName: 1 }
            data = await collections[collection].find({ active: active }, options).sort({ _id: -1 })
          }
          break;
        case "employees":
          data = null
          break;
        default:
          data = await collections[collection].findWithDeleted(query, options).sort({ _id: -1 })
          break;
      }
      return res.send({
        status: true,
        data,
      })
    } catch (error) {
      console.log('lỗi lấy dữ liệu ', error);
      return res.status(400).send({
        status: false,
        data: null,
        message: error
      });
    }
  }

  // [POST] /:collection/add
  async addDocument(req, res, next) {
    const admin = req.user;
    req.body.createBy = {
      creater: admin.fullname || admin.email,
      admin_id: admin._id,
    };
    const { collection } = req.params;
    try {
      let newDocument = new collections[collection](req.body);
      let newData = null
      switch (collection) {
        case 'employees':
          break;
        default:
          newData = await newDocument.save();
          break;
      }
      return res.send({
        status: true,
        message: "Thêm mới thành công",
        data: newData
      });
    } catch (error) {
      console.log(error);
      return res.send({
        status: false,
        message: "Thêm mới thất bại",
      });
    }
  }

  // [PUT] /:collection/update/:id
  async updateDocument(req, res, next) {
    const admin = req.user;
    req.body.updateBy = {
      updater: admin.fullname || admin.email,
      admin_id: admin._id,
    };
    const { collection, id } = req.params;
    try {
      await collections[collection].updateOne(
        { _id: sanitize(id) },
        { $set: req.body }
      );
      const newDt = await collections[collection].find({ active: true });
      await addDocumentsToRes(collection, newDt)
      return res.send({
        status: true,
        message: "Cập nhật thành công",
      });
    } catch (error) {
      console.log("Lỗi cập nhật::", error);
      return res.send({
        status: false,
        message: "Cập nhật thất bại",
      });
    }
  }

  // [PUT] /:collection/locks
  async lockDocuments(req, res, next) {
    const admin = req.user;
    req.body.updateBy = {
      updater: admin.fullname || admin.email,
      admin_id: admin._id,
    };
    const { collection } = req.params;
    try {
      await collections[collection].updateMany(
        { _id: { $in: sanitize(req.body.ids) } },
        { $set: { active: false } }
      );
      const newDt = await collections[collection].find({ active: true })
      await addDocumentsToRes(collection, data)
      return res.send({
        status: true,
        message: "Cập nhật thành công",
      });
    } catch (error) {
      console.log("Lỗi cập nhật::", error);
      return res.send({
        status: false,
        message: "Cập nhật thất bại",
      });
    }
  }

  // [PUT] /:collection/actives
  async activeDocuments(req, res, next) {
    const admin = req.user;
    req.body.updateBy = {
      updater: admin.fullname || admin.email,
      admin_id: admin._id,
    };
    const { collection, id } = req.params;
    try {
      await collections[collection].updateMany(
        { _id: { $in: sanitize(req.body.ids) } },
        { $set: { active: true } }
      );
      const newDt = await collections[collection].find({ active: true });
      await addDocumentsToRes(collection, newDt)
      return res.send({
        status: true,
        message: "Cập nhật thành công",
      });
    } catch (error) {
      console.log("Lỗi cập nhật::", error);
      return res.send({
        status: false,
        message: "Cập nhật thất bại",
      });
    }
  }

  // [DELETE] /:collection/delete/:id
  async deleteSoftDocument(req, res, next) {
    const { collection, id } = req.params;
    const admin = req.user;
    req.body.updateBy = {
      updater: admin.fullname || admin.email,
      admin_id: admin._id,
    };
    collections[collection]
      .delete({ _id: sanitize(id) })
      .then(async () => {
        await collections[collection].updateOne(
          { _id: sanitize(id) },
          { $set: req.body }
        );
        const newDt = await collections[collection].find({ active: true });
        await addDocumentsToRes(collection, newDt)
        return res.send({
          status: true,
          message: "Xóa thành công",
        });
      })
      .catch((err) => {
        console.log(err);
        return res.send({
          status: false,
          message: "Xóa thất bại",
        });
      });
  }

  // [DELETE] /:collection/deletes
  async deleteSoftDocuments(req, res, next) {
    const { collection } = req.params;
    try {
      await collections[collection].delete({ _id: { $in: sanitize(req.body.ids) } })
      const newDt = await collections[collection].find({ active: true });
      await addDocumentsToRes(collection, newDt)
      return res.send({
        status: true,
        message: "Xóa thành công",
      });
    } catch (error) {
      console.log("Lỗi xóa mềm ", error);
      return res.send({
        status: false,
        message: "Xóa thất bại",
      });
    }
  }

  // [PUT] /:collection/restore/:id
  async restoreDocument(req, res, next) {
    const { collection, id } = req.params;
    try {

    } catch (error) {

    }
    collections[collection].restore({ _id: sanitize(id) })
      .then(() =>
        res.send({
          status: true,
          message: "Khôi phục thành công",
        })
      )
      .catch((err) => {
        console.log(err);
        return res.send({
          status: false,
          message: "Khôi phục thất bại",
        });
      });
  }

  // [PUT] /:collection/deletes
  async restoreDocuments(req, res, next) {
    const { collection } = req.params;
    collections[collection]
      .restore({ _id: { $in: sanitize(req.body.ids) } })
      .then(() =>
        res.send({
          status: true,
          message: "Khôi phục thành công",
        })
      )
      .catch((err) => {
        console.log(err);
        return res.send({
          status: false,
          message: "Khôi phục thất bại",
        });
      });
  }

  // [PUT] /:collection/changeStatus/:id
  async changeActiveDocument(req, res, next) {
    const { collection } = req.params;
    const { status, ids } = req.body;
    console.log('nhan du lieu', req.body);
    const admin = req.user;
    collections[collection]
      .updateMany(
        { _id: { $in: sanitize(ids) } },
        {
          $set: {
            active: status,
            updateBy: {
              updater: admin.fullname || admin.email,
              admin_id: admin._id,
            },
          },
        }
      )
      .then(() =>
        res.send({
          status: true,
          message: "Khóa thành công",
        })
      )
      .catch((err) => {
        console.log(err);
        return res.send({
          status: false,
          message: "Khóa thất bại",
        });
      });
  }

  // [PUT] /:collection/changeStatusM
  async changeActiveDocuments(req, res, next) {
    const { collection } = req.params;
    const { status, ids } = req.body;
    const admin = req.user;
    collections[collection]
      .updateMany(
        { _id: { $in: sanitize(ids) } },
        {
          $set: {
            active: status,
            updateBy: {
              updater: admin.fullname || admin.email,
              admin_id: admin._id,
            },
          },
        }
      )
      .then(() =>
        res.send({
          status: true,
          message: "Khóa nhiều thành công",
        })
      )
      .catch((err) => {
        console.log(err);
        return res.send({
          status: false,
          message: "Khóa nhiều thất bại",
        });
      });
  }

  //[POST] /upload-single/:collectionName/:id
  async uploadSingle(req, res, next) {
    const { collection, id } = req.params;
    const obj = await collections[collection].findOne({ _id: sanitize(id) });
    if (!!obj.coverImgUrl) {
      let filepath = path.join(rootPath, "src", "public", obj.coverImgUrl);
      fs.unlinkSync(filepath);
    }
    console.log("Data id ", `uploads/${collection}/${id}/${req.file.filename}`);
    collections[collection]
      .updateOne(
        { _id: id },
        {
          $set: {
            coverImgUrl: `uploads/${collection}/${id}/${req.file.filename}`,
          },
        }
      )
      .then(() =>
        res.send({
          status: true,
          message: "Thêm ảnh thành công",
        })
      )
      .catch((err) => {
        console.log(err);
        return res.status(400).send({
          status: false,
          message: "Thêm ảnh thất bại",
        });
      });
  }

  //[POST] /upload-multi/:collectionName/:id
  async uploadMulti(req, res, next) {
    const { collection, id } = req.params;
    console.log("req.file ", req.files);
    let objeImg = req.files.map(
      (file) => `uploads/${collection}/${id}/${file.filename}`
    );
    console.log("Danh sách file", objeImg);
    collections[collection]
      .updateOne(
        { _id: id },
        {
          $set: {
            sliderImageUrl: objeImg,
          },
        }
      )
      .then(() =>
        res.send({
          status: true,
          message: "Thêm slide ảnh thành công",
        })
      )
      .catch((err) => {
        console.log(err);
        return res.status(400).send({
          status: false,
          message: "Thêm slide ảnh thất bại",
        });
      });
  }



  //[delete] /:collection/destroy/:id
  async destroyDocument(req, res, next) {
    const { collection, id } = req.params;
    collections[collection]
      .deleteOne({ _id: sanitize(id) })
      .then(async () => {
        try {
          await removeDir({ collection, id });
          res.send({
            status: true,
            message: "Xóa hoàn toàn thành công",
          });
        } catch (error) {
          console.log("remove dir err:::", error);
          res.send({
            status: true,
            message: "Xóa file thất bại",
          });
        }
      })
      .catch((err) => {
        console.log(err);
        return res.send({
          status: false,
          message: "Xóa thất bại",
        });
      });
  }

  // [DELETE] /:collection/destroys
  async destroyDocuments(req, res, next) {
    const { collection } = req.params;
    let { ids } = req.body;
    collections[collection]
      .deleteMany({ _id: { $in: sanitize(ids) } })
      .then(async () => {
        try {
          req.body.ids.forEach(async (id) => {
            await removeDir({ collection, id });
          });
          res.send({
            status: true,
            message: "Xóa thành công",
          });
        } catch (error) { }
      })
      .catch((err) => {
        console.log(err);
        return res.send({
          status: false,
          message: "Xóa thất bại",
        });
      });
  }

  // [GET] /admin/dashboard
  async Dashboard(req,res,next) {
    try {
      const nCustomer = await collections['customers'].count({active:true})
      const nProduct = await collections['products'].count({active:true})
      const nOrder = await collections['orders'].count({status: 'COMPLETED'})

     return res.send({
      status: true,
      data: [
        {
          title:'Khách hàng',
          total: nCustomer
        },
        {
          title:'Đơn giao thành công',
          total: nOrder
        },
        {
          title:'Số lượng đang bán',
          total: nProduct
        },
      ]
     })
      
    } catch (error) {
      console.log("Lỗi khi lấy dữ liệu ",error);
      return res.status(500).send({
        status: false,
        message: "Không thể lấy data !"
      })
    }
  }
}

module.exports = new SharesCtr();
