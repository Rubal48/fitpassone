import nodemailer from "nodemailer";
import PDFDocument from "pdfkit";
import { Buffer } from "buffer";

/* -------------------------------------------------------------------------- */
/* 🧾 Generate Booking Ticket PDF (same design, premium style)                 */
/* -------------------------------------------------------------------------- */
const generateBookingPDF = (bookingData) => {
  const { gymName, city, date, bookingCode, price } = bookingData;
  const formattedDate = new Date(date).toLocaleDateString("en-IN", {
    weekday: "long",
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  const doc = new PDFDocument({ size: "A4", margin: 50 });
  const buffers = [];
  doc.on("data", buffers.push.bind(buffers));
  doc.on("end", () => {});

  // Gradient header
  const gradient = doc.linearGradient(0, 0, 600, 0);
  gradient.stop(0, "#2563eb").stop(1, "#f97316");
  doc.rect(0, 0, 600, 100).fill(gradient);

  doc
    .fillColor("#ffffff")
    .font("Helvetica-Bold")
    .fontSize(28)
    .text("Pass", 50, 40, { continued: true })
    .fillColor("#FFD580")
    .text("iify")
    .fillColor("#e0f2ff")
    .fontSize(10)
    .text("Your Fitness, Your Way — Anytime, Anywhere", 50, 70);

  // Ticket box
  doc
    .rect(40, 130, 520, 350)
    .fill("#ffffff")
    .strokeColor("#d1d5db")
    .lineWidth(1)
    .stroke();

  doc
    .fillColor("#2563eb")
    .font("Helvetica-Bold")
    .fontSize(20)
    .text("🎟️ Booking Ticket", 60, 160);

  doc.moveTo(60, 185).lineTo(540, 185).strokeColor("#e5e7eb").stroke();

  // Details
  doc
    .font("Helvetica")
    .fontSize(13)
    .fillColor("#374151")
    .text("Gym:", 60, 205, { continued: true })
    .font("Helvetica-Bold")
    .text(` ${gymName}`)
    .font("Helvetica")
    .text("City:", 60, 225, { continued: true })
    .font("Helvetica-Bold")
    .text(` ${city}`)
    .font("Helvetica")
    .text("Date:", 60, 245, { continued: true })
    .font("Helvetica-Bold")
    .text(` ${formattedDate}`)
    .font("Helvetica")
    .text("Pass Type:", 60, 265, { continued: true })
    .font("Helvetica-Bold")
    .text(" 1-Day Fitness Pass");

  // Price box
  doc.rect(370, 205, 160, 100).fillAndStroke("#f8fafc", "#d1d5db");
  doc
    .fillColor("#111827")
    .font("Helvetica-Bold")
    .fontSize(16)
    .text("Amount Paid", 390, 225);
  doc.fillColor("#16a34a").fontSize(22).text(`₹${price}`, 390, 255);

  // Booking code box
  doc.rect(60, 315, 470, 60).fillAndStroke("#fff8e1", "#facc15");
  doc
    .fillColor("#78350f")
    .font("Helvetica-Bold")
    .fontSize(14)
    .text("Booking ID", 75, 330);
  doc.fillColor("#b45309").fontSize(20).text(bookingCode, 75, 350);

  // Note
  doc
    .fillColor("#6b7280")
    .font("Helvetica")
    .fontSize(11)
    .text(
      "Please show this ticket or Booking ID at the gym reception. The gym will verify it on their Passiify Dashboard.",
      60,
      400,
      { width: 460 }
    );

  doc
    .moveTo(60, 470)
    .lineTo(540, 470)
    .dash(5, { space: 5 })
    .strokeColor("#d1d5db")
    .stroke()
    .undash();

  doc
    .fillColor("#9ca3af")
    .fontSize(10)
    .text("© Passiify - India’s #1 One-Day Fitness Pass Platform", 60, 485);

  doc.end();

  return new Promise((resolve) => {
    doc.on("end", () => resolve(Buffer.concat(buffers)));
  });
};

/* -------------------------------------------------------------------------- */
/* ✉️ Reusable Email Sender with Debug Logs                                   */
/* -------------------------------------------------------------------------- */
const sendEmail = async (to, subject, htmlContent, attachments = []) => {
  try {
    console.log("📧 Preparing to send email to:", to);
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    // Verify SMTP connection before sending
    await transporter.verify();
    console.log("✅ Gmail SMTP connection verified successfully");

    const emailHTML = `
      <div style="font-family: 'Segoe UI', sans-serif; background: #f6f8fb; padding: 20px;">
        <table align="center" cellpadding="0" cellspacing="0" width="100%" 
               style="max-width: 600px; background: #fff; border-radius: 12px; overflow: hidden; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
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
      attachments,
    });

    console.log(`✅ Email sent successfully to: ${to}`);
  } catch (error) {
    console.error("❌ EMAIL SEND ERROR OCCURRED:");
    console.error("📩 Error Message:", error.message);
    if (error.code) console.error("🧩 Error Code:", error.code);
    if (error.command) console.error("📡 Command:", error.command);
    if (error.response) console.error("📨 Gmail Response:", error.response);
    throw new Error("Email could not be sent. See logs above.");
  }
};

/* -------------------------------------------------------------------------- */
/* 🧾 Booking Confirmation Email (includes Ticket PDF)                        */
/* -------------------------------------------------------------------------- */
export const sendBookingConfirmationEmail = async (to, bookingData) => {
  console.log("📤 Starting booking confirmation email for:", to);
  const { gymName, city, date, bookingCode, price } = bookingData;

  const formattedDate = new Date(date).toLocaleDateString("en-IN", {
    weekday: "long",
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  const htmlContent = `
    <h2 style="color: #0f172a; font-size: 22px;">🎉 Booking Confirmed!</h2>
    <p style="color: #334155;">Hi there,</p>
    <p>Your 1-day pass for <b>${gymName}</b> in <b>${city}</b> is confirmed.</p>

    <div style="margin: 25px 0; padding: 20px; background: linear-gradient(135deg, #f8fafc, #fff4eb); border: 1px solid #e2e8f0; border-radius: 12px;">
      <h3 style="margin: 0 0 10px; color: #2563eb;">Your Booking Summary</h3>
      <p><b>Booking ID:</b> <span style="color: #f97316;">${bookingCode}</span></p>
      <p><b>Date:</b> ${formattedDate}</p>
      <p><b>Amount Paid:</b> ₹${price}</p>
      <p><b>Gym Location:</b> ${city}</p>
    </div>

    <p style="color: #475569;">Please reach <b>10–15 minutes early</b> for check-in. The gym can verify your booking on their <b style="color: #2563eb;">Passiify Dashboard</b>.</p>
    <p style="margin-top: 20px;">💪 Thank you for booking with <b style="color: #2563eb;">Passiify</b> — your one-day fitness freedom.</p>
  `;

  const pdfBuffer = await generateBookingPDF(bookingData);

  await sendEmail(to, `Your Passiify Booking — ${gymName}`, htmlContent, [
    {
      filename: `Passiify_Ticket_${bookingCode}.pdf`,
      content: pdfBuffer,
      contentType: "application/pdf",
    },
  ]);
};

export default sendEmail;
