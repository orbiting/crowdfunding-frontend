import Router from 'next/router'

export const gotoMerci = (query) => {
  Router.push({
    pathname: '/merci',
    query
  }).then(() => {
    window.scrollTo(0, 0)
  })
}
