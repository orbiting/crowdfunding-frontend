import React, {Component} from 'react'
import {geoAlbers} from 'd3-geo'
import {css} from 'glamor'

import {
  colors
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
    transition: 'transform 400ms'
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
    const {data, filter} = this.props
    const {projection} = this
    return (
      <div ref={this.containerRef}>
        <svg width={width || '100%'} height={height || 300}>
          {
            data.map((d, i) => {
              return (
                <circle
                  key={`bubble${i}`} {...styles.circlePos}
                  transform={`translate(${projection([d.lon, d.lat]).join(' ')})`}
                  fill={colors.primary}
                  fillOpacity={0.1}
                  stroke={colors.primary}
                  strokeOpacity={(
                    filter
                      ? (d.postalCode && d.postalCode.startsWith(filter) ? 1 : 0)
                      : 1
                  )}
                  r={Math.sqrt(d.count) / 3} />
              )
            })
          }
        </svg>
      </div>
    )
  }
}

export default PostalCodeMap
