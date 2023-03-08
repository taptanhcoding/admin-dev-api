const mongoose  = require('mongoose')
var mongoose_delete = require('mongoose-delete');
const Schema = mongoose.Schema

const slider = new Schema({
    title : {type: String},
    summary: {type: String,maxLength: 500, default: null},
    url:{type: String},
    imgUrl: {type: String},
    sortOrder:{type: Number},
    active:{type: Boolean,default: true},
    createDate: { type: Date, default: new Date().getTime() },
    createBy : {type: Object},
    updateDate: {type: Date,default: new Date().getTime()},
    updateBy: {type: Object}
},{
    timestamps: true
}
)

slider.plugin(mongoose_delete,{overrideMethods: "all",deletedAt:true})

module.exports = mongoose.model('slider',slider)