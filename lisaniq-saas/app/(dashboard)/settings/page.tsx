'use client';

import React, { useState, useEffect } from 'react';

/**
 * 📊 ENTERPRISE ICON SYSTEM (SVG System Suite)
 * نظام أيقونات هندسي موحد: مقاس 16px، وزن 1.5، نمط متسق هندسياً بدون زخارف زائدة.
 */
const Icons = {
  // تبويبات الملاحة والعمليات الأساسية
  user: () => <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" /></svg>,
  building: () => <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 21v-8.25M15.75 21v-8.25M8.25 21v-8.25M3 9l9-6 9 6m-1.5 12V10.332A48.36 48.36 0 0 0 12 9.75c-2.551 0-5.056.2-7.5.582V21M3 21h18M12 6.75h.008v.008H12V6.75Z" /></svg>,
  shield: () => <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751A11.956 11.956 0 0 1 12 2.714Z" /></svg>,
  creditCard: () => <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-5.25-6.75h16.5a1.5 1.5 0 0 1 1.5 1.5v11.25a1.5 1.5 0 0 1-1.5 1.5H3.75a1.5 1.5 0 0 1-1.5-1.5V5.25a1.5 1.5 0 0 1 1.5-1.5Z" /></svg>,
  
  // دلالات الحقول الداخلية والمستندات
  mail: () => <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0l-7.5-4.615m19.5 0v-.243a2.25 2.25 0 0 0-1.07-1.916l-7.5-4.615a2.25 2.25 0 0 0-2.36 0l-7.5 4.615" /></svg>,
  globe: () => <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Zm0 0a8.966 8.966 0 0 1-5.917-2.244m5.917 2.244A8.967 8.967 0 0 0 18 18.75m-6 2.25V3m0 18a8.965 8.965 0 0 0 5.917-2.244M12 3c1.764 0 3.42.505 4.833 1.383L12 3Zm0 0A8.965 8.965 0 0 0 6.083 4.383L12 3Zm0 0v18M12 3a8.966 8.966 0 0 1 5.917 2.244M12 3a8.966 8.966 0 0 0-5.917 2.244" /></svg>,
  download: () => <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3" /></svg>,
  externalLink: () => <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 0 0 3 8.25v10.5A2.25 2.25 0 0 0 5.25 21h10.5A2.25 2.25 0 0 0 18 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" /></svg>
};

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<'account' | 'org' | 'security' | 'billing'>('account');
  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const [profile, setProfile] = useState({
    fullName: 'عبد الرحيم مصباحي',
    email: 'contact@lisaniq.com',
    language: 'ar',
    timezone: 'Asia/Riyadh',
    dateFormat: 'YYYY/MM/DD'
  });

  const [org, setOrg] = useState({
    name: 'مؤسسة ذكاء التسويق الرقمي',
    website: 'https://lisaniq.com',
    description: 'منصة رائدة لتحليل الحملات الإعلانية وتوليد Tonal Recommendations تلقائياً.',
    associatedClients: 14,             
    createdAt: '22 مارس 2025',          
    currentPlan: 'الباقة الاحترافية Pro'      
  });

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

  const [subscription, setSubscription] = useState({
    planName: 'الباقة الاحترافية (Pro Plan)', 
    status: 'نشط',                     
    renewalDate: '1 أغسطس 2026',
    price: '$49 / شهرياً',       
    csvUsed: 42,                     
    csvMax: 100,                     
    storageUsed: 1.2,
    storageMax: 5.0,
    apiUsed: 8450,
    apiMax: 25000,
    paymentMethod: 'Visa •••• 4242'
  });

  const [invoices] = useState([
    { id: 'INV-2026-003', date: '01 يوليو 2026', amount: '$49.00', status: 'مدفوعة' },
    { id: 'INV-2026-002', date: '01 يونيو 2026', amount: '$49.00', status: 'مدفوعة' },
    { id: 'INV-2026-001', date: '01 مايو 2026', amount: '$49.00', status: 'مدفوعة' },
  ]);

  useEffect(() => {
    const timer = setTimeout(() => setPageLoading(false), 300);
    return () => clearTimeout(timer);
  }, []);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); setMessage(''); setErrorMsg('');
    setTimeout(() => { setLoading(false); setMessage('تم حفظ الإعدادات بنجاح.'); }, 400);
  };

  const handleSaveOrg = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); setMessage(''); setErrorMsg('');
    setTimeout(() => { setLoading(false); setMessage('تم حفظ بيانات مساحة العمل بنجاح.'); }, 400);
  };

  const handleUpdatePassword = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); setMessage(''); setErrorMsg('');
    setTimeout(() => {
      setLoading(false);
      setMessage('تم تحديث تفاصيل الأمان الخاصة بك.');
    }, 400);
  };

  if (pageLoading) {
    return (
      <div className="min-h-screen bg-[#0B0F19] p-8" dir="rtl">
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="w-32 h-6 bg-gray-900 rounded animate-pulse"></div>
          <div className="w-full h-10 bg-gray-900 rounded-lg animate-pulse"></div>
          <div className="h-64 bg-gray-900 rounded-xl animate-pulse"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0B0F19] text-gray-200 p-6 md:p-12 font-sans antialiased selection:bg-indigo-500/30 selection:text-white" dir="rtl">
      <div className="max-w-4xl mx-auto">
        
        {/* هيدر الصفحة النظيف والمبسط جداً */}
        <div className="mb-12">
          <h1 className="text-xl md:text-2xl font-semibold text-white tracking-tight">الإعدادات</h1>
          <p className="text-xs md:text-sm text-gray-500 font-normal mt-1.5">إدارة الحساب ومساحة العمل والأمان والفوترة.</p>
        </div>

        {message && <div className="mb-8 p-3.5 bg-emerald-950/20 border border-emerald-500/10 text-emerald-400 rounded-xl text-xs font-medium flex items-center gap-2"><span>•</span> {message}</div>}

        <div className="flex flex-col md:flex-row gap-10 items-start">
          
          {/* شريط التنقل الخطي الصارم - يستدعي نظام الأيقونات الموحد بدقة مع اتساق الوزن والأبعاد */}
          <div className="w-full md:w-44 flex md:flex-col overflow-x-auto md:overflow-visible border-b md:border-b-0 border-gray-900 md:space-y-1 pb-1 md:pb-0 scrollbar-none snap-x gap-1">
            <button type="button" onClick={() => { setActiveTab('account'); setMessage(''); setErrorMsg(''); }} className={`flex items-center gap-2.5 px-3.5 py-2.5 text-xs font-medium rounded-lg transition-all flex-1 md:flex-none justify-center md:justify-start ${activeTab === 'account' ? 'bg-gray-900 text-white font-semibold' : 'text-gray-500 hover:text-gray-300 hover:bg-gray-900/30'}`}><Icons.user /> <span>الحساب</span></button>
            <button type="button" onClick={() => { setActiveTab('org'); setMessage(''); setErrorMsg(''); }} className={`flex items-center gap-2.5 px-3.5 py-2.5 text-xs font-medium rounded-lg transition-all flex-1 md:flex-none justify-center md:justify-start ${activeTab === 'org' ? 'bg-gray-900 text-white font-semibold' : 'text-gray-500 hover:text-gray-300 hover:bg-gray-900/30'}`}><Icons.building /> <span>المؤسسة</span></button>
            <button type="button" onClick={() => { setActiveTab('security'); setMessage(''); setErrorMsg(''); }} className={`flex items-center gap-2.5 px-3.5 py-2.5 text-xs font-medium rounded-lg transition-all flex-1 md:flex-none justify-center md:justify-start ${activeTab === 'security' ? 'bg-gray-900 text-white font-semibold' : 'text-gray-500 hover:text-gray-300 hover:bg-gray-900/30'}`}><Icons.shield /> <span>الأمان</span></button>
            <button type="button" onClick={() => { setActiveTab('billing'); setMessage(''); setErrorMsg(''); }} className={`flex items-center gap-2.5 px-3.5 py-2.5 text-xs font-medium rounded-lg transition-all flex-1 md:flex-none justify-center md:justify-start ${activeTab === 'billing' ? 'bg-gray-900 text-white font-semibold' : 'text-gray-500 hover:text-gray-300 hover:bg-gray-900/30'}`}><Icons.creditCard /> <span>الفوترة</span></button>
          </div>

          <div className="flex-1 w-full text-sm">
            
            {/* ========================================================= */}
            {/* 👤 قسم الحساب الشخصي */}
            {/* ========================================================= */}
            {activeTab === 'account' && (
              <form onSubmit={handleSaveProfile} className="space-y-8">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs font-medium text-gray-400 mb-2 flex items-center gap-1.5"><Icons.user /> الاسم الكامل</label>
                    <input type="text" value={profile.fullName} onChange={(e) => setProfile({ ...profile, fullName: e.target.value })} className="w-full bg-[#0B0F19] border border-gray-800 rounded-lg px-3 py-2.5 text-white text-xs focus:outline-none focus:border-gray-600 transition-all" required />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-400 mb-2 flex items-center gap-1.5"><Icons.mail /> البريد الإلكتروني</label>
                    <div className="w-full bg-transparent border border-gray-900 rounded-lg px-3 py-2.5 text-gray-500 text-xs select-none">
                      {profile.email}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-400 mb-2">لغة المنصة</label>
                    <select value={profile.language} onChange={(e) => setProfile({ ...profile, language: e.target.value })} className="w-full bg-[#0B0F19] border border-gray-800 rounded-lg px-3 py-2.5 text-white text-xs focus:outline-none focus:border-gray-600 transition-all">
                      <option value="ar">العربية</option>
                      <option value="en">English</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-400 mb-2">المنطقة الزمنية</label>
                    <select value={profile.timezone} onChange={(e) => setProfile({ ...profile, timezone: e.target.value })} className="w-full bg-[#0B0F19] border border-gray-800 rounded-lg px-3 py-2.5 text-white text-xs focus:outline-none focus:border-gray-600 transition-all">
                      <option value="Asia/Riyadh">آسيا/الرياض</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-400 mb-2">تنسيق التاريخ</label>
                    <select value={profile.dateFormat} onChange={(e) => setProfile({ ...profile, dateFormat: e.target.value })} className="w-full bg-[#0B0F19] border border-gray-800 rounded-lg px-3 py-2.5 text-white text-xs focus:outline-none focus:border-gray-600 transition-all">
                      <option value="YYYY/MM/DD">YYYY/MM/DD</option>
                    </select>
                  </div>
                </div>

                <div className="pt-4 border-t border-gray-900 flex justify-end">
                  <button type="submit" disabled={loading} className="w-full sm:w-auto bg-white hover:bg-gray-100 text-black font-medium text-xs px-4 py-2 rounded-lg transition-all shadow-sm">{loading ? 'جاري الحفظ...' : 'حفظ التغييرات'}</button>
                </div>
              </form>
            )}

            {/* ========================================================= */}
            {/* 🏢 قسم المؤسسة */}
            {/* ========================================================= */}
            {activeTab === 'org' && (
              <form onSubmit={handleSaveOrg} className="space-y-8">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-xs font-medium text-gray-400 mb-2 flex items-center gap-1.5"><Icons.building /> اسم المؤسسة</label>
                    <input type="text" value={org.name} onChange={(e) => setOrg({ ...org, name: e.target.value })} className="w-full bg-[#0B0F19] border border-gray-800 rounded-lg px-3 py-2.5 text-white text-xs focus:outline-none focus:border-gray-600 transition-all" required />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-400 mb-2 flex items-center gap-1.5"><Icons.globe /> الموقع الإلكتروني الرسمي</label>
                    <input type="url" value={org.website} onChange={(e) => setOrg({ ...org, website: e.target.value })} className="w-full bg-[#0B0F19] border border-gray-800 rounded-lg px-3 py-2.5 text-white text-xs focus:outline-none focus:border-gray-600 transition-all" />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-400 mb-2">وصف النشاط</label>
                  <textarea rows={2} value={org.description} onChange={(e) => setOrg({ ...org, description: e.target.value })} className="w-full bg-[#0B0F19] border border-gray-800 rounded-lg px-3 py-2.5 text-white text-xs focus:outline-none focus:border-gray-600 transition-all resize-none" />
                </div>

                <div className="pt-4 border-t border-gray-900 flex justify-end">
                  <button type="submit" className="w-full sm:w-auto bg-white hover:bg-gray-100 text-black font-medium text-xs px-4 py-2 rounded-lg transition-all">حفظ البيانات</button>
                </div>
              </form>
            )}

            {/* ========================================================= */}
            {/* 🔒 قسم الأمان */}
            {/* ========================================================= */}
            {activeTab === 'security' && (
              <div className="space-y-8">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs text-gray-400">
                  <div className="space-y-1">
                    <span className="block font-medium">حالة أمان الحساب الحالية:</span>
                    <span className="block text-white font-semibold flex items-center gap-1.5"><Icons.shield /> {security.securityStatus}</span>
                  </div>
                  <div className="space-y-1">
                    <span className="block font-medium">آخر الوصول والجلسات النشطة:</span>
                    <span className="block text-white font-semibold">{security.currentDevice} ({security.lastLogin})</span>
                  </div>
                </div>

                <form onSubmit={handleUpdatePassword} className="space-y-6 border-t border-gray-900 pt-8">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-gray-400 mb-2">كلمة المرور الحالية</label>
                      <input type="password" value={security.currentPassword} onChange={(e) => setSecurity({ ...security, currentPassword: e.target.value })} className="w-full bg-[#0B0F19] border border-gray-800 rounded-lg px-3 py-2 text-white text-xs focus:outline-none focus:border-gray-600" required />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-400 mb-2">كلمة المرور الجديدة</label>
                      <input type="password" value={security.newPassword} onChange={(e) => setSecurity({ ...security, newPassword: e.target.value })} className="w-full bg-[#0B0F19] border border-gray-800 rounded-lg px-3 py-2 text-white text-xs focus:outline-none focus:border-gray-600" required />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-400 mb-2">تأكيد كلمة المرور</label>
                      <input type="password" value={security.confirmPassword} onChange={(e) => setSecurity({ ...security, confirmPassword: e.target.value })} className="w-full bg-[#0B0F19] border border-gray-800 rounded-lg px-3 py-2 text-white text-xs focus:outline-none focus:border-gray-600" required />
                    </div>
                  </div>
                  <div className="flex justify-end pt-2">
                    <button type="submit" className="w-full sm:w-auto bg-gray-900 border border-gray-800 hover:bg-gray-800 text-white font-medium text-xs px-4 py-2 rounded-lg transition-all">تحديث كلمة السر</button>
                  </div>
                </form>
              </div>
            )}

            {/* ========================================================= */}
            {/* 💳 قسم الفوترة والاشتراكات النظيف مع الأيقونات الموحدة */}
            {/* ========================================================= */}
            {activeTab === 'billing' && (
              <div className="space-y-12">
                
                {/* SECTION 1: Current Plan */}
                <div>
                  <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2">
                    <div>
                      <h3 className="text-base font-semibold text-white tracking-tight flex items-center gap-1.5"><Icons.creditCard /> {subscription.planName}</h3>
                      <p className="text-xs text-gray-500 mt-1">حالة الحساب الحالي: {subscription.status} • الفوترة القادمة في {subscription.renewalDate}</p>
                    </div>
                    <span className="text-base font-medium text-gray-300 sm:text-left">{subscription.price}</span>
                  </div>
                </div>

                {/* SECTION 2: Usage Metrics */}
                <div className="space-y-6">
                  <span className="text-xs font-medium text-gray-400 tracking-wider block">استهلاك الحصص الحالية</span>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                    {/* CSV Usage */}
                    <div className="space-y-2">
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-gray-400">ملفات CSV المرفوعة</span>
                        <span className="text-white font-medium font-mono">{subscription.csvUsed}/{subscription.csvMax}</span>
                      </div>
                      <div className="w-full bg-gray-900 h-1 rounded-full overflow-hidden">
                        <div className="bg-white h-full rounded-full" style={{ width: `${(subscription.csvUsed / subscription.csvMax) * 100}%` }}></div>
                      </div>
                    </div>

                    {/* Storage Usage */}
                    <div className="space-y-2">
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-gray-400">المساحة السحابية</span>
                        <span className="text-white font-medium font-mono">{subscription.storageUsed}/{subscription.storageMax} GB</span>
                      </div>
                      <div className="w-full bg-gray-900 h-1 rounded-full overflow-hidden">
                        <div className="bg-white h-full rounded-full" style={{ width: `${(subscription.storageUsed / subscription.storageMax) * 100}%` }}></div>
                      </div>
                    </div>

                    {/* API Usage */}
                    <div className="space-y-2">
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-gray-400">طلبات واستدعاءات API</span>
                        <span className="text-white font-medium font-mono">{subscription.apiUsed.toLocaleString()}</span>
                      </div>
                      <div className="w-full bg-gray-900 h-1 rounded-full overflow-hidden">
                        <div className="bg-white h-full rounded-full" style={{ width: `${(subscription.apiUsed / subscription.apiMax) * 100}%` }}></div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* SECTION 3: Billing Actions */}
                <div className="pt-4 border-t border-gray-950 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 text-xs">
                  <div className="space-y-0.5">
                    <span className="block text-gray-400 font-medium">وسيلة الدفع النشطة للحساب</span>
                    <span className="block text-gray-500 font-mono">{subscription.paymentMethod}</span>
                  </div>
                  <button type="button" onClick={() => window.location.href = '/dashboard/billing'} className="w-full sm:w-auto bg-gray-900 border border-gray-800 text-white font-medium px-4 py-2.5 rounded-lg transition-all text-center flex items-center justify-center gap-1.5 hover:bg-gray-800">
                    إدارة الفوترة عبر Stripe <Icons.externalLink />
                  </button>
                </div>

                {/* SECTION 4: Billing History */}
                <div className="space-y-3 pt-4">
                  <span className="text-xs font-medium text-gray-400 block">الفواتير السابقة</span>
                  <div className="border-t border-gray-900 divide-y divide-gray-950">
                    {invoices.map((invoice) => (
                      <div key={invoice.id} className="flex items-center justify-between py-3.5 text-xs text-gray-400">
                        <div className="flex items-center gap-6">
                          <span className="font-mono text-white font-medium">{invoice.id}</span>
                          <span className="text-gray-500">{invoice.date}</span>
                        </div>
                        <div className="flex items-center gap-4">
                          <span className="font-medium text-gray-300 font-mono">{invoice.amount}</span>
                          <button type="button" title="تحميل المستند" className="p-1 hover:text-white transition-all flex items-center justify-center">
                            <Icons.download />
                          </button>
                        </div>
                      </div>
                    ))}
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
