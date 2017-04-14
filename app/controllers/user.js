//与用户相关的
var User = require('../models/user')

//signup
exports.showSignup = function(req, res) { 
    res.render('signup', {
      title: '用户注册页面'
    })
}

exports.signup = function(req, res) {
  var _user = req.body.user
  // /user/signin/1111?userid=1112
  // var _userid = req.query.userid

  // 避免注册重复的用户名
  User.findOne({name: _user.name}, function(err, user) {
    if(err) {
      console.log(err)
    }
    if (user) {
      return res.redirect('/signin')
    }
    else {
      var user = new User(_user)
      user.save(function(err, user) {
        if (err) {
          console.log(err)
        }
        //console.log(user)
        res.redirect('/')//重定向到xxx
      })    
    }
  })
  
}

//signin
exports.showSignin = function(req, res) { 
    res.render('signin', {
      title: '用户登录页面'
    })
}

exports.signin = function(req, res) {
  var _user = req.body.user
  var name = _user.name
  var password = _user.password

  User.findOne({name: name}, function(err, user) {
    if (err) {
      console.log(err)
    }

    if (!user) {
      return res.redirect('/signup')
    }

    user.comparePassword(password, function(err, isMatch) {
      if (err) {
        console.log(err)
      }

      if (isMatch) {
        console.log('Password is matched')

        req.session.user = user

        return res.redirect('/')
      }
      else {
        return res.redirect('/signin')
        console.log('Password is not matched')
      }
    })
  })
}


//logout
exports.logout = function(req, res) {
  delete req.session.user
  //delete app.locals.user
  res.redirect('/')

}


//userlist page
exports.list = function(req, res) { 
  User.fetch(function(err, users) {/*第二个参数为查询得到的数据*/
    if (err) {
      console.log(err)
    }
    res.render('userlist', {
      title: '用户列表页',
      users: users
    })
  })
}

// midware for user(登录、管理员)
exports.signinRequired = function(req, res, next) { 
  var user = req.session.user

  if (!user) {
    return res.redirect('/signin')
  }
  next()
}

exports.adminRequired = function(req, res, next) { 
  var user = req.session.user
  console.log(user)
  if (user.role <= 10) {
    return res.redirect('/signin')
  }
  next()
}

