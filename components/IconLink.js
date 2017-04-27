import React, {PropTypes} from 'react'
import {css} from 'glamor'

import FacebookIcon from './Icons/Facebook'
import TwitterIcon from './Icons/Twitter'
import EmailIcon from './Icons/Email'
import DownloadIcon from './Icons/Download'

const styles = {
  button: css({
    padding: '5px 5px',
    ':hover': {
      opacity: 0.6
    },
    ':first-child': {
      paddingLeft: 0
    },
    ':last-child': {
      paddingRight: 0
    }
  })
}

const ICONS = {
  facebook: FacebookIcon,
  twitter: TwitterIcon,
  email: EmailIcon,
  download: DownloadIcon
}

const IconLink = ({href, target, download, fill, icon}) => {
  const Icon = ICONS[icon]
  return (
    <a href={href} {...styles.button} download={!!download} target={target}>
      <Icon fill={fill} />
    </a>
  )
}

IconLink.propTypes = {
  icon: PropTypes.oneOf(Object.keys(ICONS)).isRequired
}

export default IconLink
