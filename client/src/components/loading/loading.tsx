import React from 'react'

interface Props {
  children: React.ReactElement,
  loading?: boolean,
}

const Loading: React.FC<Props> = ({
  children, loading = true,
}) => {
  switch(loading) {
    case true: return <div className="fbh fbac fbjc wh100p fs32">Loading...</div>
    case false: return children
  }
}

export default Loading
