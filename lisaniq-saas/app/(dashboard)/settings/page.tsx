'use client';

import React, { useState, useEffect } from 'react';

// نظام أيقونات هندسي موحد ومصقل (Linear & Apple Minimalist Style)
// خطوط دقيقة (1.5) وبدون أي خلفيات أو إطارات ديكورية زائدة لتجنب التشتت البصري
const Icons = {
  account: () => <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>,
  org: () => <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5m0 0V11m0 5H9m5-5h2m-2 5h2v-4a1 1 0 00-1-1h-1z" /></svg>,
  security: () => <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>,
  billing: () => <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" /></svg>,
  download: () => <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>,
  externalLink: () => <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
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
        
        {/* هيدر الصفحة النظيف والمبسط جداً - تباين كامل واعتماد كامل على المساحات المفتوحة */}
        <div className="mb-12">
          <h1 className="text-xl md:text-2xl font-semibold text-white tracking-tight">الإعدادات</h1>
          <p className="text-xs md:text-sm text-gray-500 font-normal mt-1.5">إدارة الحساب ومساحة العمل والأمان والفوترة.</p>
        </div>

        {/* مساحة عرض الإشعارات الهادئة والمنسجمة سيادياً مع التصميم */}
        {message && <div className="mb-8 p-3.5 bg-emerald-950/20 border border-emerald-500/10 text-emerald-400 rounded-xl text-xs font-medium flex items-center gap-2"><span>•</span> {message}</div>}

        {/* توزيع المعمارية الكلية للتبويبات والمحتوى */}
        <div className="flex flex-col md:flex-row gap-10 items-start">
          
          {/* شريط التنقل الخطي الصارم - إزالة الأطر غير الضرورية والاعتماد على التباين النظيف والخطوط الشفافة */}
          <div className="w-full md:w-44 flex md:flex-col overflow-x-auto md:overflow-visible border-b md:border-b-0 border-gray-900 md:space-y-1 pb-1 md:pb-0 scrollbar-none snap-x gap-1">
            <button type="button" onClick={() => { setActiveTab('account'); setMessage(''); setErrorMsg(''); }} className={`flex items-center gap-2.5 px-3.5 py-2.5 text-xs font-medium rounded-lg transition-all flex-1 md:flex-none justify-center md:justify-start ${activeTab === 'account' ? 'bg-gray-900 text-white font-semibold' : 'text-gray-500 hover:text-gray-300 hover:bg-gray-900/30'}`}><Icons.account /> <span>الحساب</span></button>
            <button type="button" onClick={() => { setActiveTab('org'); setMessage(''); setErrorMsg(''); }} className={`flex items-center gap-2.5 px-3.5 py-2.5 text-xs font-medium rounded-lg transition-all flex-1 md:flex-none justify-center md:justify-start ${activeTab === 'org' ? 'bg-gray-900 text-white font-semibold' : 'text-gray-500 hover:text-gray-300 hover:bg-gray-900/30'}`}><Icons.org /> <span>المؤسسة</span></button>
            <button type="button" onClick={() => { setActiveTab('security'); setMessage(''); setErrorMsg(''); }} className={`flex items-center gap-2.5 px-3.5 py-2.5 text-xs font-medium rounded-lg transition-all flex-1 md:flex-none justify-center md:justify-start ${activeTab === 'security' ? 'bg-gray-900 text-white font-semibold' : 'text-gray-500 hover:text-gray-300 hover:bg-gray-900/30'}`}><Icons.security /> <span>الأمان</span></button>
            <button type="button" onClick={() => { setActiveTab('billing'); setMessage(''); setErrorMsg(''); }} className={`flex items-center gap-2.5 px-3.5 py-2.5 text-xs font-medium rounded-lg transition-all flex-1 md:flex-none justify-center md:justify-start ${activeTab === 'billing' ? 'bg-gray-900 text-white font-semibold' : 'text-gray-500 hover:text-gray-300 hover:bg-gray-900/30'}`}><Icons.billing /> <span>الفوترة</span></button>
          </div>

          {/* مساحة عرض المحتويات الصافية بدون أطر ثقيلة أو عناصر تشتيت ملونة */}
          <div className="flex-1 w-full text-sm">
            
            {/* ========================================================= */}
            {/* 👤 قسم الحساب الشخصي (Decluttered Form) */}
            {/* ========================================================= */}
            {activeTab === 'account' && (
              <form onSubmit={handleSaveProfile} className="space-y-8">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs font-medium text-gray-400 mb-2">الاسم الكامل</label>
                    <input type="text" value={profile.fullName} onChange={(e) => setProfile({ ...profile, fullName: e.target.value })} className="w-full bg-[#0B0F19] border border-gray-800 rounded-lg px-3 py-2.5 text-white text-xs focus:outline-none focus:border-gray-600 transition-all" required />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-400 mb-2">البريد الإلكتروني</label>
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
            {/* 🏢 قسم المؤسسة (Decluttered View) */}
            {/* ========================================================= */}
            {activeTab === 'org' && (
              <form onSubmit={handleSaveOrg} className="space-y-8">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-xs font-medium text-gray-400 mb-2">اسم المؤسسة</label>
                    <input type="text" value={org.name} onChange={(e) => setOrg({ ...org, name: e.target.value })} className="w-full bg-[#0B0F19] border border-gray-800 rounded-lg px-3 py-2.5 text-white text-xs focus:outline-none focus:border-gray-600 transition-all" required />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-400 mb-2">الموقع الإلكتروني الرسمي</label>
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
            {/* 🔒 قسم الأمان (Clean Security Pass) */}
            {/* ========================================================= */}
            {activeTab === 'security' && (
              <div className="space-y-8">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs text-gray-400">
                  <div className="space-y-1">
                    <span className="block font-medium">حالة أمان الحساب الحالية:</span>
                    <span className="block text-white font-semibold">{security.securityStatus}</span>
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
            {/* 💳 قسم الفوترة الفاخر المصفى (Premium SaaS Billing Structure) */}
            {/* ========================================================= */}
            {activeTab === 'billing' && (
              <div className="space-y-12">
                
                {/* SECTION 1: Current Plan */}
                <div>
                  <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2">
                    <div>
                      <h3 className="text-base font-semibold text-white tracking-tight">{subscription.planName}</h3>
                      <p className="text-xs text-gray-500 mt-1">حالة الحساب الحالي: {subscription.status} • الفوترة القادمة في {subscription.renewalDate}</p>
                    </div>
                    <span className="text-base font-medium text-gray-300 sm:text-left">{subscription.price}</span>
                  </div>
                </div>

                {/* SECTION 2: Usage Metrics (تجريد تام للبطاقات الكثيفة والاعتماد على بارات مجهرية نقية) */}
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

                {/* SECTION 4: Billing History (سجل خطي مصفى بالكامل مقتبس من معايير Linear) */}
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
                          <button type="button" title="تحميل المستند" className="p-1 hover:text-white transition-all">
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
