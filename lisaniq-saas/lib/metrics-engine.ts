// lib/metrics-engine.ts

export interface RawMarketingData {
  campaign_id: string;
  campaign_name: string;
  platform: string;
  spend: number;
  clicks: number;
  impressions: number;
  conversions: number;
  target_cpa?: number;
  target_roas?: number;
}

export interface ProcessedMetrics {
  spend: number;
  clicks: number;
  impressions: number;
  conversions: number;
  ctr: number; // نسبة النقر
  cpc: number; // تكلفة النقرة
  cpa: number; // تكلفة الاكتساب
  roas: number; // العائد على الإنفاق
  target_cpa: number;
  target_roas: number;
}

/**
 * طبقة محرك المقاييس (Metrics Engine) المستقلة لمعالجة وهندسة الأرقام التسويقية الحقيقية
 */
export class MetricsEngine {
  public static calculateCampaignMetrics(raw: RawMarketingData): ProcessedMetrics {
    const spend = Math.max(0, raw.spend);
    const clicks = Math.max(0, raw.clicks);
    const impressions = Math.max(0, raw.impressions);
    const conversions = Math.max(0, raw.conversions);
    
    // قيم افتراضية للأهداف إن لم تحدد بالملف لحماية العمليات الحسابية
    const target_cpa = raw.target_cpa && raw.target_cpa > 0 ? raw.target_cpa : 20.00;
    const target_roas = raw.target_roas && raw.target_roas > 0 ? raw.target_roas : 3.00;

    // 🧮 الحسابات الرياضية الدقيقة مع حماية من أخطاء القسمة على صفر
    const ctr = impressions > 0 ? (clicks / impressions) * 100 : 0.00;
    const cpc = clicks > 0 ? spend / clicks : 0.00;
    const cpa = conversions > 0 ? spend / conversions : spend; // إذا لم تكن هناك مبيعات، التكلفة الإجمالية تعتبر خسارة حتى الآن
    
    // حساب الـ ROAS التقريبي كمعيار أداء إذا لم يكن مضمناً بشكل مباشر
    const estimatedRevenue = conversions * target_cpa * target_roas;
    const roas = spend > 0 ? estimatedRevenue / spend : 0.00;

    return {
      spend: parseFloat(spend.toFixed(2)),
      clicks,
      impressions,
      conversions,
      ctr: parseFloat(ctr.toFixed(2)),
      cpc: parseFloat(cpc.toFixed(2)),
      cpa: parseFloat(cpa.toFixed(2)),
      roas: parseFloat(roas.toFixed(2)),
      target_cpa,
      target_roas,
    };
  }
}

