const Koa = require('koa')
const app = new Koa()
const views = require('koa-views')
const json = require('koa-json')
const onerror = require('koa-onerror')
const logger = require('koa-logger')
const session = require('koa-session2');
// error handler
onerror(app)

//解析请求的body，包括文件上传，代替bodyparser
const body = require('koa-better-body')
app.use(body())
app.use(json())
app.use(logger())
//session设置
app.use(session({
      maxAge: 3600000,//一小时
      overwrite: true, 
      httpOnly: true, 
      signed: false, 
      rolling: false
}));
//静态资源文件目录
app.use(require('koa-static')(__dirname + '/public'))
//页面存放目录
app.use(views(__dirname + '/views', {
  map : {html:'ejs'}
}));
// routes
const routeConfig = require('./config/routeConfig');
routeConfig(app);

const indexRoute = require('./routes/index')
app.use(indexRoute.routes(), indexRoute.allowedMethods())

// error-handling
app.on('error', (err, ctx) => {
  console.error('server error', err, ctx)
});




//启动服务
const debug = require('debug')('demo:server');
const http = require('http');
var port = normalizePort(process.env.PORT || '3000');
var server = http.createServer(app.callback());

server.listen(port);
server.on('error', onError);
server.on('listening', onListening);

function normalizePort(val) {
  var port = parseInt(val, 10);
  if (isNaN(port)) {
    return val;
  }
  if (port >= 0) {
    return port;
  }
  return false;
}


function onError(error) {
  if (error.syscall !== 'listen') {
    throw error;
  }

  var bind = typeof port === 'string'
    ? 'Pipe ' + port
    : 'Port ' + port;
  switch (error.code) {
    case 'EACCES':
      console.error(bind + ' requires elevated privileges');
      process.exit(1);
      break;
    case 'EADDRINUSE':
      console.error(bind + ' is already in use');
      process.exit(1);
      break;
    default:
      throw error;
  }
}


function onListening() {
  var addr = server.address();
  var bind = typeof addr === 'string'
    ? 'pipe ' + addr
    : 'port ' + addr.port;
  debug('Listening on ' + bind);
}


module.exports = app
