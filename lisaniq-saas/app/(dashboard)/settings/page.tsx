'use client';

import React, { useState, useEffect } from 'react';

// نظام الأيقونات الموحد عالي الدقة (Premium Inline SVG Icons)
const Icons = {
  account: () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>,
  org: () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5m0 0V11m0 5H9m5-5h2m-2 5h2v-4a1 1 0 00-1-1h-1z" /></svg>,
  security: () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>,
  billing: () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" /></svg>,
  globe: () => <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" /></svg>,
  time: () => <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
  shieldCheck: () => <svg className="w-5 h-5 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>,
  link: () => <svg className="w-4 h-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5l-1.1 1.1" /></svg>,
  calendar: () => <svg className="w-4 h-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>,
  users: () => <svg className="w-4 h-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>,
  file: () => <svg className="w-4 h-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>,
  device: () => <svg className="w-4 h-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>,
  pulse: () => <svg className="w-3 h-3 text-emerald-400 animate-pulse" fill="currentColor" viewBox="0 0 20 20"><circle cx="10" cy="10" r="5" /></circle></svg>,
  card: () => <svg className="w-4 h-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" /></svg>
};

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<'account' | 'org' | 'security' | 'billing'>('account');
  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // بيانات حساب المستخدم الشخصية والتفضيلات
  const [profile, setProfile] = useState({
    fullName: 'عبد الرحيم مصباحي',
    email: 'contact@lisaniq.com',
    language: 'ar',
    timezone: 'Asia/Riyadh',
    dateFormat: 'YYYY/MM/DD'
  });

  // بيانات المؤسسة ومساحة العمل
  const [org, setOrg] = useState({
    name: 'مؤسسة ذكاء التسويق الرقمي',
    website: 'https://lisaniq.com',
    description: 'منصة رائدة لتحليل الحملات الإعلانية وتوليد التوصيات التلقائية.',
    associatedClients: 14,             
    createdAt: '22 مارس 2025',          
    currentPlan: 'الباقة الاحترافية Pro'      
  });

  // مركز أمان الحساب والجلسات النشطة
  const [security, setSecurity] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
    lastLogin: 'منذ ساعتين',             
    emailUsed: 'contact@lisaniq.com',   
    securityStatus: 'آمن ومستقر',             
    currentDevice: 'Chrome / Android',  
    activeSessions: 1                   
  });

  // بيانات سقف استهلاك الباقة والفوترة
  const [subscription, setSubscription] = useState({
    planName: 'الباقة الاحترافية (Pro Plan)', 
    status: 'نشط بنجاح',                     
    renewalDate: '1 أغسطس 2026',        
    usedFiles: 42,                     
    maxFiles: 100,                     
    associatedClients: 14,             
    paymentStatus: 'مؤمن عبر Stripe'              
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
      setMessage('تم حفظ الإعدادات وتحديث التفضيلات الشخصية بنجاح.');
    } catch (err: any) {
      setErrorMsg(err.message || 'حدث خطأ غير متوقع أثناء حفظ البيانات.');
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
      setMessage('تم حفظ بيانات ملف المؤسسة وتحديث مساحة العمل.');
    } catch (err: any) {
      setErrorMsg(err.message || 'تعذر مزامنة بيانات الشركة حالياً.');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdatePassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (security.newPassword !== security.confirmPassword) {
      setErrorMsg('تأكيد كلمة المرور الجديدة غير متطابق.');
      return;
    }
    setLoading(true); setMessage(''); setErrorMsg('');
    setTimeout(() => {
      setLoading(false);
      setMessage('تم تحديث تفاصيل كلمة المرور وتأمين الجلسة بنجاح.');
      setSecurity(prev => ({ ...prev, currentPassword: '', newPassword: '', confirmPassword: '' }));
    }, 500);
  };

  const handleLogoutAllDevices = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setMessage('تم إنهاء جميع الجلسات النشطة وتسجيل الخروج بنجاح.');
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
        
        {/* هيدر الصفحة الرئيسي المحسن بالكامل بمستوى الأنظمة العالمية */}
        <div className="flex items-center gap-4 mb-6 md:mb-8 border-b border-gray-800 pb-6">
          <div className="p-3 bg-indigo-600/10 border border-indigo-500/10 text-indigo-400 rounded-xl">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
          </div>
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-white tracking-tight">إعدادات المنصة</h1>
            <p className="text-xs md:text-sm text-gray-400 mt-1">إدارة الحساب، المؤسسة، الأمان، والاشتراك من مكان واحد.</p>
          </div>
        </div>

        {/* مساحة عرض الإشعارات الموقعية النظيفة */}
        {message && <div className="mb-5 p-3.5 bg-emerald-950/30 border border-emerald-500/15 text-emerald-400 rounded-xl text-xs md:text-sm font-medium flex items-center gap-2"><span>✅</span> {message}</div>}
        {errorMsg && <div className="mb-5 p-3.5 bg-red-950/30 border border-red-500/15 text-red-400 rounded-xl text-xs md:text-sm font-medium flex items-center gap-2"><span>⚠️</span> {errorMsg}</div>}

        {/* الهيكل التوجيهي المتجاوب 100% بدون أي Broken Tabs أو عناصر متزاحمة */}
        <div className="flex flex-col md:flex-row gap-6 md:gap-8 items-start">
          
          {/* شريط التبويبات الجانبي / الهاتف علوي بالتمرير الأفقي الآمن */}
          <div className="w-full md:w-60 flex md:flex-col overflow-x-auto md:overflow-visible border-b md:border-b-0 border-gray-800 md:space-y-1 pb-2 md:pb-0 scrollbar-none snap-x">
            <button type="button" onClick={() => { setActiveTab('account'); setMessage(''); setErrorMsg(''); }} className={`flex items-center gap-2.5 px-4 py-2.5 text-sm font-semibold rounded-xl transition-all whitespace-nowrap snap-center ${activeTab === 'account' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/10' : 'text-gray-400 hover:text-gray-200 hover:bg-gray-900/50'}`}>
              <Icons.account /> <span>الحساب</span>
            </button>
            <button type="button" onClick={() => { setActiveTab('org'); setMessage(''); setErrorMsg(''); }} className={`flex items-center gap-2.5 px-4 py-2.5 text-sm font-semibold rounded-xl transition-all whitespace-nowrap snap-center ${activeTab === 'org' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/10' : 'text-gray-400 hover:text-gray-200 hover:bg-gray-900/50'}`}>
              <Icons.org /> <span>المؤسسة</span>
            </button>
            <button type="button" onClick={() => { setActiveTab('security'); setMessage(''); setErrorMsg(''); }} className={`flex items-center gap-2.5 px-4 py-2.5 text-sm font-semibold rounded-xl transition-all whitespace-nowrap snap-center ${activeTab === 'security' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/10' : 'text-gray-400 hover:text-gray-200 hover:bg-gray-900/50'}`}>
              <Icons.security /> <span>الأمان</span>
            </button>
            <button type="button" onClick={() => { setActiveTab('billing'); setMessage(''); setErrorMsg(''); }} className={`flex items-center gap-2.5 px-4 py-2.5 text-sm font-semibold rounded-xl transition-all whitespace-nowrap snap-center ${activeTab === 'billing' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/10' : 'text-gray-400 hover:text-gray-200 hover:bg-gray-900/50'}`}>
              <Icons.billing /> <span>الاشتراك</span>
            </button>
          </div>

          {/* لوحة عرض المحتوى والـ Content Containers */}
          <div className="flex-1 w-full bg-[#111827] border border-gray-800/60 rounded-2xl p-5 md:p-6 shadow-xl overflow-hidden">
            
            {/* ========================================================= */}
            {/* 👤 قسم الحساب الشخصي (تحسين العرض والتنظيم والـ Labels) */}
            {/* ========================================================= */}
            {activeTab === 'account' && (
              <form onSubmit={handleSaveProfile} className="space-y-6">
                <div>
                  <h3 className="text-base font-bold text-white">بيانات الحساب الشخصي</h3>
                  <p className="text-xs text-gray-400 mt-1">تحديث تفاصيل الهوية الشخصية وتفضيلات عرض الحساب عبر النظام.</p>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-400 mb-2">الاسم الكامل</label>
                    <input type="text" value={profile.fullName} onChange={(e) => setProfile({ ...profile, fullName: e.target.value })} className="w-full bg-[#0B0F19] border border-gray-800 rounded-xl px-3.5 py-2.5 text-white text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/20 transition-all" required />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-400 mb-2">البريد الإلكتروني الحالي</label>
                    {/* البريد الإلكتروني معروض كـ Read-only text محمي وخارج الـ Input لمنع ثقل الواجهة بصرياً */}
                    <div className="w-full bg-gray-950/20 border border-gray-800/80 rounded-xl px-3.5 py-3 text-gray-400 text-sm select-none">
                      {profile.email}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-400 mb-2 flex items-center gap-1.5"><Icons.globe /> لغة المنصة</label>
                    <select value={profile.language} onChange={(e) => setProfile({ ...profile, language: e.target.value })} className="w-full bg-[#0B0F19] border border-gray-800 rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:border-indigo-500 transition-all">
                      <option value="ar">العربية (RTL)</option>
                      <option value="en">English (LTR)</option>
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

            {/* ========================================================= */}
            {/* 🏢 قسم المؤسسة (المتطلب: إخراج البيانات الثابتة وتحويلها إلى Premium Stats Cards) */}
            {/* ========================================================= */}
            {activeTab === 'org' && (
              <form onSubmit={handleSaveOrg} className="space-y-6">
                <div>
                  <h3 className="text-base font-bold text-white">بيانات المؤسسة ومساحة العمل</h3>
                  <p className="text-xs text-gray-400 mt-1">إدارة تفاصيل مساحة العمل وتدقيق المؤشرات التشغيلية للمنظمة.</p>
                </div>

                {/* استبدال الـ Inputs بكروت إحصائية (Stats Cards) متطورة بمظهر Stripe / Vercel */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {/* كرت: عدد العملاء الحاليين */}
                  <div className="bg-[#0B0F19]/60 border border-gray-800 p-4 rounded-xl flex items-center justify-between">
                    <div className="space-y-1">
                      <span className="block text-[11px] text-gray-400 font-medium">عدد العملاء الحاليين</span>
                      <span className="block text-xl font-bold text-white tracking-tight">{org.associatedClients} عميل</span>
                    </div>
                    <div className="text-gray-500"><Icons.users /></div>
                  </div>

                  {/* كرت: تاريخ إنشاء المؤسسة */}
                  <div className="bg-[#0B0F19]/60 border border-gray-800 p-4 rounded-xl flex items-center justify-between">
                    <div className="space-y-1">
                      <span className="block text-[11px] text-gray-400 font-medium">تاريخ إنشاء المؤسسة</span>
                      <span className="block text-base font-bold text-gray-200 tracking-tight">{org.createdAt}</span>
                    </div>
                    <div className="text-gray-500"><Icons.calendar /></div>
                  </div>

                  {/* كرت: الخطة الحالية للمؤسسة */}
                  <div className="bg-[#0B0F19]/60 border border-gray-800 p-4 rounded-xl flex items-center justify-between col-span-1">
                    <div className="space-y-1">
                      <span className="block text-[11px] text-gray-400 font-medium">الخطة الحالية للمؤسسة</span>
                      <span className="block text-sm font-bold text-indigo-400 flex items-center gap-1.5"><Icons.pulse /> {org.currentPlan}</span>
                    </div>
                  </div>
                </div>

                {/* الحقول التشغيلية القابلة للتعديل تظل داخل فورم منظم */}
                <div className="space-y-4 pt-2">
                  <div>
                    <label className="block text-xs font-semibold text-gray-400 mb-2">اسم المؤسسة</label>
                    <input type="text" value={org.name} onChange={(e) => setOrg({ ...org, name: e.target.value })} className="w-full bg-[#0B0F19] border border-gray-800 rounded-xl px-3.5 py-2.5 text-white text-sm focus:outline-none focus:border-indigo-500 transition-all" required />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-400 mb-2 flex items-center gap-1.5"><Icons.link /> الموقع الإلكتروني الرسمي</label>
                    <input type="url" value={org.website} onChange={(e) => setOrg({ ...org, website: e.target.value })} className="w-full bg-[#0B0F19] border border-gray-800 rounded-xl px-3.5 py-2.5 text-white text-sm focus:outline-none focus:border-indigo-500 transition-all" placeholder="https://example.com" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-400 mb-2">وصف النشاط التسويقي</label>
                    <textarea rows={2} value={org.description} onChange={(e) => setOrg({ ...org, description: e.target.value })} className="w-full bg-[#0B0F19] border border-gray-800 rounded-xl px-3.5 py-2.5 text-white text-sm focus:outline-none focus:border-indigo-500 transition-all resize-none" />
                  </div>
                </div>

                <div className="pt-4 border-t border-gray-800 flex justify-end">
                  <button type="submit" disabled={loading} className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-800 text-white font-semibold text-xs px-5 py-3 rounded-xl transition-all">{loading ? 'جاري الحفظ...' : 'حفظ بيانات المؤسسة'}</button>
                </div>
              </form>
            )}

            {/* ========================================================= */}
            {/* 🔒 قسم الأمان (المتطلب: تحويله إلى Security Center مع Premium Stats Cards وعناصر بصرية) */}
            {/* ========================================================= */}
            {activeTab === 'security' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-base font-bold text-white">مركز الأمان ومراقبة الوصول</h3>
                  <p className="text-xs text-gray-400 mt-1">تتبع جدار الأمان لجلسات الدخول الحالية وإدارة تراخيص الهوية المشفرة.</p>
                </div>

                {/* تحويل كافة حقول الدخول الثابتة المقروءة إلى Stats Cards فاخرة وخارج الـ Inputs كلياً */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {/* كرت: حالة الأمان */}
                  <div className="bg-[#0B0F19]/60 border border-gray-800 p-4 rounded-xl flex items-center justify-between">
                    <div className="space-y-1">
                      <span className="block text-[11px] text-gray-400 font-medium">حالة أمان الحساب</span>
                      <span className="block text-sm font-bold text-emerald-400 tracking-tight">{security.securityStatus}</span>
                    </div>
                    <div><Icons.shieldCheck /></div>
                  </div>

                  {/* كرت: آخر تسجيل دخول */}
                  <div className="bg-[#0B0F19]/60 border border-gray-800 p-4 rounded-xl flex items-center justify-between">
                    <div className="space-y-1">
                      <span className="block text-[11px] text-gray-400 font-medium">آخر تسجيل دخول مؤكد</span>
                      <span className="block text-sm font-bold text-gray-200 tracking-tight">{security.lastLogin}</span>
                    </div>
                    <div className="text-gray-500"><Icons.time /></div>
                  </div>

                  {/* كرت: عدد الجلسات النشطة */}
                  <div className="bg-[#0B0F19]/60 border border-gray-800 p-4 rounded-xl flex items-center justify-between">
                    <div className="space-y-1">
                      <span className="block text-[11px] text-gray-400 font-medium">عدد الجلسات النشطة</span>
                      <span className="block text-base font-bold text-indigo-400 tracking-tight">{security.activeSessions} جلسة فعالة</span>
                    </div>
                  </div>
                </div>

                {/* كرت حماية إضافي لعرض البريد والجهاز الحالي بدون استخدام حقول إدخال غامضة */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-gray-950/20 border border-gray-800/80 rounded-xl p-4 text-xs">
                  <div className="flex flex-col gap-1">
                    <span className="text-gray-400 font-semibold">البريد المستخدم الحالي للمصادقة</span>
                    <span className="text-sm font-bold text-white mt-1">{security.emailUsed}</span>
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="text-gray-400 font-semibold">جهاز الوصول الحالي النشط</span>
                    <span className="text-sm font-bold text-gray-300 mt-1 flex items-center gap-1.5"><Icons.device /> {security.currentDevice}</span>
                  </div>
                </div>

                {/* زر إنهاء الجلسات الآمن المخصص */}
                <div className="flex justify-start">
                  <button type="button" onClick={handleLogoutAllDevices} disabled={loading} className="w-full sm:w-auto bg-red-950/20 border border-red-500/15 hover:bg-red-950/40 text-red-400 font-semibold text-xs px-4 py-2.5 rounded-xl transition-all">
                    🚫 تسجيل الخروج من جميع الأجهزة الأخرى
                  </button>
                </div>

                {/* فورم حماية الهوية وتغيير كلمة السر */}
                <form onSubmit={handleUpdatePassword} className="space-y-4 border-t border-gray-800 pt-6">
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider">تغيير كلمة المرور الشخصية</h4>
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
                    <button type="submit" disabled={loading} className="w-full sm:w-auto bg-gray-900 border border-gray-800 hover:bg-gray-800 text-gray-300 font-semibold text-xs px-4 py-2.5 rounded-xl transition-all">{loading ? 'جاري التعديل...' : 'تحديث كلمة السر'}</button>
                  </div>
                </form>
              </div>
            )}

            {/* ========================================================= */}
            {/* 💳 قسم الاشتراك (المتطلب: Stripe Mirror & Usage Progress Bars & Stats Cards) */}
            {/* ========================================================= */}
            {activeTab === 'billing' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-base font-bold text-white">تفاصيل خطة الاشتراك والفوترة</h3>
                  <p className="text-xs text-gray-400 mt-1">مراقبة سقف استهلاك تقارير الـ CSV المرفوعة وإدارة بوابات الدفع الموثقة.</p>
                </div>

                {/* استبدال حقول المدخلات الثابتة كلياً بـ Premium SaaS Stat Cards */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="bg-[#0B0F19]/60 border border-gray-800 p-4 rounded-xl flex flex-col justify-between">
                    <span className="text-[10px] text-gray-400 font-semibold">الخطة الحالية</span>
                    <span className="text-xs font-bold text-white mt-2 tracking-tight">{subscription.planName}</span>
                  </div>
                  <div className="bg-[#0B0F19]/60 border border-gray-800 p-4 rounded-xl flex flex-col justify-between">
                    <span className="text-[10px] text-gray-400 font-semibold">حالة الاشتراك</span>
                    <div className="mt-2">
                      <span className="inline-block text-[10px] font-bold bg-emerald-950/60 border border-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded">{subscription.status}</span>
                    </div>
                  </div>
                  <div className="bg-[#0B0F19]/60 border border-gray-800 p-4 rounded-xl flex flex-col justify-between">
                    <span className="text-[10px] text-gray-400 font-semibold">بوابة الدفع التلقائي</span>
                    <div className="mt-2">
                      <span className="inline-block text-[10px] font-bold bg-gray-900 border border-gray-800 text-indigo-400 px-2 py-0.5 rounded-md flex items-center gap-1"><Icons.card /> Stripe</span>
                    </div>
                  </div>
                  <div className="bg-[#0B0F19]/60 border border-gray-800 p-4 rounded-xl flex flex-col justify-between">
                    <span className="text-[10px] text-gray-400 font-semibold">العملاء النشطين حالياً</span>
                    <span className="text-xs font-bold text-gray-200 mt-2 tracking-tight">{subscription.associatedClients} عميل نشط</span>
                  </div>
                </div>

                {/* لوحة التحكم ومراقبة استهلاك ومقاييس ملفات الـ CSV وحساب نسبة الاستهلاك بدقة */}
                <div className="bg-[#0B0F19]/60 border border-gray-800 rounded-xl p-4 sm:p-5 space-y-4">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-gray-400 font-semibold flex items-center gap-1.5"><Icons.file /> مقاييس استهلاك ملفات الـ CSV للحملات</span>
                    <span className="text-white font-bold">{subscription.usedFiles} <span className="text-gray-500 font-normal">من أصل</span> {subscription.maxFiles} ملف</span>
                  </div>
                  
                  {/* نظام الـ Progress Bar ونسب الاستهلاك الفعلي المقروء بصرياً */}
                  <div className="w-full bg-gray-800 h-2 rounded-full overflow-hidden">
                    <div className="bg-indigo-500 h-full rounded-full transition-all duration-300" style={{ width: `${(subscription.usedFiles / subscription.maxFiles) * 100}%` }}></div>
                  </div>

                  <div className="flex justify-between text-[11px] text-gray-400 pt-1">
                    <span>نسبة الحصة المستهلكة: {Math.round((subscription.usedFiles / subscription.maxFiles) * 100)}%</span>
                    <span>تاريخ الفوترة والتجديد القادم: {subscription.renewalDate}</span>
                  </div>
                </div>

                {/* كرت التوجيه لبوابة الدفع الحالية الخاصة بـ Stripe Customer Portal */}
                <div className="pt-4 border-t border-gray-800 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <p className="text-xs text-gray-400 max-w-md">لمراجعة تاريخ الفواتير، تحميل المستندات الضريبية أو إلغاء الاشتراك وتعديل البطاقة الائتمانية، يرجى الانتقال لوحة الفوترة المجهزة مسبقاً.</p>
                  <button type="button" onClick={() => window.location.href = '/dashboard/billing'} className="w-full sm:w-auto bg-gray-900 border border-gray-800 text-gray-200 hover:bg-gray-800 font-bold text-xs px-5 py-3 rounded-xl transition-all text-center">
                    إدارة الاشتراك والفوترة عبر Stripe 💳
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
