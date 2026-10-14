import { ImageResponse } from 'next/og';

// Deelafbeelding (1200×630) voor LinkedIn, WhatsApp e.d.
export async function GET() {
  return new ImageResponse(
    (
      <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '80px', background: '#0B2E52', color: '#fff' }}>
        <svg viewBox="180 235 1166 306" width="420" height="110">
          <polygon fill="#fff" points="183,538 386,237 578,518 578,243 661,243 661,538 498,538 387,357 273,538" />
          <polygon fill="#8FB4D9" points="366,456 445,456 391,538 313,538" />
          <polygon fill="#fff" points="686,243 968,243 968,308 866,308 866,538 783,538 783,308 686,308" />
          <path
            fill="#fff"
            fillRule="evenodd"
            d="M991,243 H1155 C1265,243 1343,305 1343,390 C1343,475 1265,538 1155,538 H991 Z M1074,307 H1155 C1215,307 1254,345 1254,392 C1254,439 1215,478 1155,478 H1074 Z"
          />
        </svg>
        <div style={{ marginTop: 28, fontSize: 26, letterSpacing: 14, color: '#8FB4D9' }}>CONSULTING</div>
        <div style={{ marginTop: 70, fontSize: 54, fontWeight: 700, lineHeight: 1.15 }}>Strategic foresight.</div>
        <div style={{ fontSize: 54, fontWeight: 700, lineHeight: 1.15, color: '#8FB4D9' }}>All in the detail.</div>
        <div style={{ marginTop: 36, fontSize: 26, color: '#cbd5e1' }}>
          Geopolitical analysis · Scenario modelling · Situational awareness · Imagery analysis
        </div>
      </div>
    ),
    { width: 1200, height: 630, headers: { 'Cache-Control': 'public, max-age=86400' } }
  );
}
