import React, {useRef, useEffect} from 'react'
import {Chart} from '@antv/g2'

const FlowLineChart = ({data}) => {
  const el = useRef(null)

  useEffect(() => {
    if (!data) return
    const container = el.current
    // const width = container?.scrollWidth
    const height = container?.scrollHeight || 500

    const chart = new Chart({
      container,
      autoFit: true,
      height,
    });
    
    chart.data(data);
    chart.scale({
      date: {
        range: [0, 1],
      },
      size: {
        alias: '通信流量',
        min: 0,
        sync: true,
        nice: true,
      },
      count: {
        alias: '通信次数',
        min: 0,
        sync: true,
        nice: true,
      }
    });

    chart.axis('size', {
      title: {},
      label: {
        formatter: (val) => {
          return val + 'G';
        },
      },
    });
    chart.axis('count', {
      title: {},
    });

    // chart.axis('date', {
    //   label: {
    //     formatter: (val) => {
    //       return val.slice(0, 5);
    //     },
    //   },
    // });
    
    chart.tooltip({
      showCrosshairs: true, // 展示 Tooltip 辅助线
      shared: true,
    });
    
    chart
      .line()
      .position('date*size')
      .color('#4FAAEB')
    chart
      .line()
      .position('date*count')
      .color('#9AD681')
    
    chart.render()
  }, [data])

  return <div ref={el} id="network-graph" className="wh100p" />
}

export default FlowLineChart
