import React from 'react'
import withSession from '../../lib/auth/with-session'
import Session from '../../lib/auth/session'

class SignIn extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      email: ''
    }
    this.handleSubmit = this.handleSubmit.bind(this)
    this.handleEmailChange = this.handleEmailChange.bind(this)
  }

  handleEmailChange (event) {
    this.setState({email: event.target.value.trim()})
  }

  async handleSubmit (event) {
    event.preventDefault()

    const session = new Session()
    session.signin(this.state.email)
    .then(() => {
      this.props.url.push('/auth/check-email')
    })
    .catch(err => {
      // @FIXME Handle error
      console.log(err)
    })
  }

  render () {
    let signinForm = <div />
    if (!this.props.session.user) {
      signinForm = (
        <div>
          <form id='signin' method='post' action='/auth/email/signin' onSubmit={this.handleSubmit}>
            <input name='_csrf' type='hidden' value={this.props.session.csrfToken} />
            <h3>Sign in with email</h3>
            <p>
              <label htmlFor='email'>Email address</label><br />
              <input name='email' type='text' id='email' value={this.state.email} onChange={this.handleEmailChange} />
            </p>
            <p>
              <button id='submitButton' type='submit'>Sign in</button>
            </p>
          </form>
        </div>
      )
    }

    return (
      <div>
        <h2>Authentication</h2>
        {signinForm}
      </div>
    )
  }
}

// withSession can only be used on top level components (routes inside the pages directory)
export default withSession(SignIn)
