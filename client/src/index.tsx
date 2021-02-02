import React, {Suspense} from 'react'
import ReactDOM from 'react-dom'
import Main from '@p/main'

const App = () => (
  <Suspense fallback={<div>Loading...</div>}>
    <Main />
    <div>hello world</div>
  </Suspense>
)

ReactDOM.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
  document.getElementById('root') as HTMLElement
)
