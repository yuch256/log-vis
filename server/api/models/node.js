const {sequelize} = require('../../core/db')
const {Sequelize, Model, Op, fn, col, literal} = require('sequelize')

class Node extends Model {
  // 统计不重复点及其出入度信息，存入node表中
  static async initTable() {
    console.log('init node table')
    const {Log} = require('./log')
    
    const srcNodes = await Log.findAll({
      attributes: [
        [fn('COUNT', col('*')), 'inDegree'], // 入度
        ['srcip', 'id'],
      ],
      group: 'srcip',
    })
    const dstNodes = await Log.findAll({
      attributes: [
        [fn('COUNT', col('*')), 'outDegree'], // 出度
        ['dstip', 'id'],
      ],
      group: 'dstip',
    })
    // 所有不重复的点集合
    const nodes = srcNodes.concat(dstNodes)
    const object = {}
    nodes.forEach(({id, inDegree = 0, outDegree = 0}) => {
      const n = object[id]
      if (n) {
        object[id] = {
          inDegree: n.inDegree + inDegree,
          outDegree: n.outDegree + outDegree,
        }
      } else object[id] = {inDegree, outDegree}
    })
    const result = Object.entries(object).map(([k, v]) => {
      const {inDegree, outDegree} = v || {}
      return {ip: k, inDegree, outDegree}
    })
    await Node.sync({force: true})
    await Node.bulkCreate(result)
    return true
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
  inDegree: {
    type: Sequelize.INTEGER,
    allowNull: false,
    comment: '节点连接入度',
  },
  outDegree: {
    type: Sequelize.INTEGER,
    allowNull: false,
    comment: '节点连接出度',
  },
}, {
  sequelize,
  tableName:'node',
  timestamps: false,
})

module.exports = {
  Node,
}
