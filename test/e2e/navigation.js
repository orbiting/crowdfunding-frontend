/* global describe, it, browser */

const assert = require('assert')

describe('navigation', () => {
  it('to /updates', () => {
    browser.url('/')
    browser.scroll(0, 1000)
    browser.click('=Neues')
    browser.waitForText('p=Aktuelles zum Crowdfunding')

    assert(
      browser.getText('p=Aktuelles zum Crowdfunding'),
      'Aktuelles zum Crowdfunding'
    )
  })
})
