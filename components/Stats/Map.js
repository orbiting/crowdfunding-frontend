import React, {Component} from 'react'
import {geoAlbers} from 'd3-geo'

import {
  colors, Field
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
      const height = width / 1.5

      if (width !== this.state.width) {
        console.log(toGeoJson(this.props.data))
        this.projection.fitExtent(
          [[10, 10], [width - 10, height - 20]],
          toGeoJson(this.props.data)
        )
        this.setState({
          width,
          height
        })
      }
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
    const {width, height, filter} = this.state
    const {data, allowFilter = false} = this.props
    const {projection} = this
    return (
      <div ref={this.containerRef}>
        <svg width={width || '100%'} height={height || 300}>
          {
            data.map((d, i) => {
              return (
                <g key={`bubble${i}`} transform={`translate(${projection([d.lon, d.lat]).join(' ')})`}>
                  <circle
                    fill={colors.primary}
                    fillOpacity={0.1}
                    stroke={colors.primary}
                    strokeOpacity={(
                      filter
                        ? (d.postalCode && d.postalCode.startsWith(filter) ? 1 : 0)
                        : 1
                    )}
                    r={Math.sqrt(d.count) / 3} />
                </g>
              )
            })
          }
        </svg>
        {allowFilter && <Field
          label='Postleitzahl'
          value={filter || ''}
          onChange={(_, value) => {
            this.setState({
              filter: value
            })
          }} />}
      </div>
    )
  }
}

export default PostalCodeMap
