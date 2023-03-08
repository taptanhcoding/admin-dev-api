const Customer = require("../models/Customers.model");
const Category = require("../models/Categories.model");
const Supplier = require("../models/Suppliers.model");
const {
  mailCreateCustomer,
  mailForgotCustomer,
} = require("../helpers/mail.helpers");
const sanitize = require("mongo-sanitize");
const { randomBytes } = require("node:crypto");
const bcrypt = require("bcrypt");

class CustomersController {
  //-xử lý phía người dùng
  // [POST] /Customer/add
  async registerCustomer(req, res, next) {
    let newCustomer = new Customer(req.body);
    newCustomer
      .save()
      .then(async (data) => {
        await mailCreateCustomer(data);
        return res.send({
          status: true,
          message: "Đăng ký thành công",
        });
      })
      .catch((err) => {
        console.log(err);
        return res.send({
          status: false,
          message: "Đăng ký thất bại",
        });
      });
  }

  // [POST] /customer/login
  async loginCustomer(req, res, next) {
    try {
      const { email, password } = req.body;
      const customer = await Customer.findOne({
        $and: [{ email: sanitize(email) }, { active: true }],
      });
      if (customer) {
        if (await bcrypt.compare(password, customer.password)) {
          return res.send({
            status: true,
            message: "Đăng nhập thành công ",
          });
        } else {
          return res.status(404).send({
            status: false,
            message: "Mật khẩu không đúng",
          });
        }
      } else {
        return res.status(404).send({
          status: false,
          message: "Email không tồn tại hoặc bị khóa",
        });
      }
    } catch (error) {
      console.log("Lỗi đăng nhập");
    }
  }

  // [POST] /Customer/re/:email
  async forgotCustomer(req, res, next) {
    try {
      const { email } = req.params;
      const customers = await Customer.find({ email: sanitize(email) });
      if (customers.length > 0) {
        const newPass = `N${randomBytes(8).toString("hex")}`;
        const salt = await bcrypt.genSalt(10);
        const newPasswordBcr = await bcrypt.hash(newPass, salt);
        await Customer.updateOne(
          { email: sanitize(email) },
          { $set: { password: newPasswordBcr } }
        );
        await mailForgotCustomer({
          email: sanitize(email),
          password: newPass,
        });
        return res.send({
          status: true,
          message: "Vui lòng check mail!",
        });
      } else {
        return res.status(404).send({
          status: false,
          message: "Email chưa được đăng ký hoặc bị khóa",
        });
      }
    } catch (error) {
      console.log("lỗi lấy lại mk ::", error);
      res.status(500).send({ status: false, message: "Lỗi" });
    }
  }

  //[PATCH] /customer/update?changepass=true
  async updateCustomer(req, res, next) {
    try {
      const { password, _id } = req.body;
      const { changepass } = req.query;
      const newData = req.body;
      const customer = await Customer.findOne({ _id: sanitize(_id) });
      if (!customer) {
        return res.status(500).send({
          status: false,
          message: "Không hợp lệ !!",
        });
      }
      if (await bcrypt.compare(password, customer.password)) {
        if (changepass) {
          const { newPass, rpNewPass } = req.body;
          if (newPass === rpNewPass) {
            const salt = await bcrypt.genSalt(10);
            const newPasswordBcr = await bcrypt.hash(newPass, salt);
            newData.password = newPasswordBcr;
          } else {
            return res.status(400).send({
              status: false,
              message: "Nhập lại mật khẩu không đúng",
            });
          }
        }
        await Customer.updateOne({ _id: sanitize(_id) }, { $set: newData });
      }
      else {
        return res.send({
          status: true,
          message: "Sai mật khẩu !",
        });
      }

      return res.send({
        status: true,
        message: "Cập nhật thành công",
      });
    } catch (error) {
      console.log('lỗi update người dùng',error);
      return res.status(400).send({
        status: true,
        message: "Cập nhật thất bại",
      });
    }
  }

  //[GET] /customer/active=:id
  async activeCustomer(req,res,next) {
    try {
      const {id}= req.params
      await Customer.updateOne({id},{$set: {active: true}})
      return res.send({
        status: true,
        message: "Kích hoạt thành công, mời tiếp tục sử dụng!"
      })
    } catch (error) {
      console.log('Lỗi kích hoạt',error);
      return res.status(500).send({
        status: false,
        message: "Lỗi"
      })
    }
  }

  //-kết thức xử lý phía người dùng
  //- xử lý phía admin
  //[GET] /Customer/get
  async getCustomers(req, res, next) {
    try {
      let data = await Customer.find({})
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

  //[GET] /Customer/get/:id
  async getCustomer(req, res, next) {
    Customer.findOne({ _id: req.params.id })
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

  //[GET] /Customer/getDeleted/
  async getCustomerDeleted(req, res, next) {
    Customer.findDeleted({})
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

  // [PUT] /Customer/update/:id
  async updateCustomerByAd(req, res, next) {
    Customer.updateOne({ _id: req.params.id }, { $set: req.body })
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

  // [DELETE] /Customer/deletes
  async deleteCustomers(req, res, next) {
    Customer.delete({ _id: { $in: req.body.ids } })
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

  // [PUT] /Customer/deletes
  async restoreCustomers(req, res, next) {
    Customer.restore({ _id: { $in: req.body.ids } })
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

  // [DELETE] /Customer/destroy/
  async destroyCustomer(req, res, next) {
    Customer.deletesMany({ _id: {$in :req.body.ids} })
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
}

module.exports = new CustomersController();
