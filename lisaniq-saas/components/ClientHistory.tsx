// components/ClientHistory.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { createBrowserClient } from '@supabase/ssr';

interface ClientHistoryProps {
  clientId: string;
}

export default function ClientHistory({ clientId }: ClientHistoryProps) {
  // استخدام حزمة @supabase/ssr المتوافقة لمنع أخطاء الـ Webpack في Vercel
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const [history, setHistory] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!clientId) return;

    async function fetchHistory() {
      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from('datasets')
          .select('*')
          .eq('client_id', clientId)
          .order('created_at', { ascending: false });

        if (error) throw error;
        setHistory(data || []);
      } catch (err: any) {
        console.error('Error fetching client history:', err.message);
      } finally {
        setIsLoading(false);
      }
    }

    fetchHistory();
  }, [clientId, supabase]);

  if (!clientId) return null;

  return (
    <div className="mt-12 bg-white p-6 rounded-2xl border border-slate-100 shadow-sm text-right" dir="rtl">
      <h3 className="font-bold text-slate-800 mb-4">📜 السجل التاريخي لتقارير هذا العميل:</h3>
      
      {isLoading ? (
        <p className="text-sm text-slate-400">جاري تحميل السجل التاريخي...</p>
      ) : history.length === 0 ? (
        <p className="text-sm text-slate-400">لا توجد تقارير سابقة مؤرشفة لهذا العميل.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-slate-600">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50 text-slate-700 font-bold">
                <th className="p-3 text-right">اسم الملف</th>
                <th className="p-3 text-right">تاريخ الرفع</th>
                <th className="p-3 text-right">عدد الأسطر</th>
                <th className="p-3 text-right">الحالة</th>
              </tr>
            </thead>
            <tbody>
              {history.map((item) => (
                <tr key={item.id} className="border-b border-slate-50 hover:bg-slate-50/50">
                  <td className="p-3 font-medium text-slate-900">{item.name}</td>
                  <td className="p-3 text-xs text-slate-500">{new Date(item.created_at).toLocaleDateString('ar-EG')}</td>
                  <td className="p-3">{item.row_count || 0} خطة</td>
                  <td className="p-3">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${item.status === 'ready' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-amber-50 text-amber-700 border border-amber-200'}`}>
                      {item.status === 'ready' ? 'جاهز ومحلل' : 'جاري المعالجة'}
                    </span>
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
