"use client";

import React, { useEffect, useState } from "react";
import { Plus, Folder, Calendar, ArrowRight } from "lucide-react";

interface Project {
  id: string;
  name: string;
  description: string | null;
  created_at: string;
  datasets_count?: number;
  reports_count?: number;
}

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadProjects();
  }, []);

  async function loadProjects() {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch("/api/projects");
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to load projects");
      }

      setProjects(result.data?.projects || []);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unknown error while loading projects"
      );
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div
        style={{
          padding: "2rem",
          textAlign: "center",
          fontFamily: "sans-serif",
        }}
      >
        جاري تحميل المشاريع...
      </div>
    );
  }

  if (error) {
    return (
      <div
        style={{
          padding: "2rem",
          textAlign: "center",
          color: "red",
          fontFamily: "sans-serif",
        }}
      >
        خطأ أثناء تحميل المشاريع: {error}
      </div>
    );
  }

  return (
    <div
      style={{
        padding: "2rem",
        maxWidth: "1200px",
        margin: "0 auto",
        fontFamily: "sans-serif",
        direction: "rtl",
      }}
    >
      {/* Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          borderBottom: "1px solid #eee",
          paddingBottom: "1.25rem",
          marginBottom: "2rem",
        }}
      >
        <div>
          <h1
            style={{
              fontSize: "1.875rem",
              fontWeight: "bold",
              color: "#111",
            }}
          >
            المشاريع
          </h1>

          <p
            style={{
              color: "#666",
              marginTop: "0.25rem",
            }}
          >
            إدارة وتحليل حملاتك التسويقية ومستنداتك الذكية في مكان واحد
          </p>
        </div>

        <button
          onClick={() => (window.location.href = "/projects/new")}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
            background: "#0070f3",
            color: "#fff",
            border: "none",
            padding: "0.5rem 1rem",
            borderRadius: "6px",
            cursor: "pointer",
            fontWeight: "500",
          }}
        >
          <Plus size={16} />
          مشروع جديد
        </button>
      </div>

      {/* Empty State */}
      {projects.length === 0 ? (
        <div
          style={{
            border: "2px dashed #eaeaea",
            borderRadius: "12px",
            padding: "3rem",
            textAlign: "center",
            maxWidth: "600px",
            margin: "0 auto",
          }}
        >
          <div
            style={{
              background: "#f0f7ff",
              width: "4rem",
              height: "4rem",
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 1rem",
            }}
          >
            <Folder size={32} color="#0070f3" />
          </div>

          <h2
            style={{
              fontSize: "1.25rem",
              fontWeight: "bold",
              marginBottom: "0.5rem",
            }}
          >
            لا توجد مشاريع حالياً
          </h2>

          <p
            style={{
              color: "#666",
              fontSize: "0.875rem",
              marginBottom: "1.5rem",
            }}
          >
            أنشئ مشروعك الأول ثم ارفع ملف CSV أو Excel لبدء التحليل.
          </p>

          <button
            onClick={() => (window.location.href = "/projects/new")}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
              background: "#0070f3",
              color: "#fff",
              border: "none",
              padding: "0.5rem 1.25rem",
              borderRadius: "6px",
              cursor: "pointer",
              margin: "0 auto",
            }}
          >
            <Plus size={16} />
            أنشئ مشروعك الأول
          </button>
        </div>
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
            gap: "1.5rem",
          }}
        >
          {projects.map((project) => (
            <div
              key={project.id}
              style={{
                border: "1px solid #eaeaea",
                borderRadius: "12px",
                padding: "1.5rem",
                background: "#fff",
              }}
            >
              <h3
                style={{
                  fontSize: "1.125rem",
                  fontWeight: "600",
                  marginBottom: "0.5rem",
                }}
              >
                {project.name}
              </h3>

              <p
                style={{
                  color: "#666",
                  fontSize: "0.875rem",
                  marginBottom: "1rem",
                }}
              >
                {project.description || "لا يوجد وصف للمشروع"}
              </p>

              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem",
                  color: "#888",
                  fontSize: "0.75rem",
                  marginBottom: "1rem",
                }}
              >
                <Calendar size={14} />
                <span>
                  {new Date(project.created_at).toLocaleDateString("ar-EG")}
                </span>
              </div>

              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  borderTop: "1px solid #f5f5f5",
                  paddingTop: "1rem",
                  fontSize: "0.875rem",
                }}
              >
                <span>البيانات: {project.datasets_count || 0}</span>
                <span>التقارير: {project.reports_count || 0}</span>
              </div>

              <button
                style={{
                  width: "100%",
                  marginTop: "1rem",
                  padding: "0.5rem",
                  background: "#f5f5f5",
                  border: "none",
                  borderRadius: "6px",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "0.5rem",
                  color: "#333",
                }}
              >
                عرض التفاصيل
                <ArrowRight size={14} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
