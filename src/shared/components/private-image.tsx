import Image from "next/image";

export function PrivateImage({ alt, id, kind }: { readonly alt: string; readonly id: string; readonly kind: "body-template" | "garment" | "look" }) {
  return <Image src={`/api/media/${kind}/${id}`} alt={alt} fill sizes="(max-width: 640px) 50vw, 260px" unoptimized className="object-cover" />;
}
