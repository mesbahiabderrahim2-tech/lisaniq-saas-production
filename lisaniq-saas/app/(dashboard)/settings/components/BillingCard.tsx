export default function BillingCard() {
  return (
    <div className="rounded-3xl border border-slate-800 bg-slate-900/50 p-6">
      <h3 className="text-xl font-bold text-white mb-6">
        Billing
      </h3>

      <div className="space-y-4">

        <div>
          <p className="text-slate-400">
            Current Plan
          </p>

          <p className="text-white font-semibold">
            Professional
          </p>
        </div>

        <div>
          <p className="text-slate-400">
            Monthly Cost
          </p>

          <p className="text-white font-semibold">
            $49
          </p>
        </div>

        <div>
          <p className="text-slate-400">
            Next Renewal
          </p>

          <p className="text-white font-semibold">
            July 25, 2026
          </p>
        </div>

      </div>
    </div>
  );
}
