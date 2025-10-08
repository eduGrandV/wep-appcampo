import { AuthProvider } from '@/context/AuthContext';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  // Este layout envolve todas as páginas dentro da pasta (dashboard).
  // O AuthProvider será o "porteiro" para todas elas.
  return (
    <AuthProvider>
      {children}
    </AuthProvider>
  );
}