"use client";

import * as React from "react";
import {
  DataGrid,
  GridColDef,
  Toolbar,
  GridRowSelectionModel,
} from "@mui/x-data-grid";
import { Statement } from "@/constants/Interfaces";
import { useRouter } from "next/navigation";
import Button from "@mui/material/Button";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import Typography from "@mui/material/Typography";

interface CustomizedDataGridProps {
  statements: Statement[];
  pageSize?: number;
}

export default function StatementDataGrid({
  statements,
  pageSize = 10,
}: CustomizedDataGridProps) {
  const router = useRouter();
  const [selectionModel, setSelectionModel] =
    React.useState<GridRowSelectionModel>({
      type: "include",
      ids: new Set(),
    });

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

  // Bulk-delete handler
  const handleDelete = () => {
    console.log("Delete: ", selectionModel.ids);
    // TODO implement bulk delete via api

    setSelectionModel({
      type: "include",
      ids: new Set(),
    }); // clear checkboxes
    router.refresh();
  };

  // Custom toolbar
  const CustomToolbar = () => (
    <Toolbar>
      <Typography component="h2" variant="h6" sx={{ flex: 1, mx: 0.5 }}>
        Gehaltsabrechnungen
      </Typography>
      <Button
        startIcon={<DeleteIcon />}
        variant="outlined"
        disabled={selectionModel.ids.size === 0}
        onClick={handleDelete}
        sx={{ mr: 1 }}
      >
        Löschen
      </Button>
      <Button
        startIcon={<AddIcon />}
        variant="contained"
        onClick={() => router.push("/statement/new")}
      >
        Neue Abrechnung
      </Button>
    </Toolbar>
  );

  return (
    <DataGrid
      checkboxSelection
      disableRowSelectionOnClick
      rows={rows}
      columns={columns}
      rowSelectionModel={selectionModel}
      onRowSelectionModelChange={(newSel) => setSelectionModel(newSel)}
      showToolbar
      slots={{ toolbar: CustomToolbar }}
      pageSizeOptions={[5, 10, 20]}
      initialState={{ pagination: { paginationModel: { pageSize } } }}
      onRowClick={(params) => router.push(`/statement/${params.id}`)}
      getRowClassName={(params) =>
        params.indexRelativeToCurrentPage % 2 === 0 ? "even" : "odd"
      }
      disableColumnResize
      density="compact"
    />
  );
}
