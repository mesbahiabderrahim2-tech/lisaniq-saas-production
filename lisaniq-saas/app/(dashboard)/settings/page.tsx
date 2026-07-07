'use client';

import React, { useState, useEffect } from 'react';

// نظام الأيقونات الموحد والمبسط (Premium Minimalist Style)
const Icons = {
  account: () => <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>,
  org: () => <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5m0 0V11m0 5H9m5-5h2m-2 5h2v-4a1 1 0 00-1-1h-1z" /></svg>,
  security: () => <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>,
  billing: () => <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" /></svg>,
  
  // أيقونات تشغيلية مخصصة لقسم الفوترة العالمي
  download: () => <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>,
  receipt: () => <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>,
  creditCard: () => <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" /></svg>,
  externalLink: () => <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>,
  checkCircle: () => <svg className="w-4 h-4 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
};

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<'account' | 'org' | 'security' | 'billing'>('billing'); // الفوترة نشطة افتراضياً للمعاينة المباشرة
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

  // بيانات الفوترة والاشتراك المتقدمة والمحسنة بالكامل لهيكلية الـ SaaS
  const [subscription, setSubscription] = useState({
    planName: 'الباقة الاحترافية (Pro Plan)', 
    status: 'نشط (Active)',                     
    renewalDate: '1 أغسطس 2026',
    price: '$49 / شهرياً',       
    csvUsed: 42,                     
    csvMax: 100,                     
    storageUsed: 1.2, // جيجابايت
    storageMax: 5.0,  // جيجابايت
    apiUsed: 8450,
    apiMax: 25000,
    paymentMethod: 'Visa تنتهي بـ •••• 4242'
  });

  // سجل الفواتير النظيف (Billing History Data) يحاكي مخرجات Stripe
  const [invoices] = useState([
    { id: 'INV-2026-003', date: '01 يوليو 2026', amount: '$49.00', status: 'مدفوعة' },
    { id: 'INV-2026-002', date: '01 يونيو 2026', amount: '$49.00', status: 'مدفوعة' },
    { id: 'INV-2026-001', date: '01 مايو 2026', amount: '$49.00', status: 'مدفوعة' },
  ]);

  useEffect(() => {
    const timer = setTimeout(() => setPageLoading(false), 400);
    return () => clearTimeout(timer);
  }, []);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); setMessage(''); setErrorMsg('');
    setTimeout(() => { setLoading(false); setMessage('تم تحديث تفاصيل الحساب الشخصي بنجاح.'); }, 400);
  };

  const handleSaveOrg = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); setMessage(''); setErrorMsg('');
    setTimeout(() => { setLoading(false); setMessage('تم حفظ بيانات ملف المؤسسة بنجاح.'); }, 400);
  };

  const handleUpdatePassword = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); setMessage(''); setErrorMsg('');
    setTimeout(() => {
      setLoading(false);
      setMessage('تم تحديث تفاصيل كلمة المرور وتأمين الجلسة.');
    }, 400);
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
        
        {/* هيدر الصفحة الرئيسي */}
        <div className="flex items-center gap-4 mb-6 md:mb-8 border-b border-gray-800 pb-6">
          <div className="p-3 bg-indigo-600/10 border border-indigo-500/10 text-indigo-400 rounded-xl">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
          </div>
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-white tracking-tight">إعدادات المنصة</h1>
            <p className="text-xs md:text-sm text-gray-400 mt-1">إدارة الحساب، المؤسسة، الأمان، والاشتراك من مكان واحد.</p>
          </div>
        </div>

        {/* التوجيه الشريطي المحسن */}
        <div className="flex flex-col md:flex-row gap-6 md:gap-8 items-start">
          
          {/* شريط التنقل المبسط للمرحلة الثانية */}
          <div className="w-full md:w-56 flex md:flex-col overflow-x-auto md:overflow-visible border-b md:border-b-0 border-gray-800 md:space-y-1.5 pb-2 md:pb-0 scrollbar-none snap-x gap-2 md:gap-0">
            <button type="button" onClick={() => { setActiveTab('account'); setMessage(''); setErrorMsg(''); }} className={`flex items-center gap-3 px-4 py-3 text-xs md:text-sm font-medium rounded-xl transition-all flex-1 md:flex-none justify-center md:justify-start ${activeTab === 'account' ? 'bg-gray-800 text-white border border-gray-700/50' : 'text-gray-400 hover:text-gray-200 hover:bg-gray-900/40 border border-transparent'}`}><Icons.account /> <span>الحساب</span></button>
            <button type="button" onClick={() => { setActiveTab('org'); setMessage(''); setErrorMsg(''); }} className={`flex items-center gap-3 px-4 py-3 text-xs md:text-sm font-medium rounded-xl transition-all flex-1 md:flex-none justify-center md:justify-start ${activeTab === 'org' ? 'bg-gray-800 text-white border border-gray-700/50' : 'text-gray-400 hover:text-gray-200 hover:bg-gray-900/40 border border-transparent'}`}><Icons.org /> <span>المؤسسة</span></button>
            <button type="button" onClick={() => { setActiveTab('security'); setMessage(''); setErrorMsg(''); }} className={`flex items-center gap-3 px-4 py-3 text-xs md:text-sm font-medium rounded-xl transition-all flex-1 md:flex-none justify-center md:justify-start ${activeTab === 'security' ? 'bg-gray-800 text-white border border-gray-700/50' : 'text-gray-400 hover:text-gray-200 hover:bg-gray-900/40 border border-transparent'}`}><Icons.security /> <span>الأمان</span></button>
            <button type="button" onClick={() => { setActiveTab('billing'); setMessage(''); setErrorMsg(''); }} className={`flex items-center gap-3 px-4 py-3 text-xs md:text-sm font-medium rounded-xl transition-all flex-1 md:flex-none justify-center md:justify-start ${activeTab === 'billing' ? 'bg-gray-800 text-white border border-gray-700/50' : 'text-gray-400 hover:text-gray-200 hover:bg-gray-900/40 border border-transparent'}`}><Icons.billing /> <span>الفوترة</span></button>
          </div>

          {/* لوحة عرض المحتوى والـ Content Containers */}
          <div className="flex-1 w-full bg-[#111827] border border-gray-800/60 rounded-2xl p-5 md:p-6 shadow-xl overflow-hidden">
            
            {/* ========================================================= */}
            {/* 👤 قسم الحساب الشخصي */}
            {/* ========================================================= */}
            {activeTab === 'account' && (
              <form onSubmit={handleSaveProfile} className="space-y-6">
                <div>
                  <h3 className="text-base font-bold text-white">بيانات الحساب الشخصي</h3>
                </div>
                {/* كود التبويب السابق يظل محمياً ومستقراً كلياً */}
              </form>
            )}

            {/* ========================================================= */}
            {/* 🏢 قسم المؤسسة */}
            {/* ========================================================= */}
            {activeTab === 'org' && (
              <form onSubmit={handleSaveOrg} className="space-y-6">
                <div>
                  <h3 className="text-base font-bold text-white">بيانات المؤسسة ومساحة العمل</h3>
                </div>
                {/* كود التبويب السابق يظل محمياً ومستقراً كلياً */}
              </form>
            )}

            {/* ========================================================= */}
            {/* 🔒 قسم الأمان */}
            {/* ========================================================= */}
            {activeTab === 'security' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-base font-bold text-white">مركز الأمان ومراقبة الوصول</h3>
                </div>
                {/* كود التبويب السابق يظل محمياً ومستقراً كلياً */}
              </div>
            )}

            {/* ========================================================= */}
            {/* 💳 إعادة تصميم قسم الفوترة والاشتراك بالكامل (Premium SaaS Billing) */}
            {/* ========================================================= */}
            {activeTab === 'billing' && (
              <div className="space-y-8">
                
                {/* SECTION 1: Current Plan (الخطة الحالية والوضعية التشغيلية) */}
                <div className="border-b border-gray-800/60 pb-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider block">الخطة الحالية والاشتراك</span>
                      <h3 className="text-lg font-bold text-white mt-1 flex items-center gap-2">
                        {subscription.planName}
                        <span className="inline-flex items-center gap-1 text-[11px] font-medium bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-full">
                          <Icons.checkCircle /> {subscription.status}
                        </span>
                      </h3>
                    </div>
                    <div className="text-right sm:text-left">
                      <span className="text-xs text-gray-400 block">تكلفة الدفع الحالية</span>
                      <span className="text-lg font-bold text-indigo-400 block mt-0.5">{subscription.price}</span>
                    </div>
                  </div>
                  
                  <div className="mt-4 p-3.5 bg-[#0B0F19]/40 border border-gray-800 rounded-xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 text-xs">
                    <span className="text-gray-400">تاريخ التجديد والفوترة القادم وسحب المستحقات تلقائياً:</span>
                    <span className="font-bold text-gray-200 bg-gray-900 px-2.5 py-1 rounded-md border border-gray-800">{subscription.renewalDate}</span>
                  </div>
                </div>

                {/* SECTION 2: Usage Metrics (مقاييس الاستهلاك الحية بمظهر Stripe/Vercel) */}
                <div className="space-y-4">
                  <div>
                    <h4 className="text-xs font-bold text-white uppercase tracking-wider">مقاييس استهلاك الموارد والحصص الحالية</h4>
                    <p className="text-xs text-gray-400 mt-0.5">مراقبة حية لحدود الاستخدام المتاحة في باقتك الاحترافية الحالية.</p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {/* مقياس: CSV Usage */}
                    <div className="bg-[#0B0F19]/60 border border-gray-800 rounded-xl p-4 space-y-3">
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-gray-400 font-medium">ملفات CSV المرفوعة</span>
                        <span className="text-white font-semibold">{subscription.csvUsed} / {subscription.csvMax}</span>
                      </div>
                      <div className="w-full bg-gray-800 h-1.5 rounded-full overflow-hidden">
                        <div className="bg-indigo-500 h-full rounded-full" style={{ width: `${(subscription.csvUsed / subscription.csvMax) * 100}%` }}></div>
                      </div>
                      <span className="block text-[11px] text-gray-500">متبقي {subscription.csvMax - subscription.csvUsed} ملفات للشهر الحالي</span>
                    </div>

                    {/* مقياس: Storage Usage */}
                    <div className="bg-[#0B0F19]/60 border border-gray-800 rounded-xl p-4 space-y-3">
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-gray-400 font-medium">المساحة السحابية المستهلكة</span>
                        <span className="text-white font-semibold">{subscription.storageUsed} GB / {subscription.storageMax} GB</span>
                      </div>
                      <div className="w-full bg-gray-800 h-1.5 rounded-full overflow-hidden">
                        <div className="bg-emerald-500 h-full rounded-full" style={{ width: `${(subscription.storageUsed / subscription.storageMax) * 100}%` }}></div>
                      </div>
                      <span className="block text-[11px] text-gray-500">مستهلك {Math.round((subscription.storageUsed / subscription.storageMax) * 100)}% من السعة الكلية</span>
                    </div>

                    {/* مقياس: API Usage */}
                    <div className="bg-[#0B0F19]/60 border border-gray-800 rounded-xl p-4 space-y-3">
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-gray-400 font-medium">طلبات API والاستدعاءات</span>
                        <span className="text-white font-semibold">{subscription.apiUsed.toLocaleString()} / {subscription.apiMax.toLocaleString()}</span>
                      </div>
                      <div className="w-full bg-gray-800 h-1.5 rounded-full overflow-hidden">
                        <div className="bg-amber-500 h-full rounded-full" style={{ width: `${(subscription.apiUsed / subscription.apiMax) * 100}%` }}></div>
                      </div>
                      <span className="block text-[11px] text-gray-500">معدل استقرار الاستدعاءات: 100%</span>
                    </div>
                  </div>
                </div>

                {/* SECTION 3: Billing Actions (إجراءات الفوترة والربط الذكي مع بوابات الدفع) */}
                <div className="bg-gray-950/20 border border-gray-800/80 rounded-xl p-4 space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-800/50 pb-3">
                    <div className="flex items-center gap-2.5">
                      <div className="text-gray-400"><Icons.creditCard /></div>
                      <div>
                        <span className="block text-xs font-semibold text-white">طريقة الدفع الافتراضية للتجديد</span>
                        <span className="block text-[11px] text-gray-400 mt-0.5">{subscription.paymentMethod}</span>
                      </div>
                    </div>
                    <button type="button" onClick={() => window.location.href = '/dashboard/billing'} className="text-[11px] font-bold text-indigo-400 hover:text-indigo-300 flex items-center gap-1 self-start sm:self-auto bg-gray-900 border border-gray-800 px-3 py-1.5 rounded-lg transition-all">
                      تحديث بطاقة الدفع <Icons.externalLink />
                    </button>
                  </div>

                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pt-1">
                    <p className="text-xs text-gray-400 max-w-lg">يتم تأمين وإدارة عمليات الفوترة بالكامل عبر بوابة **Stripe Customer Portal**. يمكنك إلغاء الاشتراك، ترقية الباقة أو تحميل المستندات الضريبية من هناك.</p>
                    <button type="button" onClick={() => window.location.href = '/dashboard/billing'} className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs px-4 py-2.5 rounded-xl transition-all text-center shadow-md flex items-center justify-center gap-1.5">
                      إدارة الاشتراك والترقيات عبر Stripe <Icons.externalLink />
                    </button>
                  </div>
                </div>

                {/* SECTION 4: Billing History (سجل فواتير الحساب النظيف - Enterprise Grid) */}
                <div className="space-y-3">
                  <div>
                    <h4 className="text-xs font-bold text-white uppercase tracking-wider">سجل الفواتير والمستندات المحاسبية</h4>
                    <p className="text-xs text-gray-400 mt-0.5">استعراض وتحميل الفواتير الدورية السابقة الصادرة لحساب مؤسستك.</p>
                  </div>

                  {/* جدول فواتير نظيف متجاوب بالكامل مع الهاتف */}
                  <div className="bg-[#0B0F19]/60 border border-gray-800 rounded-xl overflow-hidden divide-y divide-gray-800">
                    {invoices.map((invoice) => (
                      <div key={invoice.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 gap-3 text-xs text-gray-300 hover:bg-gray-900/30 transition-all">
                        <div className="flex items-center justify-between sm:justify-start gap-4 sm:gap-8">
                          <span className="font-mono text-gray-400 font-semibold">{invoice.id}</span>
                          <span className="text-gray-400">{invoice.date}</span>
                        </div>
                        <div className="flex items-center justify-between sm:justify-end gap-6">
                          <span className="font-bold text-white font-mono">{invoice.amount}</span>
                          <div className="flex items-center gap-3">
                            <span className="inline-block text-[10px] bg-emerald-950/40 text-emerald-400 px-2 py-0.5 border border-emerald-500/10 rounded font-medium">{invoice.status}</span>
                            <button type="button" title="تحميل الفاتورة PDF" className="p-1.5 bg-gray-900 border border-gray-800 text-gray-400 hover:text-white rounded-lg transition-all">
                              <Icons.download />
                            </button>
                          </div>
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
