// components/ClientHistory.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

interface ClientHistoryProps {
  clientId: string;
}

export default function ClientHistory({ clientId }: ClientHistoryProps) {
  const supabase = createClientComponentClient();
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState<any[]>([]);
  const [summary, setSummary] = useState({ totalDecisions: 0, totalSavings: 0 });

  useEffect(() => {
    if (!clientId) return;

    async function loadClientHistory() {
      setLoading(true);
      try {
        // سحب التوصيات والقرارات المؤرشفة للعميل المحدد حياً من جدول قاعدة البيانات الجديد
        const { data, error } = await supabase
          .from('decisions_history')
          .select('*')
          .eq('client_id', clientId)
          .order('created_at', { ascending: false });

        if (error) throw error;

        setHistory(data || []);

        // حساب مجموع الوفورات التاريخية المستردة من نزيف الحملات لهذا العميل
        const savings = (data || []).reduce((sum, item) => sum + parseFloat(item.potential_savings || 0), 0);
        setSummary({
          totalDecisions: data?.length || 0,
          totalSavings: savings
        });
      } catch (err: any) {
        console.error('⚠️ خطأ في المعالجة أثناء جلب تاريخ العميل:', err.message);
      } finally {
        setLoading(false);
      }
    }

    loadClientHistory();
  }, [clientId, supabase]);

  if (!clientId) return null;

  return (
    <div className="mt-12 bg-white rounded-2xl border border-slate-100 shadow-sm p-6 text-right" dir="rtl">
      {/* الترويسة الخاصة بسجلات العميل */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-slate-100 pb-4 mb-6 gap-4">
        <div>
          <h3 className="text-lg font-black text-slate-900">📜 الأرشيف والسجل التاريخي للعميل</h3>
          <p className="text-xs text-slate-500 mt-1">تتبع مستمر لكافة القرارات والتوصيات المستخرجة سحابياً من التقارير السابقة.</p>
        </div>
        
        {/* بطاقات الإحصاء التراكمي للعميل النشط */}
        <div className="flex gap-3 w-full sm:w-auto">
          <div className="bg-slate-50 px-4 py-2 rounded-xl border border-slate-100 text-center flex-1 sm:flex-none">
            <span className="text-[10px] font-bold text-slate-400 block">إجمالي التوصيات</span>
            <span className="text-sm font-black text-slate-800">{summary.totalDecisions} قرار</span>
          </div>
          <div className="bg-emerald-50/60 px-4 py-2 rounded-xl border border-emerald-100 text-center flex-1 sm:flex-none">
            <span className="text-[10px] font-bold text-emerald-600 block">النزيف المسترد تاريخياً</span>
            <span className="text-sm font-black text-emerald-700">${summary.totalSavings.toLocaleString()}</span>
          </div>
        </div>
      </div>

      {/* آلية عرض البيانات واستقبال كاش الأرشيف */}
      {loading ? (
        <div className="text-center py-8 text-sm text-slate-400">🔄 جاري سحب الأرشيف التاريخي للعميل من سيرفر Supabase...</div>
      ) : history.length === 0 ? (
        <div className="text-center py-10 bg-slate-50/50 rounded-xl border border-dashed border-slate-200 text-slate-400 text-xs">
          لا يوجد سجل قرارات مؤرشف مسبقاً لهذا العميل. ارفع أول ملف CSV لبناء الأرشيف!
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-right text-slate-600">
            <thead className="text-xs text-slate-400 bg-slate-50 rounded-lg">
              <tr>
                <th className="p-3 font-bold">التوصية والقرار الإستراتيجي</th>
                <th className="p-3 font-bold text-center">درجة الخطورة</th>
                <th className="p-3 font-bold text-center">الوفورات المتوقعة</th>
                <th className="p-3 font-bold text-center">نقطة الثقة</th>
                <th className="p-3 font-bold text-left">تاريخ المعالجة</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {history.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="p-3 font-semibold text-slate-800">{item.decision_title}</td>
                  <td className="p-3 text-center">
                    <span className={`text-[10px] font-black px-2 py-0.5 rounded ${
                      item.priority === 'CRITICAL' ? 'bg-rose-50 text-rose-600' :
                      item.priority === 'WARNING' ? 'bg-amber-50 text-amber-600' : 'bg-slate-100 text-slate-600'
                    }`}>
                      {item.priority === 'CRITICAL' ? 'حرج جداً 🚨' : item.priority === 'WARNING' ? 'تحذير ⚠️' : 'تحسين ⚙️'}
                    </span>
                  </td>
                  <td className="p-3 text-center font-bold text-emerald-600">
                    {item.potential_savings > 0 ? `$${parseFloat(item.potential_savings).toLocaleString()}` : '-'}
                  </td>
                  <td className="p-3 text-center font-medium text-indigo-600">{item.confidence_score}%</td>
                  <td className="p-3 text-left text-xs text-slate-400" dir="ltr">
                    {new Date(item.created_at).toLocaleDateString('ar-EG', { year: 'numeric', month: 'short', day: 'numeric' })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

