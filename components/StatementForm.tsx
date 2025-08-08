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
import ErrorSnackbar from "@/components/ErrorSnackbar";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import { StatementData } from "@/constants/Interfaces";
import { FIELD_DESCRIPTIONS_HUMAN } from "@/constants/fieldDescriptions";
import {
  MAX_FILE_SIZE,
  MAX_FILES_PER_UPLOAD,
  MAX_STATEMENTS_PER_USER,
} from "@/constants/limits";

interface StatementFormProps {
  statementId?: string;
  onSaved?: () => void;
  onCancel?: () => void;
}

export default function StatementForm({
  statementId,
  onSaved,
  onCancel,
}: StatementFormProps) {
  const router = useRouter();
  const [data, setData] = useState<StatementData>(() => {
    const now = new Date();
    return {
      month: statementId === "new" ? now.getMonth() + 1 : 0,
      year: statementId === "new" ? now.getFullYear() : 0,
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
    };
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [bulkResult, setBulkResult] = useState<{
    success: number;
    failed: number;
  } | null>(null);
  const [openResult, setOpenResult] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [existingCount, setExistingCount] = useState(0);
  const [originalData, setOriginalData] = useState<StatementData | null>(null);
  const [isEditing, setIsEditing] = useState(statementId === "new");
  const [existingStatements, setExistingStatements] = useState<StatementData[]>(
    [],
  );
  const [validationError, setValidationError] = useState<string | null>(null);

  const validate = useCallback(
    (value: StatementData) => {
      let msg: string | null = null;
      if (value.month < 1 || value.month > 12) {
        msg = "Monat muss zwischen 1 und 12 liegen.";
      } else if (value.year < 1900 || value.year > 2100) {
        msg = "Ungültiges Jahr.";
      } else if (
        existingStatements.some(
          (s) =>
            s.month === value.month &&
            s.year === value.year &&
            s.id !== statementId,
        )
      ) {
        msg = "Abrechnung für diesen Monat existiert bereits.";
      } else if (
        Object.values(value).some((v) => typeof v === "number" && v < 0) ||
        value.incomes.some((inc) => inc.value < 0)
      ) {
        msg = "Werte müssen positiv sein.";
      }
      setValidationError(msg);
      return !msg;
    },
    [existingStatements, statementId],
  );

  useEffect(() => {
    if (statementId && statementId !== "new") {
      (async () => {
        const res = await fetch(`/api/statement/${statementId}`);
        if (res.ok) {
          const loaded = await res.json();
          const normalized = { ...loaded, incomes: loaded.incomes || [] };
          setData(normalized);
          setOriginalData(normalized);
          setIsEditing(false);
          validate(normalized);
        } else {
          const err = await res.json();
          setError(err.error || "Fehler beim Laden der Abrechnung");
        }
      })();
    } else {
      setIsEditing(true);
    }
  }, [statementId, validate]);

  useEffect(() => {
    (async () => {
      const res = await fetch(`/api/statement`);
      if (res.ok) {
        const statements = await res.json();
        setExistingStatements(statements);
        setExistingCount(statements.length);
        validate({ ...data });
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (bulkResult) {
      setOpenResult(true);
    }
  }, [bulkResult]);

  const handleFiles = useCallback(
    async (files: FileList) => {
      if (files.length === 0) return;
      setError(null);
      setBulkResult(null);

      if (files.length > MAX_FILES_PER_UPLOAD) {
        setError(
          `Maximal ${MAX_FILES_PER_UPLOAD} Dateien gleichzeitig hochladen.`,
        );
        return;
      }

      if (existingCount >= MAX_STATEMENTS_PER_USER) {
        setError("Maximal 20 Abrechnungen erlaubt.");
        return;
      }

      if (existingCount + files.length > MAX_STATEMENTS_PER_USER) {
        setError(
          `Es können nur noch ${
            MAX_STATEMENTS_PER_USER - existingCount
          } Abrechnungen erstellt werden.`,
        );
        return;
      }

      if (files.length === 1) {
        const file = files[0];
        if (file.type !== "application/pdf") {
          setError("Bitte eine PDF-Datei hochladen.");
          return;
        }
        if (file.size > MAX_FILE_SIZE) {
          setError("Datei ist zu groß.");
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
          const newData = { ...json, incomes: json.incomes || [] };
          setData(newData);
          validate(newData);
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
        if (file.type !== "application/pdf" || file.size > MAX_FILE_SIZE) {
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
          setExistingCount((prev) => prev + 1);
        } catch (err) {
          console.error(err);
          failed++;
        }
      }

      setLoading(false);
      setBulkResult({ success, failed });
    },
    [existingCount, validate],
  );

  const onDrop = useCallback(
    async (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      await handleFiles(e.dataTransfer.files);
    },
    [handleFiles],
  );

  const onDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const onFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    await handleFiles(e.target.files);
  };

  const handleCloseResult = () => {
    setOpenResult(false);
    if (onSaved) {
      onSaved();
    } else {
      router.replace("/statements");
    }
  };

  const handleField =
    (field: keyof StatementData) =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value =
        field === "month" || field === "year"
          ? parseInt(e.target.value, 10)
          : parseFloat(e.target.value);
      setData((prev) => {
        const newData = { ...prev, [field]: isNaN(value) ? 0 : value };
        validate(newData);
        return newData;
      });
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
        const newData = { ...prev, incomes };
        validate(newData);
        return newData;
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
    if (statementId === "new" && existingCount >= MAX_STATEMENTS_PER_USER) {
      setError("Maximal 20 Abrechnungen erlaubt.");
      return;
    }
    if (!validate(data)) return;
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
      if (onSaved) {
        onSaved();
      } else {
        router.replace("/statements");
      }
    } else {
      const err = await res.json();
      setError(err.error || "Speichern fehlgeschlagen");
    }
  };

  const handleDelete = async () => {
    if (!statementId || statementId === "new") {
      if (onCancel) {
        onCancel();
      } else {
        router.replace("/statements");
      }
      return;
    }
    setError(null);
    const res = await fetch(`/api/statement/${statementId}`, {
      method: "DELETE",
    });
    if (res.ok) {
      if (onSaved) {
        onSaved();
      } else {
        router.replace("/statements");
      }
    } else {
      const err = await res.json();
      setError(err.error || "Löschen fehlgeschlagen");
    }
  };

  const handleCancel = () => {
    if (statementId === "new") {
      if (onCancel) {
        onCancel();
      } else {
        router.replace("/statements");
      }
      return;
    }
    if (isEditing && originalData) {
      setData(originalData);
      setIsEditing(false);
    } else if (onCancel) {
      onCancel();
    } else {
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
            : isEditing
              ? "Abrechnung bearbeiten"
              : "Abrechnung ansehen"}
        </Typography>
        <ErrorSnackbar error={error} onClose={() => setError(null)} />
        <ErrorSnackbar
          error={validationError}
          onClose={() => setValidationError(null)}
        />

        {statementId === "new" && (
          <>
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
                Klicke hier oder ziehe dein PDF-Dokument(e) hinein, um die
                Felder automatisch zu befüllen.
              </Typography>
            </Paper>
          </>
        )}

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
                disabled={!isEditing}
              />
            </Grid>
            <Grid size={{ xs: 6 }}>
              <TextField
                fullWidth
                label="Jahr"
                type="number"
                value={data.year}
                onChange={handleField("year")}
                disabled={!isEditing}
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
            {isEditing && (
              <IconButton onClick={addIncome} color="primary">
                <AddIcon />
              </IconButton>
            )}
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
                    disabled={!isEditing}
                  />
                </Grid>
                <Grid size={{ xs: 5 }}>
                  <TextField
                    fullWidth
                    label="Kennung"
                    value={inc.identifier}
                    onChange={handleIncomeChange(idx, "identifier")}
                    disabled={!isEditing}
                  />
                </Grid>
                <Grid size={{ xs: 2 }}>
                  <TextField
                    fullWidth
                    label="Wert"
                    type="number"
                    value={inc.value}
                    onChange={handleIncomeChange(idx, "value")}
                    disabled={!isEditing}
                  />
                </Grid>
                {isEditing && (
                  <Grid size={{ xs: 12 }} textAlign="right">
                    <IconButton onClick={() => removeIncome(idx)} color="error">
                      <DeleteIcon />
                    </IconButton>
                  </Grid>
                )}
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
                        label={FIELD_DESCRIPTIONS_HUMAN[field] || field}
                        type="number"
                        value={data[field as keyof StatementData] as number}
                        onChange={handleField(field as keyof StatementData)}
                        disabled={!isEditing}
                      />
                    </Grid>
                  ))}
                </Grid>
              </Paper>
            </Grid>
          ))}
        </Grid>

        {isEditing ? (
          <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 2 }}>
            {statementId !== "new" && (
              <Button variant="contained" color="error" onClick={handleDelete}>
                Löschen
              </Button>
            )}
            <Button variant="outlined" onClick={handleCancel}>
              Abbrechen
            </Button>
            <Button type="submit" variant="contained" color="success">
              Speichern
            </Button>
          </Box>
        ) : (
          <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 2 }}>
            <Button variant="contained" onClick={() => setIsEditing(true)}>
              Bearbeiten
            </Button>
          </Box>
        )}
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
