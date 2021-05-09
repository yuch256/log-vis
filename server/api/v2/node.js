const Router = require('koa-router')
const {Node} = require('../models/node')
const {Log} = require('../models/log')
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

router.get('/key-nodes', async ctx => {
  const data = await Node.getKeyNodes()

  ctx.body = {
    success: true,
    data,
  }
})

router.get('/key-nodes/flow', async ctx => {
  const data = await Log.allKeyNodesFlow()

  ctx.body = {
    success: true,
    data,
  }
})

router.get('/key-nodes/count', async ctx => {
  const data = await Log.allKeyNodesCount()

  ctx.body = {
    success: true,
    data,
  }
})

module.exports = router
