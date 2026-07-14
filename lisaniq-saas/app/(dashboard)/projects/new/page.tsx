'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2, FolderPlus } from 'lucide-react'

export default function NewProjectPage() {
  const router = useRouter()

  const [loading, setLoading] = useState(false)

  const [projectName, setProjectName] = useState('')
  const [description, setDescription] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!projectName.trim()) {
      alert('الرجاء إدخال اسم المشروع')
      return
    }

    try {
      setLoading(true)

      const response = await fetch('/api/projects', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: projectName,
          description,
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to create project')
      }

      const projectId = result.data.id

      router.push(`/projects/${projectId}`)
      router.refresh()
    } catch (error) {
      console.error(error)

      alert(
        error instanceof Error
          ? error.message
          : 'حدث خطأ أثناء إنشاء المشروع'
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-6 lg:p-10 max-w-[900px] mx-auto">

      <div className="border-b pb-5 mb-8">
        <h1 className="text-2xl font-bold text-white">
          إنشاء مشروع جديد
        </h1>

        <p className="text-sm text-slate-400 mt-2">
          أنشئ مشروعاً جديداً ثم قم برفع ملفات CSV أو Excel لتحليل البيانات التسويقية.
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="space-y-6 bg-[#111c44]/40 p-6 rounded-xl border border-[#1f2c69]"
      >

        <div>
          <label className="block text-sm text-slate-300 mb-2">
            اسم المشروع
          </label>

          <input
            type="text"
            value={projectName}
            onChange={(e) => setProjectName(e.target.value)}
            placeholder="مثال: Nike Q4 Campaign"
            className="w-full px-4 py-3 rounded-lg bg-[#0b1437] border border-[#1f2c69] text-white"
            required
          />
        </div>

        <div>
          <label className="block text-sm text-slate-300 mb-2">
            وصف المشروع (اختياري)
          </label>

          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="وصف مختصر للمشروع"
            rows={4}
            className="w-full px-4 py-3 rounded-lg bg-[#0b1437] border border-[#1f2c69] text-white resize-none"
          />
        </div>

        <div className="pt-4 border-t border-[#1f2c69] flex justify-end gap-3">

          <button
            type="button"
            onClick={() => router.push('/projects')}
            className="px-4 py-2 text-slate-400 hover:text-white"
          >
            إلغاء
          </button>

          <button
            type="submit"
            disabled={loading}
            className="inline-flex items-center gap-2 px-5 py-3 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-medium disabled:opacity-50"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <FolderPlus className="w-4 h-4" />
            )}

            {loading ? 'جاري الإنشاء...' : 'إنشاء المشروع'}
          </button>

        </div>
      </form>

    </div>
  )
}
