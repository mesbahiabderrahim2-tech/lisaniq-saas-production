// lib/decision-engine.ts

export interface CampaignDecision {
  id: string;
  campaignName: string;
  platform: string;
  decisionTitle: string;
  businessReason: string;
  expectedImpact: string;
  priority: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'GROWTH';
  confidenceScore: number; // نسبة مئوية تعبر عن الاستقرار الإحصائي للقرار
  potentialSavings: number;
}

export class DecisionEngine {
  /**
   * تشغيل قواعد الأتمتة الذكية وصياغة القرارات التنفيذية بناءً على المؤشرات الحقيقية للحملة
   */
  public static evaluateCampaign(metrics: {
    campaign_name: string;
    platform: string;
    spend: number;
    clicks: number;
    impressions: number;
    ctr: number;
    cpc: number;
    cpa: number;
    roas: number;
    conversions: number;
    target_cpa: number;
    target_roas: number;
  }): CampaignDecision[] {
    const decisions: CampaignDecision[] = [];
    const { campaign_name, platform, spend, clicks, ctr, cpa, roas, target_cpa, target_roas } = metrics;

    // 📊 حساب معامل الثقة الإحصائية (Confidence Score) بناءً على حجم البيانات المتوفرة
    // إذا كانت الحملة قد صرفت أكثر من 500 دولار، فالمحرك يمتلك ثقة عالية جداً (أعلى من 90%)
    let confidence = 50;
    if (spend > 100) confidence = 75;
    if (spend > 500) confidence = 92;
    if (spend > 1500) confidence = 98;

    // 🚨 القاعدة الأولى: النزيف المالي الحرج وضبط الـ CPA المستهدف (CPA > Target CPA بـ 20%)
    if (cpa > target_cpa * 1.20 && spend > 50) {
      const budgetLoss = Math.round(spend * 0.25); // حساب هدر تقريبي ربع الميزانية الحالية
      decisions.push({
        id: `rule-cpa-${Math.random().toString(36).substr(2, 5)}`,
        campaignName: campaign_name,
        platform: platform,
        decisionTitle: 'إيقاف مؤقت فوري للحملة (Immediate Pause Required)',
        businessReason: `تكلفة الاكتساب الفعلية الحالية تبلغ ($${cpa})، وهي متضخمة وتتجاوز الحد المستهدف المقبول لعملك ($${target_cpa}) بنسبة تتعدى الـ 20%.`,
        expectedImpact: 'حماية الميزانية الإعلانية النشطة فوراً وإعادة التوازن المالي للحساب.',
        priority: 'CRITICAL',
        confidenceScore: confidence,
        potentialSavings: budgetLoss
      });
    }

    // 🚀 القاعدة الثانية: التوسع الهجومي وضخ الميزانية (ROAS ممتاز وتكلفة اكتساب مستقرة)
    if (roas >= target_roas && cpa <= target_cpa && spend > 100) {
      const suggestedScale = Math.round(spend * 0.20); // التوصية بزيادة 20%
      decisions.push({
        id: `rule-scale-${Math.random().toString(36).substr(2, 5)}`,
        campaignName: campaign_name,
        platform: platform,
        decisionTitle: 'توسيع نطاق التمويل والميزانية الإعلانية (Scale Budget)',
        businessReason: `الحملة تحقق كفاءة مبيعات فائقة بعائد على الإنفاق الإعلاني يبلغ (${roas}x) وهو أعلى من مستهدفك (${target_roas}x) مع استقرار تام للتكلفة.`,
        expectedImpact: 'مضاعفة حجم المبيعات الإجمالية وحصد حصة سوقية أكبر قبل جمود الجمهور.',
        priority: 'GROWTH',
        confidenceScore: confidence,
        potentialSavings: 0 // هذه قاعدة نمو وتوسع وليست توفير خسائر
      });
    }

    // 🎨 القاعدة الثالثة: ضعف جاذبية الإعلان وانخفاض الـ CTR الإعلاني (CTR < 0.8%)
    if (ctr < 0.80 && clicks > 10) {
      decisions.push({
        id: `rule-ctr-${Math.random().toString(36).substr(2, 5)}`,
        campaignName: campaign_name,
        platform: platform,
        decisionTitle: 'استبدال وتحديث التصاميم والمحتوى المرئي (Refresh Ad Creatives)',
        businessReason: `نسبة النقر إلى الظهور الحالية منخفضة جداً وخطيرة تبلغ (${ctr}%)، مما يشير إلى ضعف جاذبية الإعلان أو حدوث تشبع للجمهور المستهدف المستنزف (Ad Fatigue).`,
        expectedImpact: 'رفع كفاءة النقر وخفض الـ CPC الإجمالي للحملة بصورة آلية.',
        priority: 'HIGH',
        confidenceScore: Math.min(confidence, 85), // تجميع الثقة البصرية أقل نسبياً من الأرقام المالية الجافة
        potentialSavings: Math.round(spend * 0.10)
      });
    }

    // 🔄 القاعدة الرابعة: ضعف معدل التحويل الداخلي في موقع العميل (High Clicks, Zero Conversions)
    if (clicks > 40 && metrics.conversions === 0) {
      decisions.push({
        id: `rule-cro-${Math.random().toString(36).substr(2, 5)}`,
        campaignName: campaign_name,
        platform: platform,
        decisionTitle: 'فحص تجربة المستخدم وصفحة الهبوط (Inspect Landing Page / CRO)',
        businessReason: `الحملة تجلب زيارات مهتمة بكفاءة عالية (أكثر من ${clicks} نقرة حقيقية)، لكنها تفشل تماماً في إتمام عمليات الشراء أو التحويل بداخل متجرك الإلكتروني.`,
        expectedImpact: 'إصلاح الخلل البرمجي أو التسويقي في صفحة الهبوط لمنع استمرار تبخر أموال النقرات دون عائد.',
        priority: 'HIGH',
        confidenceScore: 90,
        potentialSavings: Math.round(spend * 0.50) // نصف التكلفة تضيع بسبب عطل صفحة الهبوط
      });
    }

    return decisions;
  }
}

