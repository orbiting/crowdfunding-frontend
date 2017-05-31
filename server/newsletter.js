const server = require('express').Router()
const bodyParser = require('body-parser')
const fetch = require('isomorphic-unfetch')
const crypto = require('crypto')

const SUBJECT = 'Bitte Interesse an Republik-Mitgliedschaft bestätigen'
const FROM_EMAIL = 'kontakt@republik.ch'
const FROM_NAME = 'Republik'

const subscribeText = (email, token) => `Ma'am, Sir,

Herzlichen Dank für Ihr Interesse!

Gerne kommen wir auf Sie zu, sobald die Anmeldung für neue Mitglieder wieder offen ist.

Sie müssen nur noch auf folgenden Link klicken:
${process.env.PUBLIC_BASE_URL}/newsletter/subscribe?email=${encodeURIComponent(email)}&token=${encodeURIComponent(token)}

Danke!

Die Crew von Project R und der Republik`

const sendEmail = (email, text) => {
  return fetch(`https://mandrillapp.com/api/1.0/messages/send.json`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      key: process.env.MANDRILL_API_KEY,
      message: {
        text,
        subject: SUBJECT,
        from_email: FROM_EMAIL,
        from_name: FROM_NAME,
        to: [ {email} ]
      }
    })
  })
    .then(response => response.json())
    .then(data => {
      // we always only send one email address
      if (!data[0] || data[0].status !== 'sent') {
        return {
          message: 'Anmeldung fehlgeschlagen.'
        }
      }
      return {
        success: true,
        message: 'Bitte bestätigen Sie die E-Mail, die wir Ihnen geschickt haben.'
      }
    })
}

const subscribeEmail = (email) => {
  return fetch(`https://us14.api.mailchimp.com/3.0/lists/${process.env.MAILCHIMP_LIST_ID}/members`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Basic ' + (new Buffer('anystring:' + process.env.MAILCHIMP_API_KEY).toString('base64'))
    },
    body: JSON.stringify({
      email_address: email,
      status: 'subscribed'
    })
  })
    .then(response => response.json())
    .then(data => {
      if (data.status >= 400) {
        if (data.title === 'Member Exists') {
          return {
            message: 'alreadySubscribed'
          }
        }
        return {
          message: 'subscriptionFailed'
        }
      }
      return {}
    })
}

server.get('/newsletter/subscribe', bodyParser.json(), async (req, res) => {
  const {email, token} = req.query
  if (!email) {
    return res.status(422).json({
      message: 'E-Mail fehlt'
    })
  }

  const sha = crypto
    .createHash('sha256')
    .update(email + process.env.SUBSCRIBE_SECRET)
    .digest('hex')

  if (!token) {
    const response = await sendEmail(email, subscribeText(email, sha))
    return res.json(response)
  } else {
    if (sha !== token) {
      return res.redirect(
        `/newsletter/welcome?context=wait&message=invalidRequest`
      )
    }
    const response = await subscribeEmail(email)
    return res.redirect([
      '/newsletter/welcome?context=wait',
      response.message ? `&message=${encodeURIComponent(response.message)}` : ''
    ].join(''))
  }
})

module.exports = server
