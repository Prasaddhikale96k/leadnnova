const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false,
  auth: {
    user: 'leadnovaa001@gmail.com',
    pass: 'ebrvkexvzzhdapyu'
  }
});

console.log('Connecting to Gmail...');

transporter.verify()
  .then(() => {
    console.log('SMTP Connected! Sending test email...');
    return transporter.sendMail({
      from: 'LeadNova <leadnovaa001@gmail.com>',
      to: 'leadnovaa001@gmail.com',
      subject: 'Test from LeadNova',
      html: '<p>This is a test email!</p>'
    });
  })
  .then(info => {
    console.log('SUCCESS! Message ID:', info.messageId);
    process.exit(0);
  })
  .catch(err => {
    console.log('FAILED:', err.message);
    process.exit(1);
  });