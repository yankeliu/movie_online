//控制与电影相关的请求
var Movie = require('../models/movie')
var Category = require('../models/category')
var Comment = require('../models/comment')
var _ = require('underscore')
var fs = require('fs') //读写文件（异步）
var path = require('path')//路径模块

 //detail page
exports.detail = function(req, res) { 
  var id = req.params.id/*获取路由中的id*/

  Movie.update({_id: id}, {$inc: {pv: 1}}, function(err) {
    //访客统计
    if (err) {
      console.log(err)
    }
  })

  Movie.findById(id, function(err, movie) {/*第二个参数为查询到的电影数据*/

    //使用回调方法查询comment,嵌套层次较少时使用
    Comment
      .find({movie: id})
      .populate('from', 'name')
      //from是objectId类型，它关联user，所以会去user中查询name字段，来给from添加name属性
      .populate('reply.from reply.to', 'name')
      .exec(function(err, comments) {
        //console.log(comments[0].reply)
        res.render('detail', {
        title: movie.title,
        movie: movie,
        comments: comments
        })
    })
  })
}

//admin new page
exports.new = function(req, res) { 
  Category.find({}, function(err, categories) {
    res.render('admin', {
      title: '后台录入页',
      categories: categories,
      movie: {}
    })
  })

}

//admin update movie列表页点击更新会重新回到后台录入页，将电影数据初始化到表单中
exports.update = function(req, res) {
  var id = req.params.id

  if (id) {
    Category.find({}, function(err, categories) {
      Movie.findById(id, function(err, movie) {/*如果id存在，则通过模型来拿到这个电影*/
        res.render('admin',{
          title: '后台更新页',
          movie: movie,
          categories: categories
        })
      })
    })
  }
}

// admin poster
exports.savePoster = function(req, res, next){
  var posterData = req.files.uploadPoster //此处用req.files而不是req.body
  var filePath = posterData.path
  var originalFilename = posterData.originalFilename
  if (originalFilename) { // 根据originalName是否存在来判断图片是否上传
    fs.readFile(filePath, function(err, data) {
      var timestamp = Date.now()
      var type = posterData.type.split('/')[1]//png或jpg
      var poster = timestamp + '.' + type //重命名
      var newPath = path.join(__dirname, '../../', '/public/upload/' + poster)
      //生成服务器存储文件的地址
      fs.writeFile(newPath, data, function(err) {
        req.poster = poster
        //写入成功后的poster名字挂在req上,以便于在下一个流程中使用
        next()
      }) 
    })

  }
  else {
    next()
  }
}


//admin post movie拿到从后代录入页post过来的数据
exports.save = function(req, res) {
 
  var id = req.body.movie._id/*拿到id从而来判断是否是之前存储过的数据*/
  var movieObj = req.body.movie
  var _movie

  if (req.poster) {
    movieObj.poster = req.poster
  }

  if (id){/*不是空说明这部电影已经存储到数据库过了*/
    Movie.findById(id, function(err, movie) {
      if (err) {
        console.log(err)
      }
	  Category.findById(movie.category, function(err, category) {

          category.movies.splice(category.movies.indexOf(id), 1)
          category.save(function(err, category) { 
          })
        }) 
      /*用post过来的数据来替换掉老数据中的相应字段*/
      _movie = _.extend(movie, movieObj)/*查询得到的movie放第一参数，post过来的放第二参数*/
      _movie.save(function(err, movie) {
        if (err) {
          console.log(err)/*判断是否有异常*/
        }
        Category.findById(_movie.category, function(err, category) {

          category.movies.push(movie._id)

          category.save(function(err, category) {
              /*如果成功了就重定向到这部电影的详情页面*/
            res.redirect('/movie/' + movie._id)  
          })
        })           
      })
    })
  }
  else{/*如果电影没有被定义过，是新加的*/
    // _movie = new Movie({/*调用模型的构造函数，并传入数据*/
    //   doctor: movieObj.doctor,
    //   title: movieObj.title,
    //   country: movieObj.country,
    //   language: movieObj.language,
    //   year: movieObj.year,
    //   poster: movieObj.poster,
    //   summary: movieObj.summary,
    //   flash: movieObj.flash,
    // })

    _movie = new Movie(movieObj)

    var categoryId = _movie.category
    var categoryName = movieObj.categoryName
    console.log(categoryName)
    console.log('post数据')
    console.log(movieObj)

    _movie.save(function(err, movie) {
      if (err) {
        console.log(err)/*判断是否有异常*/
      }
      console.log(movie)
      if (categoryId) {
        Category.findById(categoryId, function(err, category) {
          category.movies.push(movie._id)

          category.save(function(err, category) {
              /*如果成功了就重定向到这部电影的详情页面*/
            res.redirect('/movie/' + movie._id)  
          })
        }) 
      }
      else if(categoryName) {
        var category = new Category({
          name: categoryName,
          movies: [movie._id]
        })
        category.save(function(err, category) {
          movie.category = category._id
          movie.save(function(err, movie) {
            /*如果成功了就重定向到这部电影的详情页面*/
            res.redirect('/movie/' + movie._id)             
          })      
        })        
      }
             
    })
  }
}

//list page
exports.list = function(req, res) { 
  Movie.fetch(function(err, movies) {/*第二个参数为查询得到的数据*/
    if (err) {
      console.log(err)
    }
    res.render('list', {
      title: '电影列表页',
      movies: movies
    })
  })
}

//list delete movie
exports.del = function(req, res) {
  var id = req.query.id

  if (id) {
    Movie.remove({_id: id}, function(err, movie) {
      if (err) {
        console.log(err)
      }
      else {
        res.json({success: 1})
      }
    })
  }
}