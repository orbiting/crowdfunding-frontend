import React from 'react'
import {css} from 'glamor'

import {
  P, H2, A, Label, mediaQueries
} from '@project-r/styleguide'

const portraitStyle = css({
  marginBottom: 30,
  [mediaQueries.mUp]: {
    marginBottom: 60
  },
  '& img': {
    maxWidth: '100%'
  }
})

const portraitImageLeftStyle = css({
  [mediaQueries.mUp]: {
    float: 'left',
    width: '50%',
    marginTop: 3,
    marginRight: 20,
    marginBottom: 10
  }
})
const portraitImageRightStyle = css({
  [mediaQueries.mUp]: {
    float: 'right',
    width: '50%',
    marginTop: 3,
    marginLeft: 20,
    marginBottom: 10
  }
})

export const RawPortrait = ({image, children, odd}) => (
  <div {...portraitStyle}>
    <img className={odd ? portraitImageLeftStyle : portraitImageRightStyle} src={image} alt='' />
    {children}
  </div>
)

const Portrait = ({odd, image, description, name, age, title, email}) => (
  <RawPortrait odd={odd} image={image}>
    <H2 style={{marginBottom: 0}}>{name},&nbsp;{age}</H2>
    <Label>{title}</Label><br /><br />
    <P>
      {description}
      <br />
      <A href={`mailto:${email}`}>{email}</A>
    </P>
  </RawPortrait>
)

export default Portrait
