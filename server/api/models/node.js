const {sequelize} = require('../../core/db')
const {Sequelize, Model, Op, fn, col, literal} = require('sequelize')
const BluePromise = require('bluebird')

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

    // 累加出入度、去重
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
    const result = await BluePromise.map(Object.entries(object), async ([k, v]) => {
      const {inDegree, outDegree} = v || {}
      let dstAmount = outDegree
      if (outDegree > 10) {
        const dstips = await Log.findAll({
          attributes: ['dstip'],
          where: {srcip: k},
          group: 'dstip',
        }) || []
        dstAmount = dstips.length
      }
      console.log(dstAmount)
      return {
        ip: k,
        outDegree,
        inDegree,
        dstAmount,
        pagerank,
      }
    }, {concurrency: 100})
    console.log(11, result.length)

    await Node.sync({force: true})
    await Node.bulkCreate(result)
    console.timeEnd('create node table')
    return true
  }

  /**
   * 计算PageRank
   * 在创建node表时，每个节点初始pagerank值均为1 / N(节点总数)，
   * 节点的新pagerank值PR(u) = 
   */
  static async pageRanking() {
    const N = 4 // 节点总数
    const D = 0.85 // 修正系数
    const T = (1 - D) / N

    const nodesObj = {}
    // await Node.findAll({
    //   attributes: [
    //     'ip',
    //     ['src_number', 'srcNumber'],
    //   ],
    // }).forEach(n => nodesObj[n.ip] = {inDegree: n.inDegree, outDegree: n.outDegree})
    
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

module.exports = {
  Node,
}
