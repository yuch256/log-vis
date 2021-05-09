const {sequelize} = require('../../core/db')
const {Sequelize, Model, Op, fn, col, literal} = require('sequelize')
const BluePromise = require('bluebird')
const {Node} = require('./node')
const {networkDegree} = require('../../config/config')

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

  static async getAllDate(format = '%Y/%m/%d') {
    const dates = await Log.findAll({
      attributes: [
        // [fn('COUNT', col('*')), 'count'],
        [literal(`DATE_FORMAT(start_time, '${format}')`), 'date'],
      ],
      group: 'date',
      // attributes: [[fn('COUNT', col('*')), 'times']],
      // group: literal('DAY(start_time)'),
    })
    const result = dates.map(({date}) => {
      let [y, m, d] = date.split('/')
      if (m[0] === '0') m = m[1]
      if (d[0] === '0') d = d[1]
      return [y, m, d].join('/')
    })
    
    return result
  }

  // 流量统计
  static async getFlow() {
    const flows = await Log.findAll({
      attributes: [
        [fn('SUM', col('file_len')), 'size'],
        // [literal("DATE_FORMAT(start_time, '%Y/%m/%d')"), 'date'],
        [literal("DATE_FORMAT(start_time, '%Y/%m/%d %h')"), 'date'],
      ],
      group: 'date',
      // attributes: [[fn('COUNT', col('*')), 'times']],
      // group: literal('DAY(start_time)'),
    }) || []
    const result = flows.map(({size, date}) => ({date: date.slice(5), size}))
    return result
  }

  // 统计每天端口使用
  // '%Y/%m/%d %h:%i'
  static async getPortsCount() {
    const dates = await this.getAllDate()
    const result = []

    await BluePromise.map(dates, async (date, i) => {
      const end = i === dates.length - 1 ? '2015/9/13' : dates[i+1]
      const data = await Log.findAll({
        attributes: ['srcport', 'dstport'],
        where: {
          'start_time': {[Op.between]: [date, end]},
        },
      })
      const obj = {}
      data.forEach(({srcport, dstport}) => {
        if (obj[srcport]) obj[srcport] += 1
        else obj[srcport] = 1
        if (obj[dstport]) obj[dstport] += 1
        else obj[dstport] = 1
      })
      console.log(date, end, data.length, Object.keys(obj).length)
      Object.entries(obj).forEach(([port, count]) => {
        if (count > 100) result.push({name: port, date: date.slice(5), count})
      })
    }, {concurrency: 1})

    console.log(result[0], result.length)
    return result
  }

  // 获取全部节点
  static async getNodes() {
    const nodes = await Node.findAll({
      attributes: [
        ['ip', 'id'],
        ['in_degree', 'inDegree'],
        ['out_degree', 'outDegree'],
        'pagerank',
      ],
    })
    return nodes
  }
  static async getEdges() {
    const edges = await Log.findAll({
      attributes: [
        [fn('COUNT', col('*')), 'count'],
        ['srcip', 'source'],
        ['dstip', 'target'],
      ],
      group: ['srcip', 'dstip'],
    })
    const nodes = await this.getNodes()
    const object = {}
    nodes.filter(n => n.inDegree + n.outDegree >= networkDegree).forEach(n => object[n.id] = 1)
    return edges.filter(e => object[e.source] && object[e.target])
  }

  // 节点端口使用统计
  // type 'source' | 'target' 分别表示作为源ip、目的ip的端口统计
  static async getNodePort(ip = '10.67.220.221', type = 'source') {
    let attrPort, whereIp
    if (type === 'source') {
      attrPort = 'srcport'
      whereIp = 'srcip'
    } else if (type === 'target') {
      attrPort = 'dstport'
      whereIp = 'dstip'
    }
    const data = await Log.findAll({
      attributes: [
        [attrPort, 'port'],
        [fn('COUNT', col('*')), 'count'],
      ],
      where: {
        [whereIp]: ip,
      },
      group: [attrPort]
    })
    return data
  }

  // 全部关键节点流量统计（天）
  static async allKeyNodesFlow() {
    const nodes = await Node.getKeyNodes()

    let result = []
    await BluePromise.map(nodes, async (ip, i) => {
      const flows = await Log.findAll({
        attributes: [
          [fn('SUM', col('file_len')), 'size'],
          [literal("DATE_FORMAT(start_time, '%Y/%m/%d')"), 'date'],
        ],
        where: {
          [Op.or]: [
            {srcip: ip},
            {dstip: ip},
          ]
        },
        group: 'date',
      }) || []
      const r = flows.map(({size, date}) => ({date: date.slice(5), size: (size/1024).toFixed(0), ip}))
      result = result.concat(r)
    }, {concurrency: 1})
    
    return result
  }

  // 全部关键节点通信次数统计（天）
  static async allKeyNodesCount() {
    const nodes = await Node.getKeyNodes()

    let result = []
    await BluePromise.map(nodes, async (ip, i) => {
      const flows = await Log.findAll({
        attributes: [
          [fn('COUNT', col('*')), 'size'],
          [literal("DATE_FORMAT(start_time, '%Y/%m/%d')"), 'date'],
        ],
        where: {
          [Op.or]: [
            {srcip: ip},
            {dstip: ip},
          ]
        },
        group: 'date',
      }) || []
      const r = flows.map(({size, date}) => ({date: date.slice(5), size: (size/1024).toFixed(0), ip}))
      result = result.concat(r)
    }, {concurrency: 1})
    
    return result
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
  Log,
}
