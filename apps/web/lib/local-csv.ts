export function parseLocalCsv(input: string): string[][] {
  const text = input.replace(/^\uFEFF/, "");
  const rows: string[][] = [];

  let row: string[] = [];
  let field = "";
  let inQuotes = false;

  for (let index = 0; index < text.length; index += 1) {
    const character = text[index];

    if (character === '"') {
      if (inQuotes && text[index + 1] === '"') {
        field += '"';
        index += 1;
      } else {
        inQuotes = !inQuotes;
      }

      continue;
    }

    if (!inQuotes && character === ",") {
      row.push(field);
      field = "";
      continue;
    }

    if (
      !inQuotes &&
      (character === "\n" || character === "\r")
    ) {
      if (
        character === "\r" &&
        text[index + 1] === "\n"
      ) {
        index += 1;
      }

      row.push(field);
      rows.push(row);

      row = [];
      field = "";
      continue;
    }

    field += character;
  }

  if (inQuotes) {
    throw new Error(
      "CSV contains an unterminated quoted field."
    );
  }

  if (field.length > 0 || row.length > 0) {
    row.push(field);
    rows.push(row);
  }

  while (
    rows.length > 0 &&
    rows[rows.length - 1]?.every(
      (value) => value.trim().length === 0
    )
  ) {
    rows.pop();
  }

  return rows;
}

export function csvCell(
  row: readonly string[],
  index: number
): string {
  return row[index]?.trim() ?? "";
}

export function normalizeCsvHeader(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "");
}

export function createCsvHeaderIndex(
  headerRow: readonly string[]
): Map<string, number> {
  const index = new Map<string, number>();

  for (
    let column = 0;
    column < headerRow.length;
    column += 1
  ) {
    const normalized = normalizeCsvHeader(
      headerRow[column] ?? ""
    );

    if (normalized && !index.has(normalized)) {
      index.set(normalized, column);
    }
  }

  return index;
}
