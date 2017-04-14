//控制与电影相关的请求
var Category = require('../models/category')
var _ = require('underscore')

//admin new page
exports.new = function(req, res) { 
  res.render('category_admin', {
    title: '后台分类录入页',
    category: {}
  })
}


//admin post movie拿到从后代录入页post过来的数据
exports.save = function(req, res) {
  var _category = req.body.category/*拿到id从而来判断是否是之前存储过的数据*/
  
  var category = new Category(_category)
  category.save(function(err, movie) {
      if (err) {
        console.log(err)/*判断是否有异常*/
      }

      
      res.redirect('/admin/category/list')     
  })

}

//categorylist page
exports.list = function(req, res) { 
  Category.fetch(function(err, categories) {/*第二个参数为查询得到的数据*/
    if (err) {
      console.log(err)
    }
    res.render('categorylist', {
      title: '分类列表页',
      categories: categories
    })
  })
}