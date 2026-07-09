const members = [
  {
    name: "عبد الرحيم",
    role: "Owner"
  },
  {
    name: "Ahmed",
    role: "Admin"
  },
  {
    name: "Sara",
    role: "Member"
  }
];

export default function TeamMembers() {
  return (
    <div className="rounded-3xl border border-slate-800 bg-slate-900/50 p-6">
      <h3 className="text-xl font-bold text-white mb-6">
        Team Members
      </h3>

      <div className="space-y-4">
        {members.map((member) => (
          <div
            key={member.name}
            className="flex items-center justify-between"
          >
            <span className="text-white">
              {member.name}
            </span>

            <span className="text-slate-400">
              {member.role}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
