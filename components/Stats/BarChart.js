import React, {Component} from 'react'
import {css, merge} from 'glamor'
import {max, sum as sumOfArray} from 'd3-array'
import {countFormat} from '../../lib/utils/formats'

import {
  colors, fontFamilies, mediaQueries
} from '@project-r/styleguide'

const X_LABEL_HEIGHT = 20
const Y_LABEL_HEIGTH = 20
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
    right: 0,
    [mediaQueries.mUp]: {
      right: 1
    },
    height: 0,
    borderTop: '1px solid',
    borderBottom: '1px solid rgba(255, 255, 255, 0.8)'
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
    position: 'absolute',
    bottom: -1,
    left: 0,
    clear: 'left',
    width: '100%',
    height: 1,
    backgroundColor: colors.divider
  }),
  yLines: css({
    position: 'absolute',
    top: 0,
    height: '100%',
    opacity: 0.3
  }),
  yLine: css({
    position: 'absolute',
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: colors.divider
  }),
  yLabels: css({
    position: 'absolute',
    top: 0,
    left: 0,
    height: '100%'
  }),
  yLabel: css({
    position: 'absolute',
    left: 0,
    color: colors.secondary,
    opacity: 0.4,
    lineHeight: 1,
    fontFamily: fontFamilies.sansSerifRegular,
    fontSize: 12,
    marginTop: -6,
    [mediaQueries.mUp]: {
      marginTop: -7,
      fontSize: 14
    }
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
      xTick, xLabel,
      color,
      height = 200,
      referenceLines = [],
      yLabel,
      yLinePadding = 0
    } = this.props
    let {
      max: maxValue,
      paddingLeft = 0
    } = this.props

    const {
      width
    } = this.state

    const innerWidth = width - paddingLeft

    if (!maxValue) {
      maxValue = max(data, d => d.count)
    }
    maxValue = Math.ceil(maxValue / 100) * 100

    const sum = sumOfArray(data, d => d.count)
    const maxRatio = maxValue / sum
    let datumWidth = width
     ? Math.floor(innerWidth / data.length)
     : `${100 / data.length}%`

    const compress = width && datumWidth <= 3
    const left = compress ? 0 : undefined
    const datumStyle = {
      width: datumWidth,
      paddingLeft: left
    }
    if (compress) {
      datumWidth = innerWidth / data.length
      datumStyle.width = Math.ceil(datumWidth)
      datumStyle.position = 'absolute'
    }

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

    const hasYLabel = !!yLabel

    return (
      <div ref={this.containerRef} {...styles.container}
        style={{
          height,
          marginTop: Y_LABEL_HEIGTH * 2,
          marginBottom: xTick ? X_LABEL_HEIGHT : 0,
          paddingLeft
        }}>
        {data.map((d, i) => (
          <div {...styles.datum}
            key={i}
            style={{
              ...datumStyle,
              left: compress
                ? paddingLeft + i * datumWidth
                : undefined
            }}>
            <div {...styles.bar}
              title={title ? title(d) : undefined}
              style={{
                left,
                height: `${d.count / sum / overallMaxRatio * 100}%`,
                backgroundColor: color ? color(d) : undefined
              }} />
            {referenceLines.map((line, lineI) => (
              <div {...styles.line}
                key={`ref${lineI}`}
                style={{
                  left,
                  borderTopColor: line.color,
                  bottom: `${line.data[i].count / refMax[lineI].sum / overallMaxRatio * 100}%`
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
        <div {...styles.yLines} style={{
          left: Math.max(paddingLeft, yLinePadding),
          width: baseWidth - yLinePadding
        }}>
          <div {...styles.yLine} style={{top: 0}} />
          <div {...styles.yLine} style={{top: '50%'}} />
        </div>
        {hasYLabel && <div {...styles.yLabels}>
          <div {...styles.yLabel} style={{
            top: -Y_LABEL_HEIGTH,
            whiteSpace: 'nowrap'
          }}>
            {yLabel}
          </div>
          <div {...styles.yLabel} style={{top: 0}}>
            {countFormat(maxValue)}
          </div>
          <div {...styles.yLabel} style={{top: '50%'}}>
            {countFormat(maxValue / 2)}
          </div>
        </div>}
        {!!xLabel && (
          <div {...styles.xLabel}>
            {xLabel}
          </div>
        )}
        <div {...styles.baseLine} style={{
          width: baseWidth,
          left: paddingLeft
        }} />
      </div>
    )
  }
}

export default BarChart
