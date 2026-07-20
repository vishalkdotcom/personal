/**
 * Locked cutover URL matrix — shared by baseline capture and rewrite gate.
 * Baseline may remap `measuredUrl` (SvelteKit stand-ins); rewrite uses lockedPath.
 */

/** @typedef {{ id: string, lockedPath: string, surface: string, notes: string }} LockedMatrixEntry */

/** @type {LockedMatrixEntry[]} */
export const LOCKED_CUTOVER_MATRIX = [
  {
    id: "home",
    lockedPath: "/",
    surface: "Featured Public Storefront (`/` — SupplyChain+ on rewrite)",
    notes: "Document load of featured Public Storefront home.",
  },
  {
    id: "internal-dossier",
    lockedPath: "/work/labor-solutions/engage-reporting",
    surface: "Internal Dossier Work Case (Engage reporting)",
    notes: "Document load of Engage reporting Internal Dossier.",
  },
  {
    id: "resume",
    lockedPath: "/resume",
    surface: "Resume Surface (PDF embed path)",
    notes: "Document load of Resume Surface (PDF path present in shell).",
  },
  {
    id: "contact",
    lockedPath: "/contact",
    surface: "Contact Mode (document load only)",
    notes: "Document load only — form submit not exercised.",
  },
];

/**
 * SvelteKit production measurement targets for the locked matrix.
 * Stand-ins exist where the legacy site had no dedicated route.
 * @param {string} baseUrl
 */
export function sveltekitBaselineTargets(baseUrl) {
  const base = baseUrl.replace(/\/$/, "");
  return LOCKED_CUTOVER_MATRIX.map((entry) => {
    if (entry.id === "home") {
      return {
        ...entry,
        measuredUrl: `${base}/`,
        standIn: false,
        notes: "Current SvelteKit home is marketing About+Work+Contact, not SupplyChain+.",
      };
    }
    if (entry.id === "internal-dossier") {
      return {
        ...entry,
        measuredUrl: `${base}/`,
        standIn: true,
        notes:
          "Engage reporting has no dedicated SvelteKit route (404). Work content loads on the home document; first-load metrics match `/`.",
      };
    }
    if (entry.id === "resume") {
      return {
        ...entry,
        measuredUrl: `${base}/`,
        standIn: true,
        notes:
          "No Resume Surface on SvelteKit (`/resume` 404). Recorded home first-load as SPA shell budget stand-in; PDF-specific LCP does not exist yet.",
      };
    }
    return {
      ...entry,
      measuredUrl: `${base}/contact`,
      standIn: false,
      notes: "Document load only — form submit not exercised.",
    };
  });
}

/**
 * Rewrite measurement URLs — always the locked deep-link path on the rewrite host.
 * @param {string} baseUrl
 */
export function rewriteCutoverTargets(baseUrl) {
  const base = baseUrl.replace(/\/$/, "");
  return LOCKED_CUTOVER_MATRIX.map((entry) => ({
    ...entry,
    measuredUrl: entry.lockedPath === "/" ? `${base}/` : `${base}${entry.lockedPath}`,
    standIn: false,
  }));
}

export function formatBytes(n) {
  if (n >= 1024 * 1024) return `${(n / (1024 * 1024)).toFixed(2)} MiB`;
  if (n >= 1024) return `${(n / 1024).toFixed(1)} KiB`;
  return `${n} B`;
}
