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
        min: 0,
        nice: true,
      },
    });

    chart.axis('size', {
      label: {
        formatter: (val) => {
          return val + 'M';
        },
      },
    });

    chart.axis('date', {
      label: {
        formatter: (val) => {
          return val.slice(0, 5);
        },
      },
    });
    
    chart.tooltip({
      showCrosshairs: true, // 展示 Tooltip 辅助线
      shared: true,
    });
    
    chart.line().position('date*size');
    chart.point().position('date*size');
    
    chart.render();
  }, [data])

  return <div ref={el} id="network-graph" className="wh100p" />
}

export default FlowLineChart
