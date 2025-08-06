"use client";

import * as React from "react";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import { Statement } from "@/constants/Interfaces";
import { useRouter } from "next/navigation";

interface CustomizedDataGridProps {
  statements: Statement[];
  pageSize?: number;
}

export default function CustomizedDataGrid({
  statements,
  pageSize = 10,
}: CustomizedDataGridProps) {
  const router = useRouter();

  const euroFormatter = (value: number) => `${value.toFixed(2)} €`;

  // Transform statements into rows
  const rows = statements.map((s) => ({
    id: s.id,
    year: s.year,
    month: s.month,
    brutto_tax: s.brutto_tax,
    payout_netto: s.payout_netto,
  }));

  // Define DataGrid columns
  const columns: GridColDef<Statement>[] = [
    { field: "year", headerName: "Jahr", flex: 1 },
    { field: "month", headerName: "Monat", flex: 1 },
    {
      field: "brutto_tax",
      headerName: "Steuer-Brutto (€)",
      type: "number",
      flex: 1,
      align: "right",
      headerAlign: "right",
      valueFormatter: (value) => euroFormatter(value as number),
    },
    {
      field: "payout_netto",
      headerName: "Netto-Auszahlung (€)",
      type: "number",
      flex: 1,
      align: "right",
      headerAlign: "right",
      valueFormatter: (value) => euroFormatter(value as number),
    },
  ];

  return (
    <DataGrid
      rows={rows}
      columns={columns}
      onRowClick={(params) => router.push(`/statement/${params.id}`)}
      pageSizeOptions={[5, 10, 20]}
      initialState={{
        pagination: { paginationModel: { pageSize } },
      }}
      getRowClassName={(params) =>
        params.indexRelativeToCurrentPage % 2 === 0 ? "even" : "odd"
      }
      sx={{
        "& .even": { backgroundColor: "#f9fafb" },
        "& .odd": { backgroundColor: "#ffffff" },
        "& .MuiDataGrid-row:hover": { backgroundColor: "#ecfdf5" },
      }}
      disableColumnResize
      density="compact"
    />
  );
}
