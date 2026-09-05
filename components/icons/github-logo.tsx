import type { SVGProps } from "react";

/**
 * The GitHub mark, inlined as SVG.
 *
 * lucide-react 1.0 removed all brand/logo icons (GitHub, Facebook, Figma,
 * Slack, etc.) to avoid trademark risk — see
 * https://github.com/lucide-icons/lucide/issues/670. This component fills
 * that gap for the one spot in the app where the actual GitHub brand mark
 * (not just a generic "git" glyph) is the point, e.g. the "Connect GitHub"
 * button and account card.
 *
 * Accepts the same props as a lucide icon (className, size, etc.) so it can
 * be swapped in without touching call sites beyond the import.
 */
function GithubLogo(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      {...props}
    >
      <path d="M12 .5C5.73.5.98 5.24.98 11.5c0 5.01 3.29 9.26 7.86 10.76.57.1.78-.25.78-.55 0-.27-.01-1.16-.02-2.11-3.2.7-3.88-1.36-3.88-1.36-.52-1.34-1.28-1.69-1.28-1.69-1.04-.72.08-.7.08-.7 1.15.08 1.76 1.19 1.76 1.19 1.03 1.75 2.69 1.25 3.34.96.1-.75.4-1.25.73-1.53-2.55-.29-5.23-1.28-5.23-5.7 0-1.26.45-2.29 1.19-3.09-.12-.29-.52-1.47.11-3.06 0 0 .97-.31 3.18 1.18a11 11 0 0 1 2.9-.39c.98 0 1.97.13 2.9.39 2.2-1.49 3.17-1.18 3.17-1.18.63 1.6.23 2.77.12 3.06.74.8 1.18 1.83 1.18 3.09 0 4.43-2.69 5.4-5.25 5.69.42.36.78 1.07.78 2.16 0 1.56-.02 2.82-.02 3.2 0 .3.2.66.79.55A10.51 10.51 0 0 0 23.02 11.5C23.02 5.24 18.27.5 12 .5Z" />
    </svg>
  );
}

export { GithubLogo };