# Fitly web design system

This is the source of truth for the web app's visual and interaction rules. It adapts the mobile design language to responsive browser layouts. The mobile project's screen geometry is reference material, not a fixed web canvas.

## 1. Voice

Fitly is a magic mirror with a companion, not a technical image-processing tool.

- Companion copy uses first person only inside a visually distinct companion bubble.
- Labels and buttons use direct second-person language.
- Keep messages warm, short, specific, and honest about timing.
- Explain queues, limits, and failures without blame. Always offer a next step.
- State accurately that web source images and generated looks are private files in the user's Google Drive. Generation temporarily stages selected sources in private Supabase Storage and sends them to the AI provider.

## 2. Color tokens

Use one light theme. Dark surfaces are intentional components, not a dark-mode variant.

| Token | Value | Use |
|---|---|---|
| `surface` | `#FFF6EC` | Main cream background. |
| `surface-raised` | `#FFFFFF` | Cards, inputs, and panels. |
| `ink` | `#1E1233` | Primary text and dark navigation. |
| `ink-deep` | `#140C28` | Full-bleed generation and result surfaces. |
| `violet` | `#4A2AB8` | Brand, links, companion UI, secondary action. |
| `violet-light` | `#5B36D6` | Brand gradient start. |
| `violet-dark` | `#3D1F9E` | Brand gradient end. |
| `marigold` | `#FFE066` | Highlight on violet or dark surfaces. |
| `coral` | `#FF5C8A` | Primary action gradient start. |
| `peach` | `#FF8A5C` | Primary action gradient end. |
| `coral-deep` | `#E1477F` | Destructive confirmation. |
| `lilac` | `#D9C6FF` | Supporting tile tint. |
| `lilac-soft` | `#F3E2FF` | Supporting surface. |
| `peach-soft` | `#FFD9C2` | Supporting tile tint. |
| `mint` | `#C9E8D8` | Privacy and data panels. |
| `text-secondary` | `#6C6180` | Supporting body copy. |
| `text-tertiary` | `#8A7F9B` | Captions and metadata. |
| `text-on-dark-muted` | `#A99CBE` | Muted text on dark surfaces. |

Rules:

- Use one coral primary action per view or modal.
- Use marigold only on violet or dark surfaces.
- Use `coral-deep` for destructive actions. Red is not part of the base palette.
- Do not encode success, warning, failure, or selection with color alone.

## 3. Typography

- Display: Bricolage Grotesque, weight 700 or 800, tight leading and slightly negative tracking.
- Body: Plus Jakarta Sans, weight 500 to 700.
- Load both through `next/font/google` in the root layout.
- Use responsive type with `clamp()` where a headline spans mobile and desktop sizes.
- Keep comfortable line length. Body copy should usually remain below 70 characters per line.

The signature headline uses one violet word that carries the user's stake, such as "you" or "fit". Do not color several words for decoration.

## 4. Shape and depth

| Token | Suggested radius | Use |
|---|---:|---|
| `pill` | `999px` | Chips, badges, and toggles. |
| `cta` | `28px` | Primary buttons and sheets. |
| `hero` | `26px` | Feature cards, dialogs, capture guide. |
| `card` | `24px` | Photo cards and companion bubbles. |
| `panel` | `22px` | Grouped panels. |
| `tile` | `20px` | Grid tiles and quick actions. |

The companion bubble has a smaller bottom-left corner. Reserve that shape for companion speech.

Use restrained colored shadows. Violet surfaces may cast a violet tint and coral actions may cast a coral tint. Avoid generic heavy gray drop shadows.

## 5. Responsive layout

- Narrow screens use a 20px gutter. Larger screens may use 24 to 32px.
- Keep content inside a deliberate max width. Do not stretch mobile cards across the browser.
- Use one column for capture and focused tasks. Lists may grow from two columns on phones to three or four on wide screens.
- Keep the main try-on action reachable without hiding page content behind it.
- Desktop layouts may show navigation and detail side by side when both remain readable.
- Mobile browser controls and safe-area insets must not cover fixed actions.

Use CSS Grid for page-level responsive layout and Flexbox for one-dimensional component alignment.

## 6. Components

### Actions

- Primary action: coral-to-peach gradient, 56px minimum height.
- Secondary action: solid violet or white, depending on the surface.
- Tertiary action: text or low-emphasis outline.
- Disabled controls remain readable and explain why when the reason is not obvious.
- Every interactive target is at least 44 by 44 CSS pixels unless native semantics provide a larger hit area.

### Companion bubble

Use violet fill, a bottom-left notch, a visible companion mark, and marigold emphasis. Generic content never uses the companion shape.

### Images

Use `next/image` for product and generated images when its optimization model fits. Preserve the designed aspect ratio and avoid layout shift with explicit dimensions or `fill` in a sized container.

Body-template, garment, and result images must not reveal a public Drive URL or provider token. Render them through authenticated responses with a private cache policy.

### Capture

Use a dark capture stage with a fashion-oriented body guide, clear permission messaging, camera selection when supported, and file-upload fallback. Do not imitate an identity-verification box.

Browser camera support varies. A denied or unavailable camera must leave the upload path usable.

## 7. Navigation

Core destinations are Looks, Closet, Try on, Me, and Settings.

- On narrow screens, use compact bottom navigation with Try on emphasized as an action.
- On desktop, use a persistent sidebar or top navigation when it improves wayfinding.
- Looks is the default authenticated destination.
- Unauthenticated users see public landing and auth routes, not the product navigation.
- OAuth redirects must preserve the in-progress try-on context across authentication and Drive reconnection.
- Sharing sends the image file through the Web Share API when supported and falls back to Download. Do not make the Drive file public.

## 8. States

Design each reachable state:

| State | Treatment |
|---|---|
| Empty Looks | Explain what will appear and provide the try-on action. |
| Empty Closet | Offer camera or file upload. Show retailer URL extraction as `Coming soon`. |
| Filtered to nothing | Keep filters visible and explain the empty result. |
| Generating | Dark focused surface with honest duration and progress semantics. |
| Queued | Calm status with position or estimate when trustworthy. |
| Generation failed | Explain the AI or provider failure, offer a new attempt, and state that quota was not consumed. |
| Drive delivery failed | Explain that generation succeeded, offer Drive-delivery retry, and state that the attempt remains counted. |
| Daily cap | Explain reset timing and keep unavailable actions visibly disabled. |
| Incompatible template | Keep it visible, disable selection, and state the pose rule. |
| Camera denied | Keep file upload available and explain how to restore permission. |
| Drive reconnect required | Keep the account active, explain the missing permission, and offer Reconnect Google Drive. |
| Drive file missing | Keep the record visible and offer Replace or Delete for a source, and Delete or Generate again for a look. |
| Recovery copy expired | Explain that Fitly no longer has the temporary output and that another generation is required. |
| Offline | Preserve safe local draft state and explain which action needs a connection. |

Skeletons should resemble the final layout. Do not replace known structure with a centered spinner.

## 9. Accessibility

- Prefer semantic HTML and native controls.
- Provide visible keyboard focus and a logical tab order.
- Dialogs must trap focus, name themselves, close with Escape when safe, and restore focus.
- Announce asynchronous generation changes through an appropriate live region without repeating every poll.
- Provide text alternatives for garment images and useful labels for body-template choices.
- Capture guidance must be available as text, not only as an overlay.
- Respect `prefers-reduced-motion`.
- Maintain WCAG AA contrast for text and meaningful controls.

## 10. Marketing and auth surfaces

These patterns are established by the landing page and the sign-in/sign-up screens. Reuse them rather than restating their values in new components.

### Shared components

- `shared/components/fitly-logo.tsx` — the wordmark plus the violet gradient tile. `tone="light"` on dark surfaces, `size="sm"` in footers.
- `shared/components/fitly-mark.tsx` — the hanger-and-spark glyph alone, for companion bubbles and small tiles.
- `shared/components/primary-cta.tsx` — the coral-to-peach link action at the 56px minimum height. One per view.
- `shared/components/icons.tsx` — check, lock, and Google marks used across marketing and auth.

### Section rhythm

Landing sections sit in a `max-width: 1240px` container with a 20px gutter that grows to 40px from the `md` breakpoint. Section headings pair a monospace eyebrow (12px, `0.12em` tracking, violet on light surfaces and marigold on `ink`) with a `clamp()` display heading. Multi-column section grids collapse to one column below `lg`; card grids step through two columns at `sm`.

### Accordions

FAQ-style disclosure uses native `<details name="…">` for exclusive open behavior, keyboard support, and focus handling. Style the open state with the `open:` and `group-open:` variants; do not build a client-side accordion.

### Auth screens

Sign-in and sign-up are one component with a `mode`, so the two screens cannot drift. The layout is a two-column grid: a dark editorial panel carrying the photo, hero copy, and the privacy line, and a white `34px` card. The editorial panel is hidden below `lg` — the card is the whole screen on a phone. The card leads with a pill tab pair (`Sign in` / `Create account`) that navigates between `/login` and `/signup` rather than toggling client state.

Google is the only sign-in control. Sign-up gates it behind two consent checkboxes; the disabled button keeps its label, and a visible hint (not color alone) says why it is unavailable. Callback failures return to `/login?error=…` and render as an alert above the card content.

## 11. Maintenance

Keep tokens in `src/app/globals.css` or a future typed token module aligned with this file. Update both when a token changes. Record deliberate differences from the mobile app here so later work does not accidentally reverse them.
