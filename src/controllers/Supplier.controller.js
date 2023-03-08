const Supplier = require("../models/Suppliers.model");
const { removeDir } = require("../helpers/deletedFiles.helpers");
class SuppliersController {
  //[GET] /supplier/get
  async getSuppliers(req, res, next) {
    try {
      let query = {};
      let countD = await Supplier.countDeleted({});
      let data = await Supplier.find(query)

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

  //[GET] /Supplier/getDeleted/:id
  async getSupplierDeleted(req, res, next) {
    Promise.all([Supplier.findDeleted({}).populate('category','name'), Supplier.count({})])
      .then(([data, countA]) =>
        res.send({
          status: true,
          data,
          countA,
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

  // [POST] /Supplier/add
  async addSupplier(req, res, next) {
    let newSupplier = new Supplier(req.body);
    newSupplier
      .save()
      .then((data) =>
        res.send({
          status: true,
          data,
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

  // [PUT] /Supplier/update/:id
  async updateSupplier(req, res, next) {
    Supplier.updateOne({ _id: req.params.id }, { $set: req.body })
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

  // [DELETE] /Supplier/delete/:id
  async deleteSupplier(req, res, next) {
    Supplier.delete({ _id: req.params.id })
      .then(() =>
        res.send({
          status: true,
          message: "Xóa thành công",
        })
      )
      .catch((err) => {
        console.log(err);
        return res.send({
          status: false,
          message: "Xóa thất bại",
        });
      });
  }

  // [DELETE] /Supplier/deletes
  async deleteSuppliers(req, res, next) {
    Supplier.delete({ _id: { $in: req.body.ids } })
      .then(() =>
        res.send({
          status: true,
          message: "Xóa thành công",
        })
      )
      .catch((err) => {
        console.log(err);
        return res.send({
          status: false,
          message: "Xóa thất bại",
        });
      });
  }

  // [PUT] /Supplier/restore/:id
  async restoreSupplier(req, res, next) {
    Supplier.restore({ _id: req.params.id })
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

  // [PUT] /Supplier/deletes
  async restoreSuppliers(req, res, next) {
    Supplier.restore({ _id: { $in: req.body.ids } })
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

  // [DELETE] /Supplier/destroy/:id
  async destroySupplier(req, res, next) {
    Supplier.deleteOne({ _id: req.params.id })
      .then(async () => {
        try {
          await removeDir({ collection: "suppliers", id: req.params.id });
          res.send({
            status: true,
            message: "Xóa thành công",
          });
        } catch (error) {
          console.log("lỗi xóa file supplier", error);
          res.status(400).send({
            status: false,
            message: "Xóa thất bại",
          });
        }
      })
      .catch((err) => {
        console.log(err);
        return res.status(400).send({
          status: false,
          message: "Xóa thất bại",
        });
      });
  }

  // [DELETE] /Supplier/deletes
  async destroySuppliers(req, res, next) {
    Supplier.deleteMany({ _id: { $in: req.body.ids } })
      .then(async () => {
        try {
          req.body.ids.forEach(async(id) => {
            try {
              await removeDir({collection:'supplier',id})
            } catch (error) {
              console.log('file delete',error);
              res.status(400).send({
                status: true,
                message: "Xóa thành công",
              })
            }
          });
          res.send({
            status: true,
            message: "Xóa thành công",
          });
        } catch (error) {
          console.log('file delete',error);
          res.status(400).send({
            status: true,
            message: "Xóa thành công",
          })
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
}

module.exports = new SuppliersController();
