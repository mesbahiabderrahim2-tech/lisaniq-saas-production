// app/(dashboard)/dashboard/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import ClientHistory from '@/components/ClientHistory';

interface LocalCampaignDecision {
  campaignName: string;
  platform: string;
  decisionTitle: string;
  businessReason: string;
  potentialSavings: number;
  priority: string;
}

export default function DashboardPage() {
  // باستخدام الحزمة الصحيحة والحديثة في مشروعك Supabase الاتصال بـ
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const [isUploading, setIsUploading] = useState(false);
  const [isSampleLoading, setIsSampleLoading] = useState(false);
  const [clients, setClients] = useState<any[]>([]);
  const [selectedClientId, setSelectedClientId] = useState<string>('');
  const [newClientName, setNewClientName] = useState('');
  const [isCreatingClient, setIsCreatingClient] = useState(false);

  const [decisions, setDecisions] = useState<LocalCampaignDecision[]>([]);
  const [stats, setStats] = useState({ totalSpend: 0, totalSavings: 0, criticalCount: 0 });
  const [isShowingSample, setIsShowingSample] = useState(false);

  // جلب البيانات الأولية
  useEffect(() => {
    async function loadInitialData() {
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
  }, [supabase]);

  // تشغيل العينة التجريبية
  const handleTriggerSample = () => {
    setIsSampleLoading(true);
    setTimeout(() => {
      const sampleDecisions: LocalCampaignDecision[] = [
        {
          campaignName: "🔍 [Search] - Brand Keywords - MENA",
          platform: "Google Ads",
          decisionTitle: "زيادة ميزانية الحملة فوراً (+25%) ⚡",
          businessReason: "ممتاز يصل إلى 4.8 وهو أعلى من المستهدف 3.5 مع تكلفة اكتساب منخفضة جداً (ROAS) الحملة تحقق عائد إعلاني.",
          potentialSavings: 0,
          priority: "OPTIMAL"
        },
        {
          campaignName: "📱 [Prospecting] - Broad Lookalikes 1%-5%",
          platform: "Facebook Ads",
          decisionTitle: "إيقاف الحملة فوراً لمنع نزيف الميزانية! 🚨",
          businessReason: "تكلفة الشراء الحالية تفوق الحد المقبول بكثير ($30 مقابل مستهدف $18)، والعائد الإعلاني منخفض جداً (1.2 ROAS).",
          potentialSavings: 1450,
          priority: "CRITICAL"
        },
        {
          campaignName: "💥 [Retargeting] - Abandoned Cart 7 Days",
          platform: "Facebook Ads",
          decisionTitle: "سحب ميزانية إضافية للحملة للتوسع",
          businessReason: "يوضحان فرصة ضخمة لزيادة المبيعات عبر إعادة الاستهداف (6.2 ROAS) معدل النقر العالي والوصول الاستثنائي.",
          potentialSavings: 0,
          priority: "HIGH"
        },
        {
          campaignName: "🎬 [Story Ads] - GenZ Interest - KSA",
          platform: "Snapchat Ads",
          decisionTitle: "تقليص ميزانية الحملة بنسبة 50% 📉",
          businessReason: "الحملة تستهلك الميزانية بنقرات رخيصة ولكن بدون تحويلات فعلية؛ العائد الإعلاني 0.9 فقط والمستهدف هو 4.0.",
          potentialSavings: 950,
          priority: "CRITICAL"
        }
      ];

      setDecisions(sampleDecisions);
      setStats({
        totalSpend: 7400,
        criticalCount: 2,
        totalSavings: 2400
      });
      setIsShowingSample(true);
      setIsSampleLoading(false);
    }, 400);
  };

  const handleCreateClient = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newClientName.trim()) return;

    setIsCreatingClient(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      let { data: org } = await supabase
        .from('organizations')
        .select('id')
        .eq('owner_id', user.id)
        .maybeSingle();

      if (!org) {
        const { data: newOrg } = await supabase
          .from('organizations')
          .insert({ name: `وكالة التسويق الذكية`, owner_id: user.id })
          .select()
          .single();
        org = newOrg;
      }

      const { data: newClient, error } = await supabase
        .from('clients')
        .insert({
          organization_id: org?.id,
          name: newClientName.trim(),
          industry: 'General'
        })
        .select()
        .single();

      if (error) throw error;

      setClients([newClient, ...clients]);
      setSelectedClientId(newClient.id);
      setNewClientName('');
      alert("🟢 تم إنشاء الحساب التجاري للعميل بنجاح !");
    } catch (err: any) {
      alert(`❌ فشل إنشاء العميل: ${err.message}`);
    } finally {
      setIsCreatingClient(false);
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setIsShowingSample(false);

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
        throw new Error(result.error || "فشلت معالجة الملف سحابياً.");
      }

      if (result.rows) {
        alert("🚀 تم تحليل التقرير وأرشفة التوصيات في سجل العميل بنجاح!");
      }
    } catch (error: any) {
      alert(`⚠️ إشعار النظام: ${error.message}`);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6 text-right" dir="rtl">
      <div className="mb-8 flex flex-col justify-between items-start md:flex-row md:items-center bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
        <div>
          <span className="bg-indigo-50 text-indigo-700 text-xs font-bold px-3 py-1 rounded-full border border-indigo-100">
            📊 نظام إدارة سجلات العملاء المستدام
          </span>
          <h1 className="text-2xl font-black text-slate-900 mt-2">LisanIQ - Dashboard</h1>
          <p className="text-sm text-slate-500 mt-1">إدارة وتحليل ملفات الـ CSV واستخراج القرارات الإعلانية المنقذة فوراً.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm md:col-span-2">
          <h3 className="font-bold text-slate-800 mb-3">📍 اختر العميل المستهدف أو جرب البناء:</h3>
          <div className="flex flex-col sm:flex-row gap-4 items-center">
            <select
              value={selectedClientId}
              onChange={(e) => setSelectedClientId(e.target.value)}
              className="w-full sm:w-1/3 p-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-700 font-medium focus:outline-indigo-600"
            >
              {clients.length === 0 ? (
                <option value="">جاري جلب قائمة العملاء...</option>
              ) : (
                clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)
              )}
            </select>

            <label className="w-full sm:w-1/3 cursor-pointer bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-4 rounded-xl text-center shadow-sm transition-all duration-200">
              {isUploading ? '... ⏳ جاري رفع تقرير الـ CSV' : '📁 ارفع تقرير الـ CSV للعميل'}
              <input type="file" accept=".csv" className="hidden" onChange={handleFileUpload} disabled={isUploading} />
            </label>

            <button
              onClick={handleTriggerSample}
              disabled={isSampleLoading}
              className="w-full sm:w-1/3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 px-4 rounded-xl text-center shadow-sm transition-all duration-200"
            >
              {isSampleLoading ? '... جاري معالجة العينة التجريبية 🪄' : '✨ تجربة مثال جاهز'}
            </button>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
          <h3 className="font-bold text-slate-800 mb-2">➕ إضافة حساب عميل جديد</h3>
          <form onSubmit={handleCreateClient} className="space-y-3">
            <input
              type="text"
              placeholder="... اسم حساب الشركة أو العميل"
              value={newClientName}
              onChange={(e) => setNewClientName(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-slate-200 text-sm focus:outline-indigo-600"
              required
            />
            <button
              type="submit"
              disabled={isCreatingClient}
              className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-2 rounded-xl text-xs transition-all duration-200"
            >
              {isCreatingClient ? '... جاري الحفظ والتثبيت' : ' حفظ وإضافة العميل الجديد'}
            </button>
          </form>
        </div>
      </div>

      {isShowingSample && (
        <div className="mb-6 p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold rounded-xl text-center">
          💡 أنت تشاهد الآن بيانات "مثال جاهز لمشروع تجاري" حقيقي عبر منصات فيسبوك وجوجل وسناب شات لاستعراض قوة محرك القرارات في 30 ثانية .
        </div>
      )}

      {stats.totalSpend > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
            <p className="text-xs font-bold text-slate-400">الإسراف المالي الحالي</p>
            <p className="text-2xl font-black text-slate-900 mt-1">${stats.totalSpend.toLocaleString()}</p>
          </div>
          <div className="bg-white p-5 rounded-2xl border border-slate-100 border-r-4 border-r-rose-500 shadow-sm">
            <p className="text-xs font-bold text-rose-500">حملات نزيف الميزانية</p>
            <p className="text-2xl font-black text-rose-600 mt-1">⚠️ {stats.criticalCount} توصيات حرجة</p>
          </div>
          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm bg-gradient-to-br from-emerald-50 to-white">
            <p className="text-xs font-bold text-emerald-600">الوفورات المستردة المتوقعة</p>
            <p className="text-2xl font-black text-emerald-700 mt-1"> دولار {stats.totalSavings.toLocaleString()}</p>
          </div>
        </div>
      )}

      <div className="space-y-4">
        <h2 className="text-md font-bold text-slate-700 flex items-center gap-2">📋 مخرجات معالجة محرك القرارات الحالي :</h2>
        {decisions.length === 0 ? (
          <div className="bg-white border-2 border-dashed border-slate-200 rounded-2xl p-10 text-center text-slate-400 text-sm">
            اختر العميل المستهدف ثم ارفع ملف الـ CSV، أو اضغط على زر "تجربة مثال جاهز" لمعالجة البيانات فوراً.
          </div>
        ) : (
          decisions.map((decision, idx) => (
            <div key={idx} className="p-5 bg-white rounded-xl shadow-sm border border-slate-100 border-r-4 border-r-slate-400">
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs font-black bg-slate-100 text-slate-700 px-2 py-1 rounded">
                  {decision.platform.toUpperCase()} | {decision.campaignName}
                </span>
                {decision.potentialSavings > 0 && (
                  <span className="text-xs font-bold text-rose-600">وفورات محتملة: ${decision.potentialSavings}</span>
                )}
              </div>
              <h4 className="text-md font-bold text-slate-900 mb-1">{decision.decisionTitle}</h4>
              <p className="text-xs text-slate-500 mt-1">{decision.businessReason}</p>
            </div>
          ))
        )}
      </div>

      {isShowingSample && selectedClientId && <ClientHistory clientId={selectedClientId} />}
    </div>
  );
}
