'use client';

import { useState } from 'react';

import SettingsHeader from './components/SettingsHeader';
import ProfileOverview from './components/ProfileOverview';
import SettingsSidebar from './components/SettingsSidebar';

export default function SettingsPage() {
  const [activeSection, setActiveSection] = useState('general');

  return (
    <div
      dir="rtl"
      className="min-h-screen bg-[#0B0F19] text-white"
    >
      <div className="max-w-7xl mx-auto px-6 py-10">

        <SettingsHeader />

        <ProfileOverview />

        <div className="mt-10 flex flex-col lg:flex-row gap-8">

          <SettingsSidebar
            activeSection={activeSection}
            setActiveSection={setActiveSection}
          />

          <div className="flex-1">

            <div className="rounded-2xl border border-gray-800 bg-[#111827] p-8">

              <h2 className="text-xl font-semibold">
                الإعدادات
              </h2>

              <p className="text-gray-400 mt-2">
                سيتم إضافة الأقسام الاحترافية هنا في الخطوات القادمة.
              </p>

            </div>

          </div>

        </div>

      </div>
    </div>
  );
}
