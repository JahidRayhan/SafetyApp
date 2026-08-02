/**
 * Panel surface primitives — the standard elevated card used throughout the app.
 * Replaces repeated `bg-white rounded-xl shadow-lg p-6` chains.
 */
export const panelBase = "bg-card text-card-foreground rounded-panel shadow-panel p-panel";
export const panelCompact = "bg-card text-card-foreground rounded-panel shadow-panel p-panel-sm";
export const panelInteractive =
  "bg-card text-card-foreground rounded-panel shadow-panel p-panel transition-shadow hover:shadow-panel-hover";
export const panelHeader = "text-xl font-bold text-foreground";
export const panelSubheader = "text-sm text-muted-foreground";
