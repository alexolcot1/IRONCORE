const fs = require('fs');
const path = require('path');
const {
  Document,
  Packer,
  Paragraph,
  TextRun,
  HeadingLevel,
  Table,
  TableRow,
  TableCell,
  WidthType,
  BorderStyle,
  ShadingType,
  AlignmentType,
} = require('docx');

function markdownToDocx(mdContent, title, subtitle) {
  const lines = mdContent.split('\n');
  const children = [];

  // Title
  children.push(
    new Paragraph({
      text: title,
      heading: HeadingLevel.TITLE,
      alignment: AlignmentType.CENTER,
      spacing: { before: 200, after: 100 },
    })
  );

  if (subtitle) {
    children.push(
      new Paragraph({
        text: subtitle,
        alignment: AlignmentType.CENTER,
        spacing: { before: 0, after: 300 },
        children: [
          new TextRun({
            text: subtitle,
            italics: true,
            color: '555555',
            size: 22,
          }),
        ],
      })
    );
  }

  let inTable = false;
  let tableRows = [];
  let inCodeOrBox = false;
  let boxLines = [];

  for (let i = 0; i < lines.length; i++) {
    const rawLine = lines[i];
    const line = rawLine.trim();

    // Detect screenshot callout box start
    if (line.startsWith('┌') || line.startsWith('```')) {
      if (!inCodeOrBox) {
        inCodeOrBox = true;
        boxLines = [];
        continue;
      } else {
        inCodeOrBox = false;
        // Output box as styled cell
        const boxContent = boxLines.join('\n');
        children.push(
          new Paragraph({
            spacing: { before: 200, after: 200 },
            border: {
              top: { style: BorderStyle.SINGLE, size: 6, color: 'EA580C' },
              bottom: { style: BorderStyle.SINGLE, size: 6, color: 'EA580C' },
              left: { style: BorderStyle.SINGLE, size: 18, color: 'EA580C' },
              right: { style: BorderStyle.SINGLE, size: 6, color: 'EA580C' },
            },
            shading: {
              type: ShadingType.CLEAR,
              fill: 'FFF7ED',
            },
            children: boxLines.map(
              (bl, idx) =>
                new TextRun({
                  text: bl + (idx < boxLines.length - 1 ? '\n' : ''),
                  font: 'Consolas',
                  size: 19,
                  bold: bl.includes('📸') || bl.includes('Pie de foto'),
                  color: bl.includes('📸') ? 'C2410C' : '1F2937',
                })
            ),
          })
        );
        boxLines = [];
        continue;
      }
    }

    if (inCodeOrBox) {
      if (line.endsWith('┘')) {
        inCodeOrBox = false;
        const boxContent = boxLines.join('\n');
        children.push(
          new Paragraph({
            spacing: { before: 200, after: 200 },
            border: {
              top: { style: BorderStyle.SINGLE, size: 6, color: 'EA580C' },
              bottom: { style: BorderStyle.SINGLE, size: 6, color: 'EA580C' },
              left: { style: BorderStyle.SINGLE, size: 24, color: 'EA580C' },
              right: { style: BorderStyle.SINGLE, size: 6, color: 'EA580C' },
            },
            shading: {
              type: ShadingType.CLEAR,
              fill: 'FFF7ED',
            },
            children: boxLines.map(
              (bl, idx) =>
                new TextRun({
                  text: bl.replace(/^[│|]\s*/, '').replace(/\s*[│|]$/, '') + (idx < boxLines.length - 1 ? '\n' : ''),
                  font: 'Segoe UI',
                  size: 20,
                  bold: bl.includes('📸') || bl.includes('Pie de foto sugerido:'),
                  color: bl.includes('📸') ? 'C2410C' : '1F2937',
                })
            ),
          })
        );
        boxLines = [];
        continue;
      }
      boxLines.push(rawLine);
      continue;
    }

    // Markdown Table handling
    if (line.startsWith('|') && line.endsWith('|')) {
      if (line.includes('---')) {
        // Separator line
        continue;
      }
      const cells = line
        .split('|')
        .slice(1, -1)
        .map((c) => c.trim());
      if (!inTable) {
        inTable = true;
        tableRows = [];
      }
      tableRows.push(cells);
      continue;
    } else if (inTable) {
      inTable = false;
      // Build table
      if (tableRows.length > 0) {
        const docxRows = tableRows.map((row, rIdx) => {
          return new TableRow({
            children: row.map((cellText) => {
              return new TableCell({
                width: { size: 100 / row.length, type: WidthType.PERCENTAGE },
                shading: {
                  type: ShadingType.CLEAR,
                  fill: rIdx === 0 ? 'F3F4F6' : 'FFFFFF',
                },
                children: [
                  new Paragraph({
                    children: [
                      new TextRun({
                        text: cellText.replace(/\*\*/g, ''),
                        bold: rIdx === 0 || cellText.startsWith('**'),
                        size: 20,
                      }),
                    ],
                  }),
                ],
              });
            }),
          });
        });

        children.push(
          new Table({
            rows: docxRows,
            width: { size: 100, type: WidthType.PERCENTAGE },
          })
        );
        children.push(new Paragraph({ text: '', spacing: { after: 150 } }));
      }
    }

    if (!line) {
      continue;
    }

    // Headings
    if (line.startsWith('# ')) {
      // already printed title
      continue;
    } else if (line.startsWith('## ')) {
      children.push(
        new Paragraph({
          text: line.replace('## ', ''),
          heading: HeadingLevel.HEADING_1,
          spacing: { before: 300, after: 150 },
        })
      );
    } else if (line.startsWith('### ')) {
      children.push(
        new Paragraph({
          text: line.replace('### ', ''),
          heading: HeadingLevel.HEADING_2,
          spacing: { before: 200, after: 100 },
        })
      );
    } else if (line.startsWith('---')) {
      children.push(
        new Paragraph({
          text: '_______________________________________________________________________________',
          spacing: { before: 100, after: 150 },
          children: [
            new TextRun({
              text: '—'.repeat(40),
              color: 'D1D5DB',
            }),
          ],
        })
      );
    } else if (line.startsWith('- ') || line.startsWith('* ')) {
      // Bullet item
      const cleanText = line.substring(2);
      children.push(
        new Paragraph({
          bullet: { level: 0 },
          spacing: { before: 50, after: 50 },
          children: parseInlineRuns(cleanText),
        })
      );
    } else if (/^\d+\.\s/.test(line)) {
      // Numbered list
      const numMatch = line.match(/^(\d+\.)\s*(.*)$/);
      children.push(
        new Paragraph({
          spacing: { before: 60, after: 60 },
          children: [
            new TextRun({ text: numMatch[1] + ' ', bold: true, color: '1F2937' }),
            ...parseInlineRuns(numMatch[2]),
          ],
        })
      );
    } else {
      // Normal paragraph
      children.push(
        new Paragraph({
          spacing: { before: 100, after: 100 },
          children: parseInlineRuns(line),
        })
      );
    }
  }

  return new Document({
    sections: [
      {
        properties: {},
        children: children,
      },
    ],
  });
}

function parseInlineRuns(text) {
  // Simple bold and normal split
  const parts = text.split(/(\*\*.*?\*\*)/g);
  return parts.map((p) => {
    if (p.startsWith('**') && p.endsWith('**')) {
      return new TextRun({
        text: p.slice(2, -2),
        bold: true,
      });
    }
    return new TextRun({
      text: p,
      size: 22,
    });
  });
}

async function run() {
  const docsDir = path.resolve(__dirname, '../docs');

  // 1. Manual Técnico
  const techMd = fs.readFileSync(path.join(docsDir, 'MANUAL_TECNICO.md'), 'utf8');
  const techDoc = markdownToDocx(
    techMd,
    'MANUAL TÉCNICO DE ARQUITECTURA Y OPERACIÓN DE SOFTWARE',
    'IronCore Fitness Guatemala · Edición Sat / DPI / Quetzales'
  );
  const techBuffer = await Packer.toBuffer(techDoc);
  fs.writeFileSync(path.join(docsDir, 'MANUAL_TECNICO.docx'), techBuffer);
  console.log('Generated docs/MANUAL_TECNICO.docx successfully (' + techBuffer.length + ' bytes)');

  // 2. Manual de Usuario
  const userMd = fs.readFileSync(path.join(docsDir, 'MANUAL_DE_USUARIO.md'), 'utf8');
  const userDoc = markdownToDocx(
    userMd,
    'MANUAL DE USUARIO Y GUÍA DE OPERACIONES',
    'IronCore Fitness Guatemala · Guía Oficial para Clientes y Personal'
  );
  const userBuffer = await Packer.toBuffer(userDoc);
  fs.writeFileSync(path.join(docsDir, 'MANUAL_DE_USUARIO.docx'), userBuffer);
  console.log('Generated docs/MANUAL_DE_USUARIO.docx successfully (' + userBuffer.length + ' bytes)');
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
