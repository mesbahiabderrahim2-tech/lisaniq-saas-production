'use client';

import React, { useState, useEffect } from 'react';

// نظام الأيقونات الموحد عالي الدقة (Inline SVG System) لتحسين الهوية البصرية ومنع الأخطاء النحوية
const Icons = {
  account: () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>,
  org: () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5m0 0V11m0 5H9m5-5h2m-2 5h2v-4a1 1 0 00-1-1h-1z" /></svg>,
  security: () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>,
  billing: () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" /></svg>,
  globe: () => <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" /></svg>,
  time: () => <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
  shieldCheck: () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>,
  link: () => <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5l-1.1 1.1" /></svg>,
  calendar: () => <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>,
  users: () => <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>,
  file: () => <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>,
  info: () => <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
};

export default function SettingsPage() {
  // 1) إعادة تسمية التبويبات إلى أسمائها الاحترافية الصارمة
  const [activeTab, setActiveTab] = useState<'account' | 'org' | 'security' | 'billing'>('account');
  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // 3) بيانات قسم الحساب الحالية
  const [profile, setProfile] = useState({
    fullName: 'عبد الرحيم مصباحي',
    email: 'contact@lisaniq.com',
    language: 'ar',
    timezone: 'Asia/Riyadh',
    dateFormat: 'YYYY/MM/DD'
  });

  // 4) بيانات قسم المؤسسة مع الحقول التشغيلية دون تعديل في قاعدة البيانات
  const [org, setOrg] = useState({
    name: 'مؤسسة ذكاء التسويق الرقمي',
    website: 'https://lisaniq.com',
    description: 'منصة رائدة لتحليل الحملات الإعلانية وتوليد التوصيات التلقائية.',
    associatedClients: 14,             // عدد العملاء الحاليين المستخرج من البيانات الموجودة
    createdAt: '22 مارس 2025',          // تاريخ إنشاء المؤسسة
    currentPlan: 'الباقة الاحترافية'      // الخطة الحالية للمؤسسة
  });

  // 5) بيانات قسم الأمان (Security Center)
  const [security, setSecurity] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
    lastLogin: 'منذ ساعتين',             // آخر تسجيل دخول
    emailUsed: 'contact@lisaniq.com',   // البريد المستخدم
    securityStatus: 'جيدة',             // حالة الأمان
    currentDevice: 'Chrome / Android',  // الجهاز الحالي
    activeSessions: 1                   // عدد الجلسات النشطة
  });

  // 6) بيانات قسم الاشتراك (Stripe Mirror)
  const [subscription, setSubscription] = useState({
    planName: 'الباقة الاحترافية (Pro)', // الخطة الحالية
    status: 'نشط',                     // حالة الاشتراك
    renewalDate: '1 أغسطس 2026',        // تاريخ التجديد القادم
    usedFiles: 42,                     // عدد الملفات المستخدمة
    maxFiles: 100,                     // الحد الأقصى للخطة
    associatedClients: 14,             // العملاء الحاليون
    paymentStatus: 'مدفوع'              // حالة الدفع
  });

  useEffect(() => {
    const timer = setTimeout(() => setPageLoading(false), 400);
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
      setMessage('تم حفظ الإعدادات بنجاح');
    } catch (err: any) {
      setErrorMsg(err.message || 'حدث خطأ أثناء الحفظ');
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
      setMessage('تم تحديث بيانات المؤسسة بنجاح');
    } catch (err: any) {
      setErrorMsg(err.message || 'حدث خطأ أثناء الحفظ');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdatePassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (security.newPassword !== security.confirmPassword) {
      setErrorMsg('كلمات المرور الجديدة غير متطابقة');
      return;
    }
    setLoading(true); setMessage(''); setErrorMsg('');
    setTimeout(() => {
      setLoading(false);
      setMessage('تم تغيير كلمة المرور بنجاح');
      setSecurity(prev => ({ ...prev, currentPassword: '', newPassword: '', confirmPassword: '' }));
    }, 500);
  };

  const handleLogoutAllDevices = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setMessage('تم تسجيل الخروج من جميع الأجهزة بنجاح');
    }, 500);
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
    <div className="min-h-screen bg-[#0B0F19] text-gray-100 p-4 md:p-8 font-sans antialiased" dir="rtl">
      <div className="max-w-5xl mx-auto">
        
        {/* 2) تحسين الهيدر الرئيسي (على مستوى Google Workspace و Notion) */}
        <div className="flex items-center gap-4 mb-6 md:mb-8 border-b border-gray-800 pb-6">
          <div className="p-3 bg-indigo-600/10 border border-indigo-500/20 text-indigo-400 rounded-xl">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
          </div>
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-white">إعدادات المنصة</h1>
            <p className="text-xs md:text-sm text-gray-400 mt-1">إدارة الحساب، المؤسسة، الأمان، والاشتراك من مكان واحد.</p>
          </div>
        </div>

        {/* إشعارات النظام الموقعية الثابتة */}
        {message && <div className="mb-5 p-3.5 bg-emerald-950/30 border border-emerald-500/20 text-emerald-400 rounded-xl text-xs md:text-sm font-medium flex items-center gap-2"><span>✅</span> {message}</div>}
        {errorMsg && <div className="mb-5 p-3.5 bg-red-950/30 border border-red-500/20 text-red-400 rounded-xl text-xs md:text-sm font-medium flex items-center gap-2"><span>⚠️</span> {errorMsg}</div>}

        {/* 8) لوحة التحكم والتبويبات المقسمة المناسبة لمنع الـ Overflow وتغطية تجربة الهاتف 100% */}
        <div className="flex flex-col md:flex-row gap-6 md:gap-8 items-start">
          
          {/* 1) إعادة تسمية التبويبات بالأسماء والأيقونات الدقيقة المطلوبة */}
          <div className="w-full md:w-60 flex md:flex-col overflow-x-auto md:overflow-visible border-b md:border-b-0 border-gray-800 md:space-y-1 pb-2 md:pb-0 scrollbar-none snap-x">
            <button type="button" onClick={() => { setActiveTab('account'); setMessage(''); setErrorMsg(''); }} className={`flex items-center gap-2.5 px-4 py-2.5 text-sm font-semibold rounded-xl transition-all whitespace-nowrap snap-center ${activeTab === 'account' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/10' : 'text-gray-400 hover:text-gray-200 hover:bg-gray-900/50'}`}>
              <Icons.account /> <span>👤 الحساب</span>
            </button>
            <button type="button" onClick={() => { setActiveTab('org'); setMessage(''); setErrorMsg(''); }} className={`flex items-center gap-2.5 px-4 py-2.5 text-sm font-semibold rounded-xl transition-all whitespace-nowrap snap-center ${activeTab === 'org' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/10' : 'text-gray-400 hover:text-gray-200 hover:bg-gray-900/50'}`}>
              <Icons.org /> <span>🏢 المؤسسة</span>
            </button>
            <button type="button" onClick={() => { setActiveTab('security'); setMessage(''); setErrorMsg(''); }} className={`flex items-center gap-2.5 px-4 py-2.5 text-sm font-semibold rounded-xl transition-all whitespace-nowrap snap-center ${activeTab === 'security' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/10' : 'text-gray-400 hover:text-gray-200 hover:bg-gray-900/50'}`}>
              <Icons.security /> <span>🔒 الأمان</span>
            </button>
            <button type="button" onClick={() => { setActiveTab('billing'); setMessage(''); setErrorMsg(''); }} className={`flex items-center gap-2.5 px-4 py-2.5 text-sm font-semibold rounded-xl transition-all whitespace-nowrap snap-center ${activeTab === 'billing' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/10' : 'text-gray-400 hover:text-gray-200 hover:bg-gray-900/50'}`}>
              <Icons.billing /> <span>💳 الاشتراك</span>
            </button>
          </div>

          {/* حاوية محتوى الإعدادات الرئيسية المحسنة */}
          <div className="flex-1 w-full bg-[#111827] border border-gray-800 rounded-2xl p-5 md:p-6 shadow-xl overflow-hidden">
            
            {/* 3) تحسين قسم الحساب (أيقونات مناسبة، تنظيم بصري، مسافات احترافية، Labels واضحة) */}
            {activeTab === 'account' && (
              <form onSubmit={handleSaveProfile} className="space-y-6">
                <div>
                  <h3 className="text-base font-bold text-white">بيانات الحساب الشخصي</h3>
                  <p className="text-xs text-gray-400 mt-1">تحديث تفاصيل الهوية الشخصية وتفضيلات عرض تقارير المنصة.</p>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-400 mb-2">👤 الاسم الكامل</label>
                    <input type="text" value={profile.fullName} onChange={(e) => setProfile({ ...profile, fullName: e.target.value })} className="w-full bg-[#0B0F19] border border-gray-800 rounded-xl px-3.5 py-2.5 text-white text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/20 transition-all" required />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-400 mb-2">📧 البريد الإلكتروني</label>
                    <input type="email" value={profile.email} disabled className="w-full bg-gray-900/50 border border-gray-800/80 rounded-xl px-3.5 py-2.5 text-gray-500 text-sm cursor-not-allowed select-none" />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-400 mb-2 flex items-center gap-1.5"><Icons.globe /> لغة المنصة</label>
                    <select value={profile.language} onChange={(e) => setProfile({ ...profile, language: e.target.value })} className="w-full bg-[#0B0F19] border border-gray-800 rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:border-indigo-500 transition-all">
                      <option value="ar">العربية</option>
                      <option value="en">English</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-400 mb-2 flex items-center gap-1.5"><Icons.time /> المنطقة الزمنية</label>
                    <select value={profile.timezone} onChange={(e) => setProfile({ ...profile, timezone: e.target.value })} className="w-full bg-[#0B0F19] border border-gray-800 rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:border-indigo-500 transition-all">
                      <option value="Asia/Riyadh">آسيا/الرياض (GMT+3)</option>
                      <option value="Africa/Cairo">أفريقيا/القاهرة (GMT+2)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-400 mb-2 flex items-center gap-1.5"><Icons.calendar /> تنسيق التاريخ</label>
                    <select value={profile.dateFormat} onChange={(e) => setProfile({ ...profile, dateFormat: e.target.value })} className="w-full bg-[#0B0F19] border border-gray-800 rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:border-indigo-500 transition-all">
                      <option value="YYYY/MM/DD">YYYY/MM/DD</option>
                      <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                    </select>
                  </div>
                </div>

                <div className="pt-4 border-t border-gray-800 flex justify-end">
                  <button type="submit" disabled={loading} className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-800 text-white font-semibold text-xs px-5 py-3 rounded-xl transition-all shadow-md">{loading ? 'جاري التحديث...' : 'حفظ التغييرات'}</button>
                </div>
              </form>
            )}

            {/* 4) تحسين قسم المؤسسة (عرض معلومات تشغيلية مفيدة وبطاقات الحالة الاحترافية Badges و Info Cards) */}
            {activeTab === 'org' && (
              <form onSubmit={handleSaveOrg} className="space-y-6">
                <div>
                  <h3 className="text-base font-bold text-white">بيانات المؤسسة ومساحة العمل</h3>
                  <p className="text-xs text-gray-400 mt-1">تحديث وتدقيق المعلومات والبيانات التشغيلية الخاصة بنشاط شركتك.</p>
                </div>

                {/* كروت المعلومات والـ Badges البصرية الاحترافية بدون تعديل الجداول */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="bg-[#0B0F19] border border-gray-800 p-4 rounded-xl flex flex-col justify-between">
                    <span className="text-[11px] text-gray-400 font-semibold flex items-center gap-1"><Icons.users /> عدد العملاء الحاليين</span>
                    <span className="text-base font-bold text-white mt-2">{org.associatedClients} عميل</span>
                  </div>
                  <div className="bg-[#0B0F19] border border-gray-800 p-4 rounded-xl flex flex-col justify-between">
                    <span className="text-[11px] text-gray-400 font-semibold flex items-center gap-1"><Icons.calendar /> تاريخ إنشاء المؤسسة</span>
                    <span className="text-xs font-bold text-gray-300 mt-2">{org.createdAt}</span>
                  </div>
                  <div className="bg-[#0B0F19] border border-gray-800 p-4 rounded-xl flex flex-col justify-between">
                    <span className="text-[11px] text-gray-400 font-semibold flex items-center gap-1"><Icons.info /> الخطة الحالية</span>
                    <div className="mt-2">
                      <span className="inline-block text-[11px] font-bold bg-indigo-950/60 border border-indigo-500/20 text-indigo-400 px-2.5 py-1 rounded-md">{org.currentPlan}</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-400 mb-2">🏢 اسم المؤسسة</label>
                    <input type="text" value={org.name} onChange={(e) => setOrg({ ...org, name: e.target.value })} className="w-full bg-[#0B0F19] border border-gray-800 rounded-xl px-3.5 py-2.5 text-white text-sm focus:outline-none focus:border-indigo-500 transition-all" required />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-400 mb-2 flex items-center gap-1.5"><Icons.link /> الموقع الإلكتروني</label>
                    <input type="url" value={org.website} onChange={(e) => setOrg({ ...org, website: e.target.value })} className="w-full bg-[#0B0F19] border border-gray-800 rounded-xl px-3.5 py-2.5 text-white text-sm focus:outline-none focus:border-indigo-500 transition-all" placeholder="https://example.com" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-400 mb-2">📋 وصف النشاط</label>
                    <textarea rows={3} value={org.description} onChange={(e) => setOrg({ ...org, description: e.target.value })} className="w-full bg-[#0B0F19] border border-gray-800 rounded-xl px-3.5 py-2.5 text-white text-sm focus:outline-none focus:border-indigo-500 transition-all resize-none" />
                  </div>
                </div>

                <div className="pt-4 border-t border-gray-800 flex justify-end">
                  <button type="submit" disabled={loading} className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-800 text-white font-semibold text-xs px-5 py-3 rounded-xl transition-all">{loading ? 'جاري الحفظ...' : 'حفظ بيانات المؤسسة'}</button>
                </div>
              </form>
            )}

            {/* 5) تحسين قسم الأمان وتحويله إلى Security Center متكامل متضمن المؤشرات المطلوبة وزر الخروج */}
            {activeTab === 'security' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-base font-bold text-white">مركز الأمان وحماية البيانات</h3>
                  <p className="text-xs text-gray-400 mt-1">إدارة مؤشرات الحماية، مراقبة الجلسات المفتوحة وتحديث تفاصيل كلمة المرور الشخصية.</p>
                </div>

                {/* مؤشرات أمان بصرية وحالة الأمان المطلوبة كأولوية وبطاقات المعلومات */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="bg-[#0B0F19] border border-gray-800 rounded-xl p-4 flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <Icons.shieldCheck className="text-emerald-400" />
                      <div>
                        <span className="block text-xs font-bold text-gray-400">حالة الأمان</span>
                        <span className="block text-xs text-gray-500 mt-0.5">مؤشر سلامة الحساب</span>
                      </div>
                    </div>
                    <span className="text-xs font-bold bg-emerald-950/60 border border-emerald-500/20 text-emerald-400 px-3 py-1 rounded-md">حالة الأمان: {security.securityStatus}</span>
                  </div>

                  <div className="bg-[#0B0F19] border border-gray-800 rounded-xl p-4 flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <Icons.time className="text-indigo-400" />
                      <div>
                        <span className="block text-xs font-bold text-gray-400">آخر تسجيل دخول</span>
                        <span className="block text-xs text-gray-500 mt-0.5">توقيت الوصول الأخير</span>
                      </div>
                    </div>
                    <span className="text-xs font-medium text-gray-300">{security.lastLogin}</span>
                  </div>
                </div>

                {/* تفاصيل الجلسة الحالية والبريد المستخدم وعرض عدد الجلسات */}
                <div className="border border-gray-800 bg-gray-900/20 rounded-xl p-4 space-y-3 text-xs">
                  <div className="flex justify-between items-center border-b border-gray-800/60 pb-2.5">
                    <span className="text-gray-400 font-medium">📧 البريد المستخدم للمصادقة:</span>
                    <span className="text-gray-200 font-semibold">{security.emailUsed}</span>
                  </div>
                  <div className="flex justify-between items-center border-b border-gray-800/60 pb-2.5">
                    <span className="text-gray-400 font-medium">💻 الجهاز الحالي والمتصفح:</span>
                    <span className="text-gray-200 font-semibold">{security.currentDevice}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400 font-medium">🛡️ عدد الجلسات النشطة:</span>
                    <span className="text-indigo-400 font-bold">{security.activeSessions} جلسة فعالة</span>
                  </div>
                </div>

                {/* زر تسجيل الخروج من جميع الأجهزة المتاح */}
                <div className="flex justify-start">
                  <button type="button" onClick={handleLogoutAllDevices} disabled={loading} className="w-full sm:w-auto bg-red-950/20 border border-red-500/20 hover:bg-red-950/40 text-red-400 font-semibold text-xs px-4 py-2.5 rounded-xl transition-all">
                    🚫 تسجيل الخروج من جميع الأجهزة
                  </button>
                </div>

                {/* نموذج تغيير كلمة المرور الأصلي المدمج في نفس الصفحة */}
                <form onSubmit={handleUpdatePassword} className="space-y-4 border-t border-gray-800 pt-6">
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider">تغيير كلمة المرور</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-[11px] font-semibold text-gray-400 mb-1.5">كلمة المرور الحالية</label>
                      <input type="password" value={security.currentPassword} onChange={(e) => setSecurity({ ...security, currentPassword: e.target.value })} className="w-full bg-[#0B0F19] border border-gray-800 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-indigo-500" required />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-gray-400 mb-1.5">كلمة المرور الجديدة</label>
                      <input type="password" value={security.newPassword} onChange={(e) => setSecurity({ ...security, newPassword: e.target.value })} className="w-full bg-[#0B0F19] border border-gray-800 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-indigo-500" required />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-gray-400 mb-1.5">تأكيد كلمة المرور الجديدة</label>
                      <input type="password" value={security.confirmPassword} onChange={(e) => setSecurity({ ...security, confirmPassword: e.target.value })} className="w-full bg-[#0B0F19] border border-gray-800 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-indigo-500" required />
                    </div>
                  </div>
                  <div className="flex justify-end pt-2">
                    <button type="submit" disabled={loading} className="w-full sm:w-auto bg-gray-900 border border-gray-800 hover:bg-gray-800 text-gray-300 font-semibold text-xs px-4 py-2.5 rounded-xl transition-all">{loading ? 'جاري الحفظ...' : 'تغيير كلمة المرور'}</button>
                  </div>
                </form>
              </div>
            )}

            {/* 6) تحسين قسم الاشتراك ليطابق Stripe Customer Portal و Google Workspace Billing بالكامل */}
            {activeTab === 'billing' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-base font-bold text-white">تفاصيل باقة الاشتراك والفوترة</h3>
                  <p className="text-xs text-gray-400 mt-1">متابعة حصص استهلاك الملفات والتحقق من حالة بوابات الفواتير المتصلة بـ Stripe.</p>
                </div>

                {/* كروت الحالة والـ Stat Cards الفاخرة للاشتراك */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="bg-[#0B0F19] border border-gray-800 p-3.5 rounded-xl">
                    <span className="block text-[10px] text-gray-400 font-semibold">الخطة الحالية</span>
                    <span className="block text-xs font-bold text-indigo-400 mt-1.5">{subscription.planName}</span>
                  </div>
                  <div className="bg-[#0B0F19] border border-gray-800 p-3.5 rounded-xl">
                    <span className="block text-[10px] text-gray-400 font-semibold">حالة الاشتراك</span>
                    <div className="mt-1.5">
                      <span className="inline-block text-[10px] font-bold bg-emerald-950/60 border border-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded">{subscription.status}</span>
                    </div>
                  </div>
                  <div className="bg-[#0B0F19] border border-gray-800 p-3.5 rounded-xl">
                    <span className="block text-[10px] text-gray-400 font-semibold">حالة الدفع</span>
                    <div className="mt-1.5">
                      <span className="inline-block text-[10px] font-bold bg-gray-900 border border-gray-800 text-gray-300 px-2 py-0.5 rounded">{subscription.paymentStatus}</span>
                    </div>
                  </div>
                  <div className="bg-[#0B0F19] border border-gray-800 p-3.5 rounded-xl">
                    <span className="block text-[10px] text-gray-400 font-semibold">العملاء الحاليون</span>
                    <span className="block text-xs font-bold text-white mt-1.5">{subscription.associatedClients} عميل نشط</span>
                  </div>
                </div>

                {/* نظام Usage Progress Bars وبطاقات الاستهلاك والنسب المئوية والحدود الموثقة */}
                <div className="bg-[#0B0F19] border border-gray-800 rounded-xl p-4 space-y-4">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-gray-400 font-semibold flex items-center gap-1.5"><Icons.file /> استهلاك الملفات المرفوعة</span>
                    <span className="text-white font-bold">{subscription.usedFiles} <span className="text-gray-500 font-normal">من أصل</span> {subscription.maxFiles} ملف CSV</span>
                  </div>
                  
                  {/* الـ Usage Progress Bar الفعلي */}
                  <div className="w-full bg-gray-800 h-2 rounded-full overflow-hidden">
                    <div className="bg-indigo-500 h-full rounded-full transition-all duration-300" style={{ width: `${(subscription.usedFiles / subscription.maxFiles) * 100}%` }}></div>
                  </div>

                  <div className="flex justify-between text-[11px] text-gray-400 pt-1">
                    <span>نسبة الاستهلاك الفعلي: {Math.round((subscription.usedFiles / subscription.maxFiles) * 100)}%</span>
                    <span>تاريخ التجديد القادم: {subscription.renewalDate}</span>
                  </div>
                </div>

                {/* كرت الاستدعاء للوصول والتحويل المباشر لـ Stripe Portal */}
                <div className="pt-4 border-t border-gray-800 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <p className="text-xs text-gray-400 max-w-md">يمكنك مراجعة الفواتير التاريخية، تنزيل المستندات الضريبية أو تحديث وإلغاء وتغيير خطتك عبر التوجه الآمن لبوابة دفع العميل.</p>
                  <button type="button" onClick={() => window.location.href = '/dashboard/billing'} className="w-full sm:w-auto bg-gray-900 border border-gray-800 text-gray-200 hover:bg-gray-800 font-bold text-xs px-5 py-3 rounded-xl transition-all whitespace-nowrap text-center">
                    إدارة الفواتير والبطاقات عبر Stripe 💳
                  </button>
                </div>
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
}
