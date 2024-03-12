import { type Styles } from "../../types";

export default function ControlIcon({ styles = "", size = "24" }: Styles) {
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
      className={`icon icon-tabler icons-tabler-outline icon-tabler-device-gamepad ${styles}`}
    >
      <path stroke="none" d="M0 0h24v24H0z" fill="none" />
      <path d="M2 6m0 2a2 2 0 0 1 2 -2h16a2 2 0 0 1 2 2v8a2 2 0 0 1 -2 2h-16a2 2 0 0 1 -2 -2z" />
      <path d="M6 12h4m-2 -2v4" />
      <path d="M15 11l0 .01" />
      <path d="M18 13l0 .01" />
    </svg>
  );
}
