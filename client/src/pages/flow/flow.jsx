import React, {useEffect, useState} from 'react'
import {$get} from '@axios'
import Loading from '@c/loading'
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
      // setData(r.map(({size, date}) => ({size: (size/K).toFixed(0), date})))
      setData(r)
      setLoading(false)
    } catch (error) {
      console.error(error)
    }
  }

  useEffect(() => {
    getData()
  }, [])

  return <div className="container wh100p">
    <div className="content wh100p pr">
      <Loading loading={loading}>
        <FlowLineChart data={data} />
      </Loading>
    </div>
  </div>
}

export default Flow
