import React from 'react'

interface Props {
  name: string,
  size?: number,
  fill?: string,
  opacity?: number,
  className?: string,
}

const Icon: React.FC<Props> = ({
  name, size = 16, fill = '#ffffff', className, opacity = 1,
}) => (
  <svg width={size} style={{opacity}} height={size} fill={fill} className={className}>
    <use xlinkHref={`#${name}`} />
  </svg>
)

export default Icon
