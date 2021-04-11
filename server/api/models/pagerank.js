const {sequelize} = require('../../core/db')
const {Sequelize, Model} = require('sequelize')

class PageRank extends Model {
  // 一轮pagerank计算后将统计次数加一
  static async increaseTimes() {
    let {times = 0} = await PageRank.findOne() || {}
    await PageRank.update({times: times+=1}, {
      where: {
        id: 1,
      }
    })
    console.log('pagerank times: ', times)
  }
}

PageRank.init({
  times: {
    type: Sequelize.INTEGER,
    comment: 'pagerank计算次数',
  },
}, {
  sequelize,
  tableName:'pagerank',
})

module.exports = {
  PageRank,
}
