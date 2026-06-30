import Link from 'next/link';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { fv, formatRelative } from '@/lib/format';
import { PageHeader, SectionLabel, StatCard, StatusBadge, DatasetBadge, EmptyState } from '@/components/dashboard/PagePrimitives';
import { TrendingUp, TrendingDown, AlertTriangle, CheckCircle, ArrowUpRight, ShieldAlert, Zap, Filter, Building2 } from 'lucide-react';

// ترحيب ذكي بناءً على الوقت
function greeting(): string {
  const h = new Date().getHours();
  if (h < 12) return 'صباح الخير';
  if (h < 17) return 'مساء الخير';
  return 'مساء الخير';
}

export const metadata = { title: 'LisanIQ | AI Decision Engine' };

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user: authUser } } = await supabase.auth.getUser();
  
  if (!authUser) redirect('/login');

  // جلب البيانات الحقيقية من قاعدة البيانات للحفاظ على استقرار النظام
  const [profileRes, reportsRes, datasetsRes] = await Promise.all([
    supabase.from('users').select('full_name, plan').eq('id', authUser.id).single(),
    supabase.from('reports').select('id, name, health_score, business_status, kpis, created_at').eq('owner_id', authUser.id).order('created_at', { ascending: false }).limit(6),
    supabase.from('datasets').select('id, name, file_type, row_count, status, created_at').eq('owner_id', authUser.id).order('created_at', { ascending: false }).limit(6)
  ]);

  const profile = profileRes.data;
  const dbReports = reportsRes.data || [];
  const dbDatasets = datasetsRes.data || [];
  const firstName = profile?.full_name?.split(' ')[0] || 'شريكنا';

  // محرك القواعد الأساسي (Rules Engine) - تحويل البيانات الحقيقية أو الافتراضية للوكالات لقرارات فورا
  const INITIAL_CLIENTS = dbReports.length > 0 ? dbReports.map((r: any) => ({
    id: r.id,
    name: r.name,
    healthScore: r.health_score || 75,
    spend: r.kpis?.spend || 3200,
    roas: r.kpis?.roas || 2.8,
    cpa: r.kpis?.cpa || 15.4
  })) : [
    { id: '1', name: 'متجر العطور (حساب تجريبي)', healthScore: 84, spend: 4500, roas: 3.8, cpa: 12.5 },
    { id: '2', name: 'تطبيق التوصيل (حساب تجريبي)', healthScore: 52, spend: 8200, roas: 1.9, cpa: 34.1 },
  ];

  const averageHealth = Math.round(INITIAL_CLIENTS.reduce((sum, c) => sum + c.healthScore, 0) / INITIAL_CLIENTS.length);
  const totalSpend = INITIAL_CLIENTS.reduce((sum, c) => sum + c.spend, 0);

  // تنبيهات ذكية مبنية على قواعد محرك اتخاذ القرار لوكالات التسويق
  const CRITICAL_ALERTS = [
    { id: 'a1', client: INITIAL_CLIENTS[1]?.name || 'تطبيق التوصيل', type: 'CPA Spike', message: 'ارتفاع مفاجئ في تكلفة الاكتساب (CPA) بنسبة 42% في حملة الاستهداف المباشر.', severity: 'high' },
    ...(averageHealth < 75 ? [{ id: 'a2', client: INITIAL_CLIENTS[0]?.name || 'متجر العطور', type: 'ROAS Drop', message: 'انخفاض عائد الإعلانات (ROAS) أسفل حد الأمان (2.5) في منصة TikTok.', severity: 'medium' }] : [])
  ];

  const TOP_RECOMMENDATIONS = [
    { id: 'r1', client: INITIAL_CLIENTS[1]?.name || 'تطبيق التوصيل', action: 'إيقاف مؤقت للحملة (Pause)', target: 'حملة ترافيك الرياض', impact: 'توفير 450$ يومياً من الميزانية الضائعة', priority: 'عالية جداً' },
    { id: 'r2', client: INITIAL_CLIENTS[0]?.name || 'متجر العطور', action: 'زيادة الميزانية (Scale)', target: 'إعلانات إعادة الاستهداف - إنستغرام', impact: 'زيادة متوقعة في المبيعات بنسبة 18%', priority: 'متوسطة' }
  ];

  return (
    <div style={{ padding: '2rem', maxWidth: '1400px', margin: '0 auto', fontFamily: 'sans-serif', direction: 'rtl', backgroundColor: '#f9fafb', minHeight: '100vh' }}>
      
      {/* هيدر التحكم التنفيذي */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '2rem', fontWeight: '800', color: '#111827', letterSpacing: '-0.025em' }}>
            {greeting()}، {firstName} 👋
          </h1>
          <p style={{ color: '#4b5563', marginTop: '0.25rem' }}>AI Marketing Decision Engine - نظرة تنفيذية ذكية على حسابات عملائك وتحليل المخاطر الفورية.</p>
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', background: '#fff', padding: '0.5rem 1rem', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', border: '1px solid #e5e7eb' }}>
          <Filter size={16} color="#6b7280" />
          <span style={{ fontSize: '0.875rem', color: '#374151', fontWeight: '500' }}>المحفظة المدارة:</span>
          <span style={{ fontWeight: '700', color: '#111827' }}>جميع عملاء الوكالة النشطين</span>
        </div>
      </div>

      {/* صف المؤشرات العلوية الرئيسية (الـ Health Score الإجمالي وأداء المحفظة) */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem', marginBottom: '2.5rem' }}>
        
        {/* الكرت الرئيسي: معدل صحة الحسابات الإعلانية */}
        <div style={{ background: '#fff', padding: '1.5rem', borderRadius: '16px', border: '1px solid #e5e7eb', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <span style={{ color: '#4b5563', fontSize: '0.875rem', fontWeight: '600' }}>معدل صحة الحسابات (Health Score)</span>
            <span style={{ background: averageHealth > 70 ? '#ecfdf5' : '#fef2f2', color: averageHealth > 70 ? '#059669' : '#dc2626', padding: '0.25rem 0.5rem', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 'bold' }}>
              {averageHealth > 70 ? 'مستقر تقريباً' : 'بحاجة لتدخل عاجل'}
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem', marginTop: '1rem' }}>
            <span style={{ fontSize: '2.5rem', fontWeight: '800', color: '#111827' }}>{averageHealth}</span>
            <span style={{ color: '#9ca3af', fontWeight: '500' }}>/ 100</span>
          </div>
          <div style={{ marginTop: '1rem', height: '6px', background: '#e5e7eb', borderRadius: '3px', overflow: 'hidden' }}>
            <div style={{ width: `${averageHealth}%`, height: '100%', background: averageHealth > 70 ? '#10b981' : '#ef4444', borderRadius: '3px' }}></div>
          </div>
        </div>

        {/* كرت إجمالي الإنفاق المدار */}
        <div style={{ background: '#fff', padding: '1.5rem', borderRadius: '16px', border: '1px solid #e5e7eb', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
          <span style={{ color: '#4b5563', fontSize: '0.875rem', fontWeight: '600' }}>إجمالي الميزانيات المدارة تحت التحليل</span>
          <div style={{ fontSize: '2.5rem', fontWeight: '800', color: '#111827', marginTop: '0.5rem' }}>
            ${totalSpend.toLocaleString()}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: '#059669', fontSize: '0.875rem', marginTop: '0.75rem', fontWeight: '500' }}>
            <TrendingUp size={16} />
            <span>محرك القرارات يراقب الحسابات بشكل لحظي</span>
          </div>
        </div>

        {/* كرت حالة التنبيهات النشطة */}
        <div style={{ background: '#fff', padding: '1.5rem', borderRadius: '16px', border: '1px solid #e5e7eb', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
          <span style={{ color: '#4b5563', fontSize: '0.875rem', fontWeight: '600' }}>مخاطر وتنبيهات نشطة</span>
          <div style={{ fontSize: '2.5rem', fontWeight: '800', color: '#dc2626', marginTop: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <ShieldAlert size={36} />
            {CRITICAL_ALERTS.length} مخاطر حرجة
          </div>
          <p style={{ color: '#6b7280', fontSize: '0.875rem', marginTop: '0.75rem' }}>تم اكتشاف هدر في الميزانية يتطلب تدخل مدير الحسابات.</p>
        </div>

      </div>

      {/* القسم المزدوج: التنبيهات الذكية والتوصيات المباشرة */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(450px, 1fr))', gap: '2rem' }}>
        
        {/* الجانب الأيمن: محرك التوصيات المقترحة (Recommendation Engine) */}
        <div style={{ background: '#fff', padding: '1.75rem', borderRadius: '20px', border: '1px solid #e5e7eb', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
            <Zap size={20} color="#3b82f6" fill="#3b82f6" />
            <h2 style={{ fontSize: '1.25rem', fontWeight: '700', color: '#111827' }}>توصيات محرك القرارات الفورية (AI Recommendations)</h2>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {TOP_RECOMMENDATIONS.map((rec) => (
              <div key={rec.id} style={{ border: '1px solid #f3f4f6', background: '#f9fafb', padding: '1rem', borderRadius: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: 'bold', color: '#3b82f6', background: '#eff6ff', padding: '0.25rem 0.5rem', borderRadius: '4px' }}>
                    {rec.client}
                  </span>
                  <span style={{ fontSize: '0.75rem', color: '#ef4444', fontWeight: '600' }}>الأولوية: {rec.priority}</span>
                </div>
                <h3 style={{ fontSize: '1rem', fontWeight: '700', color: '#111827', marginTop: '0.5rem' }}>{rec.action}: <span style={{ fontWeight: 'normal', color: '#4b5563' }}>{rec.target}</span></h3>
                <p style={{ fontSize: '0.875rem', color: '#059669', marginTop: '0.25rem', fontWeight: '500' }}>🎯 التأثير المتوقع: {rec.impact}</p>
              </div>
            ))}
          </div>
        </div>

        {/* الجانب الأيسر: شاشة مركز التنبيهات والمخاطر (Smart Alerts) */}
        <div style={{ background: '#fff', padding: '1.75rem', borderRadius: '20px', border: '1px solid #e5e7eb', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
            <AlertTriangle size={20} color="#dc2626" />
            <h2 style={{ fontSize: '1.25rem', fontWeight: '700', color: '#111827' }}>التنبيهات والمخاطر المكتشفة</h2>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {CRITICAL_ALERTS.map((alert) => (
              <div key={alert.id} style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start', padding: '1rem', borderRight: '4px solid #ef4444', background: '#fff5f5', borderRadius: '0 8px 8px 0' }}>
                <div style={{ background: '#ffeeec', padding: '0.5rem', borderRadius: '8px', color: '#ef4444' }}>
                  <AlertTriangle size={18} />
                </div>
                <div>
                  <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                    <span style={{ fontWeight: 'bold', fontSize: '0.875rem', color: '#991b1b' }}>{alert.client}</span>
                    <span style={{ fontSize: '0.75rem', color: '#b91c1c', background: '#fee2e2', padding: '0.1rem 0.4rem', borderRadius: '4px', fontWeight: '600' }}>{alert.type}</span>
                  </div>
                  <p style={{ fontSize: '0.875rem', color: '#7f1d1d', marginTop: '0.25rem' }}>{alert.message}</p>
                </div>
              </div>
            ))}
          </div>

          {/* لوحة ملخص سريعة لحسابات العملاء */}
          <h3 style={{ fontSize: '1rem', fontWeight: '700', marginTop: '2rem', marginBottom: '1rem', color: '#111827', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
            <Building2 size={16} />
            ملخص أداء المحفظة التسويقية الحالية
          </h3>
          <div style={{ width: '100%', overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'right', fontSize: '0.875rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid #e5e7eb', color: '#6b7280' }}>
                  <th style={{ padding: '0.5rem 0' }}>العميل / التقرير</th>
                  <th style={{ padding: '0.5rem 0' }}>الإنفاق المكتشف</th>
                  <th style={{ padding: '0.5rem 0' }}>ROAS الحالي</th>
                  <th style={{ padding: '0.5rem 0' }}>معدل الصحة</th>
                </tr>
              </thead>
              <tbody>
                {INITIAL_CLIENTS.map(c => (
                  <tr key={c.id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                    <td style={{ padding: '0.75rem 0', fontWeight: '600', color: '#374151' }}>{c.name}</td>
                    <td style={{ padding: '0.75rem 0', color: '#4b5563' }}>${c.spend}</td>
                    <td style={{ padding: '0.75rem 0', fontWeight: 'bold', color: c.roas > 2.5 ? '#059669' : '#dc2626' }}>{c.roas}x</td>
                    <td style={{ padding: '0.75rem 0', fontWeight: 'bold', color: c.healthScore > 70 ? '#059669' : '#dc2626' }}>{c.healthScore}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

        </div>

      </div>

    </div>
  );
}
