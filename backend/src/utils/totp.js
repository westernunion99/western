const speakeasy = require('speakeasy');
const qrcode = require('qrcode');

async function generateTOTPSecret({ name, email }) {
  const secret = speakeasy.generateSecret({
    name: `${name} (${email})`,
    length: 20
  });
  const otpauth = secret.otpauth_url;
  const qrDataUrl = await qrcode.toDataURL(otpauth);
  return {
    base32: secret.base32,
    otpauth,
    qrDataUrl
  };
}

function verifyTOTP(token, secret) {
  return speakeasy.totp.verify({
    secret,
    encoding: 'base32',
    token,
    window: 1
  });
}

module.exports = { generateTOTPSecret, verifyTOTP };
