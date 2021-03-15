import React, {useEffect, useRef} from 'react'
import G6 from '@antv/g6'

const llightBlue16 = '#C8FDFC';
const llightOrange16 = '#FFAA86';

const NetworkGraph = ({data}) => {
  const el = useRef(null)
  let graph = null

  // const data = {
  //   nodes: [],
  //   edges: [],
  // }

  // for (let i = 0; i < 100; i++) {
  //   const id = `node-${i}`
  //   data.nodes.push({
  //     id,
  //     // date: `2020${i}`,
  //     // value: Math.round(Math.random() * 300),
  //   })

  //   data.edges.push({
  //     source: `node-${Math.round(Math.random() * 90)}`,
  //     target: `node-${Math.round(Math.random() * 90)}`,
  //     value: i,
  //   })
  // }

  useEffect(() => {
    const container = el.current
    const width = container?.scrollWidth
    const height = container?.scrollHeight || 500

    graph = new G6.Graph({
      container,
      width,
      height,
      fitView: true,
      layout: {
        type: 'gForce',
        gravity: 20,
        gpuEnabled: true,
      },
      defaultNode: {
        size: 2,
        style: {
          fill: '#C6E5FF',
          stroke: '#5B8FF9',
          lineWidth: 0.3,
        },
        labelCfg: {
          style: {
            fontSize: 3,
          },
          position: 'right',
          offset: 1,
        },
      },
      defaultEdge: {
        size: 0.1,
        color: '#333',
        type: 'line',
      },
      nodeStateStyles: {
        selected: {
          fill: 'steelblue',
          stroke: '#000',
          lineWidth: 1,
        },
        hover: {
          fill: 'red',
          stroke: '#000',
          lineWidth: 1,
        },
      },
      modes: {
        default: [
          {
            type: 'zoom-canvas',
            enableOptimize: true,
            optimizeZoom: 0.9,
          },
          {
            type: 'drag-canvas',
            enableOptimize: true,
          },
          'drag-node',
          'brush-select',
        ], // 'drag-canvas',
      },
    })
    graph.data(data)
    graph.render()
    // graph.on('node:mouseenter', (e) => {
    //   const { item } = e;
    //   graph.setItemState(item, 'hover', true);
    // });
    // graph.on('node:mouseleave', (e) => {
    //   const { item } = e;
    //   graph.setItemState(item, 'hover', false);
    // });

    // if (typeof window !== 'undefined') {
    //   window.onresize = () => {
    //     if (!graph || graph.get('destroyed')) return
    //     if (!container || !container.scrollWidth || !container.scrollHeight) return
    //     graph.changeSize(container.scrollWidth, container.scrollHeight - 100)
    //   }
    // }
  }, [data])

  return <div ref={el} id="network-graph" className="wh100p" />
}

export default NetworkGraph
