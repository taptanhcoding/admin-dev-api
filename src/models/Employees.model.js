const mongoose = require("mongoose");
const mongoose_delete = require("mongoose-delete");
const mongoose_lean_virtuals  =require('mongoose-lean-virtuals')
const bcrypt = require('bcrypt')
const {Schema }= mongoose;

const Employee = new Schema(
  {
    firstName: { type: String, maxLength: 50 },
    lastName: { type: String, maxLength: 50 },
    coverImgUrl: {type: String,default: null},
    phoneNumber: { type: String, default: null ,validate: {
        validator: function(val) {
            const phoneRegex = /^(0?)(3[2-9]|5[6|8|9]|7[0|6-9]|8[0-6|8|9]|9[0-4|6-9])[0-9]{7}$/;
            if(val){
              return phoneRegex.test(val);
            }else {
              return true
            }
        },
        message: val => `Số điện thoại ${val} không hợp lệ`
    }},
    address: { type: String },
    email: {
      type: String,
      unique: true,
      validate: {
        validator: function (phone) {
          const emailRegex = /^([\w-\.]+@([\w-]+\.)+[\w-]{2,4})?$/;
          return emailRegex.test(phone);
        },
        message: (phone) =>  `Email ${phone} không hợp lệ`
      },
    },
    secretKey: {type:String},
    birthday: { type: Date, default: null },
    password: {type: String,require: true, validate: {
      validator: (val) => {
        const passRegex = /^([A-Z0-9_-]{1})([a-zA-Z0-9\W]{7,30})$/
        return passRegex.test(val)
      },
      message: 'Mật khẩu có ít nhất 8 ký tự, viết hoa ký tự đầu và chứa ký tự đặc biệt'
    }},
    lastActive: {type:Date,default: new Date().getTime()},
    active: {type: Boolean,default: false},
    roles: {type: Object,required: true, default: {}},
    createDate: { type: Date, default: new Date().getTime() },
    createBy : {type: Object},
    updateDate: {type: Date,default: new Date().getTime()},
    updateBy: {type: Object},
    enableEditRoles: {type:Boolean,default:false}
  },
  {
    timestamps: true,
  }
);

Employee.pre('save',async function(next) {
  try {
      const salt = await bcrypt.genSalt(10)
      const newPassword = await bcrypt.hash(this.password,salt)
      this.password = newPassword
      next()
    }
    catch(err) {
      next(err)
    }
})


Employee.virtual("fullname").get(function () {
  return this.firstName + " " + this.lastName;
});
// Virtuals in console.log()
Employee.set("toObject", { virtuals: true });
// Virtuals in JSON
Employee.set("toJSON", { virtuals: true });

Employee.plugin(mongoose_lean_virtuals)
Employee.plugin(mongoose_delete, { overrideMethods: "all", deletedAt: true });

module.exports = mongoose.model("employee", Employee);
