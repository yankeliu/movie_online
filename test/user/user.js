var crypto = require('crypto')//加密解密
var bcrypt = require('bcryptjs')

function getRandomString(len) {
  //测试user用户名
  if (!len) len = 16
  return crypto.randomBytes(Math.ceil(len / 2)).toString('hex')
}

var should = require('should')
var app = require('../../app')
var mongoose = require('mongoose')
//var mongoose = require('../../app/models/user')
var User = mongoose.model('User')//前提是app.js中walk函数

var user
//test
describe('<Unit Test', function() {//一个测试模块中可以包含子的测试模块
  describe('Model User:', function() {
    before(function(done) {//测试之前要做的事情
      user = {
        name: getRandomString(),
        password: 'password'
      }
      done()
    })
    describe('Before Method save', function() {//save方法调用之前
      it('should begin without test user', function(done) {// 在开始的时候没有user
        User.find({name: user.name}, function(err, users) {
          users.should.have.length(0)

          done()
        })
      })//it代表一个测试单元
    })
    describe('User save', function() {
      it('should save without problems', function(done) {// save的时候确保没有问题
        var _user = new User(user)

        _user.save(function(err) {
          should.not.exist(err)
          _user.remove(function(err) {
            should.not.exist(err)
            done()
          })
        })
      })//it代表一个测试单元
      it('should password be hashed correctly', function(done) {// save的时候确保没有问题
        var password = user.password
        var _user = new User(user)

        _user.save(function(err) {
          should.not.exist(err)
          _user.password.should.not.have.length(0)//长度不为0

          bcrypt.compare(password, _user.password, function(err, isMatch) {
            should.not.exist(err)
            isMatch.should.equal(true)
          })
          _user.remove(function(err) {
            should.not.exist(err)
            done()
          })
        })
      })//it代表一个测试单元      
      it('should have default role 0', function(done) {// save的时候确保没有问题
        var _user = new User(user)

        _user.save(function(err) {
          _user.role.should.equal(0)

          _user.remove(function(err) {
            should.not.exist(err)
            done()
          })
        })
      })//it代表一个测试单元            
      it('should fail to save an existing user', function(done) {// 重复名字报错
        var _user1 = new User(user)
        _user1.save(function(err) {
          should.not.exist(err)

          var _user2 = new User(user)

          _user2.save(function(err) {
            should.exist(err)

            _user1.remove(function(err) {
              if (!err) {
                _user2.remove(function(err) {
                  done()
                })              
              } 
            })
          })          
        })
      })//it代表一个测试单元                  
    })
    after(function(done) {
      //clear user info
      done()
    })
  })
})
