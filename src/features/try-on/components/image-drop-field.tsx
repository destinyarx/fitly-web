import type { UseFormRegisterReturn } from "react-hook-form";

type ImageDropFieldProps = {
  readonly title: string;
  readonly hint: string;
  readonly registration: UseFormRegisterReturn;
  readonly fileName?: string;
  readonly error?: string;
};

/** Native file input styled as the mockup's dashed drop tile. Browsers accept drops on file inputs. */
export function ImageDropField({ error, fileName, hint, registration, title }: ImageDropFieldProps) {
  return (
    <label className="relative flex min-h-44 cursor-pointer flex-col items-center justify-center gap-[9px] rounded-[18px] bg-white px-4 py-[22px] text-center shadow-[inset_0_0_0_2px_rgba(74,42,184,.26)] transition-shadow focus-within:shadow-[inset_0_0_0_2px_#4A2AB8] hover:shadow-[inset_0_0_0_2px_#4A2AB8]">
      <span aria-hidden="true" className="flex size-[38px] items-center justify-center rounded-[13px] bg-violet/10">
        <svg width="18" height="18" viewBox="0 0 18 18"><path d="M9 12.5V3.5M5.6 6.6L9 3.2l3.4 3.4" fill="none" stroke="#4A2AB8" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /><path d="M3 12v2.2A1.8 1.8 0 004.8 16h8.4A1.8 1.8 0 0015 14.2V12" fill="none" stroke="#4A2AB8" strokeWidth="1.8" strokeLinecap="round" /></svg>
      </span>
      <span className="text-[13.5px] font-bold text-ink">{fileName ?? title}</span>
      <span className="text-[11.5px] font-medium text-text-tertiary">{fileName ? "Click to choose a different image" : hint}</span>
      <input type="file" accept="image/jpeg,image/png,image/webp" className="absolute inset-0 cursor-pointer opacity-0" {...registration} />
      {error ? <span className="text-xs font-bold text-coral-deep">{error}</span> : null}
    </label>
  );
}
