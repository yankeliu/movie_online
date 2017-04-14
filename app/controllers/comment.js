//控制与电影相关的请求
var Comment = require('../models/comment')

//comment
exports.save = function(req, res) {
  var _comment = req.body.comment
  var movieId = _comment.movie

  if (_comment.cid) {
    //如果是回复的话就先找到数据库中的主评论
    Comment.findById(_comment.cid, function(err, comment) {
      var reply = {
        from: _comment.from,
        to: _comment.tid,
        content: _comment.content
      }

      comment.reply.push(reply)
      //console.log(comment.reply)
      comment.save(function(err, comment) {
        if (err) {
          console.log(err)/*判断是否有异常*/
        }

        /*如果成功了就重定向到这部电影的详情页面*/
        res.redirect('/movie/' + movieId)             
        })
    })
  }
  else {
    var comment = new Comment(_comment)
    
    comment.save(function(err, comment) {//此处comment为保存后的comment
      if (err) {
        console.log(err)/*判断是否有异常*/
      }

      /*如果成功了就重定向到这部电影的详情页面*/
      res.redirect('/movie/' + movieId)     
     })    
  }  
}

