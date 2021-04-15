import React, {useEffect, useRef} from 'react'
import G6, {Bundling} from '@antv/g6'

const lightBlue = 'rgb(119, 243, 252)'
const llightBlue16 = '#C8FDFC'
const lightOrange = 'rgb(230, 100, 64)'
const llightOrange16 = '#FFAA86'

const NetworkGraph = ({data}) => {
  const el = useRef(null)
  let graph = null

  // 注册自定义名为 pie-node 的节点类型
  G6.registerNode(
    'pie-node',
    {
      draw: (cfg, group) => {
        const radius = cfg.size / 2;
        const inPercentage = cfg.inDegree / cfg.degree;
        const inAngle = inPercentage * Math.PI * 2;
        const inArcEnd = [radius * Math.cos(inAngle), radius * Math.sin(inAngle)];
        let isInBigArc = 1;
        let isOutBigArc = 0;
        if (inAngle > Math.PI) {
          isInBigArc = 0;
          isOutBigArc = 1;
        }
        const fanIn = group.addShape('path', {
          attrs: {
            path: [
              ['M', radius, 0],
              ['A', radius, radius, 0, isInBigArc, 0, inArcEnd[0], inArcEnd[1]],
              ['L', 0, 0],
              ['Z'],
            ],
            stroke: lightOrange,
            lineWidth: 0,
            fill: lightOrange,
          },
          name: 'fan-in-path',
        });

        group.addShape('path', {
          attrs: {
            path: [
              ['M', inArcEnd[0], inArcEnd[1]],
              ['A', radius, radius, 0, isOutBigArc, 0, radius, 0],
              ['L', 0, 0],
              ['Z'],
            ],
            stroke: lightBlue,
            lineWidth: 0,
            fill: lightBlue,
          },
          name: 'fan-out-path',
        });
        return fanIn;
      },
    },
    'single-node',
  );

  useEffect(() => {
    if (!data) return
    const container = el.current
    const width = container?.scrollWidth
    const height = container?.scrollHeight || 500

    const edgeBundling = new Bundling({
      bundleThreshold: 0.6, // 绑定的容忍度。数值越低，被绑定在一起的边相似度越高，即被绑在一起的边更少。
      K: 100 // 绑定的强度
    })

    graph = new G6.Graph({
      container,
      width,
      height,
      plugins: [edgeBundling],
      fitView: true,
      layout: {
        type: 'fruchterman',
        // type: 'gForce',
        gravity: 10,
        gpuEnabled: true,
      },
      defaultNode: {
        shape: 'pie-node',
        size: 3,
        color: 'steelblue',
        style: {
          fill: '#C6E5FF',
          stroke: '#5B8FF9',
          lineWidth: 0.3,
        },
        labelCfg: {
          style: {
            fontSize: 3,
            color: '#131415',
          },
          position: 'right',
          offset: 1,
        },
        // fill: 'steelblue',
        // // fill: '#C6E5FF',
        // // stroke: '#5B8FF9',
        // nodeStyle: {
        //   default: {
        //     lineWidth: 0,
        //     fill: 'steelblue',
        //   },
        // },
        // edgeStyle: {
        //   default: {
        //     lineWidth: 0.7,
        //     strokeOpacity: 0.3, // 设置边透明度，在边聚集的部分透明度将会叠加，从而具备突出高密度区域的效果
        //     stroke: 'l(0) 0:' + llightBlue16 + ' 1:' + llightOrange16,
        //   },
        // },
      },
      defaultEdge: {
        size: 0.1,
        color: 'rgba(0,0,0,.24)',
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
          {
            type: 'drag-node',
            enableDebounce: true,
            enableOptimize: true,
            enableDelegate: true,
            updateEdge: false,
          },
          {
            type: 'tooltip',
            formatText(model) {
              const {id, inDegree, outDegree} = model
              return `<div>
                <div>IP: ${id}</div>\n
                <div>出度：${inDegree}</div>\n
                <div>入度：${outDegree}</div>\n
              </div>`
            },
            shouldUpdate: e => {
              return true
            }
          },
        ],
      },
    })

    // edgeBundling.bundling(data)
    graph.data(data)
    graph.render()
    graph.on('node:mouseenter', (e) => {
      const { item } = e;
      graph.setItemState(item, 'hover', true);
    });
    graph.on('node:mouseleave', (e) => {
      const { item } = e;
      graph.setItemState(item, 'hover', false);
    });

    if (typeof window !== 'undefined') {
      window.onresize = () => {
        if (!graph || graph.get('destroyed')) return
        if (!container || !container.scrollWidth || !container.scrollHeight) return
        graph.changeSize(container.scrollWidth, container.scrollHeight)
      }
    }
  }, [data])

  return <div ref={el} id="network-graph" className="wh100p" />
}

export default NetworkGraph
