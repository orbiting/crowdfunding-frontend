import React, {Component} from 'react'
import {geoAlbers} from 'd3-geo'
import {css} from 'glamor'

import {
  colors, fontFamilies
} from '@project-r/styleguide'

const toGeoJson = data => ({
  type: 'FeatureCollection',
  features: data.map(d => ({
    type: 'Feature',
    geometry: {
      type: 'Point',
      coordinates: [d.lon, d.lat]
    }
  }))
})

const styles = {
  circlePos: css({
    transition: 'cx 1s ease-in-out, cy 1s ease-in-out, r 1s ease-in-out'
  }),
  labelOutline: css({
    fill: '#fff',
    fontFamily: fontFamilies.sansSerifRegular,
    fontSize: 12,
    stroke: '#fff',
    strokeWidth: 2
  }),
  label: css({
    fill: colors.primary,
    fontFamily: fontFamilies.sansSerifRegular,
    fontSize: 12
  })
}

class PostalCodeMap extends Component {
  constructor (...args) {
    super(...args)

    this.state = {}
    this.projection = geoAlbers()
      .rotate([0, 0])
      .center([8.23, 46.8])
      .scale(13000)
    this.containerRef = ref => {
      this.container = ref
    }
    this.measure = () => {
      const width = this.container.getBoundingClientRect().width
      const height = Math.min(width / 1.5, window.innerHeight * 0.65)

      const extentData = this.props.extentData || this.props.data
      if (
        width !== this.state.width ||
        extentData !== this.state.extentData
      ) {
        this.projection.fitExtent(
          [[10, 10], [width - 10, height - 10]],
          toGeoJson(extentData)
        )
        this.setState({
          width,
          height,
          extentData
        })
      }
    }
  }
  componentDidMount () {
    window.addEventListener('resize', this.measure)
    this.measure()
  }
  componentDidUpdate () {
    this.measure()
  }
  componentWillUnmount () {
    window.removeEventListener('resize', this.measure)
  }
  render () {
    const {width, height} = this.state
    const {data, labels, labelOptions, filter} = this.props
    const {projection} = this
    const scale = projection.scale()
    const radius = d => (
      Math.max(0.3, Math.sqrt(d.count) * scale * 0.00001)
    )

    return (
      <div ref={this.containerRef}>
        <svg width={width || '100%'} height={height || 300}>
          {
            data.map((d, i) => {
              const [x, y] = projection([d.lon, d.lat])
              return (
                <circle
                  key={`bubble${i}`} {...styles.circlePos}
                  cx={x}
                  cy={y}
                  fill={colors.primary}
                  fillOpacity={0.1}
                  stroke={colors.primary}
                  strokeOpacity={(
                    filter
                      ? (d.postalCode && d.postalCode.startsWith(filter) ? 1 : 0)
                      : 1
                  )}
                  r={radius(d)}>
                  <title>{`${d.postalCode} ${d.name}: ${d.count}`}</title>
                </circle>
              )
            })
          }
          {
            labels.map((d, i) => {
              let [x, y] = projection([d.lon, d.lat])
              if (!labelOptions.center) {
                x += radius(d)
              }
              if (labelOptions.xOffset) {
                x += labelOptions.xOffset
              }
              const textStyle = {
                textAnchor: labelOptions.center ? 'middle' : 'start'
              }
              const text = labelOptions.postalCode
                ? d.postalCode : d.name
              return (
                <g key={`label${i}`}
                  transform={`translate(${x} ${y})`}>
                  <text dy='0.3em' {...styles.labelOutline} style={textStyle}>
                    {text}
                  </text>
                  <text dy='0.3em' {...styles.label} style={textStyle}>
                    {text}
                  </text>
                </g>
              )
            })
          }
        </svg>
      </div>
    )
  }
}

export default PostalCodeMap
