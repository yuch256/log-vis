import React, {useRef, useEffect, useState} from 'react'
import {Chart} from '@antv/g2'
import c from 'classnames'
import {$get} from '@axios'
import Loading from '@c/loading'

const AllFlowHeatMap = ({type = 'flow'}) => {
  const [load, setLoad] = useState(true)
  const el = useRef(null)

  const renderChart = data => {
    const container = el.current
    // const width = container?.scrollWidth
    const height = container?.scrollHeight || 500

    const chart = new Chart({
      container,
      autoFit: true,
      height,
    });
    
    chart.data(data);
    
    chart.scale('ip', {
      type: 'cat',
    });
    chart.scale('date', {
      type: 'cat',
    });
    chart.scale('size', {
      nice: true,
    });
    
    chart.axis('date', {
      tickLine: null,
      grid: {
        alignTick: false,
        line: {
          style: {
            lineWidth: 1,
            lineDash: null,
            stroke: '#f0f0f0',
          },
        },
      },
    });
    
    chart.axis('ip', {
      title: null,
      grid: {
        alignTick: false,
        line: {
          style: {
            lineWidth: 1,
            lineDash: null,
            stroke: '#f0f0f0',
          },
        },
      },
    });
    
    chart.tooltip({
      showMarkers: false,
    });
    
    chart
      .polygon()
      .position('date*ip')
      // .color('size', '#BAE7FF-#1890FF-#0050B3')
      .color('size', '#00FF00-#FF0000')
      // .label('size', {
      //   offset: -2,
      //   style: {
      //     fill: '#fff',
      //     shadowBlur: 2,
      //     shadowColor: 'rgba(0, 0, 0, .45)',
      //   },
      // })
      .style({
        lineWidth: 1,
        stroke: '#fff',
      });
    
    chart.interaction('element-active');
    
    chart.render();
  }

  const getData = async () => {
    try {
      const url = `/node/key-nodes/${type}`
      const r = await $get(url)
      setLoad(false)
      renderChart(r.map(({date, size, ip}) => ({date, size: Number(size), ip})))
    } catch (error) {
      console.error(error)
    }
  }

  useEffect(() => {
    getData()
  }, [])

  return <Loading loading={load}>
    <div ref={el} className="wh100p" />
  </Loading>
}

export default AllFlowHeatMap
