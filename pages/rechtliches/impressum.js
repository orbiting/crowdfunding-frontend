import React from 'react'
import withData from '../../lib/withData'
import Frame from '../../components/Frame'
import Content from '../../components/Frame/Content'

import {
  H1, P, A
} from '@project-r/styleguide'

export default withData(({url}) => {
  const title = 'Impressum'
  return (
    <Frame url={url} meta={{title}}>
      <Content>
        <H1>
          {title}
        </H1>
        <P>
          Republik<br />
          c/o Hotel Rothaus<br />
          Sihlhallenstrasse 1<br />
          8004 Zürich<br />
          <A href='mailto:kontakt@republik.ch'>kontakt@republik.ch</A>
        </P>
      </Content>
    </Frame>
  )
})
