const {sequelize} = require('../../core/db')
const {Sequelize, Model, Op, fn, col, literal} = require('sequelize')
const BluePromise = require('bluebird')

class Entropy extends Model {
  static async getEntropy() {
    return await this.findAll()
  }
}

Entropy.init({
  date: {
    type: Sequelize.STRING(32),
    allowNull: false,
  },
  srcip: {
    type: Sequelize.DOUBLE,
    allowNull: true,
  },
  dstip: {
    type: Sequelize.DOUBLE,
    allowNull: true,
  },
  srcport: {
    type: Sequelize.DOUBLE,
    allowNull: true,
  },
  dstport: {
    type: Sequelize.DOUBLE,
    allowNull: true,
  },
  flow: {
    type: Sequelize.DOUBLE,
    allowNull: true,
    comment: '通信流量大小',
  },
  count: {
    type: Sequelize.DOUBLE,
    allowNull: true,
    comment: '通信次数',
  },
}, {
  sequelize,
  tableName:'entropy',
  timestamps: false,
})

// Entropy.updateDate()

module.exports = {
  Entropy,
}
