import React from 'react'
import {css} from 'glamor'
import Head from 'next/head'

import withData from '../lib/withData'
import withT from '../lib/withT'
import {intersperse} from '../lib/utils/helpers'

import Me from '../components/Auth/Me'

import {
  Interaction, NarrowContainer, Logo, A
} from '@project-r/styleguide'

const styles = {
  logo: css({
    textAlign: 'center',
    maxWidth: 207,
    margin: '0 auto',
    paddingTop: 26
  }),
  text: css({
    margin: '120px auto',
    textAlign: 'center',
    maxWidth: 580
  }),
  link: css({
    marginTop: 20
  }),
  me: css({
    marginTop: 80,
    marginBottom: 80
  })
}

const {H1, P} = Interaction

export default withData(withT(({url: {query: {type, context, email}}, t}) => {
  const links = [
    {
      href: '/',
      label: t('notifications/links/home')
    },
    context === 'pledge' && {
      href: '/merci',
      label: t('notifications/links/merci')
    }
  ].filter(Boolean)

  return (
    <div>
      <Head>
        <title>{t('notifications/pageTitle')}</title>
        <meta name='robots' content='noindex' />
      </Head>
      <NarrowContainer>
        <div {...styles.logo}>
          <a href='/'><Logo /></a>
        </div>
        <div {...styles.text}>
          <H1>
            {t(`notifications/${type}/title`, undefined, '')}
          </H1>
          <P>
            {t(`notifications/${type}/text`, undefined, '')}
          </P>
          {(
            type === 'invalid-token' &&
            (
              context === 'signIn' ||
              context === 'pledge'
            )
          ) && (
            <div {...styles.me}>
              <Me email={email} />
            </div>
          )}
          <P {...styles.link}>
            {intersperse(links.map((link, i) => (
              <A key={i} href={link.href}>
                {link.label}
              </A>
            )), () => ' — ')}
          </P>
        </div>
      </NarrowContainer>
    </div>
  )
}))
