import React, {Component, PropTypes} from 'react'
import Router from 'next/router'
import withT from '../../lib/withT'
import {fieldsState} from '../../lib/utils/fieldState'
import {chfFormat} from '../../lib/utils/formats'

import {
  Field, P, A,
  Grid, Span
} from '@project-r/styleguide'

const absolutMinPrice = 100
const calculateMinPrice = (pkg, state, userPrice) => {
  return Math.max(pkg.options.reduce(
    (price, option) => price + (option.userPrice && userPrice
      ? 0
      : (option.price * (state[option.id] !== undefined ? state[option.id] : option.minAmount))
    ),
    0
  ), absolutMinPrice)
}

const getPrice = ({values, pkg, userPrice}) => {
  if (values.price !== undefined) {
    return values.price
  } else {
    if (userPrice) {
      return ''
    }
    const minPrice = calculateMinPrice(pkg, {}, userPrice)
    if (minPrice === absolutMinPrice) {
      return ''
    }

    return minPrice
  }
}
const priceError = (price, minPrice, t) => {
  if (price < minPrice) {
    return t('package/customize/price/error', {
      formattedCHF: chfFormat(minPrice / 100)
    })
  }
}
const reasonError = (value = '', t) => {
  return value.trim().length === 0 && t('package/customize/userPrice/reason/error')
}

class CustomizePackage extends Component {
  constructor (props) {
    super(props)
    this.state = {}
    this.focusRefSetter = (ref) => {
      this.focusRef = ref
    }
  }
  componentDidMount () {
    if (this.focusRef && this.focusRef.input) {
      this.focusRef.input.focus()
    }

    const {
      onChange,
      pkg, values, userPrice,
      t
    } = this.props

    const price = getPrice(this.props)
    const minPrice = calculateMinPrice(
      pkg,
      values,
      userPrice
    )
    onChange({
      values: {
        price
      },
      errors: {
        price: priceError(price, minPrice, t),
        reason: userPrice && reasonError(values.reason, t)
      }
    })
  }
  render () {
    const {
      t, pkg, userPrice,
      values, errors, dirty,
      onChange
    } = this.props

    const price = getPrice(this.props)
    const configurableOptions = pkg.options
      .filter(option => (
        option.minAmount !== option.maxAmount
      ))

    return (
      <div>
        <P>
          {t(`package/${pkg.name}/title`)}
          {' '}
          <A href='/pledge' onClick={event => {
            event.preventDefault()
            onChange({
              values: {
                price: undefined
              }
            })
            Router.replace('/pledge', '/pledge', {shallow: true})
          }}>
            {t('package/customize/changePackage')}
          </A>
        </P>
        <Grid>
          {
            configurableOptions.map((option, i) => {
              const value = values[option.id] === undefined ? option.defaultAmount : values[option.id]
              const label = t.pluralize(`option/${option.reward.name}/label`, {
                count: value
              }, t(`option/${option.reward.name}/label`))

              return (
                <Span s='1/2' m='9/18' key={option.id}>
                  <P>
                    <Field
                      ref={i === 0 ? this.focusRefSetter : undefined}
                      label={label}
                      type='number'
                      error={dirty[option.id] && errors[option.id]}
                      value={value}
                      onChange={(_, value, shouldValidate) => {
                        let error
                        if (value > option.maxAmount) {
                          error = t('package/customize/option/error/max', {
                            label,
                            maxAmount: option.maxAmount
                          })
                        }
                        if (value < option.minAmount) {
                          error = t('package/customize/option/error/min', {
                            label,
                            minAmount: option.minAmount
                          })
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
                        if (
                          minPrice !== absolutMinPrice &&
                          (!this.state.customPrice || minPrice > values.price)
                        ) {
                          fields.values.price = price = minPrice
                          this.setState(() => ({customPrice: false}))
                        }
                        fields.errors.price = priceError(
                          price,
                          minPrice,
                          t
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
        {!!userPrice && (<div>
          <P>
            {t('package/customize/userPrice/beforeReason')}
          </P>
          <P>
            <Field label={t('package/customize/userPrice/reason/label')}
              ref={this.focusRefSetter}
              error={dirty.reason && errors.reason}
              value={values.reason}
              onChange={(_, value, shouldValidate) => {
                onChange(fieldsState({
                  field: 'reason',
                  value,
                  error: reasonError(value, t),
                  dirty: shouldValidate
                }))
              }}
              />
          </P>
          <P>
            {t('package/customize/userPrice/beforePrice')}
          </P>
        </div>)}
        <P>
          <Field label={t('package/customize/price/label')}
            ref={(configurableOptions.length || userPrice)
              ? undefined : this.focusRefSetter}
            error={dirty.price && errors.price}
            value={price / 100}
            onChange={(_, value, shouldValidate) => {
              const price = value * 100
              const minPrice = calculateMinPrice(pkg, values, userPrice)
              const error = priceError(price, minPrice, t)

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
