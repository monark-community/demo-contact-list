# Assets

## Photography

All photos are from Unsplash under the free [Unsplash License](https://unsplash.com/license) (none are Unsplash+; all were served from `images.unsplash.com`). They were resized to 2,000 px on the long edge, compressed (JPEG, quality 78), and are served from `public/images/` with `next/image`. Photographers are credited on `/credits`, linked from the footer.

| File | Unsplash page | Photographer | Profile | Used on |
|-|-|-|-|-|
| `public/images/campus.jpg` | https://unsplash.com/photos/J16r3dyRM-M | Dennis Zhang | https://unsplash.com/@windagh | Home, "Who keeps a TrustList": student associations; `/credits` |
| `public/images/working-group.jpg` | https://unsplash.com/photos/wR56AUlEsE4 | Andreea Avramescu | https://unsplash.com/@minakko | Home, "Who keeps a TrustList": DAO working groups; `/credits` |
| `public/images/studio.jpg` | https://unsplash.com/photos/kk4J92iaSBk | Vitaly Gariev | https://unsplash.com/@silverkblack | Home, "Who keeps a TrustList": freelancers and local shops; `/credits` |

## Monark brand assets

From `lovable-migration/brand-refs/` and the [monark-community/website](https://github.com/monark-community/website) repo, used per `monark-brand-guidelines.md`:

| File | Source | Used for |
|-|-|-|
| `public/brand/monark-mark.svg`, `src/app/icon.svg` | brand-refs `logos/svg/standalone/logo-branded-standalone.svg` | Header brand, favicon, wallet prompt, unlock gate, OG image |
| `public/brand/monark-horizontal-{light,dark}.svg` | website `public/vectors/brand/horizontal/` | Footer Monark band |
| `public/brand/monark-vertical-{light,dark}.svg` | brand-refs `logos/svg/vertical/` | 404 page |
| `public/brand/monark-mesh.svg` | website `public/vectors/decorative/monark-mesh.svg` | Home hero only (once per site) |
| `public/brand/socials/*.svg` | website `public/vectors/socials/` | Footer social links (recoloured to `foreground` through a CSS mask for contrast) |

## Built in code

- Resolving activity card (home hero), lookalike address diff (home and `/app/check`), app hub diagram (home), storage tiers, contact anatomy and check decision path (`/how-it-works`), miniature app screens (`/app/apps`): JSX/SVG with flat orange strokes, no gradients.
- Open Graph image: generated per locale with `next/og` (`src/app/[locale]/opengraph-image.tsx`).
- Wallet avatars: Jazzicon via the `@monark/ui` `wallet` component.
- Icons: [Lucide](https://lucide.dev).
- Type: Nunito Sans via `next/font/google`.
