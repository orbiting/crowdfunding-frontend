import React, {Component} from 'react'
import {css} from 'glamor'
import Router from 'next/router'

import {
  Button, Field,
  P,
  colors
} from '@project-r/styleguide'

const styles = {
  packageHeader: css({
  }),
  packageTitle: css({
    color: colors.primary,
    marginTop: 5
  }),
  packagePrice: css({
    fontSize: 20
  }),
  package: css({
    fontFamily: 'sans-serif',
    paddingTop: 10,
    paddingBottom: 10,
    borderBottom: `1px solid ${colors.primary}`
  }),
  packageContent: css({
    '& p': {
      lineHeight: 1.3,
      fontWeight: 300
    }
  })
}

const Packages = [
  {
    minAmount: 1,
    defaultAmount: 10,
    price: 'ab 10.-',
    title: 'Einfach Spenden',
    content: (
      <div>
        <p>Sie wollen werder Mitglied werden, noch Mitgliedschaften verschenken, noch sonst irgendwas? Auch keines unserer wunderschönen Plakate? Aber Sie wollen uns trotzdem unterstützen, das ist grossartig! Wir freuen uns sehr!</p>
      </div>
    )
  },
  {
    minAmount: 70,
    price: '70.-',
    title: 'Spende und du erhältst ein Manifest-Poster',
    content: (
      <div>
        <p>Na, haben wir dich Sie überzeugt Mitglied zu werden? Dann ist dieses paket genau richtig für Sie!</p>
      </div>
    )
  },
  {
    minAmount: 240,
    price: '240.-',
    title: 'Mitgliedschaft für ein Jahr',
    content: (
      <div>
        <p>Na, haben wir Sie überzeugt Mitglied zu werden? Dann ist dieses paket genau richtig für Sie!</p>
      </div>
    )
  },
  {
    minAmount: 240,
    price: 'ab 240.-',
    title: 'Mitgliedschaft zum Verschenken',
    content: (
      <div>
        <p>Sehr grosszügig. Sie können so viele Mitgliedschaften verschenken wie Sie wollen. Wir senden pro Mitgliedschaft eine Postkarte mit einem Gutschein an die Adressen Ihrer Wahl! Auch werden Sie eine Mail mir diesen Gutschein-Codes erhalten, die Sie Ihren Liebsten so schicken können, wie Sie wollen.</p>
        <p>Wenn Sie etwas haptisch dazu verschenken wollen, können Sie unsere sehr tollen Moleskin dazu erwerben!</p>
      </div>
    ),
    fields: [
      {
        label: 'Anzahl Mitgliedschaften',
        name: 'memberships',
        type: 'number',
        default: 1,
        onChange: (value, state) => {
          if (value < 1) {
            return
          }
          const minAmount = (+value) * 240
          const prevMinAmount = (+state.memberships + 1) * 240
          return {
            minAmount,
            amount: (
              state.amount === prevMinAmount
                ? minAmount
                : Math.max(minAmount, state.amount)
            ),
            memberships: value
          }
        }
      },
      {
        label: 'Anzahl Moleskins',
        name: 'memberships',
        type: 'number',
        default: 1,
        onChange: (value, state) => {
          if (value < 1) {
            return
          }
          const minAmount = (+value + 1) * 240
          const prevMinAmount = (+state.memberships + 1) * 240
          return {
            minAmount,
            amount: (
              state.amount === prevMinAmount
                ? minAmount
                : Math.max(minAmount, state.amount)
            ),
            memberships: value
          }
        }
      }
    ]
  },
  {
    minAmount: 1000,
    price: 'ab 1000.-',
    title: 'Gönnermitgliedschaft',
    content: (
      <div>
        <p>Na, haben wir Sie überzeugt Mitglied zu werden? Und Sie haben viel Geld? Dann ist dieses paket genau richtig für Sie!</p>
        <p>Unser super cooles Goodie für Sie: Sie dürfen ein Wort Ihrer Wahl ngeben und unsere Autor*innen müssen dieses Wort in einem von Republik publiziertem Text verwenden - machen Sie es uns nicht zu leicht!</p>
      </div>
    )
  }
]

class Accordion extends Component {
  constructor (props) {
    super(props)
    this.state = {
      activeIndex: 2,
      selectedIndex: undefined
    }
  }
  render () {
    const {
      activeIndex,
      selectedIndex
    } = this.state

    return (
      <div className='ui styled fluid accordion'>
        {
          Packages.map((pkg, i) => {
            const isSelected = selectedIndex === i
            const isActive = isSelected || activeIndex === i
            const fields = pkg.fields || []
            return (
              <div key={i} {...styles.package}
                style={{
                  cursor: isSelected ? 'default' : 'pointer'
                }}
                onMouseOver={() => this.setState({activeIndex: i})}
                onClick={() => {
                  if (isSelected) {
                    return
                  }
                  const nextState = {
                    selectedIndex: i,
                    minAmount: pkg.minAmount,
                    amount: pkg.defaultAmount || pkg.minAmount
                  }

                  fields.forEach(field => {
                    nextState[field.name] = field.default
                  })
                  this.setState(nextState)
                }}>
                <div {...styles.packageHeader}>
                  <div {...styles.packagePrice}>{pkg.price}</div>
                  <div {...styles.packageTitle}>{pkg.title}</div>
                </div>
                <div {...styles.packageContent}
                  style={{display: isActive ? 'block' : 'none'}}>
                  {pkg.content}
                  {isSelected && (
                    <div style={{marginTop: 20}}>
                      {fields.map((field, i) => (
                        <P key={i}>
                          <Field
                            label={field.label}
                            type={field.type}
                            value={this.state[field.name]}
                            onChange={(event) => {
                              const value = event.target.value
                              const nextState = field.onChange
                                ? field.onChange(value, this.state)
                                : {[field.name]: value}
                              this.setState(nextState)
                            }}
                            />
                        </P>
                      ))}
                      <P>
                        <Field
                          label='Betrag'
                          type='number'
                          value={this.state.amount}
                          onChange={(event) => {
                            this.setState({amount: event.target.value})
                          }} />
                      </P>
                      <Button
                        onClick={() => {
                          const params = {amount: this.state.amount, package: pkg.title}

                          fields.forEach(field => {
                            params[field.name] = this.state[field.name]
                          })
                          Router.push({
                            pathname: '/pledge',
                            query: params
                          }).then(() => window.scrollTo(0, 0))
                        }}>
                        Weiter
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            )
          })
        }
      </div>
    )
  }
}

export default Accordion
