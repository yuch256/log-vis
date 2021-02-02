const Router = require('koa-router')
const csv = require('fast-csv')
const fs = require('fs')
const path = require('path')
const {Log} = require('../models/log')

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
  
  ctx.body = 'read log'
})

router.get('/communication-times/day', async ctx => {
  const timeInterval = await Log.getTimeInterval()
  const list = await Log.getCommunicationTimesByOneDay()
  ctx.body = {
    ...timeInterval,
    list,
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