// src/utils/sendEmail.events/index.js
import EventEmitter from "events";
import { sendEmail, html } from "../sendEmail.js";  // ← واحد بس ../ عشان تطلع من events لـ utils
import { userModel } from "../../DB/models/user.model.js";
import { Hash } from "../encryption/hash.js";

export const eventEmitter = new EventEmitter();

// send email confirmation event
eventEmitter.on("sendEmailConfirmation", async ({ email, id }) => {
  const otp = Math.floor(1000 + Math.random() * 9000).toString();
  const hashOtp = await Hash({ key: otp, SALT_ROUNDS: 10 });

  await userModel.findByIdAndUpdate(id, { otpEmail: hashOtp });

  await sendEmail({
    to: email,
    subject: "Confirm your email - Wedeny",
    html: html({ otp, message: "Please confirm your email" }),
  });
});

// forget password event
eventEmitter.on("forgetPassword", async ({ email }) => {
  const otp = Math.floor(1000 + Math.random() * 9000).toString();
  const hashOtp = await Hash({ key: otp, SALT_ROUNDS: 10 });

  await userModel.updateOne({ email }, { otpPassword: hashOtp });

  await sendEmail({
    to: email,
    subject: "Reset your password - Wedeny",
    html: html({ otp, message: "Reset your password" }),
  });
});

// confirm new email event
eventEmitter.on("confirmNewEmail", async ({ email, id }) => {
  const otp = Math.floor(1000 + Math.random() * 9000).toString();
  const hashOtp = await Hash({ key: otp, SALT_ROUNDS: 10 });

  await userModel.findByIdAndUpdate(id, { otpNewEmail: hashOtp });

  await sendEmail({
    to: email,
    subject: "Confirm your new email - Wedeny",
    html: html({ otp, message: "Please confirm your new email" }),
  });
});