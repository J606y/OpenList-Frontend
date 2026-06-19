// Shared "liquid glass" surface styles, used by the login page and the admin
// backend so the two stay visually in sync. Dark mode is handled inline via the
// `.hope-ui-dark &` selector so these can be dropped into any `css` prop without
// needing `useColorModeValue`.

// Frosted, translucent panel/card surface (login card, admin header & sidebar).
export const glassSurfaceCss = {
  background: "rgba(255, 255, 255, 0.45)",
  backdropFilter: "blur(18px) saturate(180%)",
  WebkitBackdropFilter: "blur(18px) saturate(180%)",
  border: "1px solid rgba(255, 255, 255, 0.55)",
  boxShadow:
    "0 8px 32px rgba(31, 38, 135, 0.25), inset 0 1px 0 rgba(255, 255, 255, 0.4)",
  ".hope-ui-dark &": {
    background: "rgba(24, 24, 36, 0.42)",
    border: "1px solid rgba(255, 255, 255, 0.14)",
  },
}

// Frosted, translucent button surface, light/dark aware.
export const glassButtonCss = {
  background: "rgba(255, 255, 255, 0.5)",
  backdropFilter: "blur(8px) saturate(160%)",
  WebkitBackdropFilter: "blur(8px) saturate(160%)",
  border: "1px solid rgba(255, 255, 255, 0.7)",
  boxShadow:
    "0 4px 16px rgba(31, 38, 135, 0.12), inset 0 1px 0 rgba(255, 255, 255, 0.5)",
  transition: "all 0.2s ease",
  _hover: { background: "rgba(255, 255, 255, 0.7)" },
  _active: { background: "rgba(255, 255, 255, 0.55)" },
  ".hope-ui-dark &": {
    background: "rgba(255, 255, 255, 0.08)",
    border: "1px solid rgba(255, 255, 255, 0.18)",
    boxShadow:
      "0 4px 16px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.12)",
  },
  ".hope-ui-dark &:hover": { background: "rgba(255, 255, 255, 0.14)" },
}

// macOS "System Settings"–style sidebar: a flush, full-height vibrancy panel.
// Unlike glassSurfaceCss (a bordered card) this only draws a hairline divider
// on its trailing edge and uses a deeper blur, so it reads as part of the
// window chrome rather than a floating card.
export const glassSidebarCss = {
  background: "rgba(255, 255, 255, 0.30)",
  backdropFilter: "blur(24px) saturate(180%)",
  WebkitBackdropFilter: "blur(24px) saturate(180%)",
  borderRight: "1px solid rgba(255, 255, 255, 0.45)",
  ".hope-ui-dark &": {
    background: "rgba(20, 20, 32, 0.40)",
    borderRight: "1px solid rgba(255, 255, 255, 0.08)",
  },
}

// Selected sidebar row — a true "liquid glass" tile: an accent-tinted, blurred
// translucent panel with a glossy top highlight and a soft accent glow. The
// label/icon keep the vivid accent color so they stay legible on the frost
// (instead of a near-solid blue fill). Both color modes are handled inline.
export const glassSidebarActiveItemCss = {
  background:
    "linear-gradient(135deg, rgba(10, 145, 255, 0.42) 0%, rgba(0, 118, 255, 0.32) 100%)",
  backdropFilter: "blur(12px) saturate(180%)",
  WebkitBackdropFilter: "blur(12px) saturate(180%)",
  border: "1px solid rgba(255, 255, 255, 0.55)",
  color: "$info11",
  boxShadow:
    "0 4px 14px -4px rgba(0, 118, 255, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.55)",
  ".hope-ui-dark &": {
    background:
      "linear-gradient(135deg, rgba(10, 132, 255, 0.30) 0%, rgba(0, 104, 235, 0.22) 100%)",
    border: "1px solid rgba(255, 255, 255, 0.20)",
    boxShadow:
      "0 4px 16px -4px rgba(0, 90, 220, 0.45), inset 0 1px 0 rgba(255, 255, 255, 0.18)",
  },
}

// Grid tile hover / selected states, matching the liquid-glass surfaces. The
// tiles sit on the already-frosted Obj card, so a translucent fill alone reads
// as glass (no extra backdrop blur needed per tile — keeps a large grid snappy).
// hover = light white frost; selected = accent-tinted glass with a glossy edge.
export const glassGridItemCss = {
  "&:hover": {
    transform: "scale(1.06)",
    background: "rgba(255, 255, 255, 0.45)",
  },
  "&.selected": {
    background:
      "linear-gradient(135deg, rgba(10, 145, 255, 0.42) 0%, rgba(0, 118, 255, 0.32) 100%)",
    border: "1px solid rgba(255, 255, 255, 0.55)",
    boxShadow:
      "0 4px 14px -4px rgba(0, 118, 255, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.55)",
  },
  ".hope-ui-dark &:hover": {
    background: "rgba(255, 255, 255, 0.10)",
  },
  ".hope-ui-dark &.selected": {
    background:
      "linear-gradient(135deg, rgba(10, 132, 255, 0.30) 0%, rgba(0, 104, 235, 0.22) 100%)",
    border: "1px solid rgba(255, 255, 255, 0.20)",
  },
}
