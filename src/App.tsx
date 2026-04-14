import { useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Header } from '@/components/layout/Header';
import { TabNav, type TabId } from '@/components/layout/TabNav';
import { WeekDashboard } from '@/components/week/WeekDashboard';
import { ProblemBank } from '@/components/problems/ProblemBank';
import { ProgressTable } from '@/components/progress/ProgressTable';
import { AdminPanel } from '@/components/admin/AdminPanel';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { staleTime: 1000 * 30, refetchOnWindowFocus: true },
  },
});

function AppContent() {
  const [activeTab, setActiveTab] = useState<TabId>('week');

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <TabNav activeTab={activeTab} onTabChange={setActiveTab} />
      <main className="mx-auto max-w-5xl px-6 py-6">
        {activeTab === 'week' && <WeekDashboard />}
        {activeTab === 'problems' && <ProblemBank />}
        {activeTab === 'progress' && <ProgressTable />}
        {activeTab === 'admin' && <AdminPanel />}
      </main>
    </div>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AppContent />
    </QueryClientProvider>
  );
}
