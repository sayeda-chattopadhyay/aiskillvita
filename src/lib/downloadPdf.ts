import jsPDF from "jspdf";

/**
 * Renders plain-text content as a formatted A4 PDF and triggers a download.
 * Handles:
 *  - First line → large bold heading (name or headline)
 *  - ALL CAPS lines → bold section header with thin underline
 *  - "Label – body" lines → bold label inline with normal body text
 *  - "- " lines → indented bullet points
 *  - Everything else → normal body text
 */
export function downloadPdf(filename: string, content: string): void {
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 18;
  const usableWidth = pageWidth - 2 * margin;
  const bottom = pageHeight - 15;

  // Strip any residual markdown artifacts
  const cleaned = content
    .replace(/\*\*/g, "") // remove bold markers
    .replace(/\*/g, "") // remove any remaining asterisks
    .replace(/^#+\s?/gm, "") // remove markdown headers
    .trim();// trim leading/trailing whitespace

  const rawLines = cleaned.split("\n"); // split into lines for processing

  let y = 22;
  let isFirstLine = true;

  const newPageIfNeeded = (needed: number) => { // If the current y position plus the needed space exceeds the bottom margin, add a new page
    if (y + needed > bottom) { // add a new page
      doc.addPage();// reset y position to top margin
      y = 22;// if it's the first line of a new page, we don't want to treat it as a heading
    }
  };

  for (const rawLine of rawLines) {
    const line = rawLine.trimEnd();

    if (line === "") {
      y += 3;
      continue;
    }

    // First non-empty line = name or headline — large bold
    if (isFirstLine) {
      isFirstLine = false;
      doc.setFont("helvetica", "bold");
      doc.setFontSize(15);
      const wrapped = doc.splitTextToSize(line, usableWidth);
      for (const wl of wrapped) {
        newPageIfNeeded(8);
        doc.text(wl, margin, y);
        y += 7.5;
      }
      y += 1;
      continue;
    }

    // ALL CAPS section header (e.g. EXPERIENCE, EDUCATION, SKILLS)
    const trimmed = line.trim();
    const isAllCaps =
      trimmed.length >= 3 &&
      trimmed === trimmed.toUpperCase() &&
      !/^\d/.test(trimmed) &&
      !trimmed.includes("@") &&
      !trimmed.includes("|") &&
      !trimmed.includes("–") &&
      !trimmed.includes("-");

    if (isAllCaps) {
      y += 4;
      newPageIfNeeded(9);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(10.5);
      doc.text(trimmed, margin, y);
      y += 2;
      doc.setDrawColor(160, 160, 160);
      doc.setLineWidth(0.3);
      doc.line(margin, y, pageWidth - margin, y);
      y += 5;
      continue;
    }

    // Cover letter inline labels: "Motivation –", "Past experiences –", etc.
    const labelMatch = trimmed.match(/^([A-Za-z][A-Za-z\s–?]+?)\s*[–-]\s*(.+)/);
    const isCoverLabel =
      labelMatch &&
      labelMatch[1].split(" ").length <= 6 &&
      !trimmed.startsWith("-");

    if (isCoverLabel) {
      newPageIfNeeded(7);
      const labelText = labelMatch![1].trim() + " – ";
      const bodyText = labelMatch![2].trim();
      doc.setFont("helvetica", "bold");
      doc.setFontSize(10.5);
      const labelWidth = doc.getTextWidth(labelText);
      doc.text(labelText, margin, y);
      doc.setFont("helvetica", "normal");
      const bodyWrapped = doc.splitTextToSize(bodyText, usableWidth - labelWidth);
      doc.text(bodyWrapped[0], margin + labelWidth, y);
      y += 5.5;
      for (let i = 1; i < bodyWrapped.length; i++) {
        newPageIfNeeded(6);
        doc.text(bodyWrapped[i], margin, y);
        y += 5.5;
      }
      continue;
    }

    // Bullet points: lines starting with "- "
    const isBullet = trimmed.startsWith("- ");
    if (isBullet) {
      const bulletText = trimmed.slice(2);
      const bulletIndent = margin + 4;
      const wrapped = doc.splitTextToSize(bulletText, usableWidth - 4);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(10.5);
      for (let i = 0; i < wrapped.length; i++) {
        newPageIfNeeded(6);
        if (i === 0) doc.text("–", margin + 1, y);
        doc.text(wrapped[i], bulletIndent, y);
        y += 5.5;
      }
      continue;
    }

    // Regular text
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10.5);
    const wrapped = doc.splitTextToSize(line, usableWidth);
    for (const wl of wrapped) {
      newPageIfNeeded(6);
      doc.text(wl, margin, y);
      y += 5.5;
    }
  }

  doc.save(filename);
}
