const {sequelize} = require('../../core/db')
const {Sequelize, Model, Op} = require('sequelize')

class Logs extends Model {
  static async getAllLogs() {
    const data = Logs.create()
  }
  static async createData(value) {
    return this.create(value)
  }
}

Logs.init({
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
  tableName:'logs',
  timestamps: false,
})

module.exports = {
  Logs
}