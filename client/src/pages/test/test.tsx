import React from 'react'
import c from 'classnames'
import Icon from '@c/icon'
import s from './test.module.styl'

const Test: React.FC = () => {
  return (
    <div className={c(s.aa)}>
      main
      <p className={c(s.bb)}>jfsld</p>
      <Icon name="home" fill="#5AD2FF" size={60} />
      <Icon name="3d" fill="#5AD2FF" size={60} />
    </div>
  )
}

export default Test
