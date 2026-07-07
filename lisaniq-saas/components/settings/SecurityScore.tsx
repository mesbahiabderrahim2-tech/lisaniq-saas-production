export default function SecurityScore() {
  const score = 92;

  return (
    <div className="bg-[#111827] border border-gray-800 rounded-3xl p-6">

      <div className="flex items-center justify-between mb-4">
        <h3 className="text-white font-semibold">
          Security Score
        </h3>

        <span className="text-emerald-400 font-bold">
          {score}/100
        </span>
      </div>

      <div className="h-2 bg-gray-900 rounded-full overflow-hidden">
        <div
          className="h-full bg-emerald-500 rounded-full"
          style={{ width: `${score}%` }}
        />
      </div>

      <div className="mt-6 space-y-3 text-sm">

        <div className="text-emerald-400">
          ✓ البريد الإلكتروني موثق
        </div>

        <div className="text-emerald-400">
          ✓ كلمة المرور قوية
        </div>

        <div className="text-emerald-400">
          ✓ المؤسسة محمية
        </div>

        <div className="text-yellow-400">
          ⚠ المصادقة الثنائية غير مفعلة
        </div>

      </div>
    </div>
  );
}
