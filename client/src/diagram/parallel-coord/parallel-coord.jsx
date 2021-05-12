import React, {useEffect, useState, useRef} from 'react'
import * as echarts from 'echarts'
import {$get} from '@axios'
import Loading from '@c/loading'

const ParallelCoord = ({onClickLine}) => {
  const [load, setLoad] = useState(true)
  const el = useRef(null)

  const renderChart = data => {
    const myCharts = echarts.init(el.current)
    const option = {
      series: {
        type: 'parallel',
        lineStyle: {
          width: 1
        },
        data: data,
      },
      tooltip: {
        formatter: function (d) {
          const [id, srcip, dstip, srcport, dstport, flow, count, date] = d.value
          return `<div>
            <div>date: ${date.slice(5)}</div>
            <div>srcip: ${srcip}</div>
            <div>dstip: ${dstip}</div>
            <div>srcport: ${srcport}</div>
            <div>dstport: ${dstport}</div>
            <div>flow: ${flow}</div>
            <div>count: ${count}</div>
          </div>`
        },
        padding: 10,
        backgroundColor: '#222',
        borderColor: '#777',
        borderWidth: 1,
      },
      parallel: {                         // 这是『坐标系』的定义
        left: '5%',                     // 平行坐标系的位置设置
        right: '5%',
        bottom: '5%',
        top: '10%',
      },
      parallelAxis: [
        {dim: 0, name: 'id'},
        {dim: 1, name: 'srcip'},
        {dim: 2, name: 'dstip'},
        {dim: 3, name: 'srcport'},
        {dim: 4, name: 'dstport'},
        {dim: 5, name: 'flow'},
        {dim: 6, name: 'count'},
      ],
    }

    myCharts.on('click', d => {
      const {value} = d
      const date = value.slice(-1)[0]
      console.log(value, date)
      onClickLine(date)
    })

    myCharts.setOption(option)
  }

  const getData = async () => {
    try {
      const r = await $get('/log/entropy')
      setLoad(false)
      const data = r.filter(({srcip}) => srcip)
        .map(({srcip, dstip, srcport, dstport, flow, count, id, date}) => ([
          id,
          Number(srcip.toFixed(2)),
          Number(dstip.toFixed(2)),
          Number(srcport.toFixed(2)),
          Number(dstport.toFixed(2)),
          Number((flow / 1024).toFixed(2)),
          count,
          date,
        ]))
      console.log(data)
      renderChart(data)
    } catch (error) {
      console.error(error)
    }
  }

  useEffect(() => {
    getData()
  }, [])

  return <Loading loading={load}>
    <div ref={el} className="wh100p">
      <svg id="parallel-coord" />
    </div>
  </Loading>
}

export default ParallelCoord
