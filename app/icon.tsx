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
          <rect x="52" y="52" width="408" height="408" rx="88" fill="#ffffff" />
          <rect x="104" y="104" width="304" height="304" rx="60" stroke="#2563eb" strokeWidth="52" fill="none" />
          <path d="M254 160h108v108" stroke="#dc2626" strokeWidth="52" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M352 160L244 268" stroke="#dc2626" strokeWidth="52" strokeLinecap="round" strokeLinejoin="round" />
          <circle cx="246" cy="256" r="22" fill="#0f172a" />
          <path d="M324 348l-60 60" stroke="#2563eb" strokeWidth="52" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
    ),
    size
  );
}