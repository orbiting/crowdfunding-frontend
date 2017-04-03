import React, {Component, PropTypes} from 'react'
import {css, merge} from 'glamor'
import {gql, graphql} from 'react-apollo'

import {
  Button, Field,
  Grid, Span, P,
  colors
} from '@project-r/styleguide'

const styles = {
  packageHeader: css({
  }),
  packageTitle: css({
    fontSize: 22,
    lineHeight: '28px'
  }),
  packagePrice: css({
    marginTop: 10,
    color: colors.primary,
    lineHeight: '28px',
    fontSize: 22
  }),
  userPriceLink: css({
    textDecoration: 'none',
    cursor: 'pointer',
    color: colors.text,
    ':visited': {
      color: colors.text
    },
    ':hover': {
      color: '#ccc'
    }
  }),
  package: css({
    marginTop: -1,
    fontFamily: 'sans-serif',
    paddingTop: 15,
    paddingBottom: 15,
    borderBottom: `1px solid ${colors.disabled}`,
    borderTop: `1px solid ${colors.disabled}`
  }),
  packageHighlighted: css({
    position: 'relative',
    zIndex: 1,
    marginBottom: -1,
    marginLeft: -10,
    marginRight: -10,
    paddingLeft: 10,
    paddingRight: 10,
    width: 'calc(100% + 20px)',
    backgroundColor: '#EBF6E5',
    borderBottom: 'none',
    borderTop: 'none'
  }),
  packageContent: css({
    '& p': {
      lineHeight: 1.3,
      fontWeight: 300
    }
  })
}

const MESSAGES = {
  'package/DONATE/title': 'Spenden – sonst nichts',
  'package/DONATE/description': 'Sie wollen hervorragenden Journalismus unterstützen, ohne ihn zu lesen. Aber mit Geld. Denn Sie wissen: ohne Geld läuft nichts, nicht einmal die Ratten in den Lagerschuppen.',
  'package/POSTER/title': 'Das Manifest',
  'package/POSTER/description': 'Sie sind vorsichtig und entscheiden sich statt dem Produkt für den Bauplan des Produkts. Diesen erhalten Sie prächtig in A3, ein Schmuck für jede Wand. Aber Achtung: Das Magazin erhalten Sie dafür noch nicht.',
  'package/ABO/title': 'Abonnement für ein Jahr',
  'package/ABO/description': 'Willkommen an Bord! Sie erhalten für ein Jahr unser Magazin. Und werden zu einem kleinen Teil Mitbesitzerin.',
  'package/ABO_GIVE/title': 'Abonnements verschenken',
  'package/ABO_GIVE/description': 'Sie wollen Ihren Freunden oder Feinden das heisseste Magazin für ein Jahr schenken. Und haben die Gelegenheit, diesen zusätzlich für X Franken ein Notizbuch dazu zu schenken – damit diese nicht nur Cleveres lesen, sondern auch schreiben können.',
  'package/BENEFACTOR/title': 'Gönner Abonnement',
  'package/BENEFACTOR/description': 'Sie wollen nicht nur ein unabhängiges Magazin lesen, sondern Sie wollen sich auch nachhaltig dafür ein setzten, dass dieses existiert. Und fördern ein neues Modell für Journalismus mit dem nachdrücklichsten Argument, das möglich ist: mit Geld.',
  'option/ABO/label': 'Mitgliedschaften',
  'option/NOTEBOOK/label': 'Notizbuch'
}

const query = gql`
{
  crowdfunding(name: "REPUBLIK") {
    id
    name
    packages {
      id
      name
      options {
        id
        price
        userPrice
        minAmount
        maxAmount
        defaultAmount
        reward {
          ... on MembershipType {
            id
            name
          }
          ... on Goodie {
            id
            name
          }
        }
      }
    }
  }
}
`

const calculateMinAmount = (pkg, state) => {
  return Math.max(pkg.options.reduce(
    (amount, option) => amount + (option.userPrice
      ? 0
      : (option.price * (state[option.id] !== undefined ? state[option.id] : option.minAmount))
    ),
    0
  ), 100)
}

class Accordion extends Component {
  constructor (props) {
    super(props)
    this.state = {
      activeIndex: undefined,
      selectedIndex: undefined
    }
  }
  render () {
    if (this.props.loading) {
      return <P>…</P>
    }
    if (this.props.error) {
      return <P>{this.props.error.toString()}</P>
    }

    const {
      activeIndex,
      selectedIndex
    } = this.state

    const select = (pkg, userPrice) => {
      const params = {
        package: pkg.name,
        packageName: MESSAGES[`package/${pkg.name}/title`],
        // todo simplify:
        // we should be able to only transmit option id + amount
        pledgeOptions: JSON.stringify(
          pkg.options.map(option => ({
            amount: this.state[option.id] || option.defaultAmount,
            price: option.price,
            id: option.id,
            configurable: option.minAmount !== option.maxAmount,
            name: option.reward && MESSAGES[`option/${option.reward.name}/label`]
          }))
        )
      }
      if (userPrice) {
        params.userPrice = '1'
      } else {
        params.amount = this.state.amount || pkg.options.reduce(
          (amount, option) => amount + option.price * option.minAmount,
          0
        )
      }

      this.props.onSelect(
        params
      )
    }

    const {crowdfunding: {packages}} = this.props

    return (
      <div>
        {
          packages.map((pkg, i) => {
            const isSelected = selectedIndex === i
            const isActive = isSelected || activeIndex === i
            const configurableOptions = pkg.options.filter(option => (
              option.minAmount !== option.maxAmount
            ))
            const hasOptions = !!configurableOptions.length

            const price = pkg.options.reduce(
              (amount, option) => amount + option.price * option.minAmount,
              0
            )

            const packageStyle = merge(
              styles.package,
              pkg.name === 'ABO' && styles.packageHighlighted
            )

            return (
              <div key={i} {...packageStyle}
                style={{
                  cursor: isSelected ? 'default' : 'pointer'
                }}
                onMouseOver={() => this.setState({
                  activeIndex: i
                })}
                onMouseOut={() => this.setState({
                  activeIndex: undefined
                })}
                onClick={() => {
                  if (!hasOptions) {
                    return select(pkg)
                  }
                  if (isSelected) {
                    return
                  }

                  const nextState = {
                    selectedIndex: i,
                    amount: pkg.options.reduce(
                      (amount, option) => amount + option.price * option.defaultAmount,
                      0
                    )
                  }

                  configurableOptions.forEach(option => {
                    nextState[option.id] = option.defaultAmount
                  })
                  this.setState(nextState)
                }}>
                <div {...styles.packageHeader}>
                  <div {...styles.packageTitle}>{MESSAGES[`package/${pkg.name}/title`]}</div>
                  {!!price && (<div {...styles.packagePrice}>
                    {`CHF ${price / 100}`}
                  </div>)}
                </div>
                <div {...styles.packageContent}
                  style={{
                    display: isActive ? 'block' : 'none'
                  }}>
                  <p>{MESSAGES[`package/${pkg.name}/description`]}</p>
                  {hasOptions && <div style={{marginTop: 20}}>
                    <Grid>
                      {configurableOptions.map((option, i) => (
                        <Span s='1/2' m='9/18' key={i}>
                          <Field
                            label={MESSAGES[`option/${option.reward.name}/label`] || option.reward.name}
                            type='number'
                            value={this.state[option.id]}
                            onChange={(event) => {
                              const value = event.target.value
                              if (value > option.maxAmount || value < option.minAmount) {
                                return
                              }
                              this.setState((state) => {
                                const nextState = {
                                  [option.id]: value
                                }
                                const minAmount = calculateMinAmount(pkg, {
                                  ...state,
                                  ...nextState
                                })
                                if (!state.amountCustom || minAmount > state.amount) {
                                  nextState.amount = minAmount
                                  nextState.amountCustom = false
                                }
                                return nextState
                              })
                            }}
                            />
                        </Span>
                      ))}
                      <Span s='1/2' m='9/18'>
                        <Field
                          label='Betrag'
                          type='number'
                          value={this.state.amount / 100}
                          onChange={(event) => {
                            this.setState({
                              amount: event.target.value * 100,
                              amountCustom: true
                            })
                          }} />
                      </Span>
                    </Grid>
                    <br /><br />
                    <Button
                      disabled={!isSelected}
                      onClick={() => select(pkg)}>
                      Weiter
                    </Button>
                  </div>}
                </div>
              </div>
            )
          })
        }
        <P style={{marginTop: 20}}>
          <a {...styles.userPriceLink} onClick={(e) => {
            e.preventDefault()
            select(
              packages.find(pkg => pkg.name === 'ABO'),
              true
            )
          }}>
            <em>Sie können sich kein Abonnement leisten?</em>
          </a>
        </P>
      </div>
    )
  }
}

Accordion.propTypes = {
  onSelect: PropTypes.func.isRequired
}

const AccordionWithQuery = graphql(query, {
  props: ({ data }) => {
    return {
      loading: data.loading,
      error: data.error,
      crowdfunding: data.crowdfunding
    }
  }
})(Accordion)

export default AccordionWithQuery
