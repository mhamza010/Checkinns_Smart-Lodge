import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

let transporter;

// Asynchronously initialize the mailer
async function initMailer() {
    try {
        // If you have real SMTP credentials in your .env, use them:
        if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
            transporter = nodemailer.createTransport({
                host: process.env.SMTP_HOST,
                port: process.env.SMTP_PORT || 587,
                secure: process.env.SMTP_PORT == 465,
                auth: {
                    user: process.env.SMTP_USER,
                    pass: process.env.SMTP_PASS,
                },
            });
            console.log("📧 Real SMTP Mailer initialized for Production.");
        } else {
            // Create a massive "Wow Factor" for the demo by dynamically generating 
            // a functional Ethereal test email account on the fly!
            let testAccount = await nodemailer.createTestAccount();
            transporter = nodemailer.createTransport({
                host: "smtp.ethereal.email",
                port: 587,
                secure: false,
                auth: {
                    user: testAccount.user,
                    pass: testAccount.pass,
                },
            });
            console.log("📧 Ethereal Test Mailbox created! Emails will be caught securely.");
            console.log(`   (Add SMTP_HOST, SMTP_USER, SMTP_PASS to .env for real emails)`);
        }
    } catch (error) {
        console.error("❌ Failed to initialize Mailer:", error);
    }
}

initMailer();

export const sendBookingReceiptEmail = async (userEmail, bookingDetails) => {
    if (!transporter) return;

    const htmlTemplate = `
    <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; max-width: 600px; margin: auto; background-color: #0b0c10; padding: 40px; border-radius: 16px; border: 1px solid #1f2833; color: #c5c6c7;">
        
        <!-- Header Section -->
        <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="margin: 0; font-size: 32px; color: #d4af37; font-family: 'Georgia', serif; letter-spacing: 2px; text-transform: uppercase;">CheckInns</h1>
            <p style="margin: 5px 0 0; font-size: 14px; letter-spacing: 4px; color: #8b8f94; text-transform: uppercase;">Exclusive Reservations</p>
        </div>

        <div style="background-color: #1a1a1d; padding: 40px 30px; border-radius: 12px; border: 1px solid #333; box-shadow: 0 10px 30px rgba(0,0,0,0.5);">
            <h2 style="color: #ffffff; font-size: 24px; margin-top: 0; text-align: center; font-family: 'Georgia', serif; border-bottom: 1px solid #d4af37; padding-bottom: 20px;">Your Booking is Confirmed</h2>
            <p style="font-size: 16px; line-height: 1.6; color: #e0e0e0; text-align: center; margin-bottom: 30px;">
                Dear ${bookingDetails.guestName},<br><br>
                Thank you for choosing CheckInns. We are delighted to confirm your luxury stay. Below are the exclusive details of your reservation.
            </p>
            
            <table width="100%" cellpadding="0" cellspacing="0" style="margin-top: 20px; border-collapse: collapse;">
                <tr>
                    <td style="padding: 15px 0; border-bottom: 1px solid #333; color: #8b8f94; font-size: 14px; text-transform: uppercase; letter-spacing: 1px;">Property</td>
                    <td style="padding: 15px 0; border-bottom: 1px solid #333; color: #ffffff; font-size: 16px; text-align: right; font-weight: 600;">${bookingDetails.hotelName}</td>
                </tr>
                <tr>
                    <td style="padding: 15px 0; border-bottom: 1px solid #333; color: #8b8f94; font-size: 14px; text-transform: uppercase; letter-spacing: 1px;">Check-In</td>
                    <td style="padding: 15px 0; border-bottom: 1px solid #333; color: #ffffff; font-size: 16px; text-align: right;">${bookingDetails.checkInDate}</td>
                </tr>
                <tr>
                    <td style="padding: 15px 0; border-bottom: 1px solid #333; color: #8b8f94; font-size: 14px; text-transform: uppercase; letter-spacing: 1px;">Check-Out</td>
                    <td style="padding: 15px 0; border-bottom: 1px solid #333; color: #ffffff; font-size: 16px; text-align: right;">${bookingDetails.checkOutDate}</td>
                </tr>
                <tr>
                    <td style="padding: 15px 0; border-bottom: 1px solid #333; color: #8b8f94; font-size: 14px; text-transform: uppercase; letter-spacing: 1px;">Duration</td>
                    <td style="padding: 15px 0; border-bottom: 1px solid #333; color: #ffffff; font-size: 16px; text-align: right;">${bookingDetails.nights} Night(s)</td>
                </tr>
            </table>

            <div style="background: linear-gradient(135deg, #15161a 0%, #1a1a1d 100%); border: 1px solid #d4af37; padding: 20px; border-radius: 8px; margin-top: 30px; text-align: center;">
                <p style="margin: 0; color: #8b8f94; font-size: 14px; text-transform: uppercase; letter-spacing: 2px;">Total Investment</p>
                <h2 style="margin: 10px 0 0; font-size: 32px; color: #d4af37; font-family: 'Georgia', serif;">$${Number(bookingDetails.totalPrice).toFixed(2)}</h2>
            </div>
        </div>

        <p style="text-align: center; color: #666; font-size: 12px; margin-top: 40px; line-height: 1.5;">
            Need assistance with your upcoming experience?<br>
            Contact our concierge team at support@checkinns.com<br><br>
            Receipt ID: <span style="color: #8b8f94;">${bookingDetails.paymentId}</span>
        </p>
    </div>
  `;

    try {
        const info = await transporter.sendMail({
            from: '"CheckInns Reservations" <reservations@checkinns.com>',
            to: userEmail,
            subject: `Booking Confirmed: ${bookingDetails.hotelName} Receipt`,
            html: htmlTemplate,
        });

        console.log(`✅ Automated Email sent to: ${userEmail}`);
        if (info.messageId && !process.env.SMTP_HOST) {
            console.log(`🔍 [DEMO MODE] View the sent email here: ${nodemailer.getTestMessageUrl(info)}`);
        }
    } catch (error) {
        console.error("❌ Failed to send receipt email:", error);
    }
};

export const sendOtpEmail = async (userEmail, otp) => {
    if (!transporter) return;

    const htmlTemplate = `
    <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
        <h2>CheckInns - Email Verification</h2>
        <p>Your verification code is: <strong>${otp}</strong></p>
        <p>This code will expire in 5 minutes.</p>
    </div>
    `;

    try {
        await transporter.sendMail({
            from: '"CheckInns Verification" <reservations@checkinns.com>',
            to: userEmail,
            subject: "Your CheckInns Verification Code",
            html: htmlTemplate,
        });
        console.log(`✅ OTP Email sent to: ${userEmail}`);
    } catch (error) {
        console.error("❌ Failed to send OTP email:", error);
    }
};

export const sendMarketingBlastEmail = async (userEmailsArray, hotelName, tier) => {
    if (!transporter || !userEmailsArray || userEmailsArray.length === 0) return;

    const htmlTemplate = `
    <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; max-width: 600px; margin: auto; background-color: #0b0c10; padding: 40px; border-radius: 16px; border: 1px solid #ff007f; color: #c5c6c7;">
        <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="margin: 0; font-size: 32px; color: #ff007f; font-family: 'Georgia', serif; letter-spacing: 2px; text-transform: uppercase;">🔥 FEATURED PROPERTY 🔥</h1>
        </div>
        <div style="background-color: #1a1a1d; padding: 40px 30px; border-radius: 12px; border: 1px solid #333; box-shadow: 0 10px 30px rgba(0,0,0,0.5); text-align: center;">
            <h2 style="color: #ffffff; font-size: 28px; margin-top: 0; font-family: 'Georgia', serif;">${hotelName}</h2>
            <p style="font-size: 16px; line-height: 1.6; color: #e0e0e0; margin-bottom: 30px;">
                We are thrilled to announce that <strong>${hotelName}</strong> has just been upgraded to an exclusive <strong>${tier.toUpperCase()}</strong> status on Check-Inns!
            </p>
            <p style="font-size: 16px; line-height: 1.6; color: #d4af37; margin-bottom: 30px;">
                Experience unparalleled luxury and premium services. Log in to your Check-Inns app now to book your next extraordinary stay.
            </p>
            <a href="http://localhost:5000/checkinns3.html" style="display: inline-block; padding: 15px 30px; background: linear-gradient(135deg, #ff007f, #7928ca); color: #fff; text-decoration: none; border-radius: 30px; font-weight: bold; font-size: 16px;">View Featured Property</a>
        </div>
    </div>
    `;

    try {
        // Send individually to bcc or loop. Nodemailer allows bcc for mass emails.
        const info = await transporter.sendMail({
            from: '"CheckInns Marketing" <marketing@checkinns.com>',
            bcc: userEmailsArray, // Send to all users secretly
            subject: `🔥 Featured Property of the Week: ${hotelName}`,
            html: htmlTemplate,
        });

        console.log(`✅ Mass Marketing Email sent to ${userEmailsArray.length} users for ${hotelName}`);
        if (info.messageId && !process.env.SMTP_HOST) {
            console.log(`🔍 [DEMO MODE] View the blast email here: ${nodemailer.getTestMessageUrl(info)}`);
        }
    } catch (error) {
        console.error("❌ Failed to send mass marketing email:", error);
    }
};
