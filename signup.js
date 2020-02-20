// eslint-disable-next-line import/no-unresolved
const AWS = require('aws-sdk');

const cognitoIdentityServiceProvider = new AWS.CognitoIdentityServiceProvider();

module.exports.handler = async (event) => {
  const body = JSON.parse(event.body);
  const { username, password } = body;
  if (!username || !password) {
    return response(400, 'You must specify the username and password');
  }

  return cognitoIdentityServiceProvider.signUp({
    Username: username,
    Password: password,
    ClientId: process.env.COGNITO_CLIENT_ID,
  }).promise().then(() => response(200, 'Signed up successfully, please check your email'))
    .catch((error) => response(error.statusCode, error.message));
};

const response = (responseCode, message) => ({
  statusCode: responseCode,
  body: JSON.stringify(
    {
      message,
    },
    null,
    2,
  ),
});
