import { Sidebar } from "@/components/dashboard/sidebar";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { logout } from "@/modules/core/actions/auth";
import { Header } from "@/components/dashboard/header";
import { 
  Calculator,
  LogOut, 
  Menu, 
  UserSquare2 
} from "lucide-react";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar (Desktop) */}
      <aside className="hidden md:flex w-64 flex-col bg-blue-900 text-white shadow-xl z-10">
        <div className="h-16 flex items-center justify-center gap-2 border-b border-blue-800/50 px-4">
          <Calculator className="w-6 h-6 text-blue-300" />
          <h2 className="text-xl font-bold tracking-tight">SindiCalculo</h2>
        </div>
        
        <Sidebar />

        <div className="p-4 border-t border-blue-800/50">
          <form action={logout}>
            <button className="flex w-full items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-red-500/10 hover:text-red-300 transition-colors text-left text-sm font-medium text-blue-100">
              <LogOut className="w-5 h-5" />
              Sair do Sistema
            </button>
          </form>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Header userEmail={user.email || ""} />

        {/* Page Content */}
        <div className="flex-1 overflow-y-auto p-6 md:p-8">
          <div className="mx-auto max-w-6xl">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}
