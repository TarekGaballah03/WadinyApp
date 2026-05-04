// src/utils/sendEmail.js
import nodemailer from "nodemailer";

export const sendEmail = async ({ to, subject, html, attachments = [] }) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.email,
      pass: process.env.password,
    },
  });

  const info = await transporter.sendMail({
    from: `"Wadiny App" <${process.env.email}>`,
    to: to,
    subject: subject,
    html: html,
    attachments: attachments,
  });

  return info;
};

export const html = ({ otp, message } = {}) => {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; background-color: #f4f4f4; margin: 0; padding: 0; }
        .container { max-width: 500px; margin: 50px auto; background: white; padding: 20px; border-radius: 10px; text-align: center; }
        .otp { font-size: 32px; font-weight: bold; color: #2B86ED; letter-spacing: 5px; }
        .message { font-size: 18px; margin-bottom: 20px; }
      </style>
    </head>
    <body>
      <div class="container">
        <h1 style="color: #2B86ED;">Wedeny</h1>
        <p class="message">${message}</p>
        <div class="otp">${otp}</div>
        <p style="margin-top: 20px; color: #777;">This code expires in 10 minutes</p>
      </div>
    </body>
    </html>
  `;
};