import React from 'react'
import {css} from 'glamor'

import Share from '../Share'
import VideoPlayer from '../VideoPlayer'

import {
  PUBLIC_BASE_URL
} from '../../constants'

import {
  Interaction, fontFamilies,
  P as SerifP, colors
} from '@project-r/styleguide'

const {H2} = Interaction

const styles = {
  detail: css({
    width: '100%',
    padding: '30px 45px',
    float: 'left'
  }),
  detailRole: css({
    fontSize: 17,
    fontFamily: fontFamilies.sansSerifRegular,
    color: colors.secondary
  })
}

const Detail = ({t, data: {id, name, role, quote, image, video}}) => (
  <div {...styles.detail}>
    <H2>{name} <span {...styles.detailRole}>{role}</span></H2>
    {video
      ? (
        <div style={{maxWidth: 400, marginBottom: 20, marginTop: 10}}>
          <VideoPlayer src={{...video, poster: image}} autoPlay />
        </div>
        )
      : <SerifP>«{quote}»</SerifP>
    }
    <Share
      fill={colors.secondary}
      url={`${PUBLIC_BASE_URL}/community?id=${id}`}
      emailSubject={t('testimonial/detail/share/emailSubject', {
        name,
        role
      })} />
  </div>
)

export default Detail
