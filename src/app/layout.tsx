import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

import Script from "next/script";


export const metadata: Metadata = {
  title: "Análise GrandValle",
  description: "Sistema de Análise de Doenças e Pragas",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    
    <html lang="pt-BR">
      
      <body>
        {children}
        <div id="modal-root"></div>
        
        
        <Script src="https://cdn.jsdelivr.net/npm/xlsx/dist/xlsx.full.min.js" strategy="afterInteractive" />
        <Script src="https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js" strategy="afterInteractive" />
        <Script src="https://cdnjs.cloudflare.com/ajax/libs/jspdf-autotable/3.8.2/jspdf.plugin.autotable.min.js" strategy="afterInteractive" />
      </body>
    </html>
  );
}
