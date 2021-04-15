import React, {useEffect, useState} from 'react'
import {$get} from '@axios'
import Loading from '@c/loading'
import StackedChart from '@diagram/stacked-chart'

const PortStatistic = () => {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)

  const getData = async () => {
    try {
      setLoading(true)
      const r = await $get('/log/ports')
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
        <StackedChart data={data} />
      </Loading>
    </div>
  </div>
}

export default PortStatistic
