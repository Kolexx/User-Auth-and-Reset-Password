const mailgun = require("mailgun-js");
const { MAILGUN_API_KEY, MAILGUN_DOMAIN, SENDER_EMAIL } = process.env;
const mg = mailgun({
  apiKey: MAILGUN_API_KEY,
  domain: MAILGUN_DOMAIN,
  retry: 3,
});

module.exports = async (email, subject, text) => {
  try {
    const data = {
      from: `${SENDER_EMAIL}`,
      to: email,
      subject,
      text,
    };
    mg.messages().send(data, function (error, body) {
      console.log(body);
    });
    console.log("Emaill sent Succesfully");
  } catch (error) {
    console.log("Email not sent ", error);
  }
};
