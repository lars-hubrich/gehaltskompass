import * as React from "react";
import Image from "next/image";

/**
 * Renders the Gehaltskompass logo image.
 *
 * @returns {JSX.Element} Logo component.
 */
export default function GehaltskompassIcon() {
  return (
    <Image
      src="/images/logo_transparent.png"
      alt="Logo"
      width={150}
      height={150}
    />
  );
}
