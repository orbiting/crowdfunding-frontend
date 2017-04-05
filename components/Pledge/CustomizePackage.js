import React, {Component, PropTypes} from 'react'
import Router from 'next/router'
import withT from '../../lib/withT'
import {mergeFieldState} from '../../lib/fieldState'

import {
  Field, P, A,
  Grid, Span
} from '@project-r/styleguide'

const calculateMinPrice = (pkg, state, userPrice) => {
  return Math.max(pkg.options.reduce(
    (price, option) => price + (option.userPrice && userPrice
      ? 0
      : (option.price * (state[option.id] !== undefined ? state[option.id] : option.minAmount))
    ),
    0
  ), 100)
}

const priceError = (price, minPrice) => {
  if (price < minPrice) {
    return `Betrag, mindestens ${minPrice / 100}`
  }
}

class CustomizePackage extends Component {
  constructor (props) {
    super(props)
    this.state = {
      values: {
        price: props.userPrice
          ? ''
          : calculateMinPrice(props.pkg, {}, props.userPrice)
      },
      errors: {},
      dirty: {}
    }
    this.priceRefSetter = (ref) => {
      this.priceRef = ref
    }
  }
  componentDidMount () {
    if (this.priceRef && this.priceRef.input) {
      this.priceRef.input.focus()
    }
  }
  render () {
    const {t, pkg, userPrice} = this.props
    const {values, errors, dirty} = this.state

    return (
      <div>
        <P>
          {t(`package/${pkg.name}/title`)}
          {' '}
          <A href='/pledge' onClick={event => {
            event.preventDefault()
            Router.replace('/pledge', '/pledge', {shallow: true})
          }}>
            ändern
          </A>
        </P>
        <Grid>
          {pkg.options
            .filter(option => (
              option.minAmount !== option.maxAmount
            ))
            .map(option => {
              const label = t(`option/${option.reward.name}/label`)

              return (
                <Span s='1/2' m='9/18' key={option.id}>
                  <P>
                    <Field
                      label={label}
                      type='number'
                      error={dirty[option.id] && errors[option.id]}
                      value={values[option.id] || option.defaultAmount}
                      onChange={(_, value, shouldValidate) => {
                        let error
                        if (value > option.maxAmount) {
                          return `${label}, maximal ${option.maxAmount}`
                        }
                        if (value < option.minAmount) {
                          return `${label}, minimal ${option.minAmount}`
                        }

                        this.setState(
                          (state, props) => {
                            const nextState = mergeFieldState({
                              field: option.id,
                              value,
                              error,
                              dirty: shouldValidate
                            })(state)

                            const minPrice = calculateMinPrice(
                              pkg,
                              nextState.values,
                              props.userPrice
                            )
                            if (!state.customPrice || minPrice > state.values.price) {
                              nextState.values.price = minPrice
                              nextState.customPrice = false
                            }
                            nextState.errors.price = priceError(
                              nextState.values.price,
                              minPrice
                            )

                            return nextState
                          }
                        )
                      }}
                      />
                  </P>
                </Span>
              )
            })
          }
        </Grid>
        {!!userPrice && (<P>
          Journalismus kostet. Wir haben ausgerechnet dass wir initial mindestens 3000 Abonnenten à CHF 240.- brauchen um dauerhaft zu bestehen. Trotzdem wollen wir niemanden ausschliessen. Wie viel könnten Sie den zahlen pro Jahr?
        </P>)}
        <P>
          <Field label='Betrag'
            ref={this.priceRefSetter}
            error={dirty.price && errors.price}
            value={values.price / 100}
            onChange={(_, value, shouldValidate) => {
              const price = value * 100
              const minPrice = calculateMinPrice(pkg, values, userPrice)
              const error = priceError(price, minPrice)

              this.setState(() => ({customPrice: true}))
              this.setState(mergeFieldState({
                field: 'price',
                value: price,
                error,
                dirty: shouldValidate
              }))
            }} />
        </P>
      </div>
    )
  }
}

CustomizePackage.propTypes = {
  t: PropTypes.func.isRequired,
  userPrice: PropTypes.bool,
  pkg: PropTypes.shape({
    options: PropTypes.array.isRequired
  }).isRequired
}

export default withT(CustomizePackage)
