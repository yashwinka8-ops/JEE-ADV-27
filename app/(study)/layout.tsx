import TopNav from '@/components/TopNav';
import AIChatWidget from '@/components/AIChatWidget';

export default function StudyLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <div className="layout">
        <TopNav />
        <main className="main-content">
          <div className="main-container">
            {children}
          </div>
        </main>
      </div>
      <AIChatWidget />
    </>
  );
}
