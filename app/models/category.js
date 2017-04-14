var mongoose = require('mongoose')
var CategorySchema = require('../schemas/category.js')
var Category = mongoose.model('Category', CategorySchema)/*编译生成Movie模型*/

module.exports = Category