// app/(dashboard)/dashboard/page.tsx
'use client';

import React, { useState } from 'react';
import { DecisionEngine, CampaignDecision } from '@/lib/decision-engine';

export default function DashboardPage() {
  const [isUploading, setIsUploading] = useState(false);
  const [decisions, setDecisions] = useState<CampaignDecision[]>([]);
  const [stats, setStats] = useState({ totalSpend: 0, totalSavings: 0, criticalCount: 0 });

  // دالة التعامل مع رفع الملف البرمجي
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    
    // محاكاة قراءة وتحليل لملف الـ CSV (الجزء الأمامي) لربطه بالمحرك مباشرة
    const reader = new FileReader();
    reader.onload = async (e) => {
      const text = e.target?.result as string;
      const lines = text.split('\n').filter(line => line.trim() !== '');
      const headers = lines[0].split(',');

      const parsedRows: any[] = [];
      for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(',');
        if (values.length === headers.length) {
          const row: any = {};
          headers.forEach((header, index) => {
            row[header.trim()] = values[index].trim();
          });
          parsedRows.push(row);
        }
      }

      // 🧠 تمرير البيانات الحقيقية عبر محرك القرارات المنطقي (Decision Engine)
      let allDecisions: CampaignDecision[] = [];
      let spendSum = 0;
      let savingsSum = 0;

      parsedRows.forEach((row) => {
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

      // حساب ملخص الأرقام العلوية للوحة التحكم
      const criticals = allDecisions.filter(d => d.priority === 'CRITICAL').length;
      allDecisions.forEach(d => savingsSum += d.potentialSavings);

      setDecisions(allDecisions);
      setStats({
        totalSpend: spendSum,
        totalSavings: savingsSum,
        criticalCount: criticals
      });
      setIsUploading(false);
    };

    reader.readAsText(file);
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6 text-right" dir="rtl">
      {/* الرأس العلوي والـ Header */}
      <div className="mb-8 flex flex-col justify-between items-start md:flex-row md:items-center bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
        <div>
          <span className="bg-amber-50 text-amber-700 text-xs font-bold px-3 py-1 rounded-full border border-amber-200">
            محرك اتخاذ القرار الذكي | النسخة المدفوعة MVP 🚀
          </span>
          <h1 className="text-2xl font-black text-slate-900 mt-2">LisanIQ – AI Marketing Decision Engine</h1>
          <p className="text-sm text-slate-500 mt-1">المحرك يحلل أرقامك التسويقية الحقيقية ويصدر توصيات فورية حاسمة لحماية ميزانيتك.</p>
        </div>
        
        {/* زر الرفع المطور */}
        <div className="mt-4 md:mt-0">
          <label className="cursor-pointer bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-6 rounded-xl transition shadow-md shadow-indigo-100 inline-block text-center">
            {isUploading ? 'جاري تحليل وقراءة الملف...' : '📁 ارفع تقرير الـ CSV الحقيقي'}
            <input type="file" accept=".csv" className="hidden" onChange={handleFileUpload} disabled={isUploading} />
          </label>
        </div>
      </div>

      {/* صفائح الأرقام والـ Summary Cards (تظهر عند الرفع) */}
      {stats.totalSpend > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
            <p className="text-xs font-bold text-slate-400">إجمالي الإنفاق الخاضع للتحليل</p>
            <p className="text-3xl font-black text-slate-900 mt-1">${stats.totalSpend.toLocaleString()}</p>
          </div>
          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
            <p className="text-xs font-bold text-rose-500">حملات تنزف مالياً وتتطلب تدخل</p>
            <p className="text-3xl font-black text-rose-600 mt-1">⚠️ {stats.criticalCount} حملات حاسمة</p>
          </div>
          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm bg-gradient-to-br from-emerald-50 to-white">
            <p className="text-xs font-bold text-emerald-600">وفورات مالية فورية عند التنفيذ</p>
            <p className="text-3xl font-black text-emerald-700 mt-1">${stats.totalSavings.toLocaleString()}</p>
          </div>
        </div>
      )}

      {/* قائمة القرارات التنفيذية المحللة (Decisions Pipeline) */}
      <div className="space-y-6">
        <h2 className="text-lg font-bold text-slate-800 mb-4">🎯 التدفق الفوري للقرارات التنفيذية المستخرجة:</h2>
        
        {decisions.length === 0 ? (
          <div className="bg-white border-2 border-dashed border-slate-200 rounded-2xl p-12 text-center">
            <p className="text-slate-400 font-medium">في انتظار رفع تقرير CSV لتحليل الأداء واستخراج القرارات الحقيقية...</p>
          </div>
        ) : (
          decisions.map((decision) => (
            <div 
              key={decision.id} 
              className={`p-6 bg-white rounded-2xl shadow-sm border-r-4 transition transform hover:-translate-y-0.5 ${
                decision.priority === 'CRITICAL' ? 'border-r-rose-600 border-rose-100' :
                decision.priority === 'HIGH' ? 'border-r-amber-500 border-amber-100' :
                decision.priority === 'GROWTH' ? 'border-r-emerald-500 border-emerald-100' : 'border-r-slate-400'
              } border`}
            >
              {/* ترويسة القرار والشارات المتقدمة */}
              <div className="flex flex-wrap justify-between items-center gap-2 mb-3">
                <div className="flex items-center gap-3">
                  <span className={`text-xs font-extrabold px-2.5 py-1 rounded-md ${
                    decision.priority === 'CRITICAL' ? 'bg-rose-50 text-rose-700' :
                    decision.priority === 'HIGH' ? 'bg-amber-50 text-amber-700' : 'bg-emerald-50 text-emerald-700'
                  }`}>
                    {decision.priority}
                  </span>
                  <span className="text-xs text-slate-400 font-mono">ID: {decision.id}</span>
                  <span className="text-sm font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded">
                    {decision.platform.toUpperCase()} | {decision.campaignName}
                  </span>
                </div>
                
                {/* مقياس درجة الثقة الإحصائية ومبلغ التوفير */}
                <div className="flex items-center gap-4">
                  <div className="text-left">
                    <span className="text-xs text-slate-400 block">درجة الثقة الإحصائية</span>
                    <span className="text-sm font-bold text-slate-800">{decision.confidenceScore}%</span>
                  </div>
                  {decision.potentialSavings > 0 && (
                    <div className="text-left bg-rose-50 px-3 py-1 rounded-xl">
                      <span className="text-xs text-rose-500 block">النزيف المسترد</span>
                      <span className="text-sm font-black text-rose-700">${decision.potentialSavings}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* متن القرار والسبب التجاري والتأثير المتوقع */}
              <h3 className="text-xl font-black text-slate-900 mb-2">{decision.decisionTitle}</h3>
              
              <div className="space-y-2 mt-4 bg-slate-50 p-4 rounded-xl text-sm text-slate-700">
                <p><strong>💡 السبب التجاري (Business Reason):</strong> {decision.businessReason}</p>
                <p><strong>⚡ التأثير المتوقع (Expected Impact):</strong> {decision.expectedImpact}</p>
              </div>

              {/* زر الإجراء التنفيذي */}
              <div className="mt-4 flex justify-end">
                <button 
                  onClick={() => alert(`جاري محاكاة مزامنة القرار وتطبيقه مباشرة على حساب ${decision.platform}...`)}
                  className="bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs py-2 px-4 rounded-xl transition"
                >
                  ⚡ تنفيذ هذا القرار فوراً في المنصة الإعلانية
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

