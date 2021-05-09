const {Sequelize, Model, Op, fn, col, literal} = require('sequelize')
const BluePromise = require('bluebird')
const {sequelize} = require('../../core/db')
const {PageRank} = require('../models/pagerank')
const {pagerankDegree} = require('../../config/config')
const {networkDegree} = require('../../config/config')

class Node extends Model {
  // 统计不重复点及其出入度信息，存入node表中
  static async initTable() {
    console.log('start create node table')
    console.time('create node table')
    const {Log} = require('./log')
    
    const srcNodes = await Log.findAll({
      attributes: [
        [fn('COUNT', col('*')), 'outDegree'], // 出度
        ['srcip', 'ip'],
      ],
      group: 'srcip',
    })
    const dstNodes = await Log.findAll({
      attributes: [
        [fn('COUNT', col('*')), 'inDegree'], // 入度
        ['dstip', 'ip'],
      ],
      group: 'dstip',
    })
    const nodes = srcNodes.concat(dstNodes)

    // 去重、累加出入度
    const object = {}
    nodes.forEach(({ip, inDegree = 0, outDegree = 0}) => {
      const n = object[ip]
      if (n) {
        object[ip] = {
          inDegree: n.inDegree + inDegree,
          outDegree: n.outDegree + outDegree,
        }
      } else object[ip] = {inDegree, outDegree}
    })
    const total = Object.keys(object).length // 节点总数
    const pagerank = 1 / total
    console.log(total)
    // 所有不重复的点集合
    const result = await BluePromise.map(Object.entries(object), async ([ip, n], i) => {
      const {inDegree, outDegree} = n || {}
      let dstAmount = outDegree
      if (outDegree > 1) {
        const dstips = await Log.findAll({
          attributes: ['dstip'],
          where: {srcip: ip},
          group: 'dstip',
        }) || []
        dstAmount = dstips.length
      }
      console.log(i, dstAmount)
      return {ip, outDegree, inDegree, dstAmount, pagerank}
    }, {concurrency: 100})
    console.log('end', result.length, result[0])

    await Node.sync({force: true})
    await Node.bulkCreate(result)
    console.timeEnd('create node table')
    return true
  }

  /**
   * 计算PageRank
   * 在创建node表时，每个节点初始pagerank值均为1 / N(节点总数)，
   * 节点的新pagerank值PR(u) = ((PR(A) / dstAmount(A)) + (PR(B) / dstAmount(B)) + .....(指向节点u的全部节点)) * D + T
   */
  static async pageRanking(i) {
    console.log('start a pagerank loop')
    console.time('a pagerank loop')
    const {Log} = require('./log')

    const nodes = await Node.findAll({
      attributes: [
        'id', 'ip', 'pagerank',
        ['dst_amount', 'dstAmount'],
        ['in_degree', 'inDegree'],
      ],
    })
    const nodesObj = {}
    nodes.forEach(n => nodesObj[n.ip] = n.dstAmount && n.pagerank / n.dstAmount)
    
    const D = 0.85 // 修正系数
    const N = nodes.length // 节点总数
    const T = (1 - D) / N
    console.log(N, T)

    const result = await BluePromise.map(nodes, async (n, i) => {
      const {id, ip, inDegree} = n || {}
      let _pagerank = 0
      if (inDegree > 0) {
        const srcips = await Log.findAll({
          attributes: ['srcip'],
          where: {dstip: ip},
          group: 'srcip',
        }) || []
        srcips.forEach(({srcip}) => _pagerank += nodesObj[srcip])
      }
      _pagerank = _pagerank * D + T
      console.log(i, _pagerank)
      return {id, pagerank: _pagerank, outDegree: 1, inDegree: 1, dstAmount: 1} // 必须把所有值写上，但只更新updateOnDuplicate数组中的属性，坑。。。。
    }, {concurrency: 50})
    console.log('end', result.length, result[0])

    await Node.bulkCreate(result, {updateOnDuplicate: ['pagerank']})
    await PageRank.increaseTimes()
    console.timeEnd('a pagerank loop')
    return true
  }

  // node节点总数
  static async getNodeCount() {
    const count = await Node.findOne({
      attributes: [[fn('COUNT', col('*')), 'count']],
    })
    return count
  }

  // 统计前PageRank柱状图、气泡图所要的数据
  static async getPageRankPercent() {
    const xAxis = [0.0001, 0.0002, 0.0003, 0.0004, 0.0005, 0.05]
    const getCount = async pr => await Node.findAll({
      attributes: [
        [fn('COUNT', col('*')), 'count'],
      ],
      where: {
        pagerank: {[Op.lte]: pr},
      },
    })
    const getAllCount = () => Promise.all(xAxis.map(pr => getCount(pr)))
    const allCount = await getAllCount()

    const {count: nodeCount} = await this.getNodeCount()
    const percents = xAxis.map((pr, i) => {
      const {count} = allCount[i][0]
      const prevCount = i === 0 ? 0 : allCount[i-1][0].count
      const value = (count - prevCount) / nodeCount
      return {
        name: `<=${pr}`,
        value,
      }
    })
    return percents
  }

  // 统计PageRank大于0.0001的值的节点数量
  static async getPageRankAssembly() {
    const data = await Node.findAll({
      attributes: ['ip', 'pagerank'],
      where: {
        pagerank: {[Op.gt]: 0.0002},
      },
    })
    const obj = {}
    console.log(data.length, data[0])
    data.forEach(({ip, pagerank}) => {
        const pr = pagerank.toFixed(4)
        if (obj[pr] && Array.isArray(obj[pr])) obj[pr].push(ip)
        else obj[pr] = [ip]
      })
    
    const result = Object.entries(obj).map(([pr, ips]) => ({
      name: pr,
      value: ips.length,
    }))
    console.log(result.length, result[0])
    return result
  }
  
  // 获取关键节点
  static async getKeyNodes() {
    const data = await Node.findAll({
      attributes: [
        ['ip', 'id'],
        ['in_degree', 'inDegree'],
        ['out_degree', 'outDegree'],
      ],
      where: {
        pagerank: {[Op.gt]: 0.001},
      },
    }).filter(n => {
      const degree = n.inDegree + n.outDegree
      return degree >= networkDegree
    }).map(n => n.id)
    return data
  }
}

Node.init({
  // id: {
  //   type: Sequelize.INTEGER,
  //   autoIncrement: true,
  //   primaryKey: true,
  // },
  ip: {
    type: Sequelize.STRING(32),
    comment: '网络节点ip地址',
  },
  outDegree: {
    type: Sequelize.INTEGER,
    allowNull: false,
    comment: '节点连接出度',
  },
  inDegree: {
    type: Sequelize.INTEGER,
    allowNull: false,
    comment: '节点连接入度',
  },
  dstAmount: {
    type: Sequelize.INTEGER,
    allowNull: false,
    comment: '所有出度记录中，目的节点数量',
  },
  pagerank: {
    type: Sequelize.DOUBLE,
    allowNull: false,
    comment: 'PageRank值',
  }
}, {
  sequelize,
  tableName:'node',
  timestamps: false,
})

// Node.getPageRankAssembly()

module.exports = {
  Node,
}
