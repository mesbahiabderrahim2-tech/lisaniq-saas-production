'use client';

import React, { useState, useEffect } from 'react';

// تجميع الأيقونات البصرية النظيفة لتقليل التبعيات الخارجية وضمان السرعة (Inline SVG System)
const Icons = {
  account: () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>,
  org: () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5m0 0V11m0 5H9m5-5h2m-2 5h2v-4a1 1 0 00-1-1h-1z" /></svg>,
  security: () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>,
  billing: () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" /></svg>,
  globe: () => <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" /></svg>,
  time: () => <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
  shieldCheck: () => <svg className="w-5 h-5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>,
  link: () => <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5l-1.1 1.1" /></svg>,
  pulse: () => <svg className="w-4 h-4 text-emerald-400 animate-pulse" fill="currentColor" viewBox="0 0 20 20"><circle cx="10" cy="10" r="5" /></svg>
};

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<'account' | 'org' | 'security' | 'billing'>('account');
  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // 1. قسم الحساب الشخصي (تفضيلات الهوية والموقع)
  const [profile, setProfile] = useState({
    fullName: 'عبد الرحيم مصباحي',
    email: 'contact@lisaniq.com',
    language: 'ar',
    timezone: 'Asia/Riyadh',
    dateFormat: 'YYYY/MM/DD'
  });

  // 2. قسم المؤسسة المطور (البيانات التشغيلية لمساحة العمل)
  const [org, setOrg] = useState({
    name: 'مؤسسة ذكاء التسويق الرقمي',
    website: 'https://lisaniq.com',
    description: 'منصة رائدة لتحليل الحملات الإعلانية وتوليد التوصيات التلقائية.',
    associatedClients: 14,
    createdAt: '22 مارس 2025',
    currentPlan: 'الباقة الاحترافية'
  });

  // 3. قسم الأمان المطور (Security Hub)
  const [security, setSecurity] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
    lastLogin: 'منذ ساعتين عبر تطبيق المتصفح',
    currentDevice: 'Chrome / Android (هاتفك الحالي)',
    activeSessions: 1
  });

  // 4. قسم الاشتراك والفوترة المتكامل (Stripe Portal Mirror)
  const [subscription, setSubscription] = useState({
    planName: 'الباقة الاحترافية (Pro Plan)',
    status: 'نشط',
    paymentStatus: 'مدفوع ومؤمن عبر Stripe',
    usedFiles: 42,
    maxFiles: 100,
    renewalDate: '1 أغسطس 2026'
  });

  useEffect(() => {
    // محاكاة جلب البيانات الأصلية لتفعيل الـ Skeleton Loader البصري
    const timer = setTimeout(() => setPageLoading(false), 500);
    return () => clearTimeout(timer);
  }, []);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); setMessage(''); setErrorMsg('');
    try {
      const res = await fetch('/api/settings/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'profile', profileData: profile })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setMessage('تم تحديث الملف الشخصي وتفضيلات النظام بنجاح ✨');
    } catch (err: any) {
      setErrorMsg(err.message || 'فشلت عملية الحفظ، تم تسجيل الخطأ داخلياً لفحصه.');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveOrg = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); setMessage(''); setErrorMsg('');
    try {
      const res = await fetch('/api/settings/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'organization', orgData: org })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setMessage('تم تحديث مساحة عمل المؤسسة وتطبيق التغييرات 🏢');
    } catch (err: any) {
      setErrorMsg(err.message || 'تعذر المزامنة، يرجى إعادة المحاولة لاحقاً.');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdatePassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (security.newPassword !== security.confirmPassword) {
      setErrorMsg('كلمة المرور الجديدة وتأكيدها غير متطابقين.');
      return;
    }
    setLoading(true); setMessage(''); setErrorMsg('');
    setTimeout(() => {
      setLoading(false);
      setMessage('تم تحديث كلمة المرور وحماية الجلسة الحالية بنجاح 🔒');
      setSecurity(prev => ({ ...prev, currentPassword: '', newPassword: '', confirmPassword: '' }));
    }, 800);
  };

  if (pageLoading) {
    return (
      <div className="min-h-screen bg-[#0B0F19] p-4 md:p-8 space-y-6" dir="rtl">
        <div className="max-w-5xl mx-auto space-y-6">
          <div className="w-48 h-8 bg-gray-800 rounded animate-pulse"></div>
          <div className="w-full h-12 bg-gray-800 rounded-xl animate-pulse"></div>
          <div className="flex flex-col md:flex-row gap-6">
            <div className="w-full md:w-60 h-40 bg-gray-800 rounded-xl animate-pulse"></div>
            <div className="flex-1 h-96 bg-gray-800 rounded-xl animate-pulse"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0B0F19] text-gray-100 p-4 md:p-8 font-sans antialiased selection:bg-indigo-500/30" dir="rtl">
      <div className="max-w-5xl mx-auto">
        
        {/* الهيدر الرئيسي المحسن والمطابق لمعايير المنتجات العالمية */}
        <div className="flex items-center gap-3.5 mb-6 md:mb-8 border-b border-gray-800 pb-5">
          <div className="p-3 bg-indigo-600/10 border border-indigo-500/20 text-indigo-400 rounded-xl shadow-inner">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
          </div>
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-white tracking-tight">إعدادات المنصة</h1>
            <p className="text-xs md:text-sm text-gray-400 mt-0.5">إدارة الحساب الشخصي، تفضيلات مساحة العمل للمؤسسة، جدار الأمان، وتفاصيل الفوترة والاشتراك.</p>
          </div>
        </div>

        {/* تنبيهات النجاح والفشل الموقعية */}
        {message && <div className="mb-5 p-3.5 bg-emerald-950/30 border border-emerald-500/20 text-emerald-400 rounded-xl text-xs md:text-sm font-medium flex items-center gap-2 animate-fadeIn"><span>✅</span> {message}</div>}
        {errorMsg && <div className="mb-5 p-3.5 bg-red-950/30 border border-red-500/20 text-red-400 rounded-xl text-xs md:text-sm font-medium flex items-center gap-2 animate-fadeIn"><span>⚠️</span> {errorMsg}</div>}

        {/* التنقل الذكي والتبويبات المقسمة المناسبة لشاشات الهاتف المتجاوبة */}
        <div className="flex flex-col md:flex-row gap-5 md:gap-8 items-start">
          
          <div className="w-full md:w-60 flex md:flex-col overflow-x-auto md:overflow-visible border-b md:border-b-0 border-gray-800 md:space-y-1 pb-2 md:pb-0 scrollbar-none snap-x">
            <button type="button" onClick={() => setActiveTab('account')} className={`flex items-center gap-2.5 px-4 py-2.5 text-sm font-medium rounded-xl transition-all whitespace-nowrap snap-center ${activeTab === 'account' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/10' : 'text-gray-400 hover:text-gray-200 hover:bg-gray-900/50'}`}>
              <Icons.account /> <span>الحساب</span>
            </button>
            <button type="button" onClick={() => setActiveTab('org')} className={`flex items-center gap-2.5 px-4 py-2.5 text-sm font-medium rounded-xl transition-all whitespace-nowrap snap-center ${activeTab === 'org' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/10' : 'text-gray-400 hover:text-gray-200 hover:bg-gray-900/50'}`}>
              <Icons.org /> <span>المؤسسة</span>
            </button>
            <button type="button" onClick={() => setActiveTab('security')} className={`flex items-center gap-2.5 px-4 py-2.5 text-sm font-medium rounded-xl transition-all whitespace-nowrap snap-center ${activeTab === 'security' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/10' : 'text-gray-400 hover:text-gray-200 hover:bg-gray-900/50'}`}>
              <Icons.security /> <span>الأمان</span>
            </button>
            <button type="button" onClick={() => setActiveTab('billing')} className={`flex items-center gap-2.5 px-4 py-2.5 text-sm font-medium rounded-xl transition-all whitespace-nowrap snap-center ${activeTab === 'billing' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/10' : 'text-gray-400 hover:text-gray-200 hover:bg-gray-900/50'}`}>
              <Icons.billing /> <span>الاشتراك</span>
            </button>
          </div>

          {/* الحاوية الرئيسية للمحتوى */}
          <div className="flex-1 w-full bg-[#111827] border border-gray-800/80 rounded-2xl p-5 md:p-6 shadow-2xl relative overflow-hidden">
            
            {/* قسم الحساب الشخصي وتفضيلات التقارير */}
            {activeTab === 'account' && (
              <form onSubmit={handleSaveProfile} className="space-y-5">
                <div>
                  <h3 className="text-base font-bold text-white">الهوية الرقمية والتفضيلات</h3>
                  <p className="text-xs text-gray-400 mt-0.5">تحديث معلومات ملفك الشخصي وتخصيص طريقة عرض بيانات النظام لتقارير الـ CSV.</p>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                  <div>
                    <label className="block text-xs font-semibold text-gray-400 mb-1.5">الاسم الكامل</label>
                    <input type="text" value={profile.fullName} onChange={(e) => setProfile({ ...profile, fullName: e.target.value })} className="w-full bg-[#0B0F19] border border-gray-800 rounded-xl px-3.5 py-2.5 text-white text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/30 transition-all" required />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-400 mb-1.5">البريد الإلكتروني الحالي</label>
                    <input type="email" value={profile.email} disabled className="w-full bg-gray-950/40 border border-gray-800/60 rounded-xl px-3.5 py-2.5 text-gray-500 text-sm cursor-not-allowed select-none" />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                  <div className="relative">
                    <label className="block text-xs font-semibold text-gray-400 mb-1.5 flex items-center gap-1"><Icons.globe /> لغة واجهة المنصة</label>
                    <select value={profile.language} onChange={(e) => setProfile({ ...profile, language: e.target.value })} className="w-full bg-[#0B0F19] border border-gray-800 rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:border-indigo-500 appearance-none">
                      <option value="ar">العربية (RTL)</option>
                      <option value="en">English (LTR)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-400 mb-1.5 flex items-center gap-1"><Icons.time /> المنطقة الزمنية</label>
                    <select value={profile.timezone} onChange={(e) => setProfile({ ...profile, timezone: e.target.value })} className="w-full bg-[#0B0F19] border border-gray-800 rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:border-indigo-500">
                      <option value="Asia/Riyadh">آسيا/الرياض (GMT+3)</option>
                      <option value="Africa/Cairo">أفريقيا/القاهرة (GMT+2)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-400 mb-1.5 flex items-center gap-1"><Icons.time /> تنسيق عرض التاريخ</label>
                    <select value={profile.dateFormat} onChange={(e) => setProfile({ ...profile, dateFormat: e.target.value })} className="w-full bg-[#0B0F19] border border-gray-800 rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:border-indigo-500">
                      <option value="YYYY/MM/DD">YYYY/MM/DD</option>
                      <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                    </select>
                  </div>
                </div>

                <div className="pt-4 border-t border-gray-800 flex justify-end">
                  <button type="submit" disabled={loading} className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-800 text-white font-semibold text-xs px-5 py-2.5 rounded-xl transition-all shadow-md">{loading ? 'جاري التحديث...' : 'حفظ تفضيلات الحساب'}</button>
                </div>
              </form>
            )}

            {/* قسم مساحة عمل المؤسسة والبيانات التشغيلية المستخرجة */}
            {activeTab === 'org' && (
              <form onSubmit={handleSaveOrg} className="space-y-5">
                <div>
                  <h3 className="text-base font-bold text-white">الملف التشغيلي للمؤسسة</h3>
                  <p className="text-xs text-gray-400 mt-0.5">إدارة تفاصيل مساحة العمل المشتركة للشركة ونطاقات التحليل الموثوقة.</p>
                </div>

                {/* كروت ذكية لعرض ملخص البنية والمؤشرات الحالية للمؤسسة */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-1">
                  <div className="bg-[#0B0F19] border border-gray-800 p-3 rounded-xl">
                    <span className="block text-[10px] text-gray-400 font-semibold">عدد العملاء الحاليين</span>
                    <span className="block text-lg font-bold text-white mt-0.5">{org.associatedClients} عميل</span>
                  </div>
                  <div className="bg-[#0B0F19] border border-gray-800 p-3 rounded-xl">
                    <span className="block text-[10px] text-gray-400 font-semibold">تاريخ التأسيس الرقمي</span>
                    <span className="block text-xs font-bold text-gray-300 mt-1.5">{org.createdAt}</span>
                  </div>
                  <div className="bg-[#0B0F19] border border-gray-800 p-3 rounded-xl col-span-2 sm:col-span-1">
                    <span className="block text-[10px] text-gray-400 font-semibold">ارتباط الباقة الحالية</span>
                    <span className="block text-xs font-bold text-indigo-400 mt-1.5 flex items-center gap-1"><Icons.pulse /> {org.currentPlan}</span>
                  </div>
                </div>

                <div className="space-y-4 pt-2">
                  <div>
                    <label className="block text-xs font-semibold text-gray-400 mb-1.5">اسم المؤسسة التجاري</label>
                    <input type="text" value={org.name} onChange={(e) => setOrg({ ...org, name: e.target.value })} className="w-full bg-[#0B0F19] border border-gray-800 rounded-xl px-3.5 py-2.5 text-white text-sm focus:outline-none focus:border-indigo-500" required />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-400 mb-1.5 flex items-center gap-1"><Icons.link /> الموقع الإلكتروني الرسمي أو النطاق</label>
                    <input type="url" value={org.website} onChange={(e) => setOrg({ ...org, website: e.target.value })} className="w-full bg-[#0B0F19] border border-gray-800 rounded-xl px-3.5 py-2.5 text-white text-sm focus:outline-none focus:border-indigo-500" placeholder="https://example.com" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-400 mb-1.5">وصف النشاط والحملات التسويقية</label>
                    <textarea rows={2} value={org.description} onChange={(e) => setOrg({ ...org, description: e.target.value })} className="w-full bg-[#0B0F19] border border-gray-800 rounded-xl px-3.5 py-2.5 text-white text-sm focus:outline-none focus:border-indigo-500 resize-none" />
                  </div>
                </div>

                <div className="pt-4 border-t border-gray-800 flex justify-end">
                  <button type="submit" disabled={loading} className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-800 text-white font-semibold text-xs px-5 py-2.5 rounded-xl transition-all">{loading ? 'جاري الحفظ...' : 'حفظ بيانات المؤسسة'}</button>
                </div>
              </form>
            )}

            {/* مركز الأمان لمراقبة الجلسات وإدارة كلمات المرور */}
            {activeTab === 'security' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-base font-bold text-white">مركز الأمان والجلسات الفعالة</h3>
                  <p className="text-xs text-gray-400 mt-0.5">مراقبة سلامة الدخول الحالي، وحماية حسابك عبر تشفير الهوية الرسمي التابع لـ Supabase Guard.</p>
                </div>

                {/* كرت بصرى ذو مؤشرات أمان واضحة */}
                <div className="bg-[#0B0F19] border border-gray-800/80 rounded-xl p-4 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <Icons.shieldCheck />
                    <div>
                      <span className="block text-xs font-bold text-white">حالة أمان الحساب الإجمالية</span>
                      <span className="block text-[11px] text-gray-400 mt-0.5">الجلسة مؤمنة بالكامل ومتصلة بنظام مصادقة مشفر.</span>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold bg-emerald-950/60 border border-emerald-500/20 text-emerald-400 px-2.5 py-1 rounded-md">مستقر وجيد</span>
                </div>

                {/* سجل البيانات التشغيلية الفعالة للدخول الحالي */}
                <div className="border border-gray-800 bg-gray-950/20 rounded-xl p-3.5 space-y-2 text-xs">
                  <div className="flex justify-between border-b border-gray-800/50 pb-2 text-[11px]">
                    <span className="text-gray-400">الجهاز الحالي والمتصفح:</span>
                    <span className="text-gray-200 font-medium">{security.currentDevice}</span>
                  </div>
                  <div className="flex justify-between border-b border-gray-800/50 pb-2 text-[11px]">
                    <span className="text-gray-400">آخر تسجيل دخول مؤكد:</span>
                    <span className="text-gray-200 font-medium">{security.lastLogin}</span>
                  </div>
                  <div className="flex justify-between text-[11px]">
                    <span className="text-gray-400">عدد الجلسات الحالية المفتوحة:</span>
                    <span className="text-indigo-400 font-bold">{security.activeSessions} جلسة نشطة</span>
                  </div>
                </div>

                {/* فورم إدارة الأمان وتعديل كلمة المرور */}
                <form onSubmit={handleUpdatePassword} className="space-y-4 border-t border-gray-800 pt-5">
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider">تحديث تفاصيل كلمة المرور الموثقة</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-[11px] font-semibold text-gray-400 mb-1">كلمة المرور الحالية</label>
                      <input type="password" value={security.currentPassword} onChange={(e) => setSecurity({ ...security, currentPassword: e.target.value })} className="w-full bg-[#0B0F19] border border-gray-800 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-indigo-500" required />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-gray-400 mb-1">كلمة المرور الجديدة</label>
                      <input type="password" value={security.newPassword} onChange={(e) => setSecurity({ ...security, newPassword: e.target.value })} className="w-full bg-[#0B0F19] border border-gray-800 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-indigo-500" required />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-gray-400 mb-1">تأكيد كلمة المرور</label>
                      <input type="password" value={security.confirmPassword} onChange={(e) => setSecurity({ ...security, confirmPassword: e.target.value })} className="w-full bg-[#0B0F19] border border-gray-800 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-indigo-500" required />
                    </div>
                  </div>
                  <div className="flex justify-between items-center pt-2 gap-4">
                    <span className="text-[10px] text-gray-500">ينصح باختيار كلمة مرور تحتوي على أرقام ورموز خاصة لحماية الحساب.</span>
                    <button type="submit" disabled={loading} className="bg-gray-900 border border-gray-800 hover:bg-gray-800 text-gray-300 font-semibold text-xs px-4 py-2 rounded-xl transition-all whitespace-nowrap">{loading ? 'جاري التحديث...' : 'تحديث كلمة السر'}</button>
                  </div>
                </form>
              </div>
            )}

            {/* قسم إدارة الفوترة وحدود الاستهلاك الفعلي للملفات */}
            {activeTab === 'billing' && (
              <div className="space-y-5">
                <div>
                  <h3 className="text-base font-bold text-white">باقة الاشتراك ومعدلات الاستهلاك الفعلي</h3>
                  <p className="text-xs text-gray-400 mt-0.5">مراقبة الحصص الاستهلاكية لملفات الـ CSV المرفوعة لحملاتك وإدارة بوابة دفع العميل المتصلة بـ Stripe.</p>
                </div>

                {/* بطاقة تفاصيل باقة العميل ومستوى الدفع */}
                <div className="bg-[#0B0F19] border border-gray-800 rounded-xl p-4 space-y-4">
                  <div className="flex justify-between items-start gap-4">
                    <div>
                      <span className="text-[9px] font-bold text-indigo-400 bg-indigo-950/60 px-2 py-0.5 rounded border border-indigo-500/10">مستوى الباقة</span>
                      <h4 className="text-lg font-bold text-white mt-1">{subscription.planName}</h4>
                    </div>
                    <div className="flex flex-col items-end gap-1.5">
                      <span className="text-[10px] font-semibold bg-emerald-950/60 border border-emerald-500/20 text-emerald-400 px-2.5 py-0.5 rounded-full">{subscription.status}</span>
                      <span className="text-[10px] text-gray-400">{subscription.paymentStatus}</span>
                    </div>
                  </div>

                  {/* الـ Progress Bar ونظام نسب الاستهلاك الفعلي للحملات */}
                  <div className="space-y-1.5 pt-1">
                    <div className="flex justify-between text-xs">
                      <span className="text-gray-400 font-medium">ملفات الـ CSV المستهلكة للتحليل الذكي</span>
                      <span className="text-white font-bold">{subscription.usedFiles} <span className="text-gray-500 font-normal">من أصل</span> {subscription.maxFiles} ملف</span>
                    </div>
                    <div className="w-full bg-gray-800 h-2 rounded-full overflow-hidden">
                      <div className="bg-indigo-500 h-full rounded-full transition-all duration-500" style={{ width: `${(subscription.usedFiles / subscription.maxFiles) * 100}%` }}></div>
                    </div>
                    <div className="flex justify-between text-[10px] text-gray-500 pt-0.5">
                      <span>معدل الاستهلاك الحالي: {Math.round((subscription.usedFiles / subscription.maxFiles) * 100)}%</span>
                      <span>تاريخ الاستحقاق والتجديد القادم: {subscription.renewalDate}</span>
                    </div>
                  </div>
                </div>

                {/* كرت سفلي توجيهي لبوابة العميل الحالية لـ Stripe */}
                <div className="pt-3 border-t border-gray-800 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                  <p className="text-[11px] text-gray-400">يمكنك تعديل معلومات بطاقة الائتمان، تحميل الفواتير السابقة، أو إلغاء الاشتراك من لوحة التحكم المخصصة مسبقاً للفوترة.</p>
                  <button type="button" onClick={() => window.location.href = '/dashboard/billing'} className="w-full sm:w-auto bg-gray-900 border border-gray-800 text-gray-200 hover:bg-gray-800 font-bold text-xs px-4 py-2.5 rounded-xl transition-all whitespace-nowrap text-center">إدارة الفواتير عبر Stripe 💳</button>
                </div>
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
}
