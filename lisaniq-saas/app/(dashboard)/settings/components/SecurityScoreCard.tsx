export default function SecurityScoreCard() {
  const score = 92;

  return (
    <div className="rounded-3xl border border-slate-800 bg-slate-900/50 p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-white">
          Security Score
        </h3>

        <span className="text-green-400 font-semibold">
          Excellent
        </span>
      </div>

      <div className="text-center">
        <div className="text-5xl font-bold text-white">
          {score}
        </div>

        <p className="text-slate-400 mt-2">
          Overall Security Rating
        </p>
      </div>

      <div className="mt-8 space-y-3">
        <div className="flex justify-between">
          <span className="text-slate-400">
            MFA
          </span>

          <span className="text-green-400">
            Enabled
          </span>
        </div>

        <div className="flex justify-between">
          <span className="text-slate-400">
            Password Strength
          </span>

          <span className="text-green-400">
            Strong
          </span>
        </div>

        <div className="flex justify-between">
          <span className="text-slate-400">
            Session Protection
          </span>

          <span className="text-green-400">
            Active
          </span>
        </div>
      </div>
    </div>
  );
}
