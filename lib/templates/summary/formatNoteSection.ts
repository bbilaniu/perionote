/** Plain-text indentation shared by the preview and clipboard output. */
export function indentNoteText(text: string): string {
  return text
    .split(/\r?\n/)
    .map((line) => line.trim() ? `  ${line.trimEnd()}` : "")
    .join("\n");
}

export function formatNoteSection(heading: string, lines: string[]): string {
  const content = lines.filter(Boolean).join("\n");
  return content.trim() ? `${heading}\n${indentNoteText(content)}` : "";
}
