const { Resend } = require('resend');

const resendApiKey = process.env.EMAIL_API_KEY;
const resend = resendApiKey ? new Resend(resendApiKey) : null;

async function sendAccountEmail({ to, subject, html, text }) {
  if (!resend) {
    throw new Error('EMAIL_API_KEY is not configured. Set it in .env before sending emails.');
  }

  const result = await resend.emails.send({
    from: process.env.EMAIL_FROM || 'noreply@example.com',
    to,
    subject,
    html,
    text,
  });

  return result;
}

async function sendPasswordResetEmail({ to, resetLink }) {
  return sendAccountEmail({
    to,
    subject: 'Reset your password',
    text: `Use the following link to reset your password: ${resetLink}`,
    html: `<p>Use the following link to reset your password:</p><p><a href="${resetLink}">${resetLink}</a></p>`,
  });
}

async function sendVerificationEmail({ to, verificationLink }) {
  return sendAccountEmail({
    to,
    subject: 'Verify your account',
    text: `Verify your email here: ${verificationLink}`,
    html: `<p>Verify your email here:</p><p><a href="${verificationLink}">${verificationLink}</a></p>`,
  });
}

module.exports = {
  sendAccountEmail,
  sendPasswordResetEmail,
  sendVerificationEmail,
};
