import * as xlsx from "xlsx";

export async function parseXlsxToJson({ file }: { file: File }) {
  const workbook = xlsx.read(await file.arrayBuffer());
  const sheetName = workbook.SheetNames[0];
  const sheet = workbook.Sheets[sheetName];
  const json = xlsx.utils.sheet_to_json(sheet, { raw: true });
  return json;
}
