import React, {useRef, useEffect} from 'react'
import * as echarts from 'echarts'

const Top = ({data, name="源IP", onClickPie}) => {
  console.log(name, data)
  const el = useRef(null)
  const pie = useRef(null)

  const renderChart = () => {
    const container = el.current
    // const width = container?.scrollWidth
    const height = container?.scrollHeight || 300

    const myCharts = echarts.init(el.current)
    myCharts.clear()
    const option = {
      title: {
        text: name,
        left: 'center'
    },
    tooltip: {
        trigger: 'item',
        formatter: '{a} <br/>{b} : {c}'
    },
    series: [{
      name,
      type: 'pie',
      radius: [20, 100],
      roseType: 'radius',
      itemStyle: {
          borderRadius: 5
      },
      label: {
          show: false
      },
      // data: [
      //   {value: 40, name: 'rose 1'},
      //   {value: 33, name: 'rose 2'},
      //   {value: 28, name: 'rose 3'},
      //   {value: 22, name: 'rose 4'},
      //   {value: 20, name: 'rose 5'},
      //   {value: 15, name: 'rose 6'},
      //   {value: 12, name: 'rose 7'},
      //   {value: 10, name: 'rose 8'}
      // ]}]
      data,}]
    }

    myCharts.on('click', d => {
      console.log('click pie', d.name)
      onClickPie(name, d.name)
    })

    myCharts.setOption(option)
  }

  useEffect(() => {
    renderChart()
  }, [data])

  return <div className="wh100p">
    <div ref={el} className="wh100p" />
  </div>
}

export default Top
