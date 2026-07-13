'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Upload, File, Loader2 } from 'lucide-react'

export default function NewProjectPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [projectName, setProjectName] = useState('')
  const [selectedFile, setSelectedFile] = useState<File | null>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      if (file.type === 'application/pdf') {
        setSelectedFile(file)
        if (!projectName) {
          setProjectName(file.name.replace('.pdf', ''))
        }
      } else {
        alert('الرجاء اختيار ملف بصيغة PDF فقط ليتسنى للنظام تحليله.')
      }
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    alert('handleSubmit works')
    if (!projectName || !selectedFile) {
      alert('الرجاء إدخال اسم المشروع واختيار ملف PDF أولاً.')
      return
    }

    setLoading(true)
    try {
      await new Promise((resolve) => setTimeout(resolve, 2000))
      router.push('/projects')
      router.refresh()
    } catch (error) {
      console.error(error)
      alert('حدث خطأ أثناء رفع وتحليل الملف، يرجى المحاولة مجدداً.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-6 lg:p-10 max-w-[1100px] mx-auto space-y-6">
      <div className="border-b pb-5">
        <h1 className="text-2xl font-bold text-white">إنشاء مشروع جديد</h1>
        <p className="text-xs text-slate-400 mt-1">قم برفع ملفات الـ PDF الخاصة بحملتك لتصدير البيانات وتحليلها بدقة.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl bg-[#111c44]/40 p-6 rounded-xl border border-[#1f2c69] backdrop-blur-md">
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-200 block">اسم المشروع</label>
          <input 
            type="text"
            value={projectName}
            onChange={(e) => setProjectName(e.target.value)}
            placeholder="أدخل اسماً مميزاً للمشروع"
            className="w-full px-4 py-2.5 rounded-lg bg-[#0b1437] border border-[#1f2c69] text-white placeholder:text-slate-500 focus:outline-none focus:border-blue-500 transition-colors text-sm"
            required
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-200 block">مستند الـ PDF المراد تحليله</label>
          <div className="border-2 border-dashed border-[#1f2c69] hover:border-blue-500 rounded-xl p-8 text-center cursor-pointer relative bg-[#0b1437]/50 transition-colors group">
            <input 
              type="file"
              accept=".pdf"
              onChange={handleFileChange}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
            <div className="flex flex-col items-center justify-center space-y-3">
              <div className="p-3 bg-blue-500/10 text-blue-500 rounded-full group-hover:scale-110 transition-transform">
                <Upload className="w-8 h-8" />
              </div>
              <p className="text-sm font-semibold text-white">اضغط هنا لتصفح ملفات الهاتف واختيار المستند</p>
              <p className="text-xs text-slate-400">يدعم الموقع ملفات PDF التسويقية والتحليلية</p>
            </div>
          </div>
        </div>

        {selectedFile && (
          <div className="flex items-center gap-3 p-3 bg-[#0b1437] border border-[#1f2c69] rounded-lg">
            <File className="w-5 h-5 text-blue-500 shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-white truncate">{selectedFile.name}</p>
              <p className="text-[10px] text-slate-400">{(selectedFile.size / (1024 * 1024)).toFixed(2)} ميجابايت</p>
            </div>
          </div>
        )}

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#1f2c69]">
          <button
            type="button"
            onClick={() => router.push('/projects')}
            className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white rounded-lg transition-colors"
          >
            إلغاء
          </button>
          <button
            type="submit"
            disabled={loading}
            className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-semibold rounded-lg text-white bg-blue-600 hover:bg-blue-500 shadow-lg disabled:opacity-50 transition-colors"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'بدء معالجة المشروع'}
          </button>
        </div>
      </form>
    </div>
  )
}

