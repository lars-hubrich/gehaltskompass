import * as React from "react";
import { styled } from "@mui/material/styles";
import MuiDrawer, { drawerClasses } from "@mui/material/Drawer";
import Box from "@mui/material/Box";
import Divider from "@mui/material/Divider";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import MenuContent from "./MenuContent";
import LogoutButton from "./LogoutButton";
import { useSession } from "next-auth/react";
import GehaltskompassIcon from "@/components/icons/GehaltskompassIcon";
import Image from "next/image";

const drawerWidth = 240;

const Drawer = styled(MuiDrawer)(({ theme }) => ({
  width: drawerWidth,
  flexShrink: 0,
  boxSizing: "border-box",
  mt: 10,
  [`& .${drawerClasses.paper}`]: {
    width: drawerWidth,
    boxSizing: "border-box",
    borderRight: `1px solid ${theme.palette.divider}`,
    backgroundImage: "none",
  },
}));

/**
 * Permanent side navigation menu for desktop layouts.
 *
 * @returns {JSX.Element} Side menu component.
 */
export default function SideMenu() {
  const { data: session } = useSession();
  const avatarSrc = session?.user?.picture
    ? `${session.user.picture}&s=72`
    : "/images/logo_icon.png";

  return (
    <Drawer
      variant="permanent"
      sx={{
        display: { xs: "none", md: "block" },
        [`& .${drawerClasses.paper}`]: {
          backgroundColor: "background.default",
        },
      }}
    >
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          mt: "calc(var(--template-frame-height, 0px) + 4px)",
          p: 1.5,
        }}
      >
        <GehaltskompassIcon />
      </Box>
      <Divider />
      <Box
        sx={{
          overflow: "auto",
          height: "100%",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <MenuContent />
      </Box>
      <Stack
        direction="row"
        sx={{
          p: 2,
          gap: 1,
          alignItems: "center",
          borderTop: "1px solid",
          borderColor: "divider",
        }}
      >
        <Image
          src={avatarSrc}
          alt={session?.user?.name || "Unbekannt"}
          width={36}
          height={36}
          style={{ borderRadius: "50%" }}
        />
        <Box sx={{ mr: "auto" }}>
          <Typography
            variant="body2"
            sx={{ fontWeight: 500, lineHeight: "16px" }}
          >
            {session?.user?.name}
          </Typography>
          <Typography variant="caption" sx={{ color: "text.secondary" }}>
            {session?.user?.email}
          </Typography>
        </Box>
        <LogoutButton />
      </Stack>
    </Drawer>
  );
}
