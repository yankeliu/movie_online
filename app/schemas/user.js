var mongoose = require('mongoose')/*引入建模工具模块mongoose*/
var bcrypt = require('bcryptjs')/*为密码存储而设计的算法，生成一个随机的盐然后进行加密*/
var SALT_WORK_FACTOR = 10/*计算强度*/

var UserSchema = new mongoose.Schema({
  name:{//用户名
    unique: true,//唯一的
    type: String
  },
  password: String,  
  role: {
      type: Number,
      default: 0/*默认值为0*/
  },
  //默认注册用户的角色为0，邮件激活的用户为1，资料完备用户为2，>10为管理员角色，>50超级管理员
  meta: {  /*记录更新或录入的时间*/
    createAt: {/*创建时间*/
      type: Date,
      default: Date.now()
    },
    updateAt: {/*更新时间*/
      type: Date,
      default: Date.now()
    }
  }
})

/*为模式添加一个方法*/
UserSchema.pre('save', function(next) {  /*每次存储数据之前都会调用这个方法*/
  var user = this
  if (this.isNew){ /*判断数据是否是新加的*/
    this.meta.createAt = this.meta.updateAt = Date.now()
  }
  else {
    this.meta.updateAt = Date.now()
  }
  /*生成一个随机的盐,第一个参数是计算强度，第二参数回调方法*/
  bcrypt.genSalt(SALT_WORK_FACTOR, function(err, salt) {
    if(err) {return next()} /*如果有error，就把它带到下一个流程去*/

      /*拿到盐之后*/
      bcrypt.hash(user.password, salt, function(err, hash) {
        if(err) {return next()}
          /*拿到加盐后的hash*/
        user.password = hash
        next()
      })
  })
  //next()/*必须调用的pre save的方法，使存储流程走下去*/
})

// 实例方法：通过实例来调用
UserSchema.methods = {
  comparePassword: function(_password, cb) {
    bcrypt.compare(_password, this.password, function(err, isMatch) {
      if (err) {
        return cb(err)/*如果有错误就把错误包装到回调方法中返回*/
      }
      cb(null, isMatch)
    })
  }
}



/*这里的静态方法不会与数据库进行直接交互，只有经过Model编译、进行实例化之后才会具有这个方法*/
// 静态方法是在模型里面就可以调用
UserSchema.statics = {
  /*用来取出目前数据库里面所有的数据*/
  fetch: function(cb) {
    return this
      .find({})
      .sort('meta.updateAt')/*按照更新时间排序*/
      .exec(cb)/*执行回调方法*/
  },
  findById: function(id, cb) {/*用来查询单条数据*/
    return this
      .findOne({_id: id})
      .exec(cb)/*执行回调方法*/
  }  
}

/*将模式导出*/
module.exports = UserSchema