// 与首页进行交互
var Movie = require('../models/movie')
var Category = require('../models/category')

//inex page
exports.index = function(req, res) { 
  /*调用实例app的get方法，浏览器访问页面都是以get方式提交请求，get接收两个参数*/
  /*一个是路由匹配规则,一个是回调方法，回调方法注入两个方法request和response*/
  console.log('user in session: ')
  console.log(req.session.user)

  Category
    .find({})//找到所有分类
    .populate({
      path: 'movies', 
      select: 'poster title',
      options: {limit: 5}})//每个分类下取出五条电影数据
    .exec(function(err, categories) {//执行回调

      if (err) {
        console.log(err)
      }
      res.render('index', {
        title: 'Movies 首页',
        categories: categories
    })
  })
}

//search page
exports.search = function(req, res) { 
  var catId = req.query.cat 
  //对应index.jade中a(href="/results?cat=#{cat._id}&p=0")#{cat.name}
  var q = req.query.q
  var page = parseInt(req.query.p, 10) || 0
  var count = 2
  var index = page * count//每一页展现count条数据  
  if (catId) {
    

    Category
      .find({_id: catId})//找到分类
      .populate({
        path: 'movies', 
        select: 'poster title'})
       // options: {limit: 2, skip: index}})//每个分类下取出五条电影数据,从索引index的位置开始去查询
      .exec(function(err, categories) {//执行回调

        if (err) {
          console.log(err)
        }
        var category = categories[0] || {}
        var movies = category.movies || []
        var results = movies.slice(index, index + count)

        res.render('results', {
          title: '搜索结果页面',
          keyword: category.name,
          currentPage: (page + 1),
          query: 'cat=' + catId,
          totalPage: Math.ceil(movies.length / count),
          movies: results//categories只有一条数据
        })
      })    
  }
  else {
    Movie
      .find({title: new RegExp(q + '.*','i')})  //匹配q+任意字符  
      .exec(function(err, movies) {//执行回调
        if (err) {
          console.log(err)
        }

        var results = movies.slice(index, index + count)
        console.log(movies)
        res.render('results', {
          title: '搜索结果页面',
          keyword: q,
          currentPage: (page + 1),
          query: 'q=' + q,
          totalPage: Math.ceil(movies.length / count),
          movies: results//categories只有一条数据
        })
      })              
  }
  
}