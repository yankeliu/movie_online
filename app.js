var express = require('express')
var path = require('path')/*告诉浏览器在请求样式脚本的时候在bower文件夹里面找*/
var session = require('express-session')
var mongoose = require('mongoose')
var cookieSession = require('cookie-session')
var mongoStore = require('connect-mongo')(session)
var morgan = require('morgan')
var serveStatic = require('serve-static')
var bodyParser = require('body-parser')
var multiparty = require('connect-multiparty')
var fs = require('fs')

var dbUrl = 'mongodb://localhost/movie_online'

var port = process.env.PORT || 3000/*获取全局变量process下的环境变量env中设置的端口号或设置默认3000*/

mongoose.Promise = global.Promise;
mongoose.connect(dbUrl)/*传入并连接本地数据库*/

//models loading
var models_path = __dirname + '/app/models'
var walk = function(path) {
  fs
    .readdirSync(path)
    .forEach(function(file) {
      var newPath = path + '/' + file
      var stat = fs.statSync(newPath)

      if (stat.isFile()) {
        if (/(.*)\.(js|coffee)/.test(file)) {
          require(newPath)
        }
      }
      else if (stat.isDirectory()) {
        walk(newPath)
      }
    })
}
walk(models_path)

var app = express()/*启动一个web服务器,，实例赋给变量app*/
// 连接数据库
// 这里需要安装Mongodb,并且要启动mongodb服务
//mongoose.connect('mongodb://127.0.0.1:27017/imovie');

app.set('views', './app/views/pages')/*设置视图根目录*/
app.set('view engine','jade')/*设置默认的模板引擎jade*/

//提交表单使用的中间件，后台接收请求时经过中间件把form表单中的请求体数据格式化为一个对象
app.use(bodyParser.urlencoded({extended: true}))
app.use(multiparty())

//服务器端用session保存登陆状态
// app.use(cookieSession({

//   name: 'session',//name: 设置 cookie 中保存 session id 的字段名称，默认为connect.sid

//   secret: 'h123',//secret: 通过设置 secret 来计算 hash 值并放在 cookie 中，使产生的 signedCookie 防篡改
//   //resave:false,
//   //resave: 如果为true，则每次请求都重新设置sessio的 cookie，假设你的cookie是10分钟过期，每次请求都会再设置10分钟

// 	//saveUninitialized:true //saveUninitialized: 如果为true, 则无论有没有session的cookie，每次请求都设置个session cookie

//   // Cookie Options
//   // maxAge: 24 * 60 * 60 * 1000 // 24 hours
// }))


app.use(session({
  secret: 'h123',
  store: new mongoStore({
    url: dbUrl,
    collection: 'sessions',
  }),
  resave: false,
  saveUninitialized: true
}))

// 配置本地开发环境的变量，达到控制台显示提示信息的目的
if ('development' === app.get('env')) {//拿到本地环境变量
	app.set('showStackError',true)//打印错误信息
	//app.use(express.logger(':method :url :status'))//显示请求方法，路径，状态码
	app.use(morgan(':method :url :status'))
	app.locals.pretty  =  true//显示格式化后的代码
	mongoose.set('debug', true)//debug开关打开

}


require('./config/routes')(app)

app.use('/static', express.static(path.join(__dirname, 'public')))

//添加moment
app.locals.moment = require('moment')


// 规定静态资源的获取路径,告诉浏览器在请求样式脚本的时候在bower_components文件夹里面找
// app.use(exress.static(path.join(_dirname, 'bower_components')))
app.listen(port)/*监听端口*/

console.log('movie_online started on port ' + port)

