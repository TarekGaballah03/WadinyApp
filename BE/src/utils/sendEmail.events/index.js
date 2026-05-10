import EventEmitter from "events";
import { sendEmail, html } from "../sendEmail.js"; 
import { userModel } from "../../DB/models/user.model.js";
import { Hash } from "../encryption/hash.js";

export const eventEmitter = new EventEmitter();

// ==================== 1. Send Email Confirmation Event ====================
eventEmitter.on("sendEmailConfirmation", async ({ email, id }) => {
  try {
    const otp = Math.floor(1000 + Math.random() * 9000).toString();
    const hashOtp = await Hash({ key: otp, SALT_ROUNDS: 10 });

    await userModel.findByIdAndUpdate(id, { otpEmail: hashOtp });

    await sendEmail({
      to: email,
      subject: "Confirm your email - Wedeny",
      html: html({ otp, message: "Please confirm your email" }),
    });
    console.log(`Confirmation email sent to: ${email}`);
  } catch (error) {
    console.error("Error in sendEmailConfirmation event:", error.message);
  }
});

// ==================== 2. Forget Password Event ====================
eventEmitter.on("forgetPassword", async ({ email }) => {
  try {
    const otp = Math.floor(1000 + Math.random() * 9000).toString();
    const hashOtp = await Hash({ key: otp, SALT_ROUNDS: 10 });

    await userModel.updateOne({ email }, { otpPassword: hashOtp });

    await sendEmail({
      to: email,
      subject: "Reset your password - Wedeny",
      html: html({ otp, message: "Reset your password" }),
    });
    console.log(`Reset password email sent to: ${email}`);
  } catch (error) {
    console.error("Error in forgetPassword event:", error.message);
  }
});

// ==================== 3. Confirm New Email Event ====================
eventEmitter.on("confirmNewEmail", async ({ email, id }) => {
  try {
    const otp = Math.floor(1000 + Math.random() * 9000).toString();
    const hashOtp = await Hash({ key: otp, SALT_ROUNDS: 10 });

    await userModel.findByIdAndUpdate(id, { otpNewEmail: hashOtp });

    await sendEmail({
      to: email,
      subject: "Confirm your new email - Wedeny",
      html: html({ otp, message: "Please confirm your new email" }),
    });
    console.log(`New email confirmation sent to: ${email}`);
  } catch (error) {
    console.error("Error in confirmNewEmail event:", error.message);
  }
});