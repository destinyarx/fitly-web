type CheckIconProps = {
  readonly size?: number;
  readonly stroke: string;
};

export function CheckIcon({ size = 13, stroke }: CheckIconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 14 14" aria-hidden="true">
      <path
        d="M2 7.4l3.2 3.2L12 3.8"
        fill="none"
        stroke={stroke}
        strokeWidth="2.1"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

type LockIconProps = {
  readonly width?: number;
  readonly height?: number;
  readonly fill: string;
};

export function LockIcon({ fill, height = 15, width = 13 }: LockIconProps) {
  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 10 12"
      className="flex-none"
      aria-hidden="true"
    >
      <path
        d="M2.6 5V3.4a2.4 2.4 0 0 1 4.8 0V5"
        fill="none"
        stroke={fill}
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <rect x="1" y="5" width="8" height="6.2" rx="1.8" fill={fill} />
    </svg>
  );
}

export function GoogleIcon() {
  return (
    <svg
      width="19"
      height="19"
      viewBox="0 0 20 20"
      className="flex-none"
      aria-hidden="true"
    >
      <path
        d="M19.6 10.2c0-.68-.06-1.36-.18-2H10v3.8h5.4a4.6 4.6 0 01-2 3v2.5h3.2c1.9-1.75 3-4.3 3-7.3z"
        fill="#4285F4"
      />
      <path
        d="M10 20c2.7 0 5-.9 6.6-2.4l-3.2-2.5c-.9.6-2.05.95-3.4.95-2.6 0-4.8-1.75-5.6-4.15H1.1v2.6A10 10 0 0010 20z"
        fill="#34A853"
      />
      <path d="M4.4 11.9a6 6 0 010-3.8V5.5H1.1a10 10 0 000 9l3.3-2.6z" fill="#FBBC05" />
      <path
        d="M10 3.95c1.47 0 2.8.5 3.83 1.5l2.87-2.87C14.95.95 12.65 0 10 0 6.1 0 2.7 2.2 1.1 5.5l3.3 2.6C5.2 5.7 7.4 3.95 10 3.95z"
        fill="#EA4335"
      />
    </svg>
  );
}
