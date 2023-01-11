const { sendEmail } = require("./sendEmail");

const sendResetPasswordEmail = async ({
  name,
  email,
  passwordToken,
  origin,
}) => {
  const forgotPasswordUrl = `${origin}/reset-password?token=${passwordToken}&email=${email}`;

  const message = `<p>Please reset password by clicking on the following link: <a href='${forgotPasswordUrl}'>Reset Password</a></p>`;

  const html = `<h4>Hello, ${name}</h4> ${message}`;

  return sendEmail({ to: email, subject: "Joblink Reset Password", html });
};

module.exports = { sendResetPasswordEmail };
