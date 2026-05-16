import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
});

interface ReminderSummary {
  month: string;
  totalIncome: number;
  totalExpenses: number;
  net: number;
}

export async function sendReminder(to: string, summary: ReminderSummary): Promise<void> {
  const netColor = summary.net >= 0 ? "#16a34a" : "#dc2626";
  const netSign = summary.net >= 0 ? "+" : "";

  await transporter.sendMail({
    from: `"Finance Tracker" <${process.env.GMAIL_USER}>`,
    to,
    subject: `Finance Tracker — ${summary.month} expense reminder`,
    html: `
      <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:24px">
        <h2 style="margin-bottom:4px">Finance Tracker 1.0</h2>
        <p style="color:#6b7280;margin-top:0">Monthly Reminder — ${summary.month}</p>
        <hr style="border:none;border-top:1px solid #e5e7eb;margin:16px 0"/>
        <table style="width:100%;border-collapse:collapse">
          <tr>
            <td style="padding:8px 0;color:#374151">Income</td>
            <td style="padding:8px 0;text-align:right;font-weight:600;color:#16a34a">
              €${summary.totalIncome.toFixed(2)}
            </td>
          </tr>
          <tr>
            <td style="padding:8px 0;color:#374151">Expenses</td>
            <td style="padding:8px 0;text-align:right;font-weight:600;color:#dc2626">
              €${summary.totalExpenses.toFixed(2)}
            </td>
          </tr>
          <tr style="border-top:1px solid #e5e7eb">
            <td style="padding:12px 0;font-weight:700">Net</td>
            <td style="padding:12px 0;text-align:right;font-weight:700;color:${netColor}">
              ${netSign}€${summary.net.toFixed(2)}
            </td>
          </tr>
        </table>
        <hr style="border:none;border-top:1px solid #e5e7eb;margin:16px 0"/>
        <p style="color:#6b7280;font-size:14px">
          Don't forget to register your expenses for this month!<br/>
          Log in at your Finance Tracker app to stay on top of your finances.
        </p>
      </div>
    `,
  });
}
