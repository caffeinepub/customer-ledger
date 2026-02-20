import { Outlet, useNavigate } from '@tanstack/react-router';
import { BookOpen } from 'lucide-react';

export default function Layout() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <img 
              src="/assets/generated/ledger-icon.dim_128x128.png" 
              alt="Ledger Icon" 
              className="h-10 w-10"
            />
            <button 
              onClick={() => navigate({ to: '/' })}
              className="flex items-center gap-2 hover:opacity-80 transition-opacity"
            >
              <h1 className="text-2xl font-bold text-foreground">Customer Ledger</h1>
            </button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <Outlet />
      </main>

      <footer className="border-t border-border bg-card mt-16">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
            <span>© {new Date().getFullYear()}</span>
            <span>•</span>
            <span>Built with ❤️ using</span>
            <a
              href={`https://caffeine.ai/?utm_source=Caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline font-medium"
            >
              caffeine.ai
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
