// utils/exportPDF.js
import jsPDF from "jspdf";
import "jspdf-autotable";

export default function exportPDF(filename, rows, title = "Report") {
  if (!rows || rows.length === 0) {
    console.warn("No data available for PDF export");
    return;
  }

  const doc = new jsPDF();

  const columns = Object.keys(rows[0]).map((key) => ({
    header: key.replace(/_/g, " ").toUpperCase(),
    dataKey: key,
  }));

  doc.setFontSize(16);
  doc.text(title, 14, 18);

  doc.setFontSize(10);
  doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 26);

  doc.autoTable({
    startY: 32,
    headStyles: { fillColor: [40, 40, 40] },
    styles: { fontSize: 9 },
    columns,
    body: rows,
    theme: "striped",
  });

  doc.save(`${filename}.pdf`);
}
