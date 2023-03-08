const mongoose = require("mongoose");
const mongoose_delete = require("mongoose-delete");
const slug = require("mongoose-slug-generator");
const mongooseLeanVirtuals = require("mongoose-lean-virtuals");
const Schema = mongoose.Schema;

const suppliers = new Schema({
  supplierId: { type: mongoose.Types.ObjectId, ref: "supplier" },
});

suppliers.virtual("supplier", {
  ref: "supplier",
  localField: "supplierId",
  foreignField: "_id",
  justOne: true,
});

suppliers.set("toJSON", { virtual: true });
suppliers.set("toString", { virtual: true });
const Category = new Schema(
  {
    name: { type: String, unique: true, maxLength: 50, require: true },
    slug: { type: String, slug: "name", unique: true },
    description: { type: String, maxLength: 500, default: null },
    parentId: { type: mongoose.Types.ObjectId, ref: "category", default: null },
    promotionPosition: { type: Array, default: [] },
    coverImgUrl: { type: String },
    supplierIds: {type: [suppliers], default: []},
    sortOrder: { type: Number },
    active: { type: Boolean, default: true },
    createDate: { type: Date, default: new Date().getTime() },
    createBy : {type: Object},
    updateDate: {type: Date,default: new Date().getTime()},
    updateBy: {type: Object}
  },
  {
    timestamps: true,
  }
);



Category.plugin(mongooseLeanVirtuals);
Category.plugin(mongoose_delete, { overrideMethods: "all", deletedAt: true });
Category.plugin(slug);

module.exports = mongoose.model("category", Category);
