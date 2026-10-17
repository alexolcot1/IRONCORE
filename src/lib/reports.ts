export type ReportCell = string | number | boolean | null | undefined;

export function csvText(headers: string[], rows: ReportCell[][]): string {
  const escape = (v: ReportCell) => {
    const s = v === null || v === undefined ? "" : String(v);
    return '"' + (/^[=+@\-\t\r]/.test(s) ? "'" + s : s).replaceAll('"', '""') + '"';
  };
  return "\uFEFF" + [headers, ...rows].map((r) => r.map(escape).join(",")).join("\r\n");
}

export function downloadBlob(blob: Blob, name: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  a.style.display = "none";
  document.body.appendChild(a);
  a.click();
  setTimeout(() => {
    a.remove();
    URL.revokeObjectURL(url);
  }, 1000);
}

export async function exportReport(
  format: "PDF" | "XLSX" | "CSV",
  title: string,
  headers: string[],
  rows: ReportCell[][]
): Promise<void> {
  const sanitizedTitle = title.replace(/[^a-zA-Z0-9_\u00C0-\u017F-]+/g, "-");
  const filename = `IronCore-${sanitizedTitle}`;

  if (format === "CSV") {
    const blob = new Blob([csvText(headers, rows)], { type: "text/csv;charset=utf-8" });
    downloadBlob(blob, `${filename}.csv`);
    return;
  }

  if (format === "PDF") {
    const { jsPDF } = await import("jspdf");
    const { default: autoTable } = await import("jspdf-autotable");
    const doc = new jsPDF({ orientation: headers.length > 5 ? "landscape" : "portrait" });
    doc.setFontSize(16);
    doc.text("IRONCORE FITNESS GUATEMALA", 14, 18);
    doc.setFontSize(10);
    doc.text(`${title} | Generado: ${new Date().toLocaleString("es-GT")}`, 14, 25);

    autoTable(doc, {
      head: [headers],
      body: rows.map((r) =>
        r.map((v) => (v === null || v === undefined ? "" : typeof v === "boolean" ? (v ? "Sí" : "No") : String(v)))
      ),
      startY: 32,
      styles: { fontSize: 8, overflow: "linebreak" },
      headStyles: { fillColor: [24, 28, 36], textColor: [229, 254, 64] },
      margin: 14,
    });
    doc.save(`${filename}.pdf`);
    return;
  }

  if (format === "XLSX") {
    const { default: writeXlsxFile } = await import("write-excel-file/browser");

    const sheetData = [
      headers.map((h) => ({
        value: String(h ?? ""),
        fontWeight: "bold" as const,
        backgroundColor: "#1E222B",
        color: "#E5FE40",
      })),
      ...rows.map((row) =>
        headers.map((_, colIndex) => {
          const val = row[colIndex];
          if (val === null || val === undefined || val === "") {
            return { value: null };
          }
          if (typeof val === "number" && !isNaN(val)) {
            return { value: val, type: Number };
          }
          if (typeof val === "boolean") {
            return { value: val ? "Sí" : "No", type: String };
          }
          return { value: String(val), type: String };
        })
      ),
    ];

    const builder = (writeXlsxFile as any)(sheetData, {
      columns: headers.map(() => ({ width: 22 })),
      fontFamily: "Calibri",
      fontSize: 11,
    });

    let blob: Blob;
    if (builder && typeof builder.toBlob === "function") {
      blob = await builder.toBlob();
    } else if (builder instanceof Blob) {
      blob = builder;
    } else if (builder instanceof Promise) {
      const awaited = await builder;
      blob = awaited && typeof awaited.toBlob === "function" ? await awaited.toBlob() : awaited;
    } else {
      throw new Error("No se pudo construir el libro XLSX");
    }

    downloadBlob(blob, `${filename}.xlsx`);
    return;
  }
}
