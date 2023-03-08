const mongoose  = require('mongoose')
const mongoose_delete = require('mongoose-delete');
const slug = require('mongoose-slug-generator')
const Schema = mongoose.Schema

const Supplier = new Schema({
    name : {type: String,unique:true ,maxLength: 100,require:true},
    slug: {type: String, slug:'name', unique: true},
    email: {type: String,maxLength: 50, default: null},
    phoneNumber:{type: String,default:null,maxLength:50},
    address: {type: String,maxLength:500},
    coverImgUrl: {type: String},
    active: {type:Boolean,default:true},
    createDate: { type: Date, default: new Date().getTime() },
    createBy : {type: Object},
    updateDate: {type: Date,default: new Date().getTime()},
    updateBy: {type: Object}
},{
    timestamps: true
}
)

Supplier.plugin(slug)
Supplier.plugin(mongoose_delete,{overrideMethods: "all",deletedAt:true})

module.exports = mongoose.model('supplier',Supplier)