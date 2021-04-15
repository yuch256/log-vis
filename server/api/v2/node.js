const Router = require('koa-router')
const {Node} = require('../models/node')
const {PageRank} = require('../models/pagerank')

const router = new Router({
  prefix:'/v2/node',
})

router.get('/init', async ctx => {
  await Node.initTable()

  ctx.body = {
    success: true,
  }
})

router.get('/pagerank', async ctx => {
  await Node.pageRanking()

  ctx.body = {
    success: true,
  }
})

router.get('/pagerank/percents', async ctx => {
  const data = await Node.getPageRankPercent()

  ctx.body = {
    success: true,
    data,
  }
})

router.get('/pagerank/assembly', async ctx => {
  const data = await Node.getPageRankAssembly()

  ctx.body = {
    success: true,
    data,
  }
})

module.exports = router
