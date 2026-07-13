"use client";

import React, { useEffect, useState } from 'react';
import { Plus, Folder, Calendar, ArrowRight } from 'lucide-react';

interface Project {
  id: string;
  name: string;
  description: string | null;
  created_at: string;
  datasets_count?: number;
  reports_count?: number;
}

export default function ProjectsPage() {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [projects, setProjects] = useState<Project[]>([]);
const [loading, setLoading] = useState(true);
const [error, setError] = useState<string | null>(null);
  return (
    <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto', fontFamily: 'sans-serif', direction: 'rtl' }}>
      
      {/* الهيدر العلوي لصفحة المشاريع */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #eee', paddingBottom: '1.25rem', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '1.875rem', fontWeight: 'bold', color: '#111' }}>المشاريع</h1>
          <p style={{ color: '#666', marginTop: '0.25rem' }}>إدارة وتحليل حملاتك التسويقية ومستنداتك الذكية في مكان واحد</p>
        </div>
        
        <button 
          onClick={() => setIsCreateModalOpen(true)} 
          style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: '#0070f3', color: '#fff', border: 'none', padding: '0.5rem 1rem', borderRadius: '6px', cursor: 'pointer', fontWeight: '500' }}
        >
          <Plus size={16} />
          مشروع جديد
        </button>
      </div>

      {/* عرض المشاريع أو شاشة الحالة الفارغة */}
      {projects.length === 0 ? (
        <div style={{ border: '2px dashed #eaeaea', borderRadius: '12px', padding: '3rem', textAlign: 'center', maxWidth: '600px', margin: '0 auto' }}>
          <div style={{ background: '#f0f7ff', width: '4rem', height: '4rem', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem' }}>
            <Folder size={32} color="#0070f3" />
          </div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>لا توجد مشاريع حالياً</h2>
          <p style={{ color: '#666', fontSize: '0.875rem', marginBottom: '1.5rem' }}>قم برفع ملفات الـ PDF الخاصة بمشروعك الأول لبدء المعالجة والتحليل فوراً.</p>
          
          <button 
            onClick={() => setIsCreateModalOpen(true)} 
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: '#0070f3', color: '#fff', border: 'none', padding: '0.5rem 1.25rem', borderRadius: '6px', cursor: 'pointer', margin: '0 auto' }}
          >
            <Plus size={16} />
            أنشئ مشروعك الأول
          </button>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
          {projects.map((project) => (
            <div key={project.id} style={{ border: '1px solid #eaeaea', borderRadius: '12px', padding: '1.5rem', background: '#fff' }}>
              <h3 style={{ fontSize: '1.125rem', fontWeight: '600', marginBottom: '0.5rem' }}>{project.name}</h3>
              <p style={{ color: '#666', fontSize: '0.875rem', marginBottom: '1rem' }}>{project.description || 'لا يوجد وصف للمشروع'}</p>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#888', fontSize: '0.75rem', marginBottom: '1rem' }}>
                <Calendar size={14} />
                <span>{new Date(project.created_at).toLocaleDateString('ar-EG')}</span>
              </div>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid #f5f5f5', paddingTop: '1rem', fontSize: '0.875rem' }}>
                <span>البيانات: {project.datasets_count || 0}</span>
                <span>التقارير: {project.reports_count || 0}</span>
              </div>

              <button style={{ width: '100%', marginTop: '1rem', padding: '0.5rem', background: '#f5f5f5', border: 'none', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', color: '#333' }}>
                عرض التفاصيل
                <ArrowRight size={14} />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* النافذة المنبثقة البديلة والنظيفة لرفع الملفات */}
      {isCreateModalOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: '#fff', padding: '2rem', borderRadius: '12px', maxWidth: '500px', width: '90%' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '1rem' }}>إنشاء مشروع جديد</h2>
            <div style={{ border: '2px dashed #0070f3', padding: '2rem', textAlign: 'center', borderRadius: '8px', background: '#f0f7ff' }}>
              <input type="file" accept=".pdf" id="modal-pdf" style={{ display: 'none' }} />
              <label htmlFor="modal-pdf" style={{ cursor: 'pointer', color: '#0070f3' }}>اضغط هنا لاختيار ملف PDF</label>
            </div>
            <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem', justifyContent: 'flex-end' }}>
              <button onClick={() => setIsCreateModalOpen(false)} style={{ padding: '0.5rem 1rem', background: '#eee', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>إلغاء</button>
              <button style={{ padding: '0.5rem 1rem', background: '#0070f3', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>ابدأ المعالجة</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
