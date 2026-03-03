import type { View } from "@/types";

export function Sidebar({
  view,
  setView,
  onDeleteProfile,
}: {
  view: View;
  setView: (v: View) => void;
  onDeleteProfile: () => void;
}) {
  const items: { id: View; label: string; icon: string }[] = [
    { id: "profile", label: "Profile", icon: "👤" },
    { id: "skill-match", label: "Skill Match", icon: "⚡" },
  ];

  return (
    <aside className="fixed left-0 top-14 h-[calc(100vh-3.5rem)] w-56 bg-gray-900 border-r border-gray-800 flex flex-col p-4 z-10">
      <div className="font-bold text-sm mb-8 px-2 text-gray-400 uppercase tracking-widest">Navigation</div>

      <nav className="flex flex-col gap-1 flex-1">
        {items.map((item) => (
          <button
            key={item.id}
            onClick={() => setView(item.id)}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-left transition-colors ${
              view === item.id
                ? "bg-amber-900/30 text-amber-400"
                : "text-gray-400 hover:bg-gray-800"
            }`}
          >
            <span>{item.icon}</span>
            {item.label}
          </button>
        ))}
      </nav>

      {/* Danger zone */}
      <div className="border-t border-gray-800 pt-3">
        <button
          onClick={onDeleteProfile}
          className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium text-left text-red-500 hover:bg-red-900/20 transition-colors"
        >
          <span>🗑</span>
          Delete Profile
        </button>
      </div>
    </aside>
  );
}
