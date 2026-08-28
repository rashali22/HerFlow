import nodemailer from 'nodemailer';

/**
 * Creates Nodemailer transport if SMTP credentials are provided.
 */
export function getMailTransporter() {
  const host = process.env.EMAIL_SERVER_HOST;
  const user = process.env.EMAIL_SERVER_USER;
  const pass = process.env.EMAIL_SERVER_PASSWORD;
  const port = Number(process.env.EMAIL_SERVER_PORT) || 587;

  if (!host || !user || !pass) {
    return null;
  }

  return nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: {
      user,
      pass,
    },
  });
}

/**
 * HTML Email template for period reminder.
 */
export function periodReminderEmail({ name, daysLeft }) {
  const appName = 'HerFlow';
  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1" />
  <title>${appName} · Period Reminder</title>
  <style>
    body { margin:0; padding:0; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif; background:#f4f6f8; color:#1a202c; }
    .container { max-width:680px; margin:0 auto; padding:24px; text-align:center; }
    .card { background:#ffffff; border-radius:12px; overflow:hidden; box-shadow:0 6px 24px rgba(11,22,39,0.06); }
    .header { background:#2f4f4f; padding:28px 24px; text-align:center; color:#fff; }
    .brand { display:inline-flex; align-items:center; gap:12px; }
    .brand-name { font-size:24px; font-weight:700; letter-spacing:-0.4px; color:#ffffff; }
    .tagline { color:#cfecec; margin-top:6px; font-size:13px; font-weight:500; font-style:italic; }
    .content { padding:32px 28px; }
    .greeting { font-size:18px; font-weight:600; margin:0 0 12px 0; color:#0f1724; }
    .message { font-size:16px; color:#374151; margin:0 0 20px 0; line-height:1.6; }
    .cta-wrap { text-align:center; margin:28px 0; }
    .cta { display:inline-block; background:#2f4f4f; color:#ffffff; text-decoration:none; padding:14px 28px; border-radius:10px; font-weight:700; font-size:16px; box-shadow:0 6px 18px rgba(47,79,79,0.25); }
    .note { font-size:13px; color:#6b7280; margin-top:16px; text-align:center; }
    .footer { background:#1e3333; padding:24px; text-align:center; color:#94a3b8; font-size:12px; }
    .footer a { color:#ffd966; text-decoration:none; font-weight:600; }
    .muted { color:#94a3b8; font-size:12px; margin-top:8px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="card">
      <div class="header">
        <div class="brand">
          <div>
            <div class="brand-name">🌸 ${appName}</div>
            <div class="tagline">Your Insights, Only Yours</div>
          </div>
        </div>
      </div>

      <div class="content">
        <p class="greeting">Hi ${name?.split(' ')[0] || 'there'},</p>

        <p class="message">
          Your next period is predicted to start in
          <strong>${daysLeft} day${daysLeft > 1 ? 's' : ''}</strong>.
        </p>

        <p class="message" style="font-size: 13px; color: #6b7280; margin-bottom: 24px;">
          Take care of yourself, stay hydrated, keep essentials ready, and listen to your body 🤍
        </p>

        <div class="cta-wrap">
          <a class="cta" href="${frontendUrl}/dashboard">
            Open ${appName} Dashboard
          </a>
        </div>

        <p class="note">
          Keep logging your daily flows and periods to maintain accurate predictions.
        </p>

        <p style="font-size: 11px; color: #9ca3af; margin-top: 20px;">
          Disclaimer: This is a gentle notification based on your logged rhythm, not medical advice.
        </p>
      </div>

      <div class="footer">
        <div style="margin-bottom:8px;">
          <a href="${frontendUrl}/dashboard">Manage Notification Preferences</a>
        </div>
        <div>Automatically sent with care by Team ${appName}</div>
        <div class="muted">© ${new Date().getFullYear()} ${appName}. All rights reserved.</div>
      </div>
    </div>
  </div>
</body>
</html>
  `;
}

/**
 * Sends reminder email using transporter.
 */
export async function sendReminderEmail({ to, name, daysLeft }) {
  const transporter = getMailTransporter();
  if (!transporter) {
    console.log(`[Email Service] (Mock) Period reminder email simulated for ${to} (${daysLeft} days left)`);
    return { mock: true, sent: true };
  }

  const mailOptions = {
    from: process.env.EMAIL_FROM || '"HerFlow" <noreply@herflow.app>',
    to,
    subject: `🌸 Period Reminder from HerFlow - ${daysLeft} days left`,
    html: periodReminderEmail({ name, daysLeft }),
  };

  return await transporter.sendMail(mailOptions);
}
