const Employees = require("../models/Employees.model");
const sanitize = require("mongo-sanitize");
const bcrypt = require("bcrypt");
const {
  signRfToken,
  signToken,
  verifyRfToken,
  signTokenPss,
} = require("../helpers/token.helpers");
const { client } = require("../configs/redis.configs");
require("dotenv").config();

class EmployeesController {
  //[POST] /admin/profile/:id
  async ProfileAdmin(req, res, next) {
    try {
      const { id } = req.params;
      const data = await Employees.findOne({ _id: id }, { password: 0 })
      return res.send({
        status: true,
        data
      })
    } catch (error) {
      console.log(error);
      return res.status(400).send({
        status: false,
        message: err.message,
      });
    }
  }

  //[POST] /admin/create-admin/:secret-key
  async CreateAdmin(req, res, next) {
    const newAd = new Employees(req.body);
    console.log(req.body);
    newAd
      .save()
      .then((data) =>
        res.send({
          status: true,
          message: "Thêm Admin thành công",
          data
        })
      )
      .catch((err) => {
        console.log(err);
        res.status(400).send({
          status: false,
          message: err.message,
        });
      });
  }

  //[POST] /admin//refresh-token
  async RefreshToken(req, res, next) {
    const { refreshToken } = req.body;
    const oldRfToken = await client.get("refreshToken");

    if (refreshToken == oldRfToken) {
      let dataIn = await verifyRfToken(req.body.refreshToken);
      try {
        const { id } = dataIn;
        const user = await Employees.findOne({ id });
        if (user) {
          let token = await signToken({ id: dataIn.id });
          let refreshToken = await signRfToken({ id: dataIn.id });
          await client.set("token", token);
          await client.set("refreshToken", refreshToken);
          return res.send({
            status: true,
            token,
            refreshToken,
          });
        } else {
          return res.status(500).send({
            status: false,
            message: "Token Fake",
          });
        }
      } catch (error) {
        return res.status(500).send({
          status: false,
          message: "refresh token không hợp lệ ",
        });
      }
    } else {
      res.status(404).send({
        status: false,
        message: "Bạn đã đăng xuất !!",
      });
    }
  }

  //[GET] /admin/auth
  async Auth(req, res, next) {
    res.send({
      status: true,
      message: "",
      admin: req.user,
    });
  }

  //[POST]/admin/login
  async Login(req, res, next) {
    Employees.findOne({ email: sanitize(req.body.email) })
      .then(async (acc) => {
        if (acc) {
          if (await bcrypt.compare(req.body.password, acc.password)) {
            let token = await signToken({ id: acc._id });
            let refreshToken = await signRfToken({ id: acc._id });
            await client.set("token", token);
            await client.set("refreshToken", refreshToken);
            return res.send({
              status: true,
              token,
              refreshToken,
              message: "Đăng nhập thành công",
            });
          } else {
            return res.status(404).send({
              status: false,
              token: null,
              refreshToken: null,
              message: "Mật khẩu không đúng",
            });
          }
        } else {
          return res.status(404).send({
            status: false,
            token: null,
            refreshToken: null,
            message: "Email không đúng",
          });
        }
      })
      .catch((err) => {
        console.log("err acc :::", err);
        return res.status(500).send({
          status: false,
          token: null,
          refreshToken: null,
        });
      });
  }

  //[DELETE] /admin/logout
  async Logout(req, res, next) {
    try {
      await client.del("token");
      await client.del("refreshToken");
      res.send({
        status: true,
        message: "Đăng xuất thành công",
      });
    } catch (error) {
      console.log("err::", error);
      res.status(500).send({
        status: false,
        message: "Lỗi !!!",
      });
    }
  }

  //[GET] /admin/admin-list
  async EmployeesList(req, res, next) {
    try {
      const options = {}
      let data = []
      options.password = 0
      data = await Employees.findWithDeleted({_id: {$ne : req.user.id}}, options).sort({ _id: -1 })

      return res.send({
        status: true,
        data
      })
    } catch (error) {
      console.log("Lỗi khi lấy nhân viên ",error);
      return res.status(500).send({
        status: false,
        message: "Lỗi khi lấy nhân viên"
      })
    }


    Employees.find({}, { password: 0 })
      .then((data) => {
        return res.send({
          status: true,
          message: "",
          data,
        });
      })
      .catch((err) => {
        console.log(err);
        return res.status(500).send({
          status: false,
          message: "Truy vấn lỗi",
        });
      });
  }

  //[PATCH] /admin/update/:id?changepass=true
  async UpdateAdmin(req, res, next) {
    try {
      const { id } = req.params;
      const { password,roles,} = req.body;
      const { changepass } = req.query;
      const newData = req.body;
     
      if (changepass == true) {
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

      const admin = await Employees.findOne({$and: [{ active: true },{_id:id}]})
      if (!admin) {
        return false
      }

      if(!admin.enableEditRoles) {
        if(newData.roles) {
          delete newData?.roles?.auth
        }
        delete newData?.enableEditRoles
      }
      if (await bcrypt.compare(password, admin.password)) {
        delete newData.password
        await Employees.updateOne({ _id: sanitize(id) }, { $set: newData })
        return res.send({
          status: true,
          message: "Cập nhật thành công",
        });
      }
      else {
        return res.status(404).send({
          status: false,
          message: "Mật khẩu không đúng!"
        })
      }
    } catch (error) {
      console.log("Lỗi cập nhật thông tin ", error);
      return res.status(500).send({
        status: false,
        message: error
      })
    }
  }

  //[PATCH] /admin/update/:id/:secretKey
  async UpdateByAdmin(req, res, next) {
    try {
      const { id } = req.params;
      const {password} = req.body
      let newData = req.body
      if(password) {
        let salt = await bcrypt.genSalt(10)
        newData.password = await bcrypt.hash(password,salt)
      }
      await Employees.updateOne({ _id: sanitize(id) }, { $set: newData })
      return res.send({
        status: true,
        message: "Cập nhật bởi admin thành công",
      });
    } catch (error) {
      console.log(error);
    }
  }

  //[PATCH] /admin/update/:id/:secretKey
  async RestoreByAdmin(req, res, next) {
    try {
      const { id } = req.params;
      await Employees.restore({ _id: sanitize(id) })
      return res.send({
        status: true,
        message: "Khôi phục thành công",
      });
    } catch (error) {
      console.log(error);
    }
  }

  //[PATCH] /admin/update/:id/:secretKey
  async DeleteByAdmin(req, res, next) {
    try {
      const { id } = req.params;
      await Employees.delete({ _id: sanitize(id) })
      return res.send({
        status: true,
        message: "Xóa thành công",
      });
    } catch (error) {
      console.log(error);
    }
  }

  //[PATCH] /admin/update/:id/:secretKey
  async DestroyByAdmin(req, res, next) {
    try {
      const { id } = req.params;
      await Employees.deleteOne({ _id: sanitize(id) })
      return res.send({
        status: true,
        message: "Hủy diệt thành công",
      });
    } catch (error) {
      console.log(error);
    }
  }

  //[POST] /admin/create-token-admin
  async LoginPss(req, res, next) {
    Employees.findOne({ email: sanitize(req.body.email) })
      .then(async (acc) => {
        if (acc) {
          if (await bcrypt.compare(req.body.password, acc.password)) {
            let token = await signTokenPss({ id: acc._id });
            return res.send({
              token
            });
          } else {
            return res.status(404).send({
              status: false,
              token: null,
              refreshToken: null,
              message: "Mật khẩu không đúng",
            });
          }
        } else {
          return res.status(404).send({
            status: false,
            token: null,
            refreshToken: null,
            message: "Email không đúng",
          });
        }
      })
      .catch((err) => {
        console.log("err acc :::", err);
        return res.status(500).send({
          status: false,
          token: null,
          refreshToken: null,
        });
      });
  }
}

module.exports = new EmployeesController();
