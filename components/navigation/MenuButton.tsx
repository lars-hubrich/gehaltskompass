import * as React from "react";
import Badge, { badgeClasses } from "@mui/material/Badge";
import IconButton, { IconButtonProps } from "@mui/material/IconButton";

export interface MenuButtonProps extends IconButtonProps {
  showBadge?: boolean;
}

/**
 * Icon button optionally displaying a notification badge.
 *
 * @param showBadge
 * @param {MenuButtonProps} props - Component properties.
 * @returns {JSX.Element} Menu button component.
 */
export default function MenuButton({
  showBadge = false,
  ...props
}: MenuButtonProps) {
  return (
    <Badge
      color="error"
      variant="dot"
      invisible={!showBadge}
      sx={{ [`& .${badgeClasses.badge}`]: { right: 2, top: 2 } }}
    >
      <IconButton size="small" {...props} />
    </Badge>
  );
}
