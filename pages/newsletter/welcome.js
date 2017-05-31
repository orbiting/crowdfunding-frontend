import React from 'react'
import withData from '../../lib/withData'
import withT from '../../lib/withT'
import Frame from '../../components/Frame'

import {
  Interaction
} from '@project-r/styleguide'

const {H1, P} = Interaction

export default withData(withT(({url, t}) => {
  const {context} = url.query
  const title = context === 'wait'
    ? t('ended/waitingList/title')
    : t('newsletter/title')
  return (
    <Frame url={url} meta={{
      title: t('newsletter/title')
    }}>
      <H1>
        {title}
      </H1>
      <P>
        {t(
          `api/newsletter/${url.query.message}`,
          undefined,
          t(context === 'wait'
            ? 'ended/waitingList/defaultMessage'
            : 'newsletter/defaultMessage'
          )
        )}
      </P>
    </Frame>
  )
}))
