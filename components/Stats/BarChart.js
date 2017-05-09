import React from 'react'
import {css} from 'glamor'
import {max} from 'd3-array'

const styles = {
  datum: css({
    float: 'left',
    paddingLeft: 1,
    paddingRight: 1,
    height: '100%'
  }),
  bar: css({
    width: '100%',
    backgroundColor: 'gray'
  })
}

export default ({data, title, color}) => {
  const maxCount = max(data, d => d.count)
  const datumWidth = `${100 / data.length}%`
  return (
    <div style={{height: 200}}>
      {data.map((d, i) => (
        <div key={i}
          {...styles.datum}
          style={{
            width: datumWidth
          }}>
          <div
            {...styles.bar}
            title={title ? title(d) : undefined}
            style={{
              height: `${d.count / maxCount * 100}%`,
              backgroundColor: color ? color(d) : undefined
            }} />
        </div>
      ))}
    </div>
  )
}
