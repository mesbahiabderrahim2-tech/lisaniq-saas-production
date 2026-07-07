export default function TeamCard() {
  return (
    <div className="bg-[#111827] border border-gray-800 rounded-3xl p-6">

      <h3 className="text-white font-semibold mb-5">
        فريق العمل
      </h3>

      <div className="flex items-center justify-between">

        <div>
          <p className="text-white font-medium">
            عبد الرحيم مصباحي
          </p>

          <p className="text-sm text-gray-400">
            contact@lisaniq.com
          </p>
        </div>

        <span className="px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs">
          OWNER
        </span>

      </div>

    </div>
  );
}
