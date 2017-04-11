import React, {PropTypes} from 'react'
import {css} from 'glamor'

import FacebookIcon from './Icons/Facebook'
import TwitterIcon from './Icons/Twitter'
import EmailIcon from './Icons/Email'

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

const ShareButtons = ({url, tweet, emailSubject, emailBody, emailAttachUrl, fill}) => {
  const emailAttache = emailAttachUrl ? `\n\n${url}` : ''
  const shareOptions = [
    {
      blank: true,
      href: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
      Icon: FacebookIcon
    },
    {
      blank: true,
      href: `https://twitter.com/intent/tweet?text=${encodeURIComponent(tweet)}&url=${encodeURIComponent(url)}`,
      Icon: TwitterIcon
    },
    {
      href: `mailto:?subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(emailBody + emailAttache)}`,
      Icon: EmailIcon
    }
  ]

  return (
    <div>
      {shareOptions.map(({href, blank, Icon}, i) => (
        <a key={i} href={href} {...styles.button} target={blank ? '_blank' : ''}>
          <Icon fill={fill} />
        </a>
      ))}
    </div>
  )
}

ShareButtons.propTypes = {
  url: PropTypes.string.isRequired,
  tweet: PropTypes.string.isRequired,
  emailSubject: PropTypes.string.isRequired,
  emailBody: PropTypes.string.isRequired,
  emailAttachUrl: PropTypes.bool.isRequired,
  fill: PropTypes.string
}

ShareButtons.defaultProps = {
  tweet: '',
  emailBody: '',
  emailAttachUrl: true
}

export default ShareButtons
