interface Props {
  activeSection: string;
  setActiveSection: (section: string) => void;
}

export default function SettingsSidebar({
  activeSection,
  setActiveSection,
}: Props) {

  const items = [
    'general',
    'workspace',
    'security',
    'billing',
    'team',
    'danger',
  ];

  return (
    <div className="w-full lg:w-64">

      <div className="rounded-2xl border border-gray-800 bg-[#111827] p-3">

        {items.map((item) => (
          <button
            key={item}
            onClick={() => setActiveSection(item)}
            className={`w-full text-right px-4 py-3 rounded-xl mb-2 transition ${
              activeSection === item
                ? 'bg-white text-black'
                : 'text-gray-400 hover:bg-gray-800'
            }`}
          >
            {item}
          </button>
        ))}

      </div>

    </div>
  );
}
