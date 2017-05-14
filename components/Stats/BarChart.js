import React, {Component} from 'react'
import {css, merge} from 'glamor'
import {max, sum as sumOfArray} from 'd3-array'

import {
  colors, fontFamilies, mediaQueries
} from '@project-r/styleguide'

const X_LABEL_HEIGHT = 20
const styles = {
  container: css({
    position: 'relative'
  }),
  datum: css({
    float: 'left',
    paddingLeft: 1,
    [mediaQueries.mUp]: {
      paddingRight: 1
    },
    height: '100%',
    position: 'relative'
  }),
  bar: css({
    backgroundColor: colors.primary,
    position: 'absolute',
    left: 1,
    right: 0,
    [mediaQueries.mUp]: {
      right: 1
    },
    bottom: 0
  }),
  line: css({
    pointerEvents: 'none',
    position: 'absolute',
    left: 1,
    right: 1,
    bottom: 0,
    borderTop: '1px solid'
  }),
  lineLabel: css({
    position: 'absolute',
    top: 5,
    left: 0,
    fontSize: 12
  }),
  xTick: css({
    position: 'absolute',
    bottom: -X_LABEL_HEIGHT,
    fontFamily: fontFamilies.sansSerifRegular,
    fontSize: 12,
    [mediaQueries.mUp]: {
      fontSize: 14
    },
    left: -10,
    right: -10,
    textAlign: 'center',
    color: colors.secondary,
    opacity: 0.4
  }),
  baseLine: css({
    clear: 'left',
    width: '100%',
    height: 1,
    backgroundColor: colors.divider
  })
}
styles.xLabel = merge(styles.xTick, {
  left: 0,
  textAlign: 'left'
})

class BarChart extends Component {
  constructor (...args) {
    super(...args)

    this.state = {}
    this.containerRef = ref => {
      this.container = ref
    }
    this.measure = () => {
      const {width} = this.container.getBoundingClientRect()

      this.setState(() => ({
        width
      }))
    }
  }
  componentDidMount () {
    window.addEventListener('resize', this.measure)
    this.measure()
  }
  componentWillUnmount () {
    window.removeEventListener('resize', this.measure)
  }
  render () {
    const {
      data, title,
      max: maxValue,
      xTick, xLabel,
      color,
      height = 200,
      referenceLines = []
    } = this.props
    let {
      paddingLeft = 0
    } = this.props

    const {
      width
    } = this.state

    const innerWidth = width - paddingLeft
    const sum = sumOfArray(data, d => d.count)
    const maxRatio = maxValue
      ? maxValue / sum
      : max(data, d => d.count / sum)
    const datumWidth = width
     ? Math.floor(innerWidth / data.length)
     : `${100 / data.length}%`
    let baseWidth
    if (width) {
      baseWidth = datumWidth * data.length
    }
    if (paddingLeft && innerWidth > baseWidth) {
      paddingLeft += (innerWidth - baseWidth) / 2
    }

    const refMax = referenceLines.map(line => {
      const sum = sumOfArray(line.data, d => d.count)
      return {
        sum,
        maxRatio: max(line.data, d => d.count / sum)
      }
    })
    const overallMaxRatio = max(
      [maxRatio]
        .concat(refMax.map(m => m.maxRatio))
    )

    return (
      <div ref={this.containerRef} {...styles.container}
        style={{
          height,
          marginBottom: xTick ? X_LABEL_HEIGHT : 0,
          paddingLeft
        }}>
        {data.map((d, i) => (
          <div {...styles.datum}
            key={i}
            style={{
              width: datumWidth
            }}>
            <div {...styles.bar}
              title={title ? title(d) : undefined}
              style={{
                height: `${d.count / sum / overallMaxRatio * 100}%`,
                backgroundColor: color ? color(d) : undefined
              }} />
            {referenceLines.map((line, lineI) => (
              <div {...styles.line}
                key={`ref${lineI}`}
                style={{
                  borderTopColor: line.color,
                  height: `${line.data[i].count / refMax[lineI].sum / overallMaxRatio * 100}%`
                }}>
                {i === 0 && (
                  <div {...styles.lineLabel} style={{
                    color: line.color,
                    left: -paddingLeft,
                    top: line.top
                  }}>
                    {line.label}
                  </div>
                )}
              </div>
            ))}
            {!!xTick && (
              <div {...styles.xTick}>
                {xTick(d, i)}
              </div>
            )}
          </div>
        ))}
        {!!xLabel && (
          <div {...styles.xLabel}>
            {xLabel}
          </div>
        )}
        <div {...styles.baseLine} style={{width: baseWidth}} />
      </div>
    )
  }
}

export default BarChart
