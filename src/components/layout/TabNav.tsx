import { cn } from '@/lib/utils';

export type TabId = 'week' | 'problems' | 'progress' | 'admin';

const TABS: { id: TabId; label: string }[] = [
  { id: 'week', label: 'This Week' },
  { id: 'problems', label: 'Problems' },
  { id: 'progress', label: 'Progress' },
  { id: 'admin', label: 'Admin' },
];

interface TabNavProps {
  activeTab: TabId;
  onTabChange: (tab: TabId) => void;
}

export function TabNav({ activeTab, onTabChange }: TabNavProps) {
  return (
    <nav className="border-b bg-white px-6">
      <div className="flex gap-6">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={cn(
              'relative pb-3 pt-3 text-sm font-medium transition-colors',
              activeTab === tab.id
                ? 'text-[#534AB7]'
                : 'text-muted-foreground hover:text-gray-900',
            )}
          >
            {tab.label}
            {activeTab === tab.id && (
              <span className="absolute inset-x-0 bottom-0 h-0.5 rounded-full bg-[#534AB7]" />
            )}
          </button>
        ))}
      </div>
    </nav>
  );
}
