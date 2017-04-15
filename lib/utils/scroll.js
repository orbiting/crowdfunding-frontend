// Shout out to Pawel Grzybek
// https://pawelgrzybek.com/page-scroll-in-vanilla-javascript/

import {easeCubicOut} from 'd3-ease'

const getTime = () => 'now' in window.performance ? window.performance.now() : new Date().getTime()

export const scrollIt = (
  destination,
  duration = 200,
  callback
) => {
  const start = window.pageYOffset
  const startTime = getTime()

  const documentHeight = Math.max(document.body.scrollHeight, document.body.offsetHeight, document.documentElement.clientHeight, document.documentElement.scrollHeight, document.documentElement.offsetHeight)
  const windowHeight = window.innerHeight || document.documentElement.clientHeight || document.getElementsByTagName('body')[0].clientHeight
  const destinationOffset = destination
  const destinationOffsetToScroll = Math.round(documentHeight - destinationOffset < windowHeight ? documentHeight - windowHeight : destinationOffset)

  if ('requestAnimationFrame' in window === false) {
    window.scroll(0, destinationOffsetToScroll)
    if (callback) {
      callback()
    }
    return
  }

  const scroll = () => {
    const now = getTime()
    const time = Math.min(1, ((now - startTime) / duration))
    const timeFunction = easeCubicOut(time)
    window.scroll(0, Math.ceil((timeFunction * (destinationOffsetToScroll - start)) + start))

    if (window.pageYOffset === destinationOffsetToScroll) {
      if (callback) {
        callback()
      }
      return
    }

    window.requestAnimationFrame(scroll)
  }

  scroll()
}
