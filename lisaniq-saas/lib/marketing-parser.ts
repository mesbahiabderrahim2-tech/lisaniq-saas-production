// lib/marketing-parser.ts
import { UniversalCampaignRow } from '@/types/marketing';

export function parseMarketingCSV(text: string): UniversalCampaignRow[] {
  // تقسيم النص إلى أسطر وتنظيف الفراغات وحذف الأسطر الفارغة
  const lines = text.split('\n').map(line => line.trim()).filter(Boolean);
  if (lines.length < 2) return [];

  // قراءة السطر الأول (العناوين) وتحويل الحروف إلى صغيرة لتسهيل المطابقة
  const headers = lines[0].split(',').map(h => h.replace(/["']/g, '').trim().toLowerCase());
  
  const campaigns: UniversalCampaignRow[] = [];

  // المرور على باقي الأسطر (البيانات)
  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(',').map(v => v.replace(/["']/g, '').trim());
    if (values.length !== headers.length) continue;

    // ربط كل قيمة بالعنوان الخاص بها في مصفوفة مؤقتة
    const rowData: Record<string, string> = {};
    headers.forEach((header, index) => {
      rowData[header] = values[index];
    });

    // 💡 محرك مطابقة المسميات (Mapping Logic):
    // يبحث عن الكلمة المفتاحية في ملف العميل مهما اختلف مسمى العمود من منصة لأخرى
    const spend = parseFloat(rowData['spend'] || rowData['cost'] || rowData['amount spent'] || rowData['المبلغ المنفق'] || '0');
    const clicks = parseFloat(rowData['clicks'] || rowData['نقرات'] || '0');
    const cpa = parseFloat(rowData['cpa'] || rowData['cost per purchase'] || rowData['تكلفة الاكتساب'] || '0');
    const targetCpa = parseFloat(rowData['target_cpa'] || rowData['target cpa'] || '20'); // قيمة مستهدفة افتراضية لحماية المعادلات
    const roas = parseFloat(rowData['roas'] || rowData['purchase roas'] || rowData['العائد'] || '0');
    const targetRoas = parseFloat(rowData['target_roas'] || rowData['target roas'] || '3');
    const ctr = parseFloat(rowData['ctr'] || rowData['click-through rate'] || '0');

    campaigns.push({
      campaign_id: rowData['id'] || rowData['campaign id'] || `camp-${i}`,
      campaign_name: rowData['campaign'] || rowData['campaign name'] || rowData['اسم الحملة'] || `حملة غير مسمية ${i}`,
      platform: identifyPlatform(headers, rowData),
      spend,
      cpa,
      target_cpa: targetCpa,
      roas,
      target_roas: targetRoas,
      ctr: ctr || (clicks && rowData['impressions'] ? (clicks / parseFloat(rowData['impressions'])) * 100 : 0)
    });
  }

  return campaigns;
}

// دالة ذكية لتخمين المنصة الإعلانية بناءً على محتوى الأعمدة
function identifyPlatform(headers: string[], row: Record<string, string>): 'meta' | 'google' | 'snapchat' | 'tiktok' | 'generic' {
  const text = headers.join(' ');
  if (text.includes('google') || row['campaign id']?.includes('g_')) return 'google';
  if (text.includes('fb') || text.includes('meta') || text.includes('pixel')) return 'meta';
  if (text.includes('snap')) return 'snapchat';
  if (text.includes('tiktok')) return 'tiktok';
  return 'generic';
}

