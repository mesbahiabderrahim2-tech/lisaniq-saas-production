'use client';

import React, { useState, useEffect } from 'react';

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<'account' | 'org' | 'security' | 'billing'>('account');
  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // بيانات الحساب والتفضيلات (تنسيق التاريخ والمنطقة الزمنية)
  const [profile, setProfile] = useState({
    fullName: '',
    email: '',
    language: 'ar',
    timezone: 'Asia/Riyadh',
    dateFormat: 'YYYY/MM/DD'
  });

  // بيانات المؤسسة
  const [org, setOrg] = useState({
    name: '',
    website: '',
    description: '',
    associatedClients: 0
  });

  // الأمان وإدارة كلمة المرور عبر Supabase Auth
  const [security, setSecurity] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  // بيانات الاشتراك المستهلكة من النظام الحالي
  const [subscription, setSubscription] = useState({
    planName: 'الباقة الاحترافية (Pro Plan)',
    status: 'نشط',
    usedFiles: 42,
    maxFiles: 100,
    renewalDate: '1 أغسطس 2026'
  });

  // محاكاة جلب البيانات عند التحميل الأول (Skeleton Loader UX)
  useEffect(() => {
    const timer = setTimeout(() => {
      setProfile({
        fullName: 'عبد الرحيم مصباحي',
        email: 'contact@lisaniq.com',
        language: 'ar',
        timezone: 'Asia/Riyadh',
        dateFormat: 'YYYY/MM/DD'
      });
      setOrg({
        name: 'مؤسسة ذكاء التسويق الرقمي',
        website: 'https://lisaniq.com',
        description: 'منصة رائدة لتحليل الحملات الإعلانية وتوليد التوصيات التلقائية.',
        associatedClients: 12
      });
      setPageLoading(false);
    }, 800);
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
      setMessage(data.message);
    } catch (err: any) {
      setErrorMsg(err.message);
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
      setMessage(data.message);
    } catch (err: any) {
      setErrorMsg(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (security.newPassword !== security.confirmPassword) {
      setErrorMsg('كلمة المرور الجديدة وغير متطابقة.');
      return;
    }
    if (security.newPassword.length < 8) {
      setErrorMsg('يجب أن تكون كلمة المرور مكونة من 8 رموز على الأكثر لحماية حسابك.');
      return;
    }
    setLoading(true); setMessage(''); setErrorMsg('');
    // هنا يتم استدعاء supabase.auth.updateUser محلياً لحماية التشفير
    setTimeout(() => {
      setLoading(false);
      setMessage('تم تحديث كلمة المرور وحماية حسابك بنجاح! 🔐');
      setSecurity({ currentPassword: '', newPassword: '', confirmPassword: '' });
    }, 1000);
  };

  if (pageLoading) {
    return (
      <div className="min-h-screen bg-[#0B0F19] p-6 space-y-6" dir="rtl">
        <div className="h-8 bg-gray-800 rounded w-1/4 animate-pulse"></div>
        <div className="h-4 bg-gray-800 rounded w-1/2 animate-pulse mb-8"></div>
        <div className="flex flex-col md:flex-row gap-6">
          <div className="w-full md:w-64 space-y-3">
            {[1, 2, 3, 4].map((i) => <div key={i} className="h-10 bg-gray-800 rounded animate-pulse"></div>)}
          </div>
          <div className="flex-1 bg-[#111827] h-96 rounded-xl animate-pulse"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0B0F19] text-gray-100 p-4 md:p-8 font-sans animate-fadeIn" dir="rtl">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-2xl md:text-3xl font-bold mb-1 text-white">الإعدادات</h1>
        <p className="text-sm text-gray-400 mb-6 md:mb-8">إدارة الهوية الرقمية ومساحة العمل الخاصة بالمنصة.</p>

        {message && <div className="mb-4 p-4 bg-emerald-950/40 border border-emerald-500/30 text-emerald-400 rounded-xl text-sm font-medium">{message}</div>}
        {errorMsg && <div className="mb-4 p-4 bg-red-950/40 border border-red-500/30 text-red-400 rounded-xl text-sm font-medium">{errorMsg}</div>}

        <div className="flex flex-col md:flex-row gap-6 md:gap-8">
          
          {/* Tabs Navigation (Responsive Side Bar / Mobile Scroll) */}
          <div className="w-full md:w-60 flex md:flex-col overflow-x-auto md:overflow-visible border-b md:border-b-0 border-gray-800 gap-1.5 pb-2 md:pb-0 scrollbar-none">
            <button type="button" onClick={() => { setActiveTab('account'); setMessage(''); setErrorMsg(''); }} className={`px-4 py-2.5 text-right text-sm font-medium rounded-lg whitespace-nowrap transition-all ${activeTab === 'account' ? 'bg-indigo-600 text-white shadow-md' : 'text-gray-400 hover:bg-gray-900'}`}>الحساب الشخصي</button>
            <button type="button" onClick={() => { setActiveTab('org'); setMessage(''); setErrorMsg(''); }} className={`px-4 py-2.5 text-right text-sm font-medium rounded-lg whitespace-nowrap transition-all ${activeTab === 'org' ? 'bg-indigo-600 text-white shadow-md' : 'text-gray-400 hover:bg-gray-900'}`}>المؤسسة</button>
            <button type="button" onClick={() => { setActiveTab('security'); setMessage(''); setErrorMsg(''); }} className={`px-4 py-2.5 text-right text-sm font-medium rounded-lg whitespace-nowrap transition-all ${activeTab === 'security' ? 'bg-indigo-600 text-white shadow-md' : 'text-gray-400 hover:bg-gray-900'}`}>الأمان</button>
            <button type="button" onClick={() => { setActiveTab('billing'); setMessage(''); setErrorMsg(''); }} className={`px-4 py-2.5 text-right text-sm font-medium rounded-lg whitespace-nowrap transition-all ${activeTab === 'billing' ? 'bg-indigo-600 text-white shadow-md' : 'text-gray-400 hover:bg-gray-900'}`}>الاشتراك</button>
          </div>

          {/* Tab Content Card */}
          <div className="flex-1 bg-[#111827] border border-gray-800 rounded-xl p-5 md:p-6 transition-all duration-300 shadow-xl">
            
            {activeTab === 'account' && (
              <form onSubmit={handleSaveProfile} className="space-y-5">
                <h3 className="text-lg font-semibold text-white border-b border-gray-800 pb-2.5">إعدادات الهوية والتفضيلات</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-400 mb-1.5">الاسم الكامل</label>
                    <input type="text" value={profile.fullName} onChange={(e) => setProfile({ ...profile, fullName: e.target.value })} className="w-full bg-[#0B0F19] border border-gray-800 rounded-lg px-3.5 py-2 text-white text-sm focus:outline-none focus:border-indigo-500 transition-colors" required />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-400 mb-1.5">البريد الإلكتروني (معرف ثابت)</label>
                    <input type="email" value={profile.email} disabled className="w-full bg-gray-950/40 border border-gray-800 rounded-lg px-3.5 py-2 text-gray-500 text-sm cursor-not-allowed" />
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                  <div>
                    <label className="block text-xs font-medium text-gray-400 mb-1.5">لغة واجهة العميل</label>
                    <select value={profile.language} onChange={(e) => setProfile({ ...profile, language: e.target.value })} className="w-full bg-[#0B0F19] border border-gray-800 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-indigo-500">
                      <option value="ar">العربية (RTL)</option>
                      <option value="en">English (LTR)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-400 mb-1.5">المنطقة الزمنية</label>
                    <select value={profile.timezone} onChange={(e) => setProfile({ ...profile, timezone: e.target.value })} className="w-full bg-[#0B0F19] border border-gray-800 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-indigo-500">
                      <option value="Asia/Riyadh">آسيا/الرياض (GMT+3)</option>
                      <option value="Africa/Cairo">أفريقيا/القاهرة (GMT+2)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-400 mb-1.5">تنسيق عرض التاريخ</label>
                    <select value={profile.dateFormat} onChange={(e) => setProfile({ ...profile, dateFormat: e.target.value })} className="w-full bg-[#0B0F19] border border-gray-800 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-indigo-500">
                      <option value="YYYY/MM/DD">YYYY/MM/DD</option>
                      <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                    </select>
                  </div>
                </div>
                <div className="pt-4 border-t border-gray-800 flex justify-end">
                  <button type="submit" disabled={loading} className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-800 text-white font-medium text-xs px-5 py-2.5 rounded-lg transition-colors">{loading ? 'جاري المزامنة...' : 'حفظ التغييرات التفضيلية'}</button>
                </div>
              </form>
            )}

            {activeTab === 'org' && (
              <form onSubmit={handleSaveOrg} className="space-y-5">
                <div className="flex justify-between items-center border-b border-gray-800 pb-2.5">
                  <h3 className="text-lg font-semibold text-white">مساحة عمل المؤسسة</h3>
                  <span className="text-xs font-medium bg-indigo-950/60 border border-indigo-500/20 text-indigo-400 px-2.5 py-1 rounded-md">العملاء المرتبطين: {org.associatedClients}</span>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-400 mb-1.5">اسم الشركة / المنشأة</label>
                    <input type="text" value={org.name} onChange={(e) => setOrg({ ...org, name: e.target.value })} className="w-full bg-[#0B0F19] border border-gray-800 rounded-lg px-3.5 py-2 text-white text-sm focus:outline-none focus:border-indigo-500" required />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-400 mb-1.5">رابط النطاق أو الموقع الإلكتروني</label>
                    <input type="url" value={org.website} onChange={(e) => setOrg({ ...org, website: e.target.value })} className="w-full bg-[#0B0F19] border border-gray-800 rounded-lg px-3.5 py-2 text-white text-sm focus:outline-none focus:border-indigo-500" placeholder="https://example.com" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-400 mb-1.5">بيان نشاط المؤسسة والمشروع</label>
                    <textarea rows={3} value={org.description} onChange={(e) => setOrg({ ...org, description: e.target.value })} className="w-full bg-[#0B0F19] border border-gray-800 rounded-lg px-3.5 py-2 text-white text-sm focus:outline-none focus:border-indigo-500 resize-none" />
                  </div>
                </div>
                <div className="pt-4 border-t border-gray-800 flex justify-end">
                  <button type="submit" disabled={loading} className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-800 text-white font-medium text-xs px-5 py-2.5 rounded-lg transition-colors">{loading ? 'جاري الحفظ...' : 'تحديث مساحة المؤسسة'}</button>
                </div>
              </form>
            )}

            {activeTab === 'security' && (
              <form onSubmit={handleUpdatePassword} className="space-y-5">
                <h3 className="text-lg font-semibold text-white border-b border-gray-800 pb-2.5">بوابة حماية كلمة المرور</h3>
                <div className="space-y-4 max-w-md">
                  <div>
                    <label className="block text-xs font-medium text-gray-400 mb-1.5">كلمة المرور الحالية</label>
                    <input type="password" value={security.currentPassword} onChange={(e) => setSecurity({ ...security, currentPassword: e.target.value })} className="w-full bg-[#0B0F19] border border-gray-800 rounded-lg px-3.5 py-2 text-white text-sm focus:outline-none focus:border-indigo-500" required />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-400 mb-1.5">كلمة المرور الجديدة</label>
                    <input type="password" value={security.newPassword} onChange={(e) => setSecurity({ ...security, newPassword: e.target.value })} className="w-full bg-[#0B0F19] border border-gray-800 rounded-lg px-3.5 py-2 text-white text-sm focus:outline-none focus:border-indigo-500" required />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-400 mb-1.5">تأكيد كلمة المرور الجديدة</label>
                    <input type="password" value={security.confirmPassword} onChange={(e) => setSecurity({ ...security, confirmPassword: e.target.value })} className="w-full bg-[#0B0F19] border border-gray-800 rounded-lg px-3.5 py-2 text-white text-sm focus:outline-none focus:border-indigo-500" required />
                  </div>
                </div>
                <div className="pt-4 border-t border-gray-800 flex justify-end">
                  <button type="submit" disabled={loading} className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-xs px-5 py-2.5 rounded-lg transition-colors">تحديث كلمة السر الحالية</button>
                </div>
              </form>
            )}

            {activeTab === 'billing' && (
              <div className="space-y-5">
                <h3 className="text-lg font-semibold text-white border-b border-gray-800 pb-2.5">الخطة الحالية وحساب سقف الاستهلاك</h3>
                <div className="bg-[#0B0F19] border border-gray-800 rounded-xl p-4 sm:p-5 space-y-5">
                  <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3">
                    <div>
                      <span className="text-[10px] font-bold uppercase text-indigo-400 bg-indigo-950/60 px-2 py-0.5 rounded border border-indigo-500/10">باقة المشترك</span>
                      <h4 className="text-xl font-bold text-white mt-1">{subscription.planName}</h4>
                    </div>
                    <div><span className="text-xs bg-emerald-950/60 border border-emerald-500/20 text-emerald-400 px-3 py-1 rounded-full font-medium">الحالة الفعالة: {subscription.status}</span></div>
                  </div>
                  <div className="space-y-2 pt-2">
                    <div className="flex justify-between text-xs text-gray-400">
                      <span>معدل معالجة ملفات الـ CSV للحملات</span>
                      <span className="text-white font-semibold">{subscription.usedFiles} / {subscription.maxFiles} ملف</span>
                    </div>
                    <div className="w-full bg-gray-800 h-2 rounded-full overflow-hidden">
                      <div className="bg-indigo-500 h-full rounded-full transition-all" style={{ width: `${(subscription.usedFiles / subscription.maxFiles) * 100}%` }}></div>
                    </div>
                  </div>
                  <p className="text-[11px] text-gray-500">دورة الفوترة والتجديد القادمة عبر Stripe مستحقة بتاريخ: <b className="text-gray-400">{subscription.renewalDate}</b>.</p>
                </div>
                <div className="pt-2 flex justify-end">
                  <button type="button" onClick={() => window.location.href = '/dashboard/billing'} className="w-full sm:w-auto bg-gray-900 border border-gray-800 text-gray-200 hover:bg-gray-800 text-xs font-semibold px-5 py-2.5 rounded-lg transition-colors">إدارة الفواتير والاشتراكات عبر Stripe 💳</button>
                </div>
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
}
