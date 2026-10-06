import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Projeto Fênix",
  description: "Acompanhamento de treino, peso e evolução — aluno e personal.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: dark)", color: "#14110f" },
    { media: "(prefers-color-scheme: light)", color: "#faf6f1" },
  ],
};

// Applies the saved theme/accent before first paint, avoiding a flash of the
// wrong theme. Mirrors the prototype's own inline bootstrap script.
const themeInitScript = `
(function(){
  try{
    // Escolha salva tem prioridade; sem ela, segue o tema do sistema.
    var theme = localStorage.getItem('fenix_theme');
    if(theme !== 'light' && theme !== 'dark'){
      theme = (window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches) ? 'light' : 'dark';
    }
    document.documentElement.setAttribute('data-theme', theme);
    var accent = localStorage.getItem('fenix_login_accent');
    if(accent === 'aco' || accent === 'verde'){
      document.documentElement.setAttribute('data-accent', accent);
    }
  }catch(e){
    try{
      var sys = (window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches) ? 'light' : 'dark';
      document.documentElement.setAttribute('data-theme', sys);
    }catch(e2){}
  }
})();
`;

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          href="https://fonts.googleapis.com/css2?family=Oswald:wght@400;500;600;700&family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@400;500;700&display=swap"
          rel="stylesheet"
        />
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body>
        <div className="fx-shell">{children}</div>
      </body>
    </html>
  );
}
