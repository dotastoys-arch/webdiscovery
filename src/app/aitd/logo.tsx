// AITD-woordmerk, nagetekend uit het aangeleverde logo (scherp op elk formaat).
export function AitdMark({
  className,
  navy = '#0B2E52',
  accent = '#4479AB',
}: {
  className?: string;
  navy?: string;
  accent?: string;
}) {
  return (
    <svg viewBox="180 235 1166 306" className={className} role="img" aria-label="AITD">
      <polygon
        fill={navy}
        points="183,538 386,237 578,518 578,243 661,243 661,538 498,538 387,357 273,538"
      />
      <polygon fill={accent} points="366,456 445,456 391,538 313,538" />
      <polygon
        fill={navy}
        points="686,243 968,243 968,308 866,308 866,538 783,538 783,308 686,308"
      />
      <path
        fill={navy}
        fillRule="evenodd"
        d="M991,243 H1155 C1265,243 1343,305 1343,390 C1343,475 1265,538 1155,538 H991 Z M1074,307 H1155 C1215,307 1254,345 1254,392 C1254,439 1215,478 1155,478 H1074 Z"
      />
    </svg>
  );
}
