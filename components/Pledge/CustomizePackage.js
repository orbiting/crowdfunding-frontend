import React, {Component, PropTypes} from 'react'
import Router from 'next/router'
import withT from '../../lib/withT'
import {fieldsState} from '../../lib/fieldState'

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
    const {
      t, pkg, userPrice,
      values, errors, dirty,
      onChange
    } = this.props

    let price
    if (values.price !== undefined) {
      price = values.price / 100
    } else {
      price = userPrice
        ? ''
        : calculateMinPrice(pkg, {}, userPrice)
    }

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

                        const fields = fieldsState({
                          field: option.id,
                          value,
                          error,
                          dirty: shouldValidate
                        })
                        const minPrice = calculateMinPrice(
                          pkg,
                          {
                            ...values,
                            ...fields.values
                          },
                          userPrice
                        )
                        let price = values.price
                        if (!this.state.customPrice || minPrice > values.price) {
                          fields.values.price = price = minPrice
                          this.setState(() => ({customPrice: false}))
                        }
                        fields.errors.price = priceError(
                          price,
                          minPrice
                        )
                        onChange(fields)
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
            value={price}
            onChange={(_, value, shouldValidate) => {
              const price = value * 100
              const minPrice = calculateMinPrice(pkg, values, userPrice)
              const error = priceError(price, minPrice)

              this.setState(() => ({customPrice: true}))
              onChange(fieldsState({
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
  values: PropTypes.object.isRequired,
  errors: PropTypes.object.isRequired,
  dirty: PropTypes.object.isRequired,
  t: PropTypes.func.isRequired,
  userPrice: PropTypes.bool,
  pkg: PropTypes.shape({
    options: PropTypes.array.isRequired
  }).isRequired
}

export default withT(CustomizePackage)
