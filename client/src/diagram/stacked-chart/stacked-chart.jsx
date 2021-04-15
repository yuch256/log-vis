import React, {useRef, useEffect} from 'react'
import {Chart} from '@antv/g2'

const StackedChart = ({data}) => {
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
    chart.scale('times', {
      nice: true,
    });
    chart.tooltip({
      shared: true,
      showMarkers: false,
    });
    
    chart
      .interval()
      .position('date*count')
      .color('name')
      .adjust('stack');
    
    chart.interaction('active-region');
    
    chart.render();
  }, [data])

  return <div ref={el} id="network-graph" className="wh100p" />
}

export default StackedChart
