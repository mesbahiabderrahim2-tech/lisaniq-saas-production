// app/(dashboard)/dashboard/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { DecisionEngine, CampaignDecision } from '@/lib/decision-engine';

export default function DashboardPage() {
  const supabase = createClientComponentClient();
  const [isUploading, setIsUploading] = useState(false);
  const [clients, setClients] = useState<any[]>([]);
  const [selectedClientId, setSelectedClientId] = useState<string>('');
  const [newClientName, setNewClientName] = useState('');
  const [isCreatingClient, setIsCreatingClient] = useState(false);
  
  const [decisions, setDecisions] = useState<CampaignDecision[]>([]);
  const [stats, setStats] = useState({ totalSpend: 0, totalSavings: 0, criticalCount: 0 });

  // 1. جلب قائمة العملاء عند تحميل الصفحة
  useEffect(() => {
    async function loadInitialData() {
      // جلب المنظمة التابعة للمستخدم الحالي
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: orgs } = await supabase
        .from('organizations')
        .select('id')
        .eq('owner_id', user.id)
        .limit(1);

      if (orgs && orgs.length > 0) {
        const { data: clientsData } = await supabase
          .from('clients')
          .select('*')
          .eq('organization_id', orgs[0].id)
          .order('created_at', { ascending: false });
        
        if (clientsData) {
          setClients(clientsData);
          if (clientsData.length > 0) setSelectedClientId(clientsData[0].id);
        }
      }
    }
    loadInitialData();
  }, []);

  // 2. دالة إنشاء عميل جديد فوري من لوحة التحكم
  const handleCreateClient = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newClientName.trim()) return;

    setIsCreatingClient(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // التأكد من وجود منظمة أو جلبها
      let { data: org } = await supabase
        .from('organizations')
        .select('id')
        .eq('owner_id', user.id)
        .maybeSingle();

      if (!org) {
        const { data: newOrg } = await supabase
          .from('organizations')
          .insert({ name: `وكالة تسويق ذكية`, owner_id: user.id })
          .select().single();
        org = newOrg;
      }

      const { data: newClient, error } = await supabase
        .from('clients')
        .insert({
          organization_id: org?.id,
          name: newClientName.trim(),
          industry: 'General'
        })
        .select().single();

      if (error) throw error;

      setClients([newClient, ...clients]);
      setSelectedClientId(newClient.id);
      setNewClientName('');
      alert('🟢 تم إنشاء الحساب التجاري للعميل بنجاح!');
    } catch (err: any) {
      alert(`❌ فشل إنشاء العميل: ${err.message}`);
    } finally {
      setIsCreatingClient(false);
    }
  };

  // 3. دالة معالجة ورفع الملف البرمجي وربطه بالسيرفر والعميل
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    
    // بناء بيانات الـ FormData لإرسالها حية للسيرفر الخلفي المطور
    const formData = new FormData();
    formData.append('file', file);
    if (selectedClientId) {
      formData.append('client_id', selectedClientId);
    }

    try {
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'فشلت معالجة الملف سحابياً.');
      }

      // محاكاة قراءة وعرض القرارات حياً في الواجهة بناءً على مخرجات السيرفر
      if (result.rows) {
        let allDecisions: CampaignDecision[] = [];
        let spendSum = 0;
        let savingsSum = 0;

        result.rows.forEach((row: any) => {
          const spend = parseFloat(row.spend || 0);
          spendSum += spend;

          const campaignDecisions = DecisionEngine.evaluateCampaign({
            campaign_name: row.campaign_name || row.campaign || 'حملة إعلانية',
            platform: row.platform || 'generic',
            spend: spend,
            clicks: parseInt(row.clicks || 0),
            impressions: parseInt(row.impressions || 0),
            ctr: parseFloat(row.click_through_rate || row.ctr || 0),
            cpc: parseFloat(row.cpc || 0),
            cpa: parseFloat(row.cost_per_purchase || row.cpa || 0),
            roas: parseFloat(row.purchase_roas || row.roas || 0),
            conversions: parseInt(row.conversions || 0),
            target_cpa: parseFloat(row.target_cpa || 20),
            target_roas: parseFloat(row.target_roas || 3)
          });
          allDecisions = [...allDecisions, ...campaignDecisions];
        });

        const criticals = allDecisions.filter(d => d.priority === 'CRITICAL').length;
        allDecisions.forEach(d => savingsSum += d.potentialSavings);

        setDecisions(allDecisions);
        setStats({
          totalSpend: spendSum,
          totalSavings: savingsSum,
          criticalCount: criticals
        });
        alert('🚀 تم رفع الملف، وحساب المؤشرات، وأرشفة القرارات في تاريخ العميل سحابياً!');
      }
    } catch (error: any) {
      alert(`⚠️ خطأ في المعالجة: ${error.message}`);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6 text-right" dir="rtl">
      {/* الترويسة العلوية */}
      <div className="mb-8 flex flex-col justify-between items-start md:flex-row md:items-center bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
        <div>
          <span className="bg-indigo-50 text-indigo-700 text-xs font-bold px-3 py-1 rounded-full border border-indigo-200">
            نظام إدارة سجلات العملاء المستدام 🏢
          </span>
          <h1 className="text-2xl font-black text-slate-900 mt-2">LisanIQ – Client Portfolio Management</h1>
          <p className="text-sm text-slate-500 mt-1">إدارة عملائك، رفع تقارير الـ CSV وأرشفة قرارات الحسابات الإعلانية تلقائياً.</p>
        </div>
      </div>

      {/* قسم إدارة واختيار العملاء */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* صندوق اختيار العميل ورفع الملف */}
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm md:col-span-2">
          <h3 className="font-bold text-slate-800 mb-3">📍 اختر العميل المستهدف للتحليل:</h3>
          <div className="flex flex-col sm:flex-row gap-4 items-center">
            <select 
              value={selectedClientId} 
              onChange={(e) => setSelectedClientId(e.target.value)}
              className="w-full sm:w-1/2 p-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-700 font-medium focus:outline-indigo-600 text-sm"
            >
              {clients.length === 0 ? (
                <option value="">جاري تهيئة العميل الافتراضي...</option>
              ) : (
                clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)
              )}
            </select>

            <label className={`w-full sm:w-1/2 cursor-pointer bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-4 rounded-xl transition shadow-md inline-block text-center text-sm ${isUploading ? 'opacity-60 pointer-events-none' : ''}`}>
              {isUploading ? 'جاري معالجة وأرشفة البيانات...' : '📁 ارفع تقرير الـ CSV للعميل'}
              <input type="file" accept=".csv" className="hidden" onChange={handleFileUpload} disabled={isUploading} />
            </label>
          </div>
        </div>

        {/* صندوق إضافة عميل جديد سريع */}
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
          <h3 className="font-bold text-slate-800 mb-2">➕ إضافة حساب عميل جديد:</h3>
          <form onSubmit={handleCreateClient} className="space-y-3">
            <input 
              type="text" 
              placeholder="اسم الشركة أو العميل..." 
              value={newClientName}
              onChange={(e) => setNewClientName(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-slate-200 text-sm focus:outline-indigo-600"
              required 
            />
            <button 
              type="submit" 
              disabled={isCreatingClient}
              className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-2 rounded-xl text-xs transition"
            >
              {isCreatingClient ? 'جاري الحفظ...' : 'حفظ وإضافة العميل'}
            </button>
          </form>
        </div>
      </div>

      {/* لوحة أرقام الوفورات المالي */}
      {stats.totalSpend > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
            <p className="text-xs font-bold text-slate-400">الإنفاق المالي للحساب</p>
            <p className="text-2xl font-black text-slate-900 mt-1">${stats.totalSpend.toLocaleString()}</p>
          </div>
          <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
            <p className="text-xs font-bold text-rose-500">حملات تنزف ميزانية العميل</p>
            <p className="text-2xl font-black text-rose-600 mt-1">⚠️ {stats.criticalCount} توصيات حاسمة</p>
          </div>
          <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm bg-gradient-to-br from-emerald-50 to-white">
            <p className="text-xs font-bold text-emerald-600">النزيف المالي المسترد للعميل</p>
            <p className="text-2xl font-black text-emerald-700 mt-1">${stats.totalSavings.toLocaleString()}</p>
          </div>
        </div>
      )}

      {/* مخرجات محرك القرارات الحية */}
      <div className="space-y-4">
        <h2 className="text-md font-bold text-slate-700">📋 مخرجات معالجة التقرير الحالي:</h2>
        {decisions.length === 0 ? (
          <div className="bg-white border-2 border-dashed border-slate-200 rounded-2xl p-10 text-center text-slate-400 text-sm">
            قم باختيار العميل أو إنشاء حساب له ثم ارفع ملف الـ CSV الخاص به لمعالجة بياناته وأرشفتها.
          </div>
        ) : (
          decisions.map((decision) => (
            <div key={decision.id} className="p-5 bg-white rounded-xl shadow-sm border border-slate-100 border-r-4 border-r-indigo-600">
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs font-black bg-slate-100 text-slate-700 px-2 py-1 rounded">
                  {decision.platform.toUpperCase()} | {decision.campaignName}
                </span>
                <span className="text-xs font-bold text-rose-600">وفورات: ${decision.potentialSavings}</span>
              </div>
              <h4 className="text-md font-bold text-slate-900">{decision.decisionTitle}</h4>
              <p className="text-xs text-slate-500 mt-1">{decision.businessReason}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
