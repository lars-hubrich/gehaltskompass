import * as React from "react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import MuiChip from "@mui/material/Chip";
import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";
import { styled } from "@mui/material/styles";

import DevicesRoundedIcon from "@mui/icons-material/DevicesRounded";
import InsightsIcon from "@mui/icons-material/Insights";
import ViewQuiltRoundedIcon from "@mui/icons-material/ViewQuiltRounded";

const items = [
  {
    icon: <ViewQuiltRoundedIcon />,
    title: "Dashboard",
    description:
      "Behalte deine Gehaltsentwicklung sowie Steuer- und Sozialabgaben im Blick",
    imageLight: `url("${
      process.env.TEMPLATE_IMAGE_URL || "https://mui.com"
    }/static/images/templates/templates-images/dash-light.png")`,
    imageDark: `url("${
      process.env.TEMPLATE_IMAGE_URL || "https://mui.com"
    }/static/images/templates/templates-images/dash-dark.png")`,
  },
  {
    icon: <InsightsIcon />,
    title: "AI Insights",
    description:
      "Stelle Fragen zu deiner Gehaltsabrechnung und erhalte KI-gestützte Einblicke.",
    imageLight: `url("${
      process.env.TEMPLATE_IMAGE_URL || "https://mui.com"
    }/static/images/templates/templates-images/mobile-light.png")`,
    imageDark: `url("${
      process.env.TEMPLATE_IMAGE_URL || "https://mui.com"
    }/static/images/templates/templates-images/mobile-dark.png")`,
  },
  {
    icon: <DevicesRoundedIcon />,
    title: "Plattformübergreifend",
    description:
      "Greife im Browser auf Tablet, Desktop oder Smartphone auf deine Daten zu.",
    imageLight: `url("${
      process.env.TEMPLATE_IMAGE_URL || "https://mui.com"
    }/static/images/templates/templates-images/devices-light.png")`,
    imageDark: `url("${
      process.env.TEMPLATE_IMAGE_URL || "https://mui.com"
    }/static/images/templates/templates-images/devices-dark.png")`,
  },
];

interface ChipProps {
  selected?: boolean;
}

const Chip = styled(MuiChip)<ChipProps>(({ theme }) => ({
  variants: [
    {
      props: ({ selected }) => !!selected,
      style: {
        background:
          "linear-gradient(to bottom right, hsl(210, 98%, 48%), hsl(210, 98%, 35%))",
        color: "hsl(0, 0%, 100%)",
        borderColor: (theme.vars || theme).palette.primary.light,
        "& .MuiChip-label": {
          color: "hsl(0, 0%, 100%)",
        },
        ...theme.applyStyles("dark", {
          borderColor: (theme.vars || theme).palette.primary.dark,
        }),
      },
    },
  ],
}));

interface MobileLayoutProps {
  selectedItemIndex: number;
  handleItemClick: (index: number) => void;
  selectedFeature: (typeof items)[0];
}

export function MobileLayout({
  selectedItemIndex,
  handleItemClick,
  selectedFeature,
}: MobileLayoutProps) {
  if (!items[selectedItemIndex]) {
    return null;
  }

  return (
    <Box
      sx={{
        display: { xs: "flex", sm: "none" },
        flexDirection: "column",
        gap: 2,
      }}
    >
      <Box sx={{ display: "flex", gap: 2, overflow: "auto" }}>
        {items.map(({ title }, index) => (
          <Chip
            size="medium"
            key={index}
            label={title}
            onClick={() => handleItemClick(index)}
            selected={selectedItemIndex === index}
          />
        ))}
      </Box>
      <Card variant="outlined">
        <Box
          sx={(theme) => ({
            mb: 2,
            backgroundSize: "cover",
            backgroundPosition: "center",
            minHeight: 280,
            backgroundImage: "var(--items-imageLight)",
            ...theme.applyStyles("dark", {
              backgroundImage: "var(--items-imageDark)",
            }),
          })}
          style={
            items[selectedItemIndex]
              ? ({
                  "--items-imageLight": items[selectedItemIndex].imageLight,
                  "--items-imageDark": items[selectedItemIndex].imageDark,
                } as never)
              : {}
          }
        />
        <Box sx={{ px: 2, pb: 2 }}>
          <Typography
            gutterBottom
            sx={{ color: "text.primary", fontWeight: "medium" }}
          >
            {selectedFeature.title}
          </Typography>
          <Typography variant="body2" sx={{ color: "text.secondary", mb: 1.5 }}>
            {selectedFeature.description}
          </Typography>
        </Box>
      </Card>
    </Box>
  );
}

export default function Features() {
  const [selectedItemIndex, setSelectedItemIndex] = React.useState(0);

  const handleItemClick = (index: number) => {
    setSelectedItemIndex(index);
  };

  const selectedFeature = items[selectedItemIndex];

  return (
    <Container id="features" sx={{ py: { xs: 8, sm: 16 } }}>
      {/* Kopfbereich */}
      <Box sx={{ width: { sm: "100%", md: "60%" } }}>
        <Typography
          component="h2"
          variant="h4"
          gutterBottom
          sx={{ color: "text.primary" }}
        >
          Features
        </Typography>
        <Typography
          variant="body1"
          sx={{ color: "text.secondary", mb: { xs: 2, sm: 4 } }}
        >
          Unsere Website ermöglicht es dir, deine Gehaltsabrechnungen
          hochzuladen und zu speichern, um dir aufbereitete Graphen und
          Statistiken zu bieten. Mit KI-gestützten Antworten erhältst du
          wertvolle Informationen zu all deinen Gehaltsfragen, und unsere
          benutzerfreundliche Oberfläche sorgt für eine nahtlose Erfahrung auf
          allen Geräten.
        </Typography>
      </Box>

      {/* Desktop-/Tablet-Layout */}
      <Box
        sx={{
          display: "flex",
          flexDirection: { xs: "column", md: "row-reverse" },
          gap: 2,
        }}
      >
        {/* linke Spalte mit Buttons (nur ≥ sm) */}
        <div>
          <Box
            sx={{
              display: { xs: "none", sm: "flex" },
              flexDirection: "column",
              gap: 2,
              height: "100%",
            }}
          >
            {items.map(({ icon, title, description }, index) => (
              <Box
                key={index}
                component={Button}
                onClick={() => handleItemClick(index)}
                sx={[
                  (theme) => ({
                    p: 2,
                    height: "100%",
                    width: "100%",
                    "&:hover": {
                      backgroundColor: (theme.vars || theme).palette.action
                        .hover,
                    },
                  }),
                  selectedItemIndex === index && {
                    backgroundColor: "action.selected",
                  },
                ]}
              >
                <Box
                  sx={[
                    {
                      width: "100%",
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "left",
                      gap: 1,
                      textAlign: "left",
                      textTransform: "none",
                      color: "text.secondary",
                    },
                    selectedItemIndex === index && {
                      color: "text.primary",
                    },
                  ]}
                >
                  {icon}
                  <Typography variant="h6">{title}</Typography>
                  <Typography variant="body2">{description}</Typography>
                </Box>
              </Box>
            ))}
          </Box>

          {/* Mobile-Layout */}
          <MobileLayout
            selectedItemIndex={selectedItemIndex}
            handleItemClick={handleItemClick}
            selectedFeature={selectedFeature}
          />
        </div>

        {/* rechte Spalte mit Screenshot */}
        <Box
          sx={{
            display: { xs: "none", sm: "flex" },
            width: { xs: "100%", md: "70%" },
            height: "var(--items-image-height)",
          }}
        >
          <Card
            variant="outlined"
            sx={{
              height: "100%",
              width: "100%",
              display: { xs: "none", sm: "flex" },
              pointerEvents: "none",
            }}
          >
            <Box
              sx={(theme) => ({
                m: "auto",
                width: 420,
                height: 500,
                backgroundSize: "contain",
                backgroundImage: "var(--items-imageLight)",
                ...theme.applyStyles("dark", {
                  backgroundImage: "var(--items-imageDark)",
                }),
              })}
              style={
                items[selectedItemIndex]
                  ? ({
                      "--items-imageLight": items[selectedItemIndex].imageLight,
                      "--items-imageDark": items[selectedItemIndex].imageDark,
                    } as never)
                  : {}
              }
            />
          </Card>
        </Box>
      </Box>
    </Container>
  );
}
