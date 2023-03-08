const mongoose = require('mongoose')
const mongoose_delete = require('mongoose-delete')
const slug = require('mongoose-slug-generator')
const mongooseLeanVirtuals = require('mongoose-lean-virtuals');
const mongoosePaginate = require('mongoose-paginate-v2');
const Schema = mongoose.Schema


const product = new Schema({
    name: {type: String,maxLength:300 ,index:true},
    code: {type: String,unique: true,require:true},
    slug: {type: String,slug:'name',unique:true},
    price: {type: Number,validate: {
        validator: val => {
            return val >= 0
        },
        message: 'Giá sản phấm không âm'
    },
    default: 0
},
    discount: {type: Number,validate:{
        validator: val => {
            return val>=0 && val <= 75
        },
        message:'Khuyến mãi không âm và nhỏ hơn 75%'
    },
    default: 0
},
    categoryId: {type: mongoose.Types.ObjectId ,ref: 'category'},
    supplierId: {type: mongoose.Types.ObjectId,ref: 'supplier'},
    description:{type: String,index:true},
    spec:{type: String},
    options:{type: Array,default:[]},
    promotionPosition: {type: Array,default:[]},
    coverImgUrl: {type: String,default:""},
    sliderImageUrl: {type: Array, default:[]},
    createDate: { type: Date, default: new Date().getTime() },
    createBy : {type: Object},
    updateDate: {type: Date,default: new Date().getTime()},
    updateBy: {type: Object},
    active: {type: Boolean,default: true}
},{
    timestamps: true
})

product.virtual('stock').get(function() {
    let stock = 0
    this.options.forEach(vl => {
        stock += Number.parseInt(vl.stock)
    })
    return stock
})
product.virtual('priceDiscount').get(function() {
    
    return this.price - this.price*this.discount/100
})

product.virtual('category',{
    ref: 'category',
    localField:'categoryId',
    foreignField: '_id',
    justOne: true
})
product.virtual('supplier',{
    ref: 'supplier',
    localField:'supplierId',
    foreignField: '_id',
    justOne: true
})

product.set('toJSON',{virtuals: true})
product.set('toObject',{virtuals: true})

product.index({name: 'text' ,description:'text',spec:'text'})

product.plugin(mongoose_delete,{overrideMethods: 'all',deletedAt: true})
product.plugin(mongooseLeanVirtuals)
product.plugin(slug)
product.plugin(mongoosePaginate);

module.exports = mongoose.model('product',product)