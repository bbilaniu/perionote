import { ImageResponse } from "next/og";

export const dynamic = "force-static";

export async function GET() {
  return new ImageResponse(
    (
      <svg viewBox="0 0 512 512" width="512" height="512" xmlns="http://www.w3.org/2000/svg">
        <rect width="512" height="512" fill="#fff" />
        <g fill="none" stroke="#0b0d12" strokeLinecap="round" strokeLinejoin="round">
          <path
            d="M251 84c-38 0-61 20-61 63 0 64 19 69 19 122 0 72 20 154 47 154 20 0 29-36 36-86 8-56 18-86 32-86s24 30 32 86c7 50 16 86 36 86 27 0 47-82 47-154 0-53 19-58 19-122 0-43-23-63-61-63-32 0-49 15-73 15s-41-15-73-15Z"
            strokeWidth="15"
          />
          <rect x="84" y="78" width="35" height="176" rx="13" strokeWidth="12" />
          <line x1="96" y1="134" x2="107" y2="134" strokeWidth="8" />
          <line x1="96" y1="170" x2="107" y2="170" strokeWidth="8" />
          <line x1="96" y1="206" x2="107" y2="206" strokeWidth="8" />
          <path d="M102 254v98l-38 31 45 32" strokeWidth="12" />
        </g>
      </svg>
    ),
    { width: 512, height: 512 },
  );
}
