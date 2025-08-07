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
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import { StatementData } from "@/constants/Interfaces";

interface StatementFormProps {
  statementId?: string;
}

export default function StatementForm({ statementId }: StatementFormProps) {
  const router = useRouter();

  const getInitialState = (): StatementData => ({
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear(),
    incomes: [
      { name: "Grundgehalt", identifier: "grundgehalt", value: 4500.0 },
      { name: "Leistungsprämie", identifier: "leistungspraemie", value: 350.5 },
    ],
    brutto_tax: 4850.5,
    brutto_av: 4850.5,
    brutto_pv: 4850.5,
    brutto_rv: 4850.5,
    brutto_kv: 4850.5,
    deduction_tax_income: 950.75,
    deduction_tax_church: 85.56,
    deduction_tax_solidarity: 0.0,
    deduction_tax_other: 0.0,
    social_av: 95.8,
    social_pv: 75.2,
    social_rv: 450.8,
    social_kv: 390.1,
    payout_netto: 2802.29,
    payout_transfer: 2802.29,
    payout_vwl: 40.0,
    payout_other: 0.0,
  });

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
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (statementId === "new") {
      setData(getInitialState());
    } else if (statementId) {
      const fetchStatement = async () => {
        const res = await fetch(`/api/statement/${statementId}`);
        if (res.ok) {
          const loaded = await res.json();
          setData({ ...loaded, incomes: loaded.incomes || [] });
        }
      };
      // noinspection JSIgnoredPromiseFromCall
      fetchStatement();
    }
  }, [statementId]);

  // Handle file drop
  const onDrop = useCallback(async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    await handleFile(e.dataTransfer.files);
  }, []);

  const onDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const onFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    await handleFile(e.target.files);
  };

  const handleFile = async (files: FileList) => {
    if (files.length === 0) return;
    const file = files[0];
    setError(null);
    if (file.type !== "application/pdf") {
      setError("Bitte eine PDF-Datei hochladen.");
      return;
    }
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/extract", {
        method: "POST",
        body: formData,
        credentials: "include",
      });
      if (!res.ok) {
        const err = await res.json();
        // noinspection ExceptionCaughtLocallyJS
        throw new Error(err.error || "Upload fehlgeschlagen");
      }
      const json: StatementData = await res.json();
      setData({ ...json, incomes: json.incomes || [] });
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleField =
    (field: keyof StatementData) =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const val =
        field === "month" || field === "year"
          ? parseInt(e.target.value, 10)
          : parseFloat(e.target.value);
      setData((prev) => ({ ...prev, [field]: isNaN(val) ? 0 : val }));
    };

  const handleIncomeChange =
    (i: number, key: keyof (typeof data.incomes)[0]) =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setData((prev) => {
        const incomes = [...prev.incomes];
        incomes[i] = {
          ...incomes[i],
          [key]:
            key === "value" ? parseFloat(e.target.value) || 0 : e.target.value,
        };
        return { ...prev, incomes };
      });
    };

  const addIncome = () => {
    setData({
      ...data,
      incomes: [...data.incomes, { name: "", identifier: "", value: 0 }],
    });
  };

  const removeIncome = (index: number) => {
    const newIncomes = data.incomes.filter((_, i) => i !== index);
    setData({ ...data, incomes: newIncomes });
  };

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
      router.push("/");
      router.refresh();
    }
  };

  const handleDelete = async () => {
    if (!statementId || statementId === "new") {
      router.push("/");
      return;
    }

    const res = await fetch(`/api/statement/${statementId}`, {
      method: "DELETE",
    });

    if (res.ok) {
      router.push("/");
      router.refresh();
    }
  };

  return (
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
        style={{ display: "none" }}
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
        <UploadFileIcon sx={{ fontSize: 40, mb: 1 }} />
        <Typography>
          Klicke hier oder ziehe dein PDF-Dokument hinein, um die Felder
          automatisch zu befüllen.
        </Typography>
        {loading && <CircularProgress sx={{ mt: 1 }} />}
        {error && (
          <Typography color="error" sx={{ mt: 1 }}>
            {error}
          </Typography>
        )}
      </Paper>

      {/* Zeitraum */}
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

      {/* Einkommensarten */}
      <Paper variant="outlined" sx={{ p: 2 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h6">Einkommensarten</Typography>
          <IconButton onClick={addIncome}>
            <AddIcon />
          </IconButton>
        </Box>
        <Divider sx={{ my: 1 }} />
        {data.incomes.map((inc, i) => (
          <Paper key={i} variant="outlined" sx={{ p: 2, mb: 2 }}>
            <Grid container spacing={2}>
              <Grid size={{ xs: 5 }}>
                <TextField
                  fullWidth
                  label="Name"
                  value={inc.name}
                  onChange={handleIncomeChange(i, "name")}
                />
              </Grid>
              <Grid size={{ xs: 5 }}>
                <TextField
                  fullWidth
                  label="Identifier"
                  value={inc.identifier}
                  onChange={handleIncomeChange(i, "identifier")}
                />
              </Grid>
              <Grid size={{ xs: 2 }}>
                <TextField
                  fullWidth
                  label="Wert"
                  type="number"
                  value={inc.value}
                  onChange={handleIncomeChange(i, "value")}
                />
              </Grid>
              <Grid size={{ xs: 12 }} textAlign="right">
                <IconButton onClick={() => removeIncome(i)} color="error">
                  <DeleteIcon />
                </IconButton>
              </Grid>
            </Grid>
          </Paper>
        ))}
      </Paper>

      {/* Weitere Sektionen: Brutto, Abzüge, Sozialabgaben, Auszahlung */}
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
                {section.fields.map((f) => (
                  <Grid size={{ xs: 6 }} key={f}>
                    <TextField
                      fullWidth
                      label={f.replace(/_/g, " ")}
                      type="number"
                      value={data[f as keyof StatementData] as number}
                      onChange={handleField(f as keyof StatementData)}
                      slotProps={{ htmlInput: { step: 0.01 } }}
                    />
                  </Grid>
                ))}
              </Grid>
            </Paper>
          </Grid>
        ))}
      </Grid>

      <Box display="flex" justifyContent="flex-end" gap={2}>
        <Button variant="contained" color="error" onClick={handleDelete}>
          {statementId === "new" ? "Abbrechen" : "Löschen"}
        </Button>
        <Button type="submit" variant="contained" color="success">
          Speichern
        </Button>
      </Box>
    </Box>
  );
}
