'use client';

import { useState } from 'react';

import SettingsHeader from './components/SettingsHeader';
import ProfileOverview from './components/ProfileOverview';
import SettingsSidebar from './components/SettingsSidebar';
import SecurityScoreCard from './components/SecurityScoreCard';
import BillingCard from './components/BillingCard';
import TeamMembers from './components/TeamMembers';

export default function SettingsPage() {
  const [activeSection, setActiveSection] = useState('general');

  return (
    <div
      dir="rtl"
      className="min-h-screen bg-[#0B0F19] text-white"
    >
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">

        <SettingsHeader />

        <div className="mt-8">
          <ProfileOverview />
        </div>

        <div className="mt-10 flex flex-col gap-8 lg:flex-row">

          <div className="lg:w-[300px] xl:w-[320px] shrink-0">
            <SettingsSidebar
              activeSection={activeSection}
              setActiveSection={setActiveSection}
            />
          </div>

          <div className="flex-1 space-y-6">

            <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">

              <div className="h-full">
                <SecurityScoreCard />
              </div>

              <div className="h-full">
                <BillingCard />
              </div>

            </div>

            <div>
              <TeamMembers />
            </div>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">

              <div className="rounded-2xl border border-gray-800 bg-[#111827] p-6">
                <div className="text-sm text-gray-400">
                  حالة مساحة العمل
                </div>

                <div className="mt-3 text-3xl font-bold text-green-400">
                  ممتازة
                </div>

                <div className="mt-2 text-sm text-gray-500">
                  جميع الخدمات تعمل بشكل طبيعي.
                </div>
              </div>

              <div className="rounded-2xl border border-gray-800 bg-[#111827] p-6">
                <div className="text-sm text-gray-400">
                  المستخدمون النشطون
                </div>

                <div className="mt-3 text-3xl font-bold">
                  14
                </div>

                <div className="mt-2 text-sm text-gray-500">
                  أعضاء الفريق المسجلون حالياً.
                </div>
              </div>

              <div className="rounded-2xl border border-gray-800 bg-[#111827] p-6">
                <div className="text-sm text-gray-400">
                  حالة الاشتراك
                </div>

                <div className="mt-3 text-3xl font-bold text-cyan-400">
                  Pro
                </div>

                <div className="mt-2 text-sm text-gray-500">
                  اشتراك احترافي مفعل.
                </div>
              </div>

            </div>

            <div className="rounded-2xl border border-red-900/50 bg-gradient-to-br from-red-950/20 to-transparent p-6">

              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">

                <div>
                  <h3 className="text-lg font-semibold text-red-400">
                    منطقة الخطر
                  </h3>

                  <p className="mt-2 text-sm text-gray-400">
                    الإجراءات الموجودة هنا لا يمكن التراجع عنها بعد التنفيذ.
                  </p>
                </div>

                <div className="flex flex-wrap gap-3">

                  <button
                    type="button"
                    className="rounded-xl border border-red-800 px-4 py-2 text-sm text-red-400 transition hover:bg-red-950/40"
                  >
                    تعطيل الحساب
                  </button>

                  <button
                    type="button"
                    className="rounded-xl bg-red-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-red-500"
                  >
                    حذف مساحة العمل
                  </button>

                </div>

              </div>

            </div>

          </div>

        </div>

      </div>
    </div>
  );
}
