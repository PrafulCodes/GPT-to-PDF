import { ImageResponse } from 'next/og';

export const size = { width: 512, height: 512 };
export const contentType = 'image/png';

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'transparent'
        }}
      >
        <svg viewBox="0 0 512 512" width="512" height="512" fill="none" aria-hidden="true">
          <rect x="28" y="28" width="456" height="456" rx="96" fill="#ffffff" />
          <rect x="76" y="76" width="360" height="360" rx="72" stroke="#2563eb" strokeWidth="56" fill="none" />
          <path d="M248 148h116v116" stroke="#dc2626" strokeWidth="56" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M352 148L236 264" stroke="#dc2626" strokeWidth="56" strokeLinecap="round" strokeLinejoin="round" />
          <circle cx="244" cy="256" r="24" fill="#0f172a" />
          <path d="M326 346l-64 64" stroke="#2563eb" strokeWidth="56" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
    ),
    size
  );
}