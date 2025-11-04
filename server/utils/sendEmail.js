import nodemailer from "nodemailer";

const sendEmail = async (to, subject, htmlContent) => {
  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const emailHTML = `
      <div style="font-family: 'Segoe UI', sans-serif; background: #f6f8fb; padding: 20px;">
        <table align="center" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px; background: #fff; border-radius: 12px; overflow: hidden; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
          <tr>
            <td style="background: linear-gradient(90deg, #2563eb, #f97316); padding: 20px 0; text-align: center;">
              <h1 style="color: white; font-size: 28px; margin: 0;">Pass<span style="color: #FFD580;">iify</span></h1>
              <p style="color: #e0f2ff; margin: 0; font-size: 14px;">Your Fitness, Your Way — Anytime, Anywhere</p>
            </td>
          </tr>
          <tr>
            <td style="padding: 30px 25px;">
              ${htmlContent}
            </td>
          </tr>
          <tr>
            <td style="background: #f1f5f9; text-align: center; padding: 20px; font-size: 12px; color: #64748b;">
              <p>© ${new Date().getFullYear()} <strong>Passiify</strong>. All rights reserved.</p>
              <p>India’s #1 One-Day Fitness Pass Platform</p>
            </td>
          </tr>
        </table>
      </div>
    `;

    await transporter.sendMail({
      from: `"Passiify Support" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html: emailHTML,
    });

    console.log(`✅ Email sent to ${to}`);
  } catch (error) {
    console.error("❌ Error sending email:", error);
    throw new Error("Email could not be sent");
  }
};

export default sendEmail;
