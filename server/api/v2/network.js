const Router = require('koa-router')
const {Log} = require('../models/log')
const {Node} = require('../models/node')

const router = new Router({
  prefix:'/v2/network',
})

router.get('/nodes', async ctx => {
  const nodes = await Log.getNodes()
  const result = nodes.filter(n => {
    n.degree = n.inDegree + n.outDegree
    return n.degree >= 1000
  })

  ctx.body = {
    success: true,
    data: result,
  }
})

router.get('/edges', async ctx => {
  const edges = await Log.getEdges()
  console.log('network edges', edges.length)

  ctx.body = {
    success: true,
    data: edges,
  }
})

module.exports = router
