export default function ProfileOverview() {
  return (
    <div className="rounded-2xl border border-gray-800 bg-[#111827] p-6">

      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">

        <div>

          <h2 className="text-xl font-semibold text-white">
            عبد الرحيم مصباحي
          </h2>

          <p className="text-gray-400 mt-1">
            contact@lisaniq.com
          </p>

        </div>

        <div className="text-right">

          <div className="text-white font-medium">
            Professional Plan
          </div>

          <div className="text-emerald-400 text-sm">
            Active Subscription
          </div>

        </div>

      </div>

      <div className="grid grid-cols-3 gap-6 mt-8">

        <div>
          <p className="text-gray-500 text-sm">
            العملاء
          </p>

          <p className="text-2xl font-bold text-white">
            14
          </p>
        </div>

        <div>
          <p className="text-gray-500 text-sm">
            تاريخ الإنشاء
          </p>

          <p className="text-2xl font-bold text-white">
            2025
          </p>
        </div>

        <div>
          <p className="text-gray-500 text-sm">
            الجلسات
          </p>

          <p className="text-2xl font-bold text-white">
            1
          </p>
        </div>

      </div>

    </div>
  );
}
