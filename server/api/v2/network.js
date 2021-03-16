const Router = require('koa-router')
const {Log} = require('../models/log')

const router = new Router({
  prefix:'/v2/network'
})

router.get('/nodes', async ctx => {
  const {nodes, obj} = await Log.getNodes()
  const edges = await Log.getEdges()
  console.log(object)
  edges.forEach(e => {
    if (!obj[e.target] && !obj[e.source])
  })
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
