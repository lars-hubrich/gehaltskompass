import * as React from "react";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import { useRouter } from "next/navigation";

export default function NoStatementsCard() {
  const router = useRouter();

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
          onClick={() => router.push("/statement/new")}
        >
          Neue Gehaltsabrechnung erstellen
        </Button>
      </CardContent>
    </Card>
  );
}
