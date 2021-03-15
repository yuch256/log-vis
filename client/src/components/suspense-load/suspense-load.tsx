import React, {Suspense} from 'react'

const SuspenseLoad = (Component: React.FunctionComponent) => {
  return () => <Suspense fallback={<div>Loading...</div>}>
    <Component />
  </Suspense>
}

export default SuspenseLoad
