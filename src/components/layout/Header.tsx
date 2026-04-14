import { cn } from '@/lib/utils';
import { useConfig } from '@/hooks/useConfig';

const WEEKS = [1, 2, 3, 4] as const;

export function Header() {
  const { activeWeek, setActiveWeek } = useConfig();

  return (
    <header className="border-b bg-white px-6 py-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-base font-medium tracking-tight text-gray-900">
            PrepPair
          </h1>
          <p className="text-[13px] text-muted-foreground">
            Moniepoint DreamDevs &middot; Interview Prep
          </p>
        </div>

        <div className="flex gap-1.5">
          {WEEKS.map((w) => (
            <button
              key={w}
              onClick={() => setActiveWeek.mutate(w)}
              className={cn(
                'rounded-md px-3 py-1.5 text-sm font-medium transition-colors',
                activeWeek === w
                  ? 'bg-[#534AB7] text-white'
                  : 'border border-gray-200 text-muted-foreground hover:bg-[#534AB7]/10',
              )}
            >
              W{w}
            </button>
          ))}
        </div>
      </div>
    </header>
  );
}
