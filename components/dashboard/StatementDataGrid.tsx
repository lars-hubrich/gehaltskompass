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
  onRefresh: () => Promise<void>;
  pageSize?: number;
}

export default function StatementDataGrid({
  statements,
  pageSize = 10,
  onRefresh,
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

  const [selectionModel, setSelectionModel] =
    React.useState<GridRowSelectionModel>({
      type: "include",
      ids: new Set(),
    });

  const selectedIds = React.useMemo(() => {
    const { type, ids } = selectionModel;
    if (type === "include") {
      // only those explicitly included
      return Array.from(ids);
    }
    // exclude mode = “all row IDs except those in ids”
    return rows.map((row) => row.id).filter((id) => !ids.has(id));
  }, [selectionModel, rows]);

  // Bulk-delete handler
  const handleDelete = async () => {
    console.log("Delete: ", selectedIds);

    if (selectedIds.length === 0) {
      return;
    }

    try {
      const response = await fetch("/api/statement", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: selectedIds }),
      });
      console.log("Bulk delete response:", response);

      if (!response.ok) {
        console.error("Bulk delete failed");
      }
    } catch (error) {
      console.error("Error deleting statements:", error);
    } finally {
      setSelectionModel({
        type: "include",
        ids: new Set(),
      }); // clear checkboxes
      await onRefresh();
    }
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
        disabled={selectedIds.length === 0}
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
