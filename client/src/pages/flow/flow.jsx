import React, {useEffect, useState} from 'react'
import {$get} from '@axios'
import Loading from '@c/loading'
import AllFlowHeatMap from '@diagram/all-flow-heat-map'
import FlowLineChart from '@diagram/flow-line-chart'

const K = 1024
const M = K * K

const Flow = () => {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)

  const getData = async () => {
    try {
      setLoading(true)
      const r = await $get('/log/flow')
      const data = r.map(({size, ...other}) => ({size: Number((size/M).toFixed(2)), ...other}))
      setData(data)
      // setData(r)
      setLoading(false)
    } catch (error) {
      console.error(error)
    }
  }

  useEffect(() => {
    getData()
  }, [])

  return <div className="container wh100p">
    <div className="content wh100p pr fbv">
      <div style={{height: 300}} className="mb16">
        <Loading loading={loading}>
          <FlowLineChart data={data} />
        </Loading>
      </div>
      <div className="fbh">
        <div className="fb1 fbv">
          <div className="tac">关键节点通信流量热力图</div>
          <div style={{height: 500}}>
            <AllFlowHeatMap type="flow" />
          </div>
        </div>
        <div className="fb1 fbv">
          <div className="tac">关键节点通信次数热力图</div>
          <div style={{height: 500}}>
            <AllFlowHeatMap type="count" />
          </div>
        </div>
      </div>
    </div>
  </div>
}

export default Flow
