import nodemailer from "nodemailer";

export const sendEmail = async ({ to, subject, html, attachments = [] }) => {
  try {
    console.log(`📧 Preparing to send email to: ${to}`);
    
    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 587,
      family: 4,
      secure: false, 
      auth: {
        user: process.env.email,
        pass: process.env.password,
      },
      tls: {
        rejectUnauthorized: false,
        ciphers: "SSLv3",
      },
      requireTLS: true,
      connectionTimeout: 10000,
    });

    const info = await transporter.sendMail({
      from: `"Wadiny App" <${process.env.email}>`,
      to: to,
      subject: subject,
      html: html,
      attachments: attachments,
    });
    
    console.log("✅ Email sent successfully:", info.messageId);
    return info;
  } catch (error) {
    console.error("❌ Email sending failed:", error.message);
    throw error;
  }
};

export const html = ({ otp, message } = {}) => {
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Wadiny - Email Verification</title>
      <style>
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
          background: #f0f4f8;
          margin: 0;
          padding: 40px 20px;
          line-height: 1.6;
        }
        
        .email-wrapper {
          max-width: 520px;
          margin: 0 auto;
          background: #ffffff;
          border-radius: 20px;
          overflow: hidden;
          box-shadow: 0 12px 35px rgba(0, 0, 0, 0.08);
        }
        
        /* Header Section */
        .email-header {
          background: #2B86ED;
          padding: 32px 24px;
          text-align: center;
        }
        
        .logo {
          font-size: 32px;
          font-weight: 700;
          color: #ffffff;
          letter-spacing: 1px;
          margin-bottom: 4px;
        }
        
        .logo-sub {
          font-size: 12px;
          color: rgba(255, 255, 255, 0.8);
          letter-spacing: 2px;
        }
        
        /* Content Section */
        .email-content {
          padding: 32px 28px;
          background: #ffffff;
        }
        
        .greeting {
          font-size: 22px;
          font-weight: 600;
          color: #1a2a4f;
          margin-bottom: 12px;
          text-align: center;
        }
        
        .message {
          font-size: 15px;
          color: #4a5568;
          text-align: center;
          margin-bottom: 28px;
          line-height: 1.6;
        }
        
        /* OTP Box */
        .otp-container {
          background: #f5f9ff;
          border-radius: 16px;
          padding: 24px 16px;
          text-align: center;
          margin: 24px 0;
          border: 1px solid #e2edf7;
        }
        
        .otp-label {
          font-size: 11px;
          text-transform: uppercase;
          letter-spacing: 3px;
          color: #2B86ED;
          font-weight: 600;
          margin-bottom: 12px;
        }
        
        .otp-code {
          font-size: 42px;
          font-weight: 700;
          letter-spacing: 10px;
          color: #2B86ED;
          font-family: 'Courier New', monospace;
          background: #ffffff;
          display: inline-block;
          padding: 12px 20px;
          border-radius: 12px;
          border: 1px solid #dce7f5;
        }
        
        .expiry-note {
          font-size: 12px;
          color: #8892a0;
          margin-top: 12px;
        }
        
        /* Info Box */
        .info-box {
          background: #f8fafc;
          border-radius: 12px;
          padding: 16px;
          margin: 20px 0;
          border-left: 3px solid #2B86ED;
        }
        
        .info-text {
          font-size: 13px;
          color: #4a5568;
          line-height: 1.5;
        }
        
        /* Divider */
        .divider {
          text-align: center;
          margin: 24px 0 16px;
          position: relative;
        }
        
        .divider::before {
          content: '';
          position: absolute;
          top: 50%;
          left: 0;
          right: 0;
          height: 1px;
          background: #e2e8f0;
        }
        
        .divider span {
          background: #ffffff;
          padding: 0 12px;
          position: relative;
          font-size: 11px;
          color: #94a3b8;
          text-transform: uppercase;
        }
        
        /* Footer */
        .email-footer {
          background: #f8fafc;
          padding: 20px 28px;
          text-align: center;
          border-top: 1px solid #e2e8f0;
        }
        
        .footer-text {
          font-size: 11px;
          color: #64748b;
          margin-bottom: 8px;
        }
        
        .copyright {
          font-size: 10px;
          color: #94a3b8;
          margin-top: 8px;
        }
        
        @media (max-width: 560px) {
          .email-wrapper {
            border-radius: 16px;
          }
          
          .email-content {
            padding: 24px 20px;
          }
          
          .otp-code {
            font-size: 34px;
            letter-spacing: 6px;
            padding: 10px 16px;
          }
          
          .logo {
            font-size: 28px;
          }
        }
      </style>
    </head>
    <body>
      <div class="email-wrapper">
        <div class="email-header">
          <div class="logo">Wadiny</div>
          <div class="logo-sub">Discover the best places</div>
        </div>
        
        <div class="email-content">
          <h1 class="greeting">Verify Your Email</h1>
          
          <p class="message">
            ${message || "Thanks for joining Wadiny! Please use the verification code below to complete your registration."}
          </p>
          
          <div class="otp-container">
            <div class="otp-label">Verification Code</div>
            <div class="otp-code">${otp}</div>
            <div class="expiry-note">This code expires in 10 minutes</div>
          </div>
          
          <div class="info-box">
            <div class="info-text">
              <strong>Why verify?</strong> Email verification helps secure your account and unlocks all features of Wadiny.
            </div>
          </div>
          
          <div class="divider">
            <span>Need assistance?</span>
          </div>
          
          <div class="info-box" style="background: #fff8eb; border-left-color: #f59e0b;">
            <div class="info-text">
              <strong>Didn't receive the code?</strong> Check your spam folder or click "Resend Code" on the verification page.
            </div>
          </div>
        </div>
        
        <div class="email-footer">
          <p class="footer-text">
            This email was sent to you as a registered user of Wadiny.
          </p>
          <p class="copyright">
            © 2024 Wadiny. All rights reserved.
          </p>
        </div>
      </div>
    </body>
    </html>
  `;
};