'use client'

import { useState } from 'react'
import { Plus, Folder, Calendar, FileText, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { CreateProjectModal } from '@/components/project/CreateProjectModal'

// واجهة تعريفية للمشاريع المسترجعة من قاعدة البيانات
interface Project {
  id: string
  name: string
  description: string | null
  created_at: string
  datasets_count?: number
  reports_count?: number
}

export default function ProjectsPage() {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [projects, setProjects] = useState<Project[]>([])
  const [isLoading, setIsLoading] = useState(false)

  return (
    <div className="space-y-8 p-6 max-w-7xl mx-auto">
      {/* الهيدر العلوي لصفحة المشاريع */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b pb-5">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">المشاريع</h1>
          <p className="text-muted-foreground mt-1">
            إدارة وتحليل حملاتك التسيقية ومستنداتك الذكية في مكان واحد.
          </p>
        </div>
        
        {/* تم إصلاح هذا الزر لفتح نافذة الرفع والتحليل مباشرة لمنع الـ 404 */}
        <Button onClick={() => setIsCreateModalOpen(true)} className="gap-2">
          <Plus className="h-4 w-4" />
          مشروع جديد
        </Button>
      </div>

      {/* عرض المشاريع أو شاشة الحالة الفارغة */}
      {projects.length === 0 ? (
        <Card className="flex flex-col items-center justify-center text-center p-12 border-dashed">
          <CardHeader>
            <div className="mx-auto p-4 bg-primary/10 text-primary rounded-full mb-4">
              <Folder className="h-12 w-12" />
            </div>
            <CardTitle className="text-xl">لا توجد مشاريع حالياً</CardTitle>
            <CardDescription className="max-w-sm mt-2">
              ابدأ بإنشاء مشروعك الأول ورفع ملفات الـ PDF أو البيانات التسويقية ليقوم محرك LisanIQ بتحليلها فوراً.
            </CardDescription>
          </CardHeader>
          <CardFooter>
            <Button onClick={() => setIsCreateModalOpen(true)} className="gap-2">
              <Plus className="h-4 w-4" />
              أنشئ مشروعك الأول
            </Button>
          </CardFooter>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project) => (
            <Card key={project.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg font-semibold truncate">{project.name}</CardTitle>
                <CardDescription className="line-clamp-2 h-10 mt-1">
                  {project.description || 'لا يوجد وصف للمشروع'}
                </CardDescription>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground space-y-2 border-t pt-4">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  <span>{new Date(project.created_at).toLocaleDateString('ar-EG')}</span>
                </div>
                <div className="flex items-center justify-between text-xs mt-2 pt-2 border-t border-dashed">
                  <span>البيانات: {project.datasets_count || 0}</span>
                  <span>التقارير: {project.reports_count || 0}</span>
                </div>
              </CardContent>
              <CardFooter className="bg-muted/50 p-3 flex justify-end border-t">
                <Button variant="ghost" size="sm" className="gap-1 text-primary">
                  عرض التفاصيل
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}

      {/* النافذة المنبثقة المسؤولة عن رفع الملفات من الهاتف والتحليل الذكي */}
      <CreateProjectModal 
        isOpen={isCreateModalOpen} 
        onClose={() => setIsCreateModalOpen(false)} 
      />
    </div>
  )
}
