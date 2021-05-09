const Router = require('koa-router')
const {Log} = require('../models/log')
const {Node} = require('../models/node')
const {networkDegree} = require('../../config/config')

const router = new Router({
  prefix:'/v2/network',
})

router.get('/nodes', async ctx => {
  const nodes = await Log.getNodes()
  let s = 1
  const result = nodes.filter(n => {
    n.degree = n.inDegree + n.outDegree
    return n.degree >= networkDegree
  }).map(n => {
    const {pagerank, ...other} = n
    const isKeyNode = pagerank > 0.001
    if (isKeyNode) {
      s += 1
      // console.log(pagerank)
    }
    return {...other, isKeyNode}
  })
  console.log('network nodes', nodes.length, 'key nodes', s)

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

router.get('/pagerank', async ctx => {
  const {query} = ctx
  const {loop} = query

  await Node.pageRanking(loop)

  ctx.body = {
    success: true,
    data: query
  }
})

module.exports = router
