import nodemailer from "nodemailer";
import userVerification from "../template/verifyEmailTemplate";
import { IUser } from "../../@types/interfaces";

const sendEmailVerification = async function (receiver: IUser, token: string) {
  try {
    const email = process.env.EMAIL;
    const password = process.env.EMAIL_PASSWORD;
    const transport = nodemailer.createTransport({
      service: "gmail",
      host: "smtp.gmail.com",
      port: 465,
      secure: true,
      auth: {
        user: email,
        pass: password,
      },
    });

    const mailOptions = {
      from: {
        name: "AcadPulse",
        address: email,
      },
      to: [receiver.email],
      subject: "Email Verification (Intel",
      text: "",
      html: userVerification(receiver.firstname, token),
    };

    // @ts-expect-error
    const info = await transport.sendMail(mailOptions);
    console.log("Email sent successfully");
  } catch (error) {
    console.error("Failed to send email", error);
  }
};

export default sendEmailVerification;
