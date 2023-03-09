const mongoose  = require('mongoose')
var mongoose_delete = require('mongoose-delete');
const Schema = mongoose.Schema

const slider = new Schema({
    title : {type: String},
    url:{type: String},
    typeSlide: {type: ['slider','banner_right'],require:true,default:'slider'},
    coverImgUrl: {type: String,require:true},
    active:{type: Boolean,default: true},
    createBy : {type: Object},
    updateBy: {type: Object}
},{
    timestamps: true
}
)

slider.plugin(mongoose_delete,{overrideMethods: "all",deletedAt:true})

module.exports = mongoose.model('slider',slider)