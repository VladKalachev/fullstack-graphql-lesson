import nodemailer from 'nodemailer';

export async function sendEmail(to: string, html: string) {
  let testAccount = await nodemailer.createTestAccount();
    console.log("testAccount", testAccount);
  let transporter = nodemailer.createTransport({
    host: "smtp.ethereal.email",
    port: 587,
    secure: false, // true for 465, false for other ports
    auth: {
      user: 'peikqqrcckalkxfp@ethereal.email', // generated ethereal user
      pass: 'USZjyreR4YEfjYv3u2', // generated ethereal password
    },
  });

  let info = await transporter.sendMail({
    from: '"Fred Foo 👻" <foo@example.com>', // sender address
    to, // list of receivers
    subject: "Change password", // Subject line
    html, // plain text body
  });

  console.log("Message sent: %s", info.messageId);
  console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
}