const {sequelize} = require('../../core/db')
const {Sequelize, Model, Op, fn, col, literal} = require('sequelize')
const {distinct} = require('../../core/util')

class Log extends Model {
  // 获取日志时间区间（默认日志已按时间排序，所以取第一条和最后一条日志的时间即可）
  // 7月22日-9月12日，共52天，9月2日无数据
  static async getTimeInterval() {
    const startTime = await Log.findOne({
      attributes: ['start_time'],
      order: ['id'],
    })
    const endTime = await Log.findOne({
      attributes: ['start_time'],
      order: [['id', 'DESC']],
    })
    return {
      startTime: startTime['start_time'],
      endTime: endTime['start_time'],
    }
  }

  // 统计每天的通讯次数
  // '%Y/%m/%d %h:%i'
  static async getCommunicationTimesByOneDay() {
    const list = await Log.findAll({
      attributes: [
        [fn('COUNT', col('*')), 'count'],
        [literal("DATE_FORMAT(start_time, '%Y/%m/%d')"), 'date'],
      ],
      group: 'date',
      // attributes: [[fn('COUNT', col('*')), 'times']],
      // group: literal('DAY(start_time)'),
    })
    // const list = await sequelize.query("select start_time, ifnull");
    return list
  }

  // 获取ip节点
  static async getNodes() {
    const srcNodes = await Log.findAll({
      attributes: [
        ['srcip', 'id'],
      ],
      group: 'srcip',
      // limit: 3,
    })
    const dstNodes = await Log.findAll({
      attributes: [
        ['dstip', 'id'],
      ],
      group: 'dstip',
      // limit: 3,
    })
    // return distinct(srcNodes, dstNodes)
    const {nodes, obj} = distinct(srcNodes, dstNodes)
    console.log(Object.keys(obj).length, 1)
    return {nodes, obj}
    // return nodes.reduce((arr, n) => {
    //   if (!/^0/.test(n.id)) arr.push(n)
    //   return arr
    // }, [])
  }
  static async getEdges() {
    const edges = await Log.findAll({
      attributes: [
        // 'id',
        ['srcip', 'source'],
        ['dstip', 'target'],
      ],
      group: ['srcip', 'dstip'],
      limit: 50000,
    })
    return edges.reduce((arr, e) => {
      const {source, target} = e
      const reg = /^0/
      if (!reg.test(source) && !reg.test(target)) arr.push(e)
      return arr
    }, [])
  }
}

Log.init({
  id: {
    type: Sequelize.STRING(32),
    primaryKey: true,
    comment: 'log文件自带id字段',
  },
  ip_small_type: {
    type: Sequelize.STRING(32),
    allowNull: true,
  },
  file_len: {
    type: Sequelize.STRING(32),
    allowNull: true,
  },
  file_affix: {
    type: Sequelize.STRING(32),
    allowNull: true,
  },
  is_cracked: {
    type: Sequelize.STRING(32),
    allowNull: true,
  },
  start_time: {
    type: Sequelize.STRING(32),
    allowNull: true,
  },
  srcip: {
    type: Sequelize.STRING(32),
    allowNull: true,
  },
  dstip: {
    type: Sequelize.STRING(32),
    allowNull: true,
  },
  srcport: {
    type: Sequelize.STRING(32),
    allowNull: true,
  },
  dstport: {
    type: Sequelize.STRING(32),
    allowNull: true,
  },
  vpi_1: {
    type: Sequelize.STRING(32),
    allowNull: true,
  },
  vci_1: {
    type: Sequelize.STRING(32),
    allowNull: true,
  },
  atm1_aal_type: {
    type: Sequelize.STRING(32),
    allowNull: true,
  },
}, {
  sequelize,
  // tableName:'log-test',
  tableName:'log',
  timestamps: false,
})

module.exports = {
  Log
}