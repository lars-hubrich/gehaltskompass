"use client";
import * as React from "react";
import { useRouter } from "next/navigation";
import { useState, useEffect, useCallback, useRef } from "react";
import {
  Grid,
  Typography,
  TextField,
  Button,
  IconButton,
  Box,
  Divider,
  Paper,
  CircularProgress,
  Backdrop,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import { StatementData } from "@/constants/Interfaces";
import { FIELD_DESCRIPTIONS } from "@/constants/fieldDescriptions";

interface StatementFormProps {
  statementId?: string;
}

export default function StatementForm({ statementId }: StatementFormProps) {
  const router = useRouter();

  const [data, setData] = useState<StatementData>({
    month: 0,
    year: 0,
    incomes: [],
    brutto_tax: 0,
    brutto_av: 0,
    brutto_pv: 0,
    brutto_rv: 0,
    brutto_kv: 0,
    deduction_tax_income: 0,
    deduction_tax_church: 0,
    deduction_tax_solidarity: 0,
    deduction_tax_other: 0,
    social_av: 0,
    social_pv: 0,
    social_rv: 0,
    social_kv: 0,
    payout_netto: 0,
    payout_transfer: 0,
    payout_vwl: 0,
    payout_other: 0,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [bulkResult, setBulkResult] = useState<{
    success: number;
    failed: number;
  } | null>(null);
  const [openResult, setOpenResult] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (statementId && statementId !== "new") {
      (async () => {
        const res = await fetch(`/api/statement/${statementId}`);
        if (res.ok) {
          const loaded = await res.json();
          setData({ ...loaded, incomes: loaded.incomes || [] });
        }
      })();
    }
  }, [statementId]);

  useEffect(() => {
    if (bulkResult) {
      setOpenResult(true);
    }
  }, [bulkResult]);

  const onDrop = useCallback(async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    await handleFiles(e.dataTransfer.files);
  }, []);

  const onDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const onFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    await handleFiles(e.target.files);
  };

  const handleFiles = async (files: FileList) => {
    if (files.length === 0) return;
    setError(null);
    setBulkResult(null);

    if (files.length === 1) {
      const file = files[0];
      if (file.type !== "application/pdf") {
        setError("Bitte eine PDF-Datei hochladen.");
        return;
      }
      setLoading(true);
      try {
        const formData = new FormData();
        formData.append("file", file);
        const resExtract = await fetch("/api/extract", {
          method: "POST",
          body: formData,
          credentials: "include",
        });
        if (!resExtract.ok) {
          const err = await resExtract.json();
          // noinspection ExceptionCaughtLocallyJS
          throw new Error(err.error || "Upload fehlgeschlagen");
        }
        const json: StatementData = await resExtract.json();
        setData({ ...json, incomes: json.incomes || [] });
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
      return;
    }

    const count = files.length;
    if (
      !window.confirm(
        `Sind Sie sicher, dass Sie ${count} Gehaltsabrechnungen hochladen möchten?`,
      )
    ) {
      return;
    }

    setLoading(true);
    let success = 0;
    let failed = 0;

    for (const file of Array.from(files)) {
      if (file.type !== "application/pdf") {
        failed++;
        continue;
      }
      try {
        const formData = new FormData();
        formData.append("file", file);
        const resExtract = await fetch("/api/extract", {
          method: "POST",
          body: formData,
          credentials: "include",
        });
        if (!resExtract.ok) {
          // noinspection ExceptionCaughtLocallyJS
          throw new Error("Extraktion fehlgeschlagen");
        }
        const statement: StatementData = await resExtract.json();

        const resSave = await fetch("/api/statement", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(statement),
          credentials: "include",
        });
        if (!resSave.ok) {
          // noinspection ExceptionCaughtLocallyJS
          throw new Error("Speichern fehlgeschlagen");
        }

        success++;
      } catch (err) {
        console.error(err);
        failed++;
      }
    }

    setLoading(false);
    setBulkResult({ success, failed });
  };

  const handleCloseResult = () => {
    setOpenResult(false);
    router.replace("/statements");
  };

  const handleField =
    (field: keyof StatementData) =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value =
        field === "month" || field === "year"
          ? parseInt(e.target.value, 10)
          : parseFloat(e.target.value);
      setData((prev) => ({ ...prev, [field]: isNaN(value) ? 0 : value }));
    };

  const handleIncomeChange =
    (index: number, key: keyof StatementData["incomes"][0]) =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setData((prev) => {
        const incomes = [...prev.incomes];
        incomes[index] = {
          ...incomes[index],
          [key]:
            key === "value" ? parseFloat(e.target.value) || 0 : e.target.value,
        };
        return { ...prev, incomes };
      });
    };

  const addIncome = () =>
    setData((prev) => ({
      ...prev,
      incomes: [...prev.incomes, { name: "", identifier: "", value: 0 }],
    }));

  const removeIncome = (index: number) =>
    setData((prev) => ({
      ...prev,
      incomes: prev.incomes.filter((_, i) => i !== index),
    }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const url =
      statementId === "new"
        ? "/api/statement"
        : `/api/statement/${statementId}`;
    const method = statementId === "new" ? "POST" : "PUT";
    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
      credentials: "include",
    });
    if (res.ok) {
      router.replace("/statements");
    }
  };

  const handleDelete = async () => {
    if (!statementId || statementId === "new") {
      router.replace("/statements");
      return;
    }
    const res = await fetch(`/api/statement/${statementId}`, {
      method: "DELETE",
    });
    if (res.ok) {
      router.replace("/statements");
    }
  };

  return (
    <>
      <Backdrop
        sx={{ color: "#fff", zIndex: (theme) => theme.zIndex.drawer + 1 }}
        open={loading}
      >
        <CircularProgress color="inherit" />
      </Backdrop>

      <Box
        component="form"
        onSubmit={handleSubmit}
        sx={{ display: "flex", flexDirection: "column", gap: 4 }}
      >
        <Typography variant="h4" align="center">
          {statementId === "new"
            ? "Neue Abrechnung erstellen"
            : "Abrechnung ansehen und bearbeiten"}
        </Typography>

        <input
          ref={fileInputRef}
          type="file"
          accept="application/pdf"
          multiple
          hidden
          onChange={onFileChange}
        />

        <Paper
          variant="outlined"
          sx={{
            p: 2,
            textAlign: "center",
            borderStyle: "dashed",
            cursor: "pointer",
          }}
          onDrop={onDrop}
          onDragOver={onDragOver}
          onClick={() => fileInputRef.current?.click()}
        >
          <UploadFileIcon fontSize="large" />
          <Typography sx={{ mt: 1 }}>
            Klicke hier oder ziehe dein PDF-Dokument(e) hinein, um die Felder
            automatisch zu befüllen.
          </Typography>
          {error && (
            <Typography color="error" sx={{ mt: 1 }}>
              {error}
            </Typography>
          )}
        </Paper>

        <Paper variant="outlined" sx={{ p: 2 }}>
          <Typography variant="h6">Abrechnungszeitraum</Typography>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid size={{ xs: 6 }}>
              <TextField
                fullWidth
                label="Monat"
                type="number"
                value={data.month}
                onChange={handleField("month")}
              />
            </Grid>
            <Grid size={{ xs: 6 }}>
              <TextField
                fullWidth
                label="Jahr"
                type="number"
                value={data.year}
                onChange={handleField("year")}
              />
            </Grid>
          </Grid>
        </Paper>

        <Paper variant="outlined" sx={{ p: 2 }}>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Typography variant="h6">Einkommensarten</Typography>
            <IconButton onClick={addIncome} color="primary">
              <AddIcon />
            </IconButton>
          </Box>
          <Divider sx={{ my: 2 }} />
          {data.incomes.map((inc, idx) => (
            <Paper key={idx} variant="outlined" sx={{ p: 2, mb: 2 }}>
              <Grid container spacing={2}>
                <Grid size={{ xs: 5 }}>
                  <TextField
                    fullWidth
                    label="Name"
                    value={inc.name}
                    onChange={handleIncomeChange(idx, "name")}
                  />
                </Grid>
                <Grid size={{ xs: 5 }}>
                  <TextField
                    fullWidth
                    label="Kennung"
                    value={inc.identifier}
                    onChange={handleIncomeChange(idx, "identifier")}
                  />
                </Grid>
                <Grid size={{ xs: 2 }}>
                  <TextField
                    fullWidth
                    label="Wert"
                    type="number"
                    value={inc.value}
                    onChange={handleIncomeChange(idx, "value")}
                  />
                </Grid>
                <Grid size={{ xs: 12 }} textAlign="right">
                  <IconButton onClick={() => removeIncome(idx)} color="error">
                    <DeleteIcon />
                  </IconButton>
                </Grid>
              </Grid>
            </Paper>
          ))}
        </Paper>

        <Grid container spacing={2}>
          {[
            {
              title: "Brutto",
              fields: [
                "brutto_tax",
                "brutto_av",
                "brutto_pv",
                "brutto_rv",
                "brutto_kv",
              ],
            },
            {
              title: "Abzüge",
              fields: [
                "deduction_tax_income",
                "deduction_tax_church",
                "deduction_tax_solidarity",
                "deduction_tax_other",
              ],
            },
            {
              title: "Sozialabgaben",
              fields: ["social_av", "social_pv", "social_rv", "social_kv"],
            },
            {
              title: "Auszahlung",
              fields: [
                "payout_netto",
                "payout_transfer",
                "payout_vwl",
                "payout_other",
              ],
            },
          ].map((section, idx) => (
            <Grid size={{ xs: 12, md: 6 }} key={idx}>
              <Paper variant="outlined" sx={{ p: 2 }}>
                <Typography variant="h6" gutterBottom>
                  {section.title}
                </Typography>
                <Grid container spacing={1}>
                  {section.fields.map((field) => (
                    <Grid size={{ xs: 6 }} key={field}>
                      <TextField
                        fullWidth
                        label={FIELD_DESCRIPTIONS[field] || field}
                        type="number"
                        value={data[field as keyof StatementData] as number}
                        onChange={handleField(field as keyof StatementData)}
                      />
                    </Grid>
                  ))}
                </Grid>
              </Paper>
            </Grid>
          ))}
        </Grid>

        <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 2 }}>
          <Button variant="contained" color="error" onClick={handleDelete}>
            {statementId === "new" ? "Abbrechen" : "Löschen"}
          </Button>
          <Button type="submit" variant="contained" color="success">
            Speichern
          </Button>
        </Box>
      </Box>

      <Dialog open={openResult} onClose={handleCloseResult}>
        <DialogTitle>Upload abgeschlossen</DialogTitle>
        <DialogContent>
          <Typography>
            {bulkResult?.success} erfolgreich, {bulkResult?.failed}{" "}
            fehlgeschlagen.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseResult} autoFocus>
            Zurück zur Übersicht
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
