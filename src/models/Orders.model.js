const mongoose = require('mongoose')
const mongoose_delete = require('mongoose-delete')
const mongoose_lean_virtuals = require('mongoose-lean-virtuals')
const Schema = mongoose.Schema

const productOrder = new Schema({
    productCode: {type: String,require:true,ref:"product"},
    quanity: {type: mongoose.Types.Decimal128},
    price: {type: Number},
    discount: {type: Number},
    option: {type: Object}
})

productOrder.virtual('product',{
    ref: 'product',
    localField: "productCode",
    foreignField: 'code',
    justOne: true
})

productOrder.set('toJSON',{virtuals: true})
productOrder.set('toObject',{virtuals: true})

const order = new Schema({
    code: {type: String,require:true,unique: true},
    shippedDate: {type: Date,default: null,validate: {
        validator: function(val) {
            const _this = this
            let crDate = new Date(_this.createdDate).getTime()
            if(!val) return true
            return val - crDate > 0
        },
        message:"Ngày ship phải sau ngày đặt"
    }},
    status: {type: String, default: 'WAITING'},
    description: {type: String,default: null},
    customerId: {type: mongoose.Types.ObjectId,ref: 'customer',default : null},
    contactInformation:{type: Object},
    shippingInformation: {type:Object},
    paymentInformation: {type:Object},
    createDate: { type: Date, default: null },
    createBy : {type: Object},
    updateDate: {type: Date,default: new Date().getTime()},
    updateBy: {type: Object},
    orderDetails:{type: [productOrder],default: []}
},
)

order.pre('save',async function(next) {
    try {
        if(!this.code) {
            const now = new Date()
            const month = now.getMonth() + 1
            const year = now.getFullYear()
            this.code = `DH${month}${year}`
        }
        if(this.status !== 'WAITING' && this.createDate == null || this.createDate == undefined) {
            this.createDate = new Date()
        }
        next()

    } catch (error) {
       return next(error)
    }
})

order.virtual('customer',{
    ref: 'customer',
    localField: 'customerId',
    foreignField: '_id'
})

order.virtual('employee',{
    ref: 'employee',
    localField: 'employeeId',
    foreignField: '_id'
})
order.set('toJSON',{virtuals: true})
order.set('toObject',{virtuals: true})

order.plugin(mongoose_lean_virtuals)
order.plugin(mongoose_delete,{overrideMethods:'all',deletedAt: true})

module.exports = mongoose.model('order',order)