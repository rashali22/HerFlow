import cron from 'node-cron';
import { User } from '../models/User.js';
import { CycleInsight } from '../models/CycleInsight.js';
import { sendReminderEmail } from './emailService.js';

function isSameDay(a, b) {
  if (!a || !b) return false;
  const d1 = new Date(a);
  const d2 = new Date(b);
  return (
    d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate()
  );
}

/**
 * Checks all eligible users and sends period reminder emails.
 */
export async function checkAndSendPeriodReminders() {
  const today = new Date();
  console.log(`[Cron] Running daily period reminder check at ${today.toISOString()}`);

  try {
    const users = await User.find({ emailNotifications: true });

    let sentCount = 0;

    for (const user of users) {
      const insight = await CycleInsight.findOne({ userId: user._id });
      if (!insight || !insight.nextPeriodDate) continue;

      // Idempotency guard: avoid sending multiple emails on the same calendar day
      if (insight.lastPeriodReminderSent && isSameDay(insight.lastPeriodReminderSent, today)) {
        continue;
      }

      const nextDate = new Date(insight.nextPeriodDate);
      const daysLeft = Math.ceil((nextDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

      // Send reminder 2 days before predicted start
      if (daysLeft === 2) {
        await sendReminderEmail({
          to: user.email,
          name: user.name,
          daysLeft,
        });

        insight.lastPeriodReminderSent = today;
        await insight.save();
        sentCount++;
      }
    }

    console.log(`[Cron] Period reminder check completed. Sent ${sentCount} reminders.`);
    return { success: true, sentCount };
  } catch (error) {
    console.error('[Cron] Error processing period reminders:', error.message);
    return { success: false, error: error.message };
  }
}

/**
 * Initializes the background cron schedule.
 */
export function initCronJobs() {
  // Run every morning at 08:00 AM server time
  cron.schedule('0 8 * * *', async () => {
    await checkAndSendPeriodReminders();
  });

  console.log('[Cron] Initialized period reminder scheduler (0 8 * * *)');
}
