export const toCSV = (rows: any[]): string => {
  if (!rows || rows.length === 0) return '';
  const headers = Object.keys(rows[0]);
  const escape = (val: any) => {
    const s = String(val ?? '');
    return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  const csvRows = [
    headers.join(','),
    ...rows.map(r => headers.map(h => escape((r as any)[h])).join(','))
  ];
  return csvRows.join('\n');
};

export const downloadCSV = (filename: string, csv: string) => {
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
};