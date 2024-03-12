import { type Styles } from "../../types";

export default function Transform({ styles = "", size = "24" }: Styles) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={`${size}`}
      height={`${size}`}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={`icon icon-tabler icons-tabler-outline icon-tabler-transform ${styles}`}
    >
      <path stroke="none" d="M0 0h24v24H0z" fill="none" />
      <path d="M3 6a3 3 0 1 0 6 0a3 3 0 0 0 -6 0" />
      <path d="M21 11v-3a2 2 0 0 0 -2 -2h-6l3 3m0 -6l-3 3" />
      <path d="M3 13v3a2 2 0 0 0 2 2h6l-3 -3m0 6l3 -3" />
      <path d="M15 18a3 3 0 1 0 6 0a3 3 0 0 0 -6 0" />
    </svg>
  );
}
