import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Projeto Fênix",
  description: "Acompanhamento de treino, peso e evolução — aluno e personal.",
};

// Applies the saved theme/accent before first paint, avoiding a flash of the
// wrong theme. Mirrors the prototype's own inline bootstrap script.
const themeInitScript = `
(function(){
  try{
    var theme = localStorage.getItem('fenix_theme');
    document.documentElement.setAttribute('data-theme', theme === 'light' ? 'light' : 'dark');
    var accent = localStorage.getItem('fenix_login_accent');
    if(accent === 'aco' || accent === 'verde'){
      document.documentElement.setAttribute('data-accent', accent);
    }
  }catch(e){}
})();
`;

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="pt-BR">
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
