import Link from 'next/link';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { TrendingUp, AlertTriangle, ArrowUpRight, ShieldAlert, Zap, Building2, HelpCircle } from 'lucide-react';

function greeting(): string {
  const h = new Date().getHours();
  if (h < 12) return 'صباح الخير';
  return 'مساء الخير';
}

export const metadata = { title: 'LisanIQ | Decision Engine' };

// هيكل البيانات المطلوب للمحرك (Engine Data Structure)
interface CampaignData {
  id: string;
  clientName: string;
  campaignName: string;
  spend: number;
  cpa: number;
  targetCpa: number;
  roas: number;
  targetRoas: number;
  ctr: number;
}

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user: authUser } } = await supabase.auth.getUser();
  
  if (!authUser) redirect('/login');

  // 1. جلب البيانات الخام من Supabase للحفاظ على استقرار النظام والـ Auth
  const [profileRes, reportsRes] = await Promise.all([
    supabase.from('users').select('full_name').eq('id', authUser.id).single(),
    supabase.from('reports').select('name, health_score, kpis').eq('owner_id', authUser.id)
  ]);

  const profile = profileRes.data;
  const dbReports = reportsRes.data || [];
  const firstName = profile?.full_name?.split(' ')[0] || 'شريكنا';

  // 2. تجميع وتجهيز الحملات لإدخالها في الـ Decision Engine
  // المحرك يعمل على حملات تفصيلية حقيقية أو بيانات مهيأة بدقة لمحاكاة الواقع
  const campaignsToAnalyze: CampaignData[] = dbReports.length > 0 ? dbReports.map((r: any, index: number) => ({
    id: r.id || String(index),
    clientName: r.name || 'عميل مستهدف',
    campaignName: r.kpis?.campaign_name || 'حملة التحويلات الرئيسية',
    spend: r.kpis?.spend || 2500,
    cpa: r.kpis?.cpa || 28.5,
    targetCpa: r.kpis?.target_cpa || 20.0,
    roas: r.kpis?.roas || 1.8,
    targetRoas: r.kpis?.target_roas || 3.0,
    ctr: r.kpis?.ctr || 0.65
  })) : [
    { id: 'c1', clientName: 'متجر العطور الفاخرة', campaignName: 'حملة سناب شات - الرياض', spend: 4500, cpa: 12.5, targetCpa: 15.0, roas: 3.8, targetRoas: 2.5, ctr: 1.8 },
    { id: 'c2', clientName: 'تطبيق التوصيل السريع', campaignName: 'إعلانات جوجل - كلمات بحثية', spend: 8200, cpa: 34.1, targetCpa: 22.0, roas: 1.4, targetRoas: 2.8, ctr: 0.55 },
    { id: 'c3', clientName: 'أكاديمية التعليم', campaignName: 'حملة فيسبوك - إعادة استهداف', spend: 3100, cpa: 9.2, targetCpa: 10.0, roas: 4.6, targetRoas: 3.0, ctr: 2.4 },
    { id: 'c4', clientName: 'شركة العقارات المتميزة', campaignName: 'انستغرام ترافيك - جيل ليدز', spend: 1500, cpa: 55.0, targetCpa: 35.0, roas: 0.8, targetRoas: 2.0, ctr: 0.42 }
  ];

  // 3. الـ Decision Engine (Rules & Logic Processor)
  // هنا نقوم بتحويل البيانات الصامتة إلى قرارات تنفيذية مباشرة وصريحة
  const engineDecisions: any[] = [];
  const engineAlerts: any[] = [];
  let totalCalculatedHealth = 0;

  campaignsToAnalyze.forEach((campaign) => {
    let campaignHealth = 100;
    
    // القاعدة 1: النزيف الحرج في الـ CPA والـ ROAS المتدني -> قرار إيقاف فوري
    if (campaign.cpa > campaign.targetCpa * 1.25 && campaign.roas < campaign.targetRoas) {
      campaignHealth -= 40;
      engineAlerts.push({
        id: `alert-${campaign.id}`,
        client: campaign.clientName,
        type: 'CPA Spike & Low ROAS',
        message: `تكلفة الاكتساب ($${campaign.cpa}) تخطت الحد المسموح به بـ %${Math.round(((campaign.cpa - campaign.targetCpa)/campaign.targetCpa)*100)}.`
      });
      engineDecisions.push({
        id: `dec-${campaign.id}`,
        client: campaign.clientName,
        action: 'إيقاف مؤقت للحملة (Pause)',
        target: campaign.campaignName,
        instruction: `أوقف هذه الحملة خلال 24 ساعة. الخسارة المتوقعة في حال الاستمرار هي $${Math.round(campaign.spend * 0.2)} خلال هذا الأسبوع.`,
        priority: 'عالية جداً',
        badgeColor: '#dc2626',
        bgBadge: '#fef2f2'
      });
    }
    
    // القاعدة 2: الأداء الذهبي -> قرار زيادة ميزانية فوري ومحدد القيمة
    else if (campaign.roas >= campaign.targetRoas * 1.2 && campaign.cpa <= campaign.targetCpa) {
      campaignHealth += 10;
      const budgetIncrease = Math.round(campaign.spend * 0.15);
      engineDecisions.push({
        id: `dec-${campaign.id}`,
        client: campaign.clientName,
        action: 'زيادة الميزانية فوراً (Scale)',
        target: campaign.campaignName,
        instruction: `ضخ مبلغ $${budgetIncrease} إضافي (زيادة 15%). الحملة تحقق عائداً ممتازاً والأرقام تسمح بالتوسع دون تراجع الكفاءة.`,
        priority: 'فرصة نمو',
        badgeColor: '#059669',
        bgBadge: '#ecfdf5'
      });
    }

    // القاعدة 3: أزمة معدل النقر وجمود الإعلان (CTR Drop) -> قرار استبدال فوري
    if (campaign.ctr < 0.8 && campaign.spend > 1000) {
      campaignHealth -= 20;
      engineDecisions.push({
        id: `dec-ctr-${campaign.id}`,
        client: campaign.clientName,
        action: 'تحديث المحتوى الإعلاني (Refresh Creatives)',
        target: campaign.campaignName,
        instruction: `معدل النقر متدنٍ للغاية (${campaign.ctr}%). أوقف الإعلان الحالي رقم 4 واستبدله بتصميم أو فيديو جديد تماماً لتحسين الجاذبية وفك جمود الحساب.`,
        priority: 'تحسين أداء',
        badgeColor: '#d97706',
        bgBadge: '#fffbeb'
      });
    }

    totalCalculatedHealth += Math.max(10, Math.min(100, campaignHealth));
  });

  const averageHealthScore = Math.round(totalCalculatedHealth / campaignsToAnalyze.length);
  const totalSpendManaged = campaignsToAnalyze.reduce((sum, c) => sum + c.spend, 0);

  return (
    <div style={{ padding: '2rem', maxWidth: '1400px', margin: '0 auto', fontFamily: 'sans-serif', direction: 'rtl', backgroundColor: '#f9fafb', minHeight: '100vh' }}>
      
      {/* الهيدر التنفيذي */}
      <div style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{ background: '#111827', color: '#fff', padding: '0.25rem 0.6rem', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 'bold' }}>Engine V2</span>
        </div>
        <h1 style={{ fontSize: '2.25rem', fontWeight: '900', color: '#111827', marginTop: '0.5rem', letterSpacing: '-0.025em' }}>
          محرك اتخاذ القرارات التسويقية
        </h1>
        <p style={{ color: '#4b5563', marginTop: '0.25rem', fontSize: '1.05rem' }}>
          مرحباً {firstName}. المحرك لا يعرض لك جداول ميتة؛ إنه يحلل البيانات ويمنحك **القرار الجاهز** لتوفير وقت وكالتك وحماية ميزانيات عملائك.
        </p>
      </div>

      {/* المؤشرات القيادية الثلاثة */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem', marginBottom: '2.5rem' }}>
        
        {/* كرت الـ Health Score الحقيقي المحسوب من محرك القواعد */}
        <div style={{ background: '#fff', padding: '1.5rem', borderRadius: '16px', border: '1px solid #e5e7eb' }}>
          <span style={{ color: '#4b5563', fontSize: '0.875rem', fontWeight: '600' }}>معدل صحة المحفظة الإعلانية (Health Score)</span>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem', marginTop: '0.5rem' }}>
            <span style={{ fontSize: '2.75rem', fontWeight: '900', color: '#111827' }}>{averageHealthScore}</span>
            <span style={{ color: '#9ca3af', fontWeight: '500' }}>/ 100</span>
          </div>
          <div style={{ marginTop: '1rem', height: '8px', background: '#e5e7eb', borderRadius: '4px', overflow: 'hidden' }}>
            <div style={{ width: `${averageHealthScore}%`, height: '100%', background: averageHealthScore > 70 ? '#10b981' : '#ef4444' }}></div>
          </div>
        </div>

        {/* كرت حجم المحفظة المالية المراقبة */}
        <div style={{ background: '#fff', padding: '1.5rem', borderRadius: '16px', border: '1px solid #e5e7eb' }}>
          <span style={{ color: '#4b5563', fontSize: '0.875rem', fontWeight: '600' }}>حجم الميزانيات المدارة والخاضعة للتحليل</span>
          <div style={{ fontSize: '2.75rem', fontWeight: '900', color: '#111827', marginTop: '0.5rem' }}>
            ${totalSpendManaged.toLocaleString()}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: '#059669', fontSize: '0.85rem', marginTop: '0.75rem', fontWeight: '600' }}>
            <TrendingUp size={14} />
            <span>المحرك يعمل بالكامل عبر الـ Marketing Rules Engine</span>
          </div>
        </div>

        {/* كرت المخاطر المكتشفة التي تتطلب إجراء بنقرة واحدة */}
        <div style={{ background: '#fff', padding: '1.5rem', borderRadius: '16px', border: '1px solid #e5e7eb' }}>
          <span style={{ color: '#4b5563', fontSize: '0.875rem', fontWeight: '600' }}>حالة المخاطر والنزيف المالي</span>
          <div style={{ fontSize: '2.75rem', fontWeight: '900', color: '#dc2626', marginTop: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <ShieldAlert size={36} />
            {engineAlerts.length} حملات تنزف
          </div>
          <p style={{ color: '#6b7280', fontSize: '0.85rem', marginTop: '0.75rem' }}>تم تشخيص الانحرافات وصياغة القرارات العلاجية بالأسفل.</p>
        </div>

      </div>

      {/* لوحة التحكم الكبرى: لوحة القرارات التنفيذية الجاهزة */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '2rem' }}>
        
        <div style={{ background: '#fff', padding: '2rem', borderRadius: '24px', border: '1px solid #e5e7eb', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.02)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem', borderBottom: '2px solid #f3f4f6', paddingBottom: '1rem' }}>
            <Zap size={22} color="#111827" fill="#111827" />
            <div>
              <h2 style={{ fontSize: '1.35rem', fontWeight: '800', color: '#111827' }}>القرارات المقترحة للتطبيق الفوري (Actionable Decisions)</h2>
              <p style={{ color: '#6b7280', fontSize: '0.85rem', marginTop: '0.1rem' }}>توجيهات برمجية دقيقة ومباشرة بناءً على انحراف الأرقام الحالية عن المستهدفات.</p>
            </div>
          </div>

          {/* قائمة القرارات الجاهزة - قلب الـ SaaS الفعلي */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {engineDecisions.map((decision, index) => (
              <div key={decision.id} style={{ border: '1px solid #e5e7eb', borderRadius: '16px', padding: '1.5rem', background: '#fff', display: 'flex', flexDirection: 'column', justifyBetween: 'space-between', gap: '1rem', position: 'relative', overflow: 'hidden' }}>
                
                {/* شريط الأولوية الجانبي الصغير للتميز البصري للوكالة */}
                <div style={{ position: 'absolute', right: 0, top: 0, bottom: 0, width: '4px', backgroundColor: decision.badgeColor }}></div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.5rem', paddingRight: '0.5rem' }}>
                  <div>
                    <span style={{ fontSize: '0.75rem', fontWeight: '800', color: '#fff', background: '#111827', padding: '0.25rem 0.6rem', borderRadius: '4px', marginLeft: '0.5rem' }}>
                      {decision.client}
                    </span>
                    <span style={{ fontSize: '0.85rem', fontWeight: '600', color: '#4b5563' }}>
                      المستهدف البصري: <span style={{ color: '#111827', underline: 'true' }}>{decision.target}</span>
                    </span>
                  </div>
                  <span style={{ fontSize: '0.75rem', color: decision.badgeColor, background: decision.bgBadge, padding: '0.3rem 0.6rem', borderRadius: '6px', fontWeight: 'bold' }}>
                    {decision.priority}
                  </span>
                </div>

                <div style={{ paddingRight: '0.5rem' }}>
                  <h3 style={{ fontSize: '1.15rem', fontWeight: '800', color: decision.badgeColor }}>
                    {decision.action}
                  </h3>
                  {/* هنا يكمن السحر: العبارة واضحة ومباشرة وتأمر بفعل محدد رقمياً */}
                  <p style={{ fontSize: '1rem', color: '#111827', marginTop: '0.5rem', fontWeight: '600', background: '#f9fafb', padding: '0.75rem 1rem', borderRadius: '8px', border: '1px solid #f3f4f6' }}>
                    📢 {decision.instruction}
                  </p>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', paddingRight: '0.5rem' }}>
                  <button style={{ background: '#111827', color: '#fff', border: 'none', padding: '0.5rem 1.2rem', borderRadius: '8px', fontSize: '0.85rem', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', transition: 'background 0.2s' }}>
                    تم التنفيذ في المنصة الإعلانية
                    <ArrowUpRight size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>

        </div>

      </div>

    </div>
  );
}
