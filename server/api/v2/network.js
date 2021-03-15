const Router = require('koa-router')
const {Log} = require('../models/log')

const router = new Router({
  prefix:'/v2/network'
})

router.get('/nodes', async ctx => {
  const nodes = await Log.getNodes()
  ctx.body = {
    success: true,
    data: nodes,
  }
})

router.get('/edges', async ctx => {
  const edges = await Log.getEdges()
  ctx.body = {
    success: true,
    data: edges,
  }
})

module.exports = router
