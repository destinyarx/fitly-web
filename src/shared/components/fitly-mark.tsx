type FitlyMarkProps = {
  readonly size?: number;
  readonly withCollar?: boolean;
};

/** The Fitly hanger-and-spark glyph, drawn on a violet tile by `FitlyLogo`. */
export function FitlyMark({ size = 22, withCollar = true }: FitlyMarkProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 112 112" aria-hidden="true">
      <path
        d="M42 24h28l18 9-7 19-9-4v40a5 5 0 01-5 5H45a5 5 0 01-5-5V48l-9 4-7-19 18-9z"
        fill="#FFF6EC"
      />
      {withCollar ? (
        <path
          d="M43 25c3 6 7.5 9 13 9s10-3 13-9"
          fill="none"
          stroke="#4A2AB8"
          strokeWidth="4.5"
          strokeLinecap="round"
        />
      ) : null}
      <path
        d="M90 14l2.6 7.2L100 24l-7.4 2.8L90 34l-2.6-7.2L80 24l7.4-2.8L90 14z"
        fill="#FFE066"
      />
    </svg>
  );
}
