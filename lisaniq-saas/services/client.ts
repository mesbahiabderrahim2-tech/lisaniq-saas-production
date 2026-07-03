// services/client.ts
import { SupabaseClient } from '@supabase/supabase-js';

export interface ClientData {
  id?: string;
  organization_id: string;
  name: string;
  industry?: string;
}

export class ClientService {
  /**
   * جلب أو إنشاء المنظمة التلقائية لمالك الحساب لضمان تجربة مستخدم سلسة بدون تعقيد
   */
  public static async getOrCreateOrganization(supabase: SupabaseClient, userId: string, userName: string) {
    // 1. فحص ما إذا كان للمستخدم يملك منظمة مسجلة بالفعل
    const { data: org, error } = await supabase
      .from('organizations')
      .select('*')
      .eq('owner_id', userId)
      .maybeSingle();

    if (org) return org;

    // 2. إذا لم يكن لديه، نقوم بإنشاء منظمة افتراضية له باسمه فوراً
    const { data: newOrg, error: createError } = await supabase
      .from('organizations')
      .insert({
        name: userName ? `${userName} الذكية` : 'التسويق الذكي',
        owner_id: userId
      })
      .select()
      .single();

    if (createError) throw new Error(`فشلت عملية تهيئة مساحة العمل: ${createError.message}`);
    return newOrg;
  }

  /**
   * إنشاء عميل جديد تابع لمنظمة معينة
   */
  public static async createClient(supabase: SupabaseClient, client: ClientData) {
    const { data, error } = await supabase
      .from('clients')
      .insert(client)
      .select()
      .single();

    if (error) throw new Error(`فشلت عملية إنشاء العميل التجاري: ${error.message}`);
    return data;
  }

  /**
   * جلب قائمة كافة العملاء التابعين للمنتظم النشطة
   */
  public static async getClientsByOrganization(supabase: SupabaseClient, orgId: string) {
    const { data, error } = await supabase
      .from('clients')
      .select('*')
      .eq('organization_id', orgId)
      .order('created_at', { ascending: false });

    if (error) throw new Error(`فشلت جلب قائمة العملاء: ${error.message}`);
    return data || [];
  }

  /**
   * أرشفة وحفظ القرارات التسويقية الذكية المستخرجة تاريخياً في قاعدة البيانات
   */
  public static async archiveDecisions(
    supabase: SupabaseClient,
    clientId: string,
    datasetId: string,
    decisions: any[]
  ) {
    if (!decisions || decisions.length === 0) return;

    const rowsToInsert = decisions.map(decision => ({
      client_id: clientId,
      dataset_id: datasetId,
      decision_title: decision.decisionTitle,
      priority: decision.priority,
      potential_savings: decision.potentialSavings || 0,
      confidence_score: decision.confidenceScore || 50,
      executed: false
    }));

    const { error } = await supabase
      .from('decisions_history')
      .insert(rowsToInsert);

    if (error) console.error('⚠️ تحذير خلفي: فشل أرشفة القرارات في سجل التاريخ لقاعدة البيانات:', error.message);
  }
}
