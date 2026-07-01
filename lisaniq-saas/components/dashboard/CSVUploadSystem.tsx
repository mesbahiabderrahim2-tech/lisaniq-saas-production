// components/dashboard/CSVUploadSystem.tsx
'use client';
import React, { useState } from 'react';
import { Upload, FileSpreadsheet, CheckCircle2, AlertCircle } from 'lucide-react';
import { parseMarketingCSV } from '@/lib/marketing-parser';
import { UniversalCampaignRow } from '@/types/marketing';

interface CSVUploadSystemProps {
  onDataLoaded: (data: UniversalCampaignRow[]) => void;
}

export default function CSVUploadSystem({ onDataLoaded }: CSVUploadSystemProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFile = (file: File) => {
    setError(null);
    
    // التأكد من صيغة الملف
    if (file.type !== 'text/csv' && !file.name.endsWith('.csv')) {
      setError('يرجى رفع ملف بصيغة CSV فقط.');
      return;
    }
    
    setFileName(file.name);
    const reader = new FileReader();
    
    reader.onload = (e) => {
      const text = e.target?.result as string;
      // استدعاء محرك التحليل الذي أنشأناه في الخطوة 2
      const parsedCampaigns = parseMarketingCSV(text);
      
      if (parsedCampaigns.length === 0) {
        setError('لم نتمكن من استخراج بيانات تسويقية صالحة. تحقق من بنية الملف وفواصل الأسطر.');
        setFileName(null);
        return;
      }
      
      // تمرير البيانات الموحدة إلى المكون الأب (Dashboard Page)
      onDataLoaded(parsedCampaigns);
    };
    
    reader.readAsText(file);
  };

  return (
    <div 
      onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={(e) => { e.preventDefault(); setIsDragging(false); if(e.dataTransfer.files[0]) handleFile(e.dataTransfer.files[0]); }}
      style={{
        border: isDragging ? '2px dashed #111827' : '2px dashed #e5e7eb',
        background: isDragging ? '#f9fafb' : '#fff',
        padding: '2.5rem 2rem',
        borderRadius: '20px',
        textAlign: 'center',
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.02)'
      }}
    >
      <input 
        type="file" 
        accept=".csv" 
        id="csv-file-input" 
        style={{ display: 'none' }} 
        onChange={(e) => { if(e.target.files?.[0]) handleFile(e.target.files[0]); }}
      />
      <label htmlFor="csv-file-input" style={{ cursor: 'pointer', display: 'block' }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
          
          {/* تغيير الأيقونة ديناميكياً حسب الحالة */}
          {error ? (
            <AlertCircle size={44} color="#dc2626" />
          ) : fileName ? (
            <CheckCircle2 size={44} color="#059669" />
          ) : (
            <FileSpreadsheet size={44} color="#4b5563" />
          )}

          <div>
            <p style={{ fontSize: '1.1rem', fontWeight: '800', color: '#111827' }}>
              {error ? error : fileName ? `تم استيراد: ${fileName}` : 'قم بسحب ملف الـ CSV الخاص بالحملات هنا أو اضغط للتصفح'}
            </p>
            <p style={{ fontSize: '0.85rem', color: '#6b7280', marginTop: '0.35rem', lineHeight: '1.4' }}>
              يدعم تقارير تصدير الأداء من منصات Google, Meta, Snapchat, والمنصات المتوافقة مع المخطط الموحد.
            </p>
          </div>
        </div>
      </label>
    </div>
  );
}

