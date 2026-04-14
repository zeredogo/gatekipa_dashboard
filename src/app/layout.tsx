import type { Metadata } from "next";
import "./globals.css";
import Sidebar from "@/components/Sidebar";
import TopNav from "@/components/TopNav";
import { AuthProvider } from "@/context/AuthContext";
import AuthGuard from "@/components/AuthGuard";
import { Toaster } from "react-hot-toast";

export const metadata: Metadata = {
  title: "Gatekeeper HQ",
  description: "Administrative Dashboard for Gatekeeper Platform",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <Toaster position="top-right" toastOptions={{ className: 'gk-toast' }} />
        <AuthProvider>
          <AuthGuard>
            <div className="dashboard-layout">
              <Sidebar />
              <div className="main-content">
                <TopNav />
                <main className="page-content animate-fade-in">
                  {children}
                </main>
              </div>
            </div>
          </AuthGuard>
        </AuthProvider>
      </body>
    </html>
  );
}
