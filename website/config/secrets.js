module.exports = {
  db: 'localhost',

  localAuth: true,
  sessionSecret: "Your Session Secret goes here",

  mailgun: {
    login: 'Your Mailgun SMTP Username',
    password: 'Your Mailgun SMTP Password'
  },

  sendgrid: {
    user: 'Your SendGrid Username',
    password: 'Your SendGrid Password'
  },

  gmail: {
    user: 'Your Gmail Username',
    password: 'Your Gmail Password'
  },

  nyt: {
    key: 'Your New York Times API Key'
  },

  lastfm: {
    api_key: 'Your API Key',
    secret: 'Your API Secret'
  },

  facebookAuth: true,
  facebook: {
    clientID: 'Your App ID',
    clientSecret: 'Your App Secret',
    callbackURL: '/auth/facebook/callback',
    passReqToCallback: true
  },

  githubAuth: true,
  github: {
    clientID: 'Your Client ID',
    clientSecret: 'Your Client Secret',
    callbackURL: '/auth/github/callback',
    passReqToCallback: true
  },

  twitterAuth: true,
  twitter: {
    consumerKey: 'Your Consumer Key',
    consumerSecret: 'Your Consumer Secret',
    callbackURL: '/auth/twitter/callback',
    passReqToCallback: true
  },

  googleAuth: true,
  google: {
    clientID: 'Your Client ID',
    clientSecret: 'Your Client Secret',
    callbackURL: '/auth/google/callback',
    passReqToCallback: true
  },

  steam: {
    apiKey: 'Your Steam API Key'
  },

  twilio: {
    sid: 'Your Account SID',
    token: 'Your Auth Token'
  },

  tumblr: {
    consumerKey: 'Your Consumer Key',
    consumerSecret: 'Your Consumer Secret',
    callbackURL: '/auth/tumblr/callback'
  },

  foursquare: {
    clientId: 'Your Client ID',
    clientSecret: 'Your Client Secret',
    redirectUrl: 'http://localhost:3000/auth/foursquare/callback'
  },

  venmo: {
    clientId: 'Your Venmo Client ID',
    clientSecret: 'Your Venmo Client Secret',
    redirectUrl: 'http://localhost:3000/auth/venmo/callback'
  },

  paypal: {
    host: 'api.sandbox.paypal.com', // or api.paypal.com
    client_id: 'Your Client ID',
    client_secret: 'Your Client Secret',
    returnUrl: 'http://localhost:3000/api/paypal/success',
    cancelUrl: 'http://localhost:3000/api/paypal/cancel'
  }
};
