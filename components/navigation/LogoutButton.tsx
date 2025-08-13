import * as React from "react";
import LogoutRoundedIcon from "@mui/icons-material/LogoutRounded";
import Button from "@mui/material/Button";
import { signOut } from "next-auth/react";

/**
 * Button that signs the user out of the application.
 *
 * @returns {JSX.Element} Logout button component.
 */
export default function LogoutButton() {
  return (
    <Button
      variant="outlined"
      aria-label="Abmelden"
      onClick={() => {
        // noinspection JSIgnoredPromiseFromCall
        signOut();
      }}
    >
      <LogoutRoundedIcon />
    </Button>
  );
}
