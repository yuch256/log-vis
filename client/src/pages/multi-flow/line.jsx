import React, {useRef, useEffect} from 'react'
import * as echarts from 'echarts'

const Line = ({data, title}) => {
  const el = useRef(null)
  const xData = data.map(({date}) => date)
  const yData = data.map(({size}) => size)

  const renderChart = () => {
    const container = el.current
    // const width = container?.scrollWidth
    const height = container?.scrollHeight || 300

    const myCharts = echarts.init(el.current)
    // myCharts.clear()
    const option = {
      title: {
        text: title,
        left: 'center',
      },
      xAxis: {
        type: 'category',
        data: xData,
      },
      yAxis: {
          type: 'value'
      },
      series: [{
        data: yData,
        type: 'line'
      }]
    }

    myCharts.setOption(option)
  }

  useEffect(() => {
    renderChart()
  }, [data])

  return <div className="wh100p">
    <div ref={el} className="wh100p" />
  </div>
}

export default Line
