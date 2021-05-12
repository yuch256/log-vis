const Router = require('koa-router')
const csv = require('fast-csv')
const fs = require('fs')
const path = require('path')
const {Log} = require('../models/log')
const {Entropy} = require('../models/entropy')

const router = new Router({
  prefix:'/v2/log'
})

// csv文件读入数据库
router.put('/read', async ctx => {
  console.time('delete log')
  await Log.sync({force: true})
  console.timeEnd('delete log')

  const files = fs.readdirSync(path.resolve(process.cwd(), 'public/log'))
  const csvFiles = files.filter(file => /^ip\d{1,2}\.csv-数据处理\.csv$/.test(file))
  console.log(csvFiles)

  const readLog = i => {
    if (!csvFiles[i]) return console.log('end')
    const data = []
    console.time(`read log ${i}`)
    fs.createReadStream(path.resolve(process.cwd(), 'public/log', csvFiles[i]))
    // fs.createReadStream(path.resolve(process.cwd(), 'public/log', 'test.csv'))
      // .pipe(csv.parse({ headers: true, maxRows: 10000}))
      .pipe(csv.parse({ headers: true}))
      .on('error', error => console.error(error))
      .on('data', async row => {
        try {
          data.push(row)
          if (data.length === 10000) {
            Log.bulkCreate(data)
            data.length = 0
          }
        } catch (error) {
          console.error(error)
        }
      })
      .on('end', async rowCount => {
        data.length && await Log.bulkCreate(data)
        console.timeEnd(`read log ${i}`)
        console.log(`${csvFiles[i]} parsed ${rowCount} rows`)
        readLog(++i)
      })
  }
  readLog(0)
  
  ctx.body = {
    success: true,
  }
})

router.get('/ports', async ctx => {
  const data = await Log.getPortsCount()

  ctx.body = {
    success: true,
    data,
  }
})

router.get('/flow', async ctx => {
  const data = await Log.getFlow()
  
  ctx.body = {
    success: true,
    data,
  }
})

const formatPortData = data => {
  let otherPortCount = 0
  const total = data.reduce((sum, item) => sum + item.count, 0)
  const result = data.filter(({count}) => {
    const percent = count / total
    const isMajor = percent >= 0.05
    if (!isMajor) otherPortCount += count
    return isMajor
  }).concat({port: 'other', count: otherPortCount})
  .map(({port, count}) => ({port, count, percent: (count / total).toFixed(3)}))
  return data.length ? result : []
}

router.get('/node/srcport', async ctx => {
  const {ip} = ctx.query
  const data = await Log.getNodePort(ip, 'source')
  const result = formatPortData(data)

  ctx.body = {
    success: true,
    data: result,
  }
})

router.get('/node/dstport', async ctx => {
  const {ip} = ctx.query
  const data = await Log.getNodePort(ip, 'target')
  const result = formatPortData(data)

  ctx.body = {
    success: true,
    data: result,
  }
})

router.get('/entropy', async ctx => {
  const data = await Entropy.findAll()

  ctx.body = {
    success: true,
    data,
  }
})

router.get('/node/top', async ctx => {
  const {date} = ctx.query
  const srcip = await Log.getTopFlowAttr('srcip', date)
  const dstip = await Log.getTopFlowAttr('dstip', date)
  const srcport = await Log.getTopFlowAttr('srcport', date)
  const dstport = await Log.getTopFlowAttr('dstport', date)

  ctx.body = {
    success: true,
    data: {
      srcip,
      dstip,
      srcport,
      dstport,
    },
  }
})

router.get('/date/attr', async ctx => {
  const {date, attr, value} = ctx.query
  const data = await Log.getDateAttr(attr, value, date)

  ctx.body = {
    success: true,
    data,
  }
})

// var base = +new Date(1968, 9, 3);
// var oneDay = 24 * 3600 * 1000;
// var date = [];

// for (var i = 1; i < 20000; i++) {
//     var now = new Date(base += oneDay);
//     date.push([now.getFullYear(), now.getMonth() + 1, now.getDate()].join('/'));
// }

module.exports = router
