import * as nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  service: '',
  auth: {
    user: '',
    pass: '',
  },
});
