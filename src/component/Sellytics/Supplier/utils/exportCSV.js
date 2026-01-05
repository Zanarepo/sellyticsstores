// utils/exportCSV.js

export default function exportCSV(filename, rows) {
    if (!rows || rows.length === 0) {
      console.warn("No data available for CSV export");
      return;
    }
  
    const headers = Object.keys(rows[0]);
    const csvContent = [
      headers.join(","), // header row
      ...rows.map((row) =>
        headers
          .map((field) => {
            let value = row[field] ?? "";
            // escape commas & quotes
            if (typeof value === "string") {
              value = value.replace(/"/g, '""');
              if (value.includes(",")) value = `"${value}"`;
            }
            return value;
          })
          .join(",")
      ),
    ].join("\n");
  
    const blob = new Blob(["\uFEFF" + csvContent], {
      type: "text/csv;charset=utf-8;",
    });
  
    const url = URL.createObjectURL(blob);
  
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `${filename}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  
    URL.revokeObjectURL(url);
  }
  