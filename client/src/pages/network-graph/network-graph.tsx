import React, {useEffect, useState, useMemo} from 'react'
import c from 'classnames'
import {$get} from '@axios'
import Loading from '@c/loading'
import NetworkGraph from '@diagram/network-graph'
import PortPie from '@diagram/port-pie'
import s from './network-graph.module.styl'

interface Data {
  nodes: Node[],
  edges: Edge[],
}
interface Node {
  id: string,
  degree: number,
  inDegree: number,
  outDegree: number,
  isKeyNode: boolean,
  size?: number,
  label?: string,
  // labelCfg?: {
    //   style: {
      //     fontSize: number,
      //   }
      // },
  style: {
    fill: string,
    stroke: any,
    lineWidth?: number,
  },
}
interface Edge {
  source: string,
  target: string,
  count?: number,
  value?: number,
}

const NetWorkGraph: React.FC = () => {
  const [data, setData] = useState<Data>({
    nodes: [],
    edges: [],
  })
  const [loading, setLoading] = useState(true)
  const [ip, setIp] = useState('')

  useEffect(() => {
    getGraphData()
  }, [])

  const getGraphData = async () => {
    try {
      const nodes: any = await $get('/network/nodes')
      const edges: any = await $get('/network/edges')

      let maxDegree = -99999999, minDegree = 99999999
      nodes.forEach((n: Node) => {
        // n.label = n.id
        n.degree = n.inDegree + n.outDegree
        if (maxDegree < n.degree) maxDegree = n.degree
        if (minDegree > n.degree) minDegree = n.degree
        n.style = {
          fill: n.inDegree > n.outDegree ? '#F66071' : '#30C9E8',
          stroke: '#F66071',
          lineWidth: n.isKeyNode ? 6 : 0,
        }
      })
      const sizeRange = [1, 20]
      const degreeDataRange = [minDegree, maxDegree]
      // scaleNodeProp(nodes, 'size', 'degree', [minDegree, maxDegree], [5, 20])
      mapNodeSize(nodes, 'degree', [10, 50])
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

  const onClickNode = (model: any) => {
    const {id} = model
    setIp(id)
    console.log(id)
  }

  return (
    <div className="container wh100p">
      <div className="content wh100p">
        <div className="fb1">
          <Loading loading={loading}>
            <NetworkGraph data={data} onClickNode={onClickNode} />
          </Loading>
        </div>
        {useMemo(() => <div style={{width: 400}}>
          <div style={{height: '50%'}} className="fbv">
            <div className="tac">{`${ip}作为源IP的端口统计`}</div>
            <div className="fb1">
              <PortPie ip={ip} type='source' />
            </div>
          </div>
          <div style={{height: '50%'}} className="fbv">
            <div className="tac">{`${ip}作为目的IP的端口统计`}</div>
            <div className="fb1">
              <PortPie ip={ip} type='target' />
            </div>
          </div>
        </div>, [ip])}
      </div>
    </div>
  )
}

export default NetWorkGraph
