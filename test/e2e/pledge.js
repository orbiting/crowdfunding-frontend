/* global describe, it, browser */

describe('pledge', () => {
  it('submits', () => {
    browser.url('/pledge?package=ABO')

    browser.setValue('input[name=name]', 'Thomas Test')
    browser.setValue('input[name=email]', 'tpr@project-r.construction')

    browser.click('input[value=STRIPE]')

    browser.setValue('input[name=cardNumber]', '4242 4242 4242 4242')
    browser.setValue('input[name=cardMonth]', '3')
    browser.setValue('input[name=cardYear]', '19')
    browser.setValue('input[name=cardCVC]', '123')

    browser.click('button=Bezahlen')

    browser.waitForText('p*=tpr@project-r.construction')
    browser.waitForText('p*=Bestätigunsemail')
  })
})
