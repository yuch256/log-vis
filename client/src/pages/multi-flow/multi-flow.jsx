import React, {useState, Children, useMemo} from 'react'
import {$get} from '@axios'
import ParallelCoord from '@diagram/parallel-coord'
import Top from './top'
import Line from './line'

const MultiFlow = () => {
  const [data, setData] = useState({})
  const [date, setDate] = useState('')
  const [lines, setLines] = useState([])
  const [a, setA] = useState(1)

  console.log(1111111, a, lines)

  const onClickLine = async cdate => {
    try {
      const r = await $get('/log/node/top', {date: cdate})
      setData(r)
      setLines([])
      setDate(cdate)
      window.localStorage.setItem('date', cdate)
    } catch (error) {
      console.error(error)
    }
  }

  const onClickPie = async (name, value) => {
    try {
      const isRepeat = lines.find(({attr, v}) => attr === name && value === v)
      if (isRepeat) return alert('重复请求')
      const r = await $get('/log/date/attr', {
        date: window.localStorage.getItem('date'),
        attr: name,
        value
      })
      console.log(r, lines)
      let A = a + 1
      setA(A)
      setLines(lines.concat({
        attr: name,
        value,
        data: r,
      }))
    } catch (error) {
      console.error(error)
    }
  }

  return <div className="container wh100p">
    <div className="content wh100p pr fbv oa">
      <div style={{height: 500}}>
        <ParallelCoord onClickLine={onClickLine} />
      </div>
      <p className="mb8 tac f16">{date}{a}</p>
      <div className="fbh">
        <div className="fbv" style={{width: 400}}>
          {Object.entries(data).map(([k, v]) => Children.toArray(
            <div style={{height: 200}}>
              <Top data={v} name={k} onClickPie={onClickPie} />
            </div>
          ))}
        </div>
        <div className="fb1 fbv">
          {console.log(lines)}
          {lines.map(l => Children.toArray(
            <div style={{height: 200}}>
              <Line data={l.data} title={`${l.attr} ${l.value}`} />
            </div>
          ))}
        </div>
      </div>
    </div>
  </div>
}

export default MultiFlow
