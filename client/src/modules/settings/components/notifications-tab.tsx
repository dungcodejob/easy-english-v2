import { useState } from 'react';
import { Card, SettingRow, TabHeader, Toggle } from './settings-ui';

export function NotificationsTab() {
  const [emailDigest, setEmailDigest] = useState(true);
  const [studyReminders, setStudyReminders] = useState(true);
  const [streakAlerts, setStreakAlerts] = useState(true);
  const [weeklyReport, setWeeklyReport] = useState(false);
  const [achievements, setAchievements] = useState(true);
  const [productUpdates, setProductUpdates] = useState(false);

  return (
    <div className="space-y-8">
      <TabHeader
        title="Notification Center"
        description="Control how and when Easy English reaches you. Fine-tune study reminders, achievement alerts, and email preferences to match your rhythm."
        saveLabel="Save Notifications"
      />
      <Card
        title="Study Notifications"
        subtitle="Control alerts that keep your learning on track."
      >
        <div>
          <SettingRow
            title="Daily Study Reminders"
            description="Push notifications at your scheduled study time."
            control={
              <Toggle checked={studyReminders} onChange={setStudyReminders} />
            }
          />
          <SettingRow
            title="Streak Alerts"
            description="Notify me when my streak is at risk of breaking."
            control={
              <Toggle checked={streakAlerts} onChange={setStreakAlerts} />
            }
          />
          <SettingRow
            title="Achievement Unlocked"
            description="Celebrate milestones as you reach them."
            control={
              <Toggle checked={achievements} onChange={setAchievements} />
            }
          />
        </div>
      </Card>

      <Card
        title="Email Preferences"
        subtitle="Choose what we send to your inbox."
      >
        <div>
          <SettingRow
            title="Weekly Progress Digest"
            description="A curated summary of your learning metrics every Monday."
            control={<Toggle checked={emailDigest} onChange={setEmailDigest} />}
          />
          <SettingRow
            title="Weekly Report"
            description="Detailed breakdown of words studied, mastered, and reviewed."
            control={
              <Toggle checked={weeklyReport} onChange={setWeeklyReport} />
            }
          />
          <SettingRow
            title="Product Updates"
            description="New features, improvements, and platform announcements."
            control={
              <Toggle checked={productUpdates} onChange={setProductUpdates} />
            }
          />
        </div>
      </Card>
    </div>
  );
}
