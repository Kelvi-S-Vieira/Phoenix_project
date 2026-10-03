"use client";

// "Exportar resumo (PDF)" — the prototype built a hidden print-only summary
// div and called window.print() (fxBuildPrintSummary, Task 3). Rather than
// porting that exact hidden-summary markup, this triggers the browser's
// native print dialog directly against the existing Dashboard page: the
// `@media print` rules in globals.css hide the sidebar/nav/buttons and keep
// the hero + cards, which gets the user to the same practical outcome (a
// clean PDF of their progress) via "Salvar como PDF" in the print dialog.
export default function PrintSummaryButton() {
  return (
    <button className="btn ghost" type="button" onClick={() => window.print()}>
      🖨️ Exportar resumo (PDF)
    </button>
  );
}
