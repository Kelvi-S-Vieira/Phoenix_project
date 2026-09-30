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
    var accent = localStorage.getItem('fenix_accent');
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
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body>
        <div className="fx-shell">{children}</div>
      </body>
    </html>
  );
}
