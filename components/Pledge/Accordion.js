import React, {Component, PropTypes} from 'react'
import {css, merge} from 'glamor'
import {gql, graphql} from 'react-apollo'
import withT from '../../lib/withT'

import {
  Field,
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
        package: pkg.name
      }
      if (userPrice) {
        params.userPrice = '1'
      }

      this.props.onSelect(
        params
      )
    }

    const {t, crowdfunding: {packages}, extended} = this.props

    return (
      <div>
        {
          packages.map((pkg, i) => {
            const isSelected = selectedIndex === i
            const isActive = extended || isSelected || activeIndex === i
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
                  return select(pkg)
                }}>
                <div {...styles.packageHeader}>
                  <div {...styles.packageTitle}>{t(`package/${pkg.name}/title`)}</div>
                  {!!price && (<div {...styles.packagePrice}>
                    {`CHF ${price / 100}`}
                  </div>)}
                </div>
                <div {...styles.packageContent}
                  style={{
                    display: isActive ? 'block' : 'none'
                  }}>
                  <p>{t(`package/${pkg.name}/description`)}</p>
                  {hasOptions && <div style={{marginTop: -10, marginBottom: 20}}>
                    <Grid>
                      {configurableOptions.map((option, i) => (
                        <Span s='1/2' m='9/18' key={i}>
                          <Field
                            label={t(`option/${option.reward.name}/label`, undefined, option.reward.name)}
                            value={''}
                            onChange={() => {
                              // no-op
                              // can only be changed on pledge page
                            }}
                            />
                        </Span>
                      ))}
                    </Grid>
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
            <em>{t('package/ABO/userPrice/teaser')}</em>
          </a>
        </P>
      </div>
    )
  }
}

Accordion.propTypes = {
  t: PropTypes.func.isRequired,
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

export default withT(AccordionWithQuery)
