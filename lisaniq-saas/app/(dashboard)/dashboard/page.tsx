// app/(dashboard)/dashboard/page.tsx
'use client';

import React, { useState } from 'react';
import CSVUploadSystem from '@/components/dashboard/CSVUploadSystem';
import { UniversalCampaignRow } from '@/types/marketing';
import { TrendingUp, ShieldAlert, Zap, ArrowUpRight } from 'lucide-react';

export default function DashboardPage() {
  // الحالة المسؤولة عن تخزين بيانات الحملات الحقيقية المرفوعة من ملف الـ CSV
  const [realCampaigns, setRealCampaigns] = useState<UniversalCampaignRow[]>([]);

  // مصفوفة لتجميع القرارات المتولدة من المحرك ديناميكياً
  const engineDecisions: any[] = [];
  let bleedingCampaignsCount = 0;
  let totalCalculatedHealth = 0;
  let totalSpendManaged = 0;

  // تشغيل الـ Rules Engine فقط في حال تم رفع ملف يحتوي على بيانات حقيقية
  if (realCampaigns.length > 0) {
    realCampaigns.forEach((campaign) => {
      let campaignHealth = 100;
      let hasCriticalIssue = false;
      totalSpendManaged += campaign.spend;
      
      // 1. قاعدة الـ CPA المرتفع والنزيف المالي
      if (campaign.cpa > campaign.target_cpa) {
        campaignHealth -= 40;
        hasCriticalIssue = true;
        const budgetLoss = Math.round(campaign.spend * 0.2);
        engineDecisions.push({
          id: `cpa-${campaign.campaign_id}`,
          client: campaign.campaign_name,
          action: 'إيقاف مؤقت للحملة لحماية الميزانية (Pause)',
          instruction: `تكلفة الاكتساب الفعلية ($${campaign.cpa}) تجاوزت الحد المستهدف ($${campaign.target_cpa}). نوصي بإيقاف الحملة فوراً خلال 24 ساعة لتفادي هدر مالي يقدر بـ $${budgetLoss} هذا الأسبوع.`,
          priority: 'خطورة عالية جداً',
          color: '#dc2626',
          bgColor: '#fef2f2'
        });
      }
      
      // 2. قاعدة الـ ROAS الإيجابي وفرص التوسع الهجومي
      if (campaign.roas >= campaign.target_roas && campaign.cpa <= campaign.target_cpa) {
        campaignHealth += 10;
        const budgetIncrease = Math.round(campaign.spend * 0.15);
        engineDecisions.push({
          id: `scale-${campaign.campaign_id}`,
          client: campaign.campaign_name,
          action: 'زيادة التمويل والميزانية فوراً (Scale)',
          instruction: `الحملة تحقق عائداً ممتازاً على الإنفاق الإعلاني يبلغ (${campaign.roas}x) وهو أعلى من مستهدفك مع استقرار التكلفة. ضخ ميزانية إضافية بقيمة $${budgetIncrease} (زيادة 15%).`,
          priority: 'فرصة نمو واعدة',
          color: '#059669',
          bgColor: '#ecfdf5'
        });
      }

      // 3. قاعدة ضعف جاذبية الإعلان وانخفاض الـ CTR
      if (campaign.ctr < 0.8 && campaign.spend > 200) {
        campaignHealth -= 20;
        engineDecisions.push({
          id: `ctr-${campaign.campaign_id}`,
          client: campaign.campaign_name,
          action: 'تحديث المحتوى الإعلاني (Refresh Creatives)',
          instruction: `نسبة النقر إلى الظهور منخفضة ومقلقة وضمن نطاق الخطر الحالي (${campaign.ctr}%). استبدل الصور أو النصوص الإعلانية فوراً لجلب تفاعل أعلى وكسر جمود الحساب.`,
          priority: 'تحسين الأداء البصري',
          color: '#d97706',
          bgColor: '#fffbeb'
        });
      }

      if (hasCriticalIssue) bleedingCampaignsCount++;
      totalCalculatedHealth += Math.max(10, Math.min(100, campaignHealth));
    });
  }

  // حساب معدل الصحة الوسطي للحملات الحقيقية المرفوعة
  const averageHealthScore = realCampaigns.length > 0 ? Math.round(totalCalculatedHealth / realCampaigns.length) : 0;

  return (
    <div style={{ padding: '2rem', maxWidth: '1400px', margin: '0 auto', direction: 'rtl', fontFamily: 'sans-serif', backgroundColor: '#f9fafb', minHeight: '100vh' }}>
      
      {/* هيدر الصفحة */}
      <div style={{ marginBottom: '2.5rem' }}>
        <span style={{ background: '#111827', color: '#fff', padding: '0.25rem 0.6rem', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 'bold' }}>طبقة دمج البيانات الحية | المرحلة 3</span>
        <h1 style={{ fontSize: '2rem', fontWeight: '900', color: '#111827', marginTop: '0.5rem' }}>محرك القرارات المربوط ببياناتك الفعلية</h1>
        <p style={{ color: '#4b5563', marginTop: '0.25rem' }}>قم برفع تقرير حملاتك بصيغة CSV ليقوم النظام بتحليل الأرقام حياً وصياغة القرارات التنفيذية فوراً.</p>
      </div>

      {/* مكون رفع الملف التابع للخطوة 3 */}
      <div style={{ marginBottom: '2.5rem' }}>
        <CSVUploadSystem onDataLoaded={(data) => setRealCampaigns(data)} />
      </div>

      {/* اختبار الحالة: إذا لم يرفع العميل ملفاً بعد، تظهر واجهة الانتظار النظيفة */}
      {realCampaigns.length === 0 ? (
        <div style={{ padding: '4rem 2rem', background: '#fff', borderRadius: '24px', textAlign: 'center', border: '1px solid #e5e7eb' }}>
          <p style={{ fontSize: '1.2rem', fontWeight: '800', color: '#374151' }}>بانتظار حقن ملف البيانات الحقيقية...</p>
          <p style={{ fontSize: '0.9rem', color: '#6b7280', marginTop: '0.5rem' }}>بمجرد قيامك بسحب وإفلات ملف الـ CSV في الأعلى، ستختفي هذه الرسالة لتظهر المؤشرات القيادية والقرارات المولدة تلقائياً.</p>
        </div>
      ) : (
        <div>
          {/* لوحة المؤشرات الإحصائية الحية المستخرجة من ملف العميل */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem', marginBottom: '2.5rem' }}>
            
            <div style={{ background: '#fff', padding: '1.5rem', borderRadius: '16px', border: '1px solid #e5e7eb' }}>
              <span style={{ color: '#4b5563', fontSize: '0.875rem', fontWeight: '600' }}>معدل صحة حسابك الفعلي (Health Score)</span>
              <div style={{ fontSize: '2.75rem', fontWeight: '900', marginTop: '0.5rem', color: '#111827' }}>
                {averageHealthScore} <span style={{ fontSize: '1rem', color: '#9ca3af', fontWeight: '500' }}>/ 100</span>
              </div>
            </div>

            <div style={{ background: '#fff', padding: '1.5rem', borderRadius: '16px', border: '1px solid #e5e7eb' }}>
              <span style={{ color: '#4b5563', fontSize: '0.875rem', fontWeight: '600' }}>إجمالي الإنفاق المكتشف بالتقرير</span>
              <div style={{ fontSize: '2.75rem', fontWeight: '900', marginTop: '0.5rem', color: '#111827' }}>
                دولار {totalSpendManaged.toLocaleString()}
              </div>
            </div>

            <div style={{ background: '#fff', padding: '1.5rem', borderRadius: '16px', border: '1px solid #e5e7eb' }}>
              <span style={{ color: '#4b5563', fontSize: '0.875rem', fontWeight: '600' }}>الحملات الحرجة المستنزِفة حالياً</span>
              <div style={{ fontSize: '2.75rem', fontWeight: '900', marginTop: '0.5rem', color: bleedingCampaignsCount > 0 ? '#dc2626' : '#059669' }}>
                {bleedingCampaignsCount} حملات
              </div>
            </div>

          </div>

          {/* لوحة عرض القرارات الحقيقية الذكية والجاهزة للتنفيذ */}
          <div style={{ background: '#fff', padding: '2rem', borderRadius: '24px', border: '1px solid #e5e7eb' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '2rem' }}>
              <Zap size={22} color="#111827" fill="#111827" />
              <h2 style={{ fontSize: '1.3rem', fontWeight: '800', color: '#111827' }}>القرارات التنفيذية المتولدة من أرقامك الفعلية</h2>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              {engineDecisions.map((decision, idx) => (
                <div key={idx} style={{ border: '1px solid #e5e7eb', borderRadius: '16px', padding: '1.5rem', background: '#fff', position: 'relative', overflow: 'hidden' }}>
                  <div style={{ position: 'absolute', right: 0, top: 0, bottom: 0, width: '4px', backgroundColor: decision.color }}></div>
                  
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem', marginRight: '0.5rem' }}>
                    <span style={{ fontSize: '0.8rem', fontWeight: '800', background: '#111827', color: '#fff', padding: '0.25rem 0.5rem', borderRadius: '4px' }}>
                      {decision.client}
                    </span>
                    <span style={{ fontSize: '0.75rem', color: decision.color, background: decision.bgColor, padding: '0.3rem 0.6rem', borderRadius: '6px', fontWeight: 'bold' }}>
                      {decision.priority}
                    </span>
                  </div>

                  <div style={{ marginRight: '0.5rem', marginTop: '1rem' }}>
                    <h3 style={{ fontSize: '1.15rem', fontWeight: '800', color: decision.color }}>{decision.action}</h3>
                    <p style={{ fontSize: '1rem', color: '#111827', marginTop: '0.5rem', fontWeight: '600', background: '#f9fafb', padding: '1rem', borderRadius: '8px', border: '1px solid #f3f4f6', lineHeight: '1.6' }}>
                      📢 {decision.instruction}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
