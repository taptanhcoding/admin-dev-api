const mongoose = require("mongoose");
var mongoose_delete = require("mongoose-delete");
const Schema = mongoose.Schema;
const bcrypt = require('bcrypt')
const mongoosePaginete = require('mongoose-paginate-v2')

const customer = new Schema(
  {
    firstName: { type: String, maxLength: 50 ,index:true,default: ""},
    lastName: { type: String, maxLength: 50,index: true,default: ""},
    username: { type: String, maxLength: 50,index: true,unique: true,require: true},
    code: {type:String ,index:true},
    phoneNumber: { type: String, default: null ,validate: {
        validator: function(val) {
            const phoneRegex = /^(0?)(3[2-9]|5[6|8|9]|7[0|6-9]|8[0-6|8|9]|9[0-4|6-9])[0-9]{7}$/;
            if(val) return phoneRegex.test(val);
            else return true
        },
        message: val => `Số điện thoại ${val} không hợp lệ`
    }},
    address: { type: String },
    email: {
      type: String,
      unique: true,
      validate: {
        validator: function (val) {
          const emailRegex = /^([\w-\.]+@([\w-]+\.)+[\w-]{2,4})?$/;
          return emailRegex.test(val);
        },
        message: (val) =>  `Email ${val} không hợp lệ`
      },
    },
    birthday: { type: Date, default: null },
    password: {type: String,require: true, validate: {
      validator: (val) => {
        const passRegex = /^([A-Z0-9_-]{1})([a-zA-Z0-9\W]{7,30})$/
        return passRegex.test(val)
      },
      message: 'Mật khẩu có ít nhất 8 ký tự, viết hoa ký tự đầu và chứa ký tự đặc biệt'
    }},
    coverImgUrl: {type: String},
    lastActive: {type:Date},
    active: {type: Boolean,default:false},
    updateDate: {type: Date,default: new Date().getTime()},
    updateBy: {type: Object}
  },
  {
    timestamps: true,
  }
);

customer.pre('save',async function(next) {
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

customer.virtual("fullname").get(function () {
  return this.firstName +" "+ this.lastName;
});

customer.index({firstName: 1,lastName: 1,code:1})

// Virtuals in console.log()
customer.set("toObject", { virtuals: true });
// Virtuals in JSON
customer.set("toJSON", { virtuals: true });

customer.plugin(mongoosePaginete)
customer.plugin(mongoose_delete, { overrideMethods: "all", deletedAt: true });

module.exports = mongoose.model("customer", customer);
