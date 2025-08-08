import * as React from "react";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import { useRouter } from "next/navigation";
import Dialog from "@mui/material/Dialog";
import DialogContent from "@mui/material/DialogContent";
import StatementForm from "@/components/StatementForm";

interface NoStatementsCardProps {
  onCreated?: () => Promise<void> | void;
}

export default function NoStatementsCard({ onCreated }: NoStatementsCardProps) {
  const router = useRouter();
  const [open, setOpen] = React.useState(false);

  return (
    <Card sx={{ height: "100%" }}>
      <CardContent>
        <Typography
          component="h2"
          variant="subtitle2"
          gutterBottom
          sx={{ fontWeight: "600" }}
        >
          Noch keine Gehaltsabrechnungen
        </Typography>
        <Typography sx={{ color: "text.secondary", mb: "8px" }}>
          Lege deine erste Gehaltsabrechnung an, um Statistiken zu sehen.
        </Typography>
        <Button
          variant="contained"
          size="small"
          startIcon={<AddRoundedIcon />}
          onClick={() => setOpen(true)}
        >
          Neue Gehaltsabrechnung erstellen
        </Button>
        <Dialog
          open={open}
          onClose={() => setOpen(false)}
          fullWidth
          maxWidth="md"
        >
          <DialogContent>
            <StatementForm
              statementId="new"
              onSaved={async () => {
                setOpen(false);
                if (onCreated) {
                  await onCreated();
                } else {
                  router.refresh();
                }
              }}
              onCancel={() => setOpen(false)}
            />
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}
