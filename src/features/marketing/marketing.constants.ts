export type HowItWorksStep = {
  readonly number: string;
  readonly timing: string;
  readonly title: string;
  readonly body: string;
  readonly image: { readonly src: string; readonly alt: string };
  readonly cardClassName: string;
  readonly chipClassName: string;
};

export const HOW_IT_WORKS_STEPS: readonly HowItWorksStep[] = [
  {
    number: "1",
    timing: "30 SEC, ONCE",
    title: "Set your mirror",
    body: "Upload one full-body photo in decent light. Fitly turns it into a private body template you reuse forever.",
    image: {
      src: "/landing/before.png",
      alt: "A full-body photo saved as a Fitly body template",
    },
    cardClassName: "bg-surface-raised",
    chipClassName: "bg-violet text-surface",
  },
  {
    number: "2",
    timing: "ANY STORE",
    title: "Bring a garment",
    body: "Paste a product link, upload a photo of the piece, or pull something you already own out of your closet.",
    image: {
      src: "/landing/garment.png",
      alt: "A product photo of a cropped bomber jacket",
    },
    cardClassName: "bg-marigold",
    chipClassName: "bg-ink text-marigold",
  },
  {
    number: "3",
    timing: "~20 SEC",
    title: "See it on you",
    body: "Fitly generates the garment on your template. Save it to Looks or download the image.",
    image: {
      src: "/landing/after.png",
      alt: "A generated try-on of the bomber jacket on the saved body template",
    },
    cardClassName: "bg-lilac",
    chipClassName: "bg-violet text-surface",
  },
];

export const MIRROR_FEATURES = [
  {
    title: "Garment in, look out",
    body: "Pick a body template, drop in a garment, get the generated try-on.",
  },
  {
    title: "Your photos stay yours",
    body: "Held on your device on mobile and in your own cloud drive on web.",
  },
  {
    title: "Handles what you throw at it",
    body: "Tops, dresses, outerwear, trousers — across body types and templates.",
  },
  {
    title: "Reusable templates",
    body: "Save a template once and run every new garment against it.",
  },
] as const;

export const MOBILE_FEATURES = [
  "Camera try-on, right in the shop",
  "Your closet and looks sync both ways",
  "Offline saves — review the queue later",
] as const;

export const TESTIMONIALS = [
  {
    text: "“I stopped ordering three sizes of everything. I just look at it on me first.”",
    name: "Mia R.",
    role: "Free plan · 2 months",
    avatarClassName: "bg-linear-140 from-peach-soft to-lilac",
  },
  {
    text: "“I can see exactly how a cropped jacket sits on me before it ships. That is all I wanted.”",
    name: "Priya S.",
    role: "Free plan · web",
    avatarClassName: "bg-linear-140 from-lilac to-violet-light",
  },
  {
    text: "“Feels less like an app and more like a friend who is honest about clothes.”",
    name: "Jo A.",
    role: "Android · 6 months",
    avatarClassName: "bg-linear-140 from-peach to-coral",
  },
] as const;

export type PricingPlan = {
  readonly name: string;
  readonly price: string;
  readonly per: string;
  readonly blurb: string;
  readonly cta: string;
  readonly features: readonly string[];
  readonly isLocked: boolean;
  readonly tone: "light" | "dark";
};

export const PRICING_PLANS: readonly PricingPlan[] = [
  {
    name: "Free",
    price: "$0",
    per: "forever",
    blurb: "Everything you need to stop guessing.",
    cta: "Start free",
    features: [
      "1 body template",
      "3 try-ons a day",
      "Unlimited saved looks",
      "Paste any product link",
    ],
    isLocked: false,
    tone: "light",
  },
  {
    name: "Fitly Plus",
    price: "$9",
    per: "/month",
    blurb: "For people who shop like it is a sport.",
    cta: "Coming soon",
    features: [
      "Unlimited try-ons",
      "3 body templates",
      "Outfit stacking",
      "Priority generation queue",
    ],
    isLocked: true,
    tone: "dark",
  },
  {
    name: "Studio",
    price: "$29",
    per: "/month",
    blurb: "For stylists and small labels.",
    cta: "Coming soon",
    features: [
      "Client body templates",
      "Shareable lookbooks",
      "Bulk catalogue import",
      "Commercial usage terms",
    ],
    isLocked: true,
    tone: "light",
  },
];

export const FAQS = [
  {
    question: "Do I need a full-body photo?",
    answer:
      "One is enough to start, and it gives the best results for dresses, trousers and anything long. A waist-up template still works for tops and jackets — it just shows less of the garment.",
  },
  {
    question: "How accurate is the try-on?",
    answer:
      "Fitly shows drape, length and proportion of the garment on your own body template. It is a generated image, not a tape measure — use it to judge look and proportion, and the brand chart for size.",
  },
  {
    question: "What happens to my photos?",
    answer:
      "They sit in private storage tied only to your account, are never used for training, and are deleted along with every generated look the moment you delete them.",
  },
  {
    question: "Which stores work?",
    answer:
      "Any product page with a clear garment image. Paste the link and Fitly pulls the photo and details — no retailer partnership needed.",
  },
  {
    question: "Is the mobile app different?",
    answer:
      "Same closet and same looks — the Android app adds camera try-on so you can shoot a piece on the rack in a shop. On web you upload or paste a link instead.",
  },
] as const;

export const NAV_LINKS = [
  { href: "#how", label: "How it works" },
  { href: "#mirror", label: "The mirror" },
  { href: "#mobile", label: "Mobile app" },
  { href: "#pricing", label: "Pricing" },
  { href: "#faq", label: "FAQ" },
] as const;
