import React, {useState, useEffect} from 'react'
import c from 'classnames'
import {$get} from '@axios'
import Loading from '@c/loading'
import BubbleChart from '@diagram/bubble-chart'
import BarChart from '@diagram/bar-chart'
import s from './page-rank.module.styl'

interface Data {
  bar: Bar[],
  bubble: Bar[],
}

interface Bar {
  name: string,
  value: number,
}

const PageRank: React.FC = () => {
  const [data, setData] = useState<Data>({
    bar: [],
    bubble: [],
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getPageRankData()
  }, [])

  const getPageRankData = async () => {
    try {
      const bar: any = await $get('/node/pagerank/percents')
      const bubble: any = await $get('/node/pagerank/assembly')
      setData({
        bar: bar.map(({name, value}: Bar) => ({name, value: (value*100).toFixed(4)})),
        bubble,
      })
      setLoading(false)
    } catch (error) {
      console.error(error)
    }
  }

  return <div className="container wh100p">
    <div className="content wh100p pr">
      <Loading loading={loading}>
        <>
          {/* <BubbleChart data={data.bubble} className={c(s.bubble)} /> */}
          <BarChart data={data.bar} />
        </>
      </Loading>
    </div>
  </div>
}

export default PageRank
