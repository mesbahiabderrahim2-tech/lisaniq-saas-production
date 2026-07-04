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
    <div className="min-h-screen p-6 text-right" style={{ backgroundColor: '#0b0f19' }} dir="rtl">
      
      {/* الهيدر العلوي لوحة التحكم */}
      <div className="mb-8 flex flex-col justify-between items-start md:flex-row md:items-center p-6 rounded-2xl border" style={{ backgroundColor: '#0f172a', borderColor: '#1e293b' }}>
        <div>
          <span className="text-xs font-bold px-3 py-1 rounded-full border" style={{ backgroundColor: 'rgba(61,111,232,0.1)', color: '#9fc4f5', borderColor: 'rgba(61,111,232,0.2)' }}>
            📊 نظام إدارة سجلات العملاء المستدام
          </span>
          <h1 className="text-2xl font-black mt-2" style={{ color: '#f8fafc' }}>LisanIQ - Dashboard</h1>
          <p className="text-sm mt-1" style={{ color: '#94a3b8' }}>إدارة وتحليل ملفات الـ CSV واستخراج القرارات الإعلانية المنقذة فوراً.</p>
        </div>
      </div>

      {/* صف التحكم واختيار وإضافة العملاء */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        
        {/* اختيار العميل ورفع الملف */}
        <div className="p-6 rounded-2xl border" style={{ backgroundColor: '#0f172a', borderColor: '#1e293b' }}>
          <h3 className="font-bold mb-3" style={{ color: '#cbd5e1' }}>📍 اختر العميل المستهدف أو جرب البناء:</h3>
          <div className="flex flex-col sm:flex-row gap-4 items-center">
            <select
              value={selectedClientId}
              onChange={(e) => setSelectedClientId(e.target.value)}
              className="w-full sm:w-1/3 p-3 rounded-xl border font-medium focus:outline-none"
              style={{ backgroundColor: '#1e293b', borderColor: '#334155', color: '#f8fafc' }}
            >
              {clients.length === 0 ? (
                <option value="" style={{ color: '#94a3b8' }}>جاري جلب قائمة العملاء...</option>
              ) : (
                clients.map(c => <option key={c.id} value={c.id} style={{ backgroundColor: '#0f172a', color: '#f8fafc' }}>{c.name}</option>)
              )}
            </select>

            <label className="w-full sm:w-1/3 cursor-pointer bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-4 rounded-xl text-center shadow-sm transition-all duration-200">
              {isUploading ? '... ⏳ جاري الرفع' : '📁 ارفع تقرير CSV'}
              <input type="file" accept=".csv" className="hidden" onChange={handleFileUpload} disabled={isUploading} />
            </label>

            <button
              onClick={handleTriggerSample}
              disabled={isSampleLoading}
              className="w-full sm:w-1/3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 px-4 rounded-xl text-center shadow-sm transition-all duration-200"
            >
              {isSampleLoading ? '... ⏳ جاري المعالجة' : '✨ تجربة مثال جاهز'}
            </button>
          </div>
        </div>

        {/* كرت إضافة العميل الجديد */}
        <div className="p-6 rounded-2xl border" style={{ backgroundColor: '#0f172a', borderColor: '#1e293b' }}>
          <h3 className="font-bold mb-2" style={{ color: '#cbd5e1' }}>➕ إضافة حساب عميل جديد</h3>
          <form onSubmit={handleCreateClient} className="space-y-3">
            <input
              type="text"
              placeholder="... اسم حساب الشركة أو العميل"
              value={newClientName}
              onChange={(e) => setNewClientName(e.target.value)}
              className="w-full p-2.5 rounded-xl border text-sm focus:outline-none"
              style={{ backgroundColor: '#1e293b', borderColor: '#334155', color: '#ffffff' }}
              required
            />
            <button
              type="submit"
              disabled={isCreatingClient}
              className="w-full bg-slate-100 hover:bg-white text-slate-900 font-bold py-2 rounded-xl text-xs transition-all duration-200"
            >
              {isCreatingClient ? '... جاري الحفظ والتثبيت' : ' حفظ وإضافة العميل الجديد'}
            </button>
          </form>
        </div>
      </div>

      {/* إشعار العينة */}
      {isShowingSample && (
        <div className="mb-6 p-3 border text-xs font-bold rounded-xl text-center" style={{ backgroundColor: 'rgba(16,185,129,0.1)', borderColor: 'rgba(16,185,129,0.2)', color: '#34d399' }}>
          💡 أنت تشاهد الآن بيانات "مثال جاهز لمشروع تجاري" حقيقي عبر منصات فيسبوك وجوجل وسناب شات لاستعراض قوة محرك القرارات في 30 ثانية .
        </div>
      )}

      {/* كروت الإحصائيات الأربعة الذكية - تم إصلاح بياضها نهائياً بفرض قيم داكنة صريحة وكلمات ناصعة الوضوح */}
      {stats.totalSpend > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          
          <div className="p-6 rounded-2xl border shadow-lg text-right" style={{ backgroundColor: '#0f172a', borderColor: '#1e293b' }}>
            <p className="text-xs font-bold" style={{ color: '#94a3b8' }}>الإسراف المالي الحالي</p>
            <p className="text-2xl font-black mt-1" style={{ color: '#ffffff' }}>${stats.totalSpend.toLocaleString()}</p>
          </div>

          <div className="p-5 rounded-2xl border border-r-4 shadow-lg text-right" style={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRightColor: '#ef4444' }}>
            <p className="text-xs font-bold" style={{ color: '#f87171' }}>حملات نزيف الميزانية</p>
            <p className="text-2xl font-black mt-1" style={{ color: '#ef4444' }}>⚠️ {stats.criticalCount} توصيات حرجة</p>
          </div>

          <div className="p-6 rounded-2xl border shadow-lg text-right bg-gradient-to-br from-slate-900 to-indigo-950/20" style={{ backgroundColor: '#0f172a', borderColor: '#1e293b' }}>
            <p className="text-xs font-bold" style={{ color: '#34d399' }}>الوفورات المستردة المتوقعة</p>
            <p className="text-2xl font-black mt-1" style={{ color: '#10b981' }}>{stats.totalSavings.toLocaleString()} دولار</p>
          </div>

        </div>
      )}

      {/* مخرجات معالجة محرك القرارات الحالي */}
      <div className="space-y-4">
        <h2 className="text-md font-bold flex items-center gap-2" style={{ color: '#e2e8f0' }}>
          📋 مخرجات معالجة محرك القرارات الحالي :
        </h2>
        
        {decisions.length === 0 ? (
          <div className="border-2 border-dashed rounded-2xl p-10 text-center text-sm" style={{ backgroundColor: '#0f172a', borderColor: '#1e293b', color: '#94a3b8' }}>
            اختر العميل المستهدف ثم ارفع ملف الـ CSV، أو اضغط على زر "تجربة مثال جاهز" لمعالجة البيانات فوراً.
          </div>
        ) : (
          decisions.map((decision, idx) => (
            <div key={idx} className="p-5 rounded-xl shadow-lg border border-r-4 text-right" style={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRightColor: '#64748b' }}>
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs font-black px-2 py-1 rounded" style={{ backgroundColor: '#1e293b', color: '#cbd5e1' }}>
                  {decision.platform.toUpperCase()} | {decision.campaignName}
                </span>
                {decision.potentialSavings > 0 && (
                  <span className="text-xs font-bold" style={{ color: '#f87171' }}>وفورات محتملة: ${decision.potentialSavings}</span>
                )}
              </div>
              <h4 className="text-md font-bold mb-1" style={{ color: '#ffffff' }}>{decision.decisionTitle}</h4>
              <p className="text-xs mt-1" style={{ color: '#94a3b8' }}>{decision.businessReason}</p>
            </div>
          ))
        )}
      </div>

      {isShowingSample && selectedClientId && <ClientHistory clientId={selectedClientId} />}
    </div>
  );
}
