//跨域设置
const cors = require('koa2-cors');
module.exports = app => {
    app.use(cors({
        origin: 'http://www.tbmrk.com',
        exposeHeaders: ['WWW-Authenticate', 'Server-Authorization'],
        maxAge: 5,
        credentials: true,
        allowMethods: ['GET', 'POST', 'DELETE', 'PUT'],
        allowHeaders: ['Content-Type', 'Authorization', 'Accept','x-requested-with', 'origin', 'content-type'],
        credentials: true
    }))
}