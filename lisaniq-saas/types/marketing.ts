Enter// types/marketing.ts

export interface UniversalCampaignRow {
  campaign_id: string;      // معرف الحملة الإعلانية
  campaign_name: string;    // اسم الحملة
  platform: 'meta' | 'google' | 'snapchat' | 'tiktok' | 'generic'; // المنصة الإعلانية
  spend: number;            // المبلغ المنفق (Spend)
  cpa: number;              // تكلفة الاكتساب الحالية (CPA)
  target_cpa: number;       // تكلفة الاكتساب المستهدفة من قبل العميل
  roas: number;             // العائد الحالي على الإعلانات (ROAS)
  target_roas: number;      // العائد المستهدف من قبل العميل
  ctr: number;              // معدل النقر (CTR)
  impressions?: number;     // الظهور (اختياري)
  clicks?: number;          // النقرات (اختياري)
}
