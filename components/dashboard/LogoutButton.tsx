import * as React from "react";
import LogoutRoundedIcon from "@mui/icons-material/LogoutRounded";
import Button from "@mui/material/Button";
import { signOut } from "next-auth/react";

export default function LogoutButton() {
  return (
    <Button
      variant="outlined"
      startIcon={<LogoutRoundedIcon />}
      onClick={() => {
        signOut();
      }}
    ></Button>
  );
}
