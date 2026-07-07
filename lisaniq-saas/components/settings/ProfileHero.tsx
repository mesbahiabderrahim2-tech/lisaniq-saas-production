export default function ProfileHero() {
  return (
    <div className="bg-[#111827] border border-gray-800 rounded-3xl p-6">
      <div className="flex flex-col items-center text-center">

        <div className="w-20 h-20 rounded-full bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-2xl font-bold text-indigo-300">
          ع
        </div>

        <h2 className="mt-4 text-xl font-semibold text-white">
          عبد الرحيم مصباحي
        </h2>

        <p className="text-gray-400 text-sm">
          contact@lisaniq.com
        </p>

        <div className="mt-4 inline-flex px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs">
          Pro Plan
        </div>

      </div>

      <div className="grid grid-cols-3 gap-4 mt-8">

        <div className="text-center">
          <div className="text-2xl font-bold text-white">
            14
          </div>
          <div className="text-xs text-gray-500">
            العملاء
          </div>
        </div>

        <div className="text-center">
          <div className="text-2xl font-bold text-white">
            2025
          </div>
          <div className="text-xs text-gray-500">
            سنة الانضمام
          </div>
        </div>

        <div className="text-center">
          <div className="text-2xl font-bold text-white">
            1
          </div>
          <div className="text-xs text-gray-500">
            جلسة نشطة
          </div>
        </div>

      </div>
    </div>
  );
}
