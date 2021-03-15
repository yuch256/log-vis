import React, {Suspense} from 'react'
import ReactDOM from 'react-dom'
import {HashRouter as Router, Switch, Route} from 'react-router-dom'
import Main from './pages/main'
import Test from './pages/test'
import NotFound from './pages/not-found'
import Header from './components/header'
import SuspenseLoad from './components/suspense-load'
import './assets/icons'
import './common/common.styl'

const App = () => (
  <Suspense fallback={<div>Loading...</div>}>
    <Router>
      <Header />
      <Switch>
        <Route exact path="/" component={SuspenseLoad(Main)} />
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
