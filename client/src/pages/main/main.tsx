import React, {useEffect, useState} from 'react'
import c from 'classnames'
import {$get} from '@axios'
import Loading from '@c/loading'
import NetworkGraph from '@diagram/network-graph'
import s from './main.module.styl'

interface Data {
  nodes: Node[],
  edges: Edge[],
}
interface Node {
  id: string,
  degree: number,
  inDegree: number,
  outDegree: number,
  size?: number,
  label?: string,
  // labelCfg?: {
  //   style: {
  //     fontSize: number,
  //   }
  // },
  style: {
    fill: string,
    stroke: string,
  },
}
interface Edge {
  source: string,
  target: string,
  count?: number,
  value?: number,
}

const Main: React.FC = () => {
  const [data, setData] = useState<Data>({
    nodes: [],
    edges: [],
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getGraphData()
  }, [])

  const getGraphData = async () => {
    try {
      const nodes: any = await $get('/network/nodes')
      const edges: any = await $get('/network/edges')

      let maxDegree = -99999999, minDegree = 99999999
      nodes.forEach((n: Node) => {
        n.label = n.id
        n.degree = n.inDegree + n.outDegree
        if (maxDegree < n.degree) maxDegree = n.degree
        if (minDegree > n.degree) minDegree = n.degree
        n.style = {
          fill: n.inDegree > n.outDegree ? '#F66071' : '#30C9E8',
          stroke: n.inDegree > n.outDegree ? '#F66071' : '#30C9E8',
        }
      })
      const sizeRange = [1, 20]
      const degreeDataRange = [minDegree, maxDegree]
      scaleNodeProp(nodes, 'size', 'degree', [minDegree, maxDegree], [5, 20])
      // mapNodeSize(nodes, 'degree', [10, 50])
      setData({
        nodes,
        edges,
      })
    } catch (error) {
      console.error(error)
    }
    setLoading(false)
  }

  /**
   * 映射属性
   * @param  {array} nodes          对象数组
   * @param  {string} propName      写入的属性名称
   * @param  {string} refPropName   被归一化的属性名称
   * @param  {array} dataRange      被归一化的属性的值范围 [min, max]
   * @param  {array} outRange       写入的属性的值范围 [min, max]
   */
  function scaleNodeProp(
    nodes: Node[],
    propName: 'size',
    refPropName: 'degree',
    dataRange: [number, number],
    outRange: [number, number],
  ) {
    const outLength = outRange[1] - outRange[0];
    const dataLength = dataRange[1] - dataRange[0];
    nodes.forEach(n => {
      n[propName] = (n[refPropName] - dataRange[0]) * outLength / dataLength + outRange[0];
    });
  }

  const mapNodeSize = (nodes: Node[], name: 'degree', visualRange: [number, number]) => {
    let minp = 9999999999;
    let maxp = -9999999999;
    const propertyName = 'mapSize'
    nodes.forEach(node => {
      node[propertyName] = Math.pow(node[name], 1 / 3);
      minp = node[propertyName] < minp ? node[propertyName] : minp;
      maxp = node[propertyName] > maxp ? node[propertyName] : maxp;
    });
    const rangepLength = maxp - minp;
    const rangevLength = visualRange[1] - visualRange[0];
    nodes.forEach(node => {
      node.size = ((node[propertyName] - minp) / rangepLength) * rangevLength + visualRange[0];
    })
  }

  return (
    <div className={c(s.container, 'h100p')}>
      <div className={c(s.box, 'wh100p')}>
        <Loading loading={loading}>
          <NetworkGraph data={data} />
        </Loading>
      </div>
    </div>
  )
}

export default Main
