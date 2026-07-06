'use client';

import React, { useState } from 'react';

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<'account' | 'org' | 'billing' | 'security'>('account');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // 1. حالات الحساب الشخصي والتفضيلات
  const [profile, setProfile] = useState({
    fullName: 'عبد الرحيم مصباحي',
    email: 'contact@lisaniq.com',
    language: 'ar',
    timezone: 'Asia/Riyadh',
    dateFormat: 'YYYY/MM/DD',
    lastLogin: 'اليوم، 14:32 عبر جهاز Mac'
  });

  // 2. حالات المؤسسة والشركة
  const [org, setOrg] = useState({
    name: 'مؤسسة ذكاء التسويق الرقمي',
    website: 'https://lisaniq.com',
    description: 'منصة رائدة لتحليل الحملات الإعلانية وتوليد التوصيات التلقائية.'
  });

  // 3. بيانات خطة الاشتراك والفوترة الديناميكية
  const subscription = {
    planName: 'الباقة الاحترافية (Pro Plan)',
    usedFiles: 42,
    maxFiles: 100,
    renewalDate: '1 أغسطس 2026',
    status: 'نشط'
  };

  // دالة إرسال وحفظ البيانات الشخصية للسيرفر وقاعدة البيانات
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    setErrorMsg('');
    
    try {
      const res = await fetch('/api/settings/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'profile', profileData: profile })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'حدث خطأ ما');
      setMessage('تم تحديث البيانات الشخصية والتفضيلات بنجاح! ✅');
    } catch (err: any) {
      setErrorMsg(err.message);
    } finally {
      setLoading(false);
    }
  };

  // دالة إرسال وحفظ بيانات المؤسسة للسيرفر وقاعدة البيانات
  const handleSaveOrg = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    setErrorMsg('');
    
    try {
      const res = await fetch('/api/settings/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'organization', orgData: org })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'حدث خطأ ما');
      setMessage('تم حفظ بيانات المؤسسة وتحديث الـ Workspace بنجاح! 🏢✨');
    } catch (err: any) {
      setErrorMsg(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0B0F19] text-gray-100 p-4 md:p-8 font-sans" dir="rtl">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-2 text-white">الإعدادات</h1>
        <p className="text-gray-400 mb-8">إدارة حسابك الشخصي، تفضيلات المنصة، بيانات المؤسسة، والاشتراكات.</p>

        {/* إشعارات النجاح أو الفشل */}
        {message && (
          <div className="mb-6 p-4 bg-emerald-950/40 border border-emerald-500/30 text-emerald-400 rounded-lg text-sm font-medium">
            {message}
          </div>
        )}
        {errorMsg && (
          <div className="mb-6 p-4 bg-red-950/40 border border-red-500/30 text-red-400 rounded-lg text-sm font-medium">
            {errorMsg}
          </div>
        )}

        {/* تقسيم الشاشة بشكل متجاوب كمبيوتر وهاتف */}
        <div className="flex flex-col md:flex-row gap-8">
          
          {/* الأزرار الجانبية (Tabs) */}
          <div className="w-full md:w-64 flex md:flex-col overflow-x-auto md:overflow-visible border-b md:border-b-0 border-gray-800 gap-2 pb-2 md:pb-0 scrollbar-none">
            <button
              type="button"
              onClick={() => setActiveTab('account')}
              className={`px-4 py-3 text-right text-sm font-medium rounded-lg whitespace-nowrap transition-colors ${activeTab === 'account' ? 'bg-indigo-600 text-white' : 'text-gray-400 hover:bg-gray-900'}`}
            >
              الحساب الشخصي والتفضيلات
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('org')}
              className={`px-4 py-3 text-right text-sm font-medium rounded-lg whitespace-nowrap transition-colors ${activeTab === 'org' ? 'bg-indigo-600 text-white' : 'text-gray-400 hover:bg-gray-900'}`}
            >
              المؤسسة والشركة
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('billing')}
              className={`px-4 py-3 text-right text-sm font-medium rounded-lg whitespace-nowrap transition-colors ${activeTab === 'billing' ? 'bg-indigo-600 text-white' : 'text-gray-400 hover:bg-gray-900'}`}
            >
              الخطة الحالية والاشتراك
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('security')}
              className={`px-4 py-3 text-right text-sm font-medium rounded-lg whitespace-nowrap transition-colors ${activeTab === 'security' ? 'bg-indigo-600 text-white' : 'text-gray-400 hover:bg-gray-900'}`}
            >
              الأمان ومنطقة الخطر
            </button>
          </div>

          {/* محتوى الإعدادات النشط */}
          <div className="flex-1 bg-[#111827] border border-gray-800 rounded-xl p-6 md:p-8">
            
            {/* 1. واجهة الحساب الشخصي */}
            {activeTab === 'account' && (
              <form onSubmit={handleSaveProfile} className="space-y-6">
                <h3 className="text-xl font-semibold border-b border-gray-800 pb-3 text-white">بيانات الحساب الشخصي</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">الاسم الكامل</label>
                    <input
                      type="text"
                      value={profile.fullName}
                      onChange={(e) => setProfile({ ...profile, fullName: e.target.value })}
                      className="w-full bg-[#0B0F19] border border-gray-800 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-indigo-500 transition-colors"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">البريد الإلكتروني (ثابت أمنياً)</label>
                    <input
                      type="email"
                      value={profile.email}
                      disabled
                      className="w-full bg-gray-950/50 border border-gray-800 rounded-lg px-4 py-2.5 text-gray-500 cursor-not-allowed"
                    />
                  </div>
                </div>

                <h3 className="text-xl font-semibold border-b border-gray-800 pt-6 pb-3 text-white">التفضيلات والنظام</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">لغة المنصة</label>
                    <select
                      value={profile.language}
                      onChange={(e) => setProfile({ ...profile, language: e.target.value })}
                      className="w-full bg-[#0B0F19] border border-gray-800 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-indigo-500"
                    >
                      <option value="ar">العربية (RTL)</option>
                      <option value="en">English (LTR)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">المنطقة الزمنية</label>
                    <select
                      value={profile.timezone}
                      onChange={(e) => setProfile({ ...profile, timezone: e.target.value })}
                      className="w-full bg-[#0B0F19] border border-gray-800 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-indigo-500"
                    >
                      <option value="Asia/Riyadh">آسيا/الرياض (GMT+3)</option>
                      <option value="Africa/Cairo">أفريقيا/القاهرة (GMT+2)</option>
                      <option value="Europe/London">أوروبا/لندن (GMT+0)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">تنسيق التاريخ</label>
                    <select
                      value={profile.dateFormat}
                      onChange={(e) => setProfile({ ...profile, dateFormat: e.target.value })}
                      className="w-full bg-[#0B0F19] border border-gray-800 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-indigo-500"
                    >
                      <option value="YYYY/MM/DD">YYYY/MM/DD</option>
                      <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                    </select>
                  </div>
                </div>

                <div className="pt-4 border-t border-gray-800 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 text-xs text-gray-500">
                  <span>آخر نشاط للحساب: {profile.lastLogin}</span>
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-800 text-white font-medium text-sm px-6 py-2.5 rounded-lg transition-colors"
                  >
                    {loading ? 'جاري الحفظ...' : 'حفظ التعديلات والشخصية'}
                  </button>
                </div>
              </form>
            )}

            {/* 2. واجهة بيانات المؤسسة */}
            {activeTab === 'org' && (
              <form onSubmit={handleSaveOrg} className="space-y-6">
                <h3 className="text-xl font-semibold border-b border-gray-800 pb-3 text-white">بيانات المؤسسة (Tenant Workspace)</h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">اسم المؤسسة / الشركة التجارية</label>
                    <input
                      type="text"
                      value={org.name}
                      onChange={(e) => setOrg({ ...org, name: e.target.value })}
                      className="w-full bg-[#0B0F19] border border-gray-800 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-indigo-500 transition-colors"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">الموقع الإلكتروني الرسمي</label>
                    <input
                      type="url"
                      value={org.website}
                      onChange={(e) => setOrg({ ...org, website: e.target.value })}
                      className="w-full bg-[#0B0F19] border border-gray-800 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">وصف مختصر لعمل الشركة</label>
                    <textarea
                      rows={3}
                      value={org.description}
                      onChange={(e) => setOrg({ ...org, description: e.target.value })}
                      className="w-full bg-[#0B0F19] border border-gray-800 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-indigo-500 resize-none"
                    />
                  </div>
                </div>

                <div className="pt-4 border-t border-gray-800 flex justify-end">
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-800 text-white text-sm px-6 py-2.5 rounded-lg transition-colors"
                  >
                    {loading ? 'جاري الحفظ...' : 'حفظ بيانات الشركة والمؤسسة'}
                  </button>
                </div>
              </form>
            )}

            {/* 3. واجهة باقة الاشتراك والفوترة */}
            {activeTab === 'billing' && (
              <div className="space-y-6">
                <h3 className="text-xl font-semibold border-b border-gray-800 pb-3 text-white">إدارة باقة الاشتراك والفوترة عبر Stripe</h3>
                
                <div className="bg-[#0B0F19] border border-gray-800 rounded-xl p-6">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
                    <div>
                      <span className="text-xs font-bold uppercase tracking-wider text-indigo-400 bg-indigo-950/50 px-2.5 py-1 rounded-md">الباقة الحالية</span>
                      <h4 className="text-2xl font-bold mt-2 text-white">{subscription.planName}</h4>
                    </div>
                    <span className="text-emerald-400 bg-emerald-950/40 px-3 py-1 rounded-full text-sm font-medium">حالة الاشتراك: {subscription.status}</span>
                  </div>

                  {/* شريط الاستهلاك */}
                  <div className="space-y-2 mt-6">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">ملفات الـ CSV المستهلكة لتحليلات الذكاء التسويقي</span>
                      <span className="text-white font-semibold">{subscription.usedFiles} من أصل {subscription.maxFiles} ملف</span>
                    </div>
                    <div className="w-full bg-gray-800 h-2.5 rounded-full overflow-hidden">
                      <div 
                        className="bg-indigo-500 h-full rounded-full transition-all duration-500" 
                        style={{ width: `${(subscription.usedFiles / subscription.maxFiles) * 100}%` }}
                      ></div>
                    </div>
                  </div>

                  <p className="text-xs text-gray-500 mt-4">سيتم تجديد اشتراك باقتك والفوترة التلقائية القادمة في: **{subscription.renewalDate}**.</p>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 pt-4 border-t border-gray-800">
                  <button type="button" className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-sm px-6 py-2.5 rounded-lg transition-colors text-center">
                    ترقية الخطة الباقة الفورية 🚀
                  </button>
                  <button type="button" className="w-full sm:w-auto border border-gray-700 hover:bg-gray-900 text-gray-300 text-sm px-6 py-2.5 rounded-lg transition-colors text-center">
                    إدارة الفواتير وإلغاء الاشتراك من لوحة Stripe
                  </button>
                </div>
              </div>
            )}

            {/* 4. واجهة الأمان ومنطقة الخطر */}
            {activeTab === 'security' && (
              <div className="space-y-8">
                <div>
                  <h3 className="text-xl font-semibold border-b border-gray-800 pb-3 text-white">إجراءات الأمان وحماية الجلسات</h3>
                  <div className="mt-4 space-y-3 max-w-md">
                    <button type="button" className="w-full bg-gray-900 hover:bg-gray-800 text-gray-300 text-right text-sm px-4 py-3 rounded-lg border border-gray-800 transition-colors">
                      🔐 إرسال بريد أمني فوري لإعادة تعيين كلمة المرور
                    </button>
                    <button type="button" className="w-full bg-gray-900 hover:bg-gray-800 text-red-400 text-right text-sm px-4 py-3 rounded-lg border border-gray-800 transition-colors">
                      🚫 إنهاء الجلسات وتسجيل الخروج من كافة الأجهزة الأخرى
                    </button>
                  </div>
                </div>

                <div className="border border-red-900/40 bg-red-950/10 rounded-xl p-6 space-y-4">
                  <h4 className="text-red-400 font-bold text-lg">منطقة الخطر القصوى (Danger Zone)</h4>
                  <p className="text-sm text-gray-400">العمليات التالية حساسة للغاية ومصيرية ولا يمكن التراجع عنها نهائياً.</p>
                  
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pt-4 border-t border-red-900/20">
                    <div>
                      <h5 className="text-white font-semibold text-sm">حذف المؤسسة وملفاتها بشكل دائم</h5>
                      <p className="text-xs text-gray-500">سيتم مسح كافة ملفات الـ CSV، التقارير المؤرشفة، والتوصيات كلياً.</p>
                    </div>
                    <button type="button" className="w-full sm:w-auto bg-red-950 text-red-400 border border-red-800 hover:bg-red-900 hover:text-white text-xs font-medium px-4 py-2 rounded-lg transition-colors whitespace-nowrap">
                      حذف المؤسسة نهائياً
                    </button>
                  </div>
                </div>

              </div>
            )}

          </div>
        </div>

      </div>
    </div>
  );
}
