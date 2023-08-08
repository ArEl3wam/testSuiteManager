import nodemailer from "nodemailer";

const sendEmail = async (options: {
  to: string;
  subject: string;
  text: string;
}) => {
  const transporter = nodemailer.createTransport({
    service: "Gmail",
    auth: {
      user: process.env.EMAIL_USERNAME,
      pass: process.env.EMAIL_PASSWORD,
    },
  });

  const mailOptions = {
    from: "Visualizer <visulaizer.noreply@gmail.com>",
    ...options,
  };

  await transporter.sendMail(mailOptions);
};

export default sendEmail;
