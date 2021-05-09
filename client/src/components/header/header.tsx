import React from 'react'
import {NavLink, Link} from 'react-router-dom'
import Logo from './logo.png'
import './header.styl'

const Header: React.FC = () => {
  return (
    <header className="app-header">
      <Link to="/" className="app-title">
        <div className="app-logo-box">
          <img src={Logo} alt="logo" className="wh100p" />
        </div>
        <span>网络日志可视化分析</span>
      </Link>
      <ul className="app-menu">
        <NavBar />
      </ul>
    </header>
  )
}

interface NavList {
  link: string,
  name: string,
}

const NavBar: React.FC = () => {
  const arr: NavList[] = [
    {link: '/network', name: '网络主体结构'},
    // {link: '/page-rank', name: 'PageRank'},
    // {link: '/flow', name: '流量时序'},
    {link: '/key-nodes-flow', name: '关键节点流量时序分析'},
    {link: '/multi-flow', name: '多维属性流量时序分析'},
  ]

  return <>
    {arr.map((item: NavList) => {
      return (
        <li className="app-menu-item" key={item.name}>
          <NavLink to={item.link} activeClassName="app-menu-active">
            {item.name}
          </NavLink>
        </li>
      )
    })}
  </>
}

export default Header
