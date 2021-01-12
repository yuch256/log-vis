const koa = require('koa')
const parser = require('koa-bodyparser')
const exception = require('./middlewares/execption')
const app = new koa()

const InitManager = require('./core/init')
app.use(exception)
app.use(parser())
InitManager.initCore(app)

app.listen(8080, () => {
  console.log('http监听端口8080')
})
