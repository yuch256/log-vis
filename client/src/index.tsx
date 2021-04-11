import React, {Suspense} from 'react'
import ReactDOM from 'react-dom'
import {HashRouter as Router, Switch, Route} from 'react-router-dom'
import NetWorkGraph from './pages/network-graph'
import PageRank from './pages/page-rank'
import Test from './pages/test'
import NotFound from './pages/not-found'
import Header from './components/header'
import SuspenseLoad from './components/suspense-load'
import './icons'
import './common/common.styl'
import './common/g6.styl'

const App = () => (
  <Suspense fallback={<div>Loading...</div>}>
    <Router>
      <Header />
      <Switch>
        <Route exact path="/network" component={SuspenseLoad(NetWorkGraph)} />
        <Route exact path="/page-rank" component={SuspenseLoad(PageRank)} />
        <Route exact path="/test" component={SuspenseLoad(Test)} />
        <Route path="*" component={SuspenseLoad(NotFound)} />
      </Switch>
    </Router>
  </Suspense>
)

ReactDOM.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
  document.getElementById('root') as HTMLElement
)

// type Props = { onClick(e: MouseEvent<HTMLElement>): void };
