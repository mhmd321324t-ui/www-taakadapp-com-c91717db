import { Component, ReactNode } from 'react';
import { Button } from '@/components/ui/button';

interface AppErrorBoundaryProps {
  children: ReactNode;
}

interface AppErrorBoundaryState {
  hasError: boolean;
}

export default class AppErrorBoundary extends Component<AppErrorBoundaryProps, AppErrorBoundaryState> {
  state: AppErrorBoundaryState = {
    hasError: false,
  };

  static getDerivedStateFromError(): AppErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Application crashed:', error, errorInfo);
  }

  private handleReload = () => {
    window.location.reload();
  };

  private handleHardReset = async () => {
    try {
      if ('serviceWorker' in navigator) {
        const registrations = await navigator.serviceWorker.getRegistrations();
        await Promise.all(registrations.map((reg) => reg.unregister()));
      }

      if ('caches' in window) {
        const keys = await caches.keys();
        await Promise.all(keys.map((key) => caches.delete(key)));
      }
    } catch {
      // ignore cleanup errors
    } finally {
      window.location.reload();
    }
  };

  render() {
    if (!this.state.hasError) {
      return this.props.children;
    }

    return (
      <main className="min-h-screen bg-background text-foreground flex items-center justify-center p-6" dir="rtl">
        <section className="w-full max-w-md rounded-2xl border border-border bg-card p-6 text-center shadow-elevated space-y-4">
          <h1 className="text-xl font-bold">صار خطأ غير متوقع</h1>
          <p className="text-sm text-muted-foreground">
            جرّب إعادة التحميل، وإذا استمرت الشاشة البيضاء استخدم إعادة الضبط الكاملة.
          </p>
          <div className="flex flex-col gap-2">
            <Button onClick={this.handleReload}>إعادة تحميل</Button>
            <Button variant="secondary" onClick={this.handleHardReset}>إعادة ضبط الكاش</Button>
          </div>
        </section>
      </main>
    );
  }
}
