const Router = require('koa-router')
const csv = require('fast-csv')
const fs = require('fs')
const path = require('path')
const {Logs} = require('../models/logs')

const router = new Router({
  prefix:'/v2/logs'
})

// csv文件读入数据库
router.get('/read', async ctx => {
  console.time('delete logs')
  await Logs.sync({force: true})
  console.timeEnd('delete logs')

  const files = fs.readdirSync(path.resolve(process.cwd(), 'public/logs'))
  const csvFiles = files.filter(file => /^ip\d{1,2}\.csv-数据处理\.csv$/.test(file))
  console.log(csvFiles)

  const readLog = i => {
    if (!csvFiles[i]) return
    const data = []
    let len = 0
    console.time(`read log ${i}`)
    fs.createReadStream(path.resolve(process.cwd(), 'public/logs', csvFiles[i]))
    // fs.createReadStream(path.resolve(process.cwd(), 'public/logs', 'test.csv'))
      // .pipe(csv.parse({ headers: true, maxRows: 10000}))
      .pipe(csv.parse({ headers: true}))
      .on('error', error => console.error(error))
      .on('data', async row => {
        try {
          data.push(row)
          len ++
          if (len === 10000) {
            Logs.bulkCreate(data)
            data.length = 0
            len = 0
          }
          // await Logs.createData(row)
        } catch (error) {
          console.error(error)
        }
      })
      .on('end', async rowCount => {
        len && await Logs.bulkCreate(data)
        console.timeEnd(`read log ${i}`)
        console.log(`${csvFiles[i]} parsed ${rowCount} rows`)
        readLog(++i)
      })
  }
  readLog(9)
  
  ctx.body = 'read logs'
})

module.exports = router