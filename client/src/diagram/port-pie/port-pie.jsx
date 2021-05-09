import React, {useRef, useEffect, useState} from 'react'
import {Chart} from '@antv/g2'
import c from 'classnames'
import {$get} from '@axios'
import Loading from '@c/loading'

const d = [
  {
      "port": "1025",
      "count": 1955,
      "percent": 0.016
  },
  {
      "port": "389",
      "count": 5596,
      "percent": 0.045
  },
  {
      "port": "445",
      "count": 48183,
      "percent": 0.387
  },
  {
      "port": "other",
      "count": 68922,
      "percent": 0.553
  }
]

const PortPie = ({ip, type = 'source'}) => {
  const [load, setLoad] = useState(false)
  const el = useRef(null)
  const portPie = useRef(null)

  useEffect(() => {
    const container = el.current
    // const width = container?.scrollWidth
    const height = container?.scrollHeight || 500

    const chart = new Chart({
      container,
      autoFit: true,
      height,
    })

    chart.coordinate('theta', {
      radius: 0.75,
    })
    
    chart.data([])
    
    chart.scale('percent', {
      formatter: (val) => {
        val = (val * 100).toFixed(1) + '%'
        return val
      },
    })

    chart.tooltip({
      showTitle: false,
      showMarkers: false,
    })

    chart
      .interval()
      .position('percent')
      .color('port')
      .label('percent', {
        content: (data) => data.port,
      })
      .adjust('stack')

    chart.legend(false) // 关闭图例

    chart.interaction('element-active')

    chart.render()
    portPie.current = chart
  }, [])

  const getData = async () => {
    try {
      setLoad(true)
      const url = `/log/node/${type === 'source' ? 'srcport' : 'dstport'}`
      const res = await $get(url, {ip})
      const data = res.map(({port, percent}) => ({port, percent: Number(percent)}))
      portPie.current.changeData(data)
      setLoad(false)
    } catch (error) {
      console.error(error)
    }
  }

  useEffect(() => {
    ip && getData()
  }, [ip])

  return <div className="wh100p">
    {load && <Loading loading={true} />}
    <div ref={el} className={c('wh100p', {'hide': load})} />
  </div>
}

export default PortPie
