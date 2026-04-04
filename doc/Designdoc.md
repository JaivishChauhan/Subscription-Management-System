<role>
You are an expert frontend engineer, UI/UX designer, visual design specialist, and typography expert. Your goal is to help the user integrate a design system into an existing codebase in a way that is visually consistent, maintainable, and idiomatic to their tech stack.

Before proposing or writing any code, first build a clear mental model of the current system:
- Identify the tech stack (e.g. React, Next.js, Vue, Tailwind, shadcn/ui, etc.).
- Understand the existing design tokens (colors, spacing, typography, radii, shadows), global styles, and utility patterns.
- Review the current component architecture (atoms/molecules/organisms, layout primitives, etc.) and naming conventions.
- Note any constraints (legacy CSS, design library in use, performance or bundle-size considerations).

Ask the user focused questions to understand the user's goals. Do they want:
- a specific component or page redesigned in the new style,
- existing components refactored to the new system, or
- new pages/features built entirely in the new style?

Once you understand the context and scope, do the following:
- Propose a concise implementation plan that follows best practices, prioritizing:
  - centralizing design tokens,
  - reusability and composability of components,
  - minimizing duplication and one-off styles,
  - long-term maintainability and clear naming.
- When writing code, match the user’s existing patterns (folder structure, naming, styling approach, and component patterns).
- Explain your reasoning briefly as you go, so the user understands *why* you’re making certain architectural or design choices.

Always aim to:
- Preserve or improve accessibility.
- Maintain visual consistency with the provided design system.
- Leave the codebase in a cleaner, more coherent state than you found it.
- Ensure layouts are responsive and usable across devices.
- Make deliberate, creative design choices (layout, motion, interaction details, and typography) that express the design system’s personality instead of producing a generic or boilerplate UI.

</role>

<design-system>
# Design Style: Corporate Trust

## 1. Design Philosophy
This style embodies the **modern enterprise SaaS aesthetic** — professional yet approachable, sophisticated yet friendly. It draws inspiration from tech unicorns and high-growth startups that have successfully humanized the corporate experience. The design rejects the cold, sterile formality of traditional corporate websites in favor of a warm, confident, and inviting presence.

**Core Principles:**
- **Trustworthy Yet Vibrant**: Establishes credibility through clean structure and professional typography while maintaining visual energy through vibrant gradients and colorful accents
- **Dimensional Depth**: Uses isometric perspectives, soft colored shadows, and subtle 3D transforms to create visual interest and break free from flat design
- **Refined Elegance**: Every element is polished with attention to micro-interactions, smooth transitions, and sophisticated hover states
- **Purposeful Gradients**: Indigo-to-violet gradients serve as the visual signature, used strategically in headlines, buttons, and decorative elements
- **Professional Polish**: Generous white space, consistent spacing rhythms, and crisp typography create a premium, enterprise-ready feel

**Keywords**: Trustworthy, Vibrant, Polished, Dimensional, Modern, Approachable, Enterprise-Ready, Elegant

**Visual DNA**: The unmistakable signature of this style comes from:
1. **Colored Shadows**: Soft shadows with blue/purple tints instead of neutral grays
2. **Isometric Elements**: Subtle 3D transforms (rotate-x, rotate-y) on decorative cards and visualizations
3. **Gradient Text**: Strategic use of gradient text for emphasis in headlines
4. **Soft Blobs**: Large, blurred gradient orbs in the background for atmospheric depth
5. **Elevated Cards**: White cards that lift on hover with enhanced shadows
6. **Dual-Tone Palette**: Indigo (primary) + Violet (secondary) creating a cohesive gradient spectrum

## 2. Design Token System

### Colors (Light Mode)
*   **Background**: `#F8FAFC` (Slate 50) - A very subtle cool grey/white base.
*   **Foreground (Surface)**: `#FFFFFF` (White) - For cards and raised elements.
*   **Primary**: `#4F46E5` (Indigo 600) - The core brand color. Vibrant blue-purple.
*   **Secondary**: `#7C3AED` (Violet 600) - For gradients and accents.
*   **Text Main**: `#0F172A` (Slate 900) - High contrast, sharp.
*   **Text Muted**: `#64748B` (Slate 500) - For supporting text.
*   **Accent/Success**: `#10B981` (Emerald 500) - For positive indicators.
*   **Border**: `#E2E8F0` (Slate 200) - Subtle separation.

### Typography
*   **Font Family**: `Plus Jakarta Sans` — A geometric sans-serif with friendly rounded terminals that perfectly balances professional authority with modern approachability. Its clean letterforms ensure excellent readability while maintaining visual warmth.
*   **Scaling**: Major Third (1.250) scale provides substantial hierarchy without overwhelming the layout
*   **Font Weights**:
    *   **Display/Headings**: ExtraBold (800) for hero headlines, Bold (700) for section headings
    *   **Subheadings**: SemiBold (600) for card titles and emphasis
    *   **Body Text**: Regular (400) for paragraphs, Medium (500) for navigation and labels
*   **Line Heights**:
    *   Headlines: 1.1 (tight tracking for impact)
    *   Body Text: 1.6-1.7 (relaxed for readability)
*   **Letter Spacing**: Tight tracking (-0.02em) on large headlines for modern polish
*   **Responsive Type Scale**:
    *   Mobile: text-2xl to text-4xl for h1
    *   Desktop: text-4xl to text-6xl for h1
    *   Progressive scaling ensures legibility across all devices

### Radius & Border
*   **Radius**: `rounded-xl` (12px) for cards and `rounded-lg` (8px) for inputs. Buttons are `rounded-full` or `rounded-lg`.
*   **Borders**: Thin, 1px borders using the `Border` token.

### Shadows & Effects
This is where the design truly shines. **Colored shadows** replace neutral grays to reinforce the brand palette:

*   **Default Card Shadow**: `0 4px 20px -2px rgba(79, 70, 229, 0.1)` — Soft blue-tinted base elevation
*   **Hover Card Shadow**: `0 10px 25px -5px rgba(79, 70, 229, 0.15), 0 8px 10px -6px rgba(79, 70, 229, 0.1)` — Multi-layer depth on interaction
*   **Button Shadow**: `0 4px 14px 0 rgba(79, 70, 229, 0.3)` — Strong presence for primary CTAs
*   **Glow Effects**: Numbered badges use `shadow-[0_0_20px_rgba(79,70,229,0.5)]` for ethereal glow
*   **Background Blobs**: Large gradient orbs with 3xl blur create atmospheric depth without distraction
    *   `blur-3xl filter` combined with low opacity (20-50%)
    *   Positioned absolutely to create layered depth
*   **Gradients**:
    *   **Primary Gradient**: `from-indigo-600 to-violet-600` — Used for buttons and active states
    *   **Text Gradient**: Combined with `bg-clip-text text-transparent` for striking headlines
    *   **Background Gradients**: Subtle `from-indigo-100 to-violet-100` for container backgrounds
    *   **Final CTA Background**: `from-indigo-900 to-indigo-950` for dramatic dark section

## 3. Component Stylings

### Buttons
*   **Primary**: Gradient background (Indigo to Violet). `rounded-full` or `rounded-lg`. White text. Slight shadow. Transition: Lift (`-translate-y-0.5`) and increase shadow on hover.
*   **Secondary**: White background, Border `E2E8F0`, Text `Slate 700`. Hover: `bg-slate-50` and darker border.

### Cards
*   **Base**: White background, `rounded-xl`, `border border-slate-100`, `shadow-soft`.
*   **Behavior**: On hover, slight lift and increased shadow intensity.
*   **Feature Cards**: May feature an icon in a soft-colored circle (bg-indigo-50 text-indigo-600).

### Inputs
*   **Style**: `bg-white`, `border-slate-200`, `rounded-lg`.
*   **Focus**: `ring-2 ring-indigo-500 ring-offset-1` and `border-indigo-500`.
*   **Label**: `text-sm font-semibold text-slate-700`.

## 4. Non-Generic Bold Choices

The Corporate Trust aesthetic stands out through deliberate, sophisticated design decisions:

### Isometric Depth & 3D Transforms
*   **Hero Card**: `perspective-[2000px]` parent with `rotate-x-[5deg] rotate-y-[-12deg]` child creates subtle isometric effect
*   **Hover Transforms**: `hover:rotate-x-[2deg] hover:rotate-y-[-8deg]` — Subtle 3D movement on interaction
*   **Feature Cards**: Alternating `rotate-y-[6deg]` and `rotate-y-[-6deg]` based on layout position
*   **Benefit Visualization**: `rotate-x-6 rotate-y-12 transform` on gradient container for dramatic depth

### Strategic Gradient Usage
*   **Split Headlines**: First 3 words in standard color, remaining words in gradient for visual hierarchy
*   **Gradient Buttons**: Full background gradient with hover lift (`-translate-y-0.5`)
*   **Badge Elements**: NEW badge with solid indigo background inside gradient-ringed container
*   **Final CTA**: White button on dark gradient background creates dramatic contrast

### Atmospheric Background Elements
*   **Blur Orbs**: Large (400-600px) circular gradients with heavy blur positioned absolutely
*   **Layered Positioning**: Multiple blobs at different z-indexes create depth
*   **Subtle Animation**: `animate-pulse duration-[4000ms]` on floating cards for gentle movement

### Elevated Card System
*   **Default State**: Soft colored shadow with subtle border
*   **Hover State**: Lift effect (`-translate-y-1`) combined with enhanced shadow
*   **Transition**: Smooth `duration-200` for professional polish
*   **Pricing Highlight**: Center card uses `md:scale-105` with special ring styling

### Micro-Interactions
*   **Arrow Icons**: `transition-transform group-hover:translate-x-1` for directional feedback
*   **Image Zoom**: `group-hover:scale-105` on blog images with overlay fade-in
*   **Chevron Rotation**: `group-open:rotate-180` for FAQ accordions
*   **Button Lift**: Subtle upward movement on hover reinforces clickability

## 5. Spacing & Layout
*   **Container**: `max-w-7xl` (1280px) provides spacious, enterprise-appropriate width
*   **Padding**: Responsive padding with `px-4 sm:px-6` pattern for consistent gutters
*   **Vertical Rhythm**:
    *   Mobile: `py-16` (64px)
    *   Tablet: `sm:py-20` (80px)
    *   Desktop: `lg:py-24` (96px)
*   **Section Spacing**: Generous white space between sections creates breathing room
*   **Grid Strategy**:
    *   Hero: Two-column `lg:grid-cols-2` with text-first approach
    *   Features: Alternating zig-zag with `lg:flex-row` and `lg:flex-row-reverse`
    *   Pricing: Three-column `md:grid-cols-3` with center emphasis
    *   Stats: Four-column `md:grid-cols-4` for metric display
*   **Responsive Breakpoints**:
    *   Mobile-first approach with progressive enhancement
    *   sm: 640px, md: 768px, lg: 1024px, xl: 1280px
*   **Text Width Constraints**: `max-w-xl` or `max-w-2xl` on paragraphs to maintain 60-75 character line lengths

## 6. Animation & Transitions
*   **Philosophy**: "Refined Motion" — Smooth, professional, never jarring
*   **Base Transition**: `transition-all duration-200` for general interactive elements
*   **Long Transitions**: `duration-500` for image zooms and complex animations
*   **Hover Effects**:
    *   Cards: Combine `hover:-translate-y-1` with shadow enhancement
    *   Buttons: `hover:-translate-y-0.5` for subtle lift
    *   Icons: `transition-transform group-hover:translate-x-1` for directional cues
*   **Easing**: Default `ease-out` for natural deceleration
*   **Pulse Animation**: `animate-pulse duration-[4000ms]` on decorative floating elements for gentle breathing effect
*   **State Changes**: Smooth color transitions on links and buttons reinforce interactivity

## 7. Iconography
*   **Library**: `lucide-react` for consistent, modern icon system
*   **Style**:
    *   Default stroke width: `2px` (standard)
    *   Size: `h-4 w-4` for inline icons, `h-5 w-5` or `h-6 w-6` for featured icons
    *   Joins: Rounded for friendliness
*   **Color Treatment**:
    *   **Badge Icons**: Icon in `text-indigo-600` on `bg-indigo-100` container
    *   **Navigation Icons**: Inherit text color, transition on hover
    *   **Social Icons**: `text-slate-400 hover:text-indigo-400`
*   **Icon Containers**:
    *   Small badges: `h-12 w-12 rounded-xl` with soft background
    *   Large features: `h-14 w-14 rounded-xl` for prominent sections
    *   Circular: `rounded-full` for avatars or status indicators
*   **Accessibility**: Icons are decorative with proper text alternatives or hidden from screen readers when paired with text

## 8. Responsive Strategy
*   **Mobile-First Philosophy**: Design begins at 375px width, progressively enhances
*   **Touch Targets**: Minimum 44x44px for all interactive elements (buttons, links)
*   **Typography Scaling**:
    *   Headlines reduce from `text-6xl` (desktop) to `text-4xl` (mobile)
    *   Body text maintains readability at `text-base` with responsive line heights
*   **Layout Adaptations**:
    *   Two-column layouts stack to single column on mobile
    *   Navigation collapses to essential items (login hidden on mobile)
    *   Pricing cards stack vertically with equal width
    *   Footer columns stack progressively (4 col → 2 col → 1 col)
*   **Spacing Compression**: Padding and margins reduce proportionally on smaller screens
*   **Image Optimization**: Aspect ratios maintained, sizes adapt to container width
*   **Horizontal Scrolling**: Never required; all content fits viewport width
*   **Visual Hierarchy Preserved**: Even on mobile, clear distinction between heading levels maintained

## 9. Accessibility & Best Practices
*   **Color Contrast**: All text meets WCAG AA standards
    *   Slate 900 on Slate 50 background: AAA compliant
    *   White text on Indigo 900 background: AAA compliant
    *   Link colors tested for 4.5:1 minimum ratio
*   **Focus States**:
    *   Visible ring on all interactive elements: `focus-visible:ring-2 focus-visible:ring-indigo-500`
    *   Ring offset for clarity: `focus-visible:ring-offset-2`
    *   Never remove focus indicators
*   **Semantic HTML**:
    *   Proper heading hierarchy (h1 → h2 → h3)
    *   Native `<button>` elements for interactive actions
    *   `<nav>` for navigation, `<footer>` for footer
    *   Details/summary for FAQ accordions
*   **Image Alt Text**: Descriptive alternatives for all images
*   **Interactive States**:
    *   Hover: Visual feedback on all clickable elements
    *   Active: Subtle state change on click
    *   Disabled: Reduced opacity with `pointer-events-none`
*   **Motion Preferences**: Consider `prefers-reduced-motion` for users sensitive to animation
*   **Screen Reader Support**: Proper ARIA labels where semantic HTML insufficient
</design-system>

# UI Design System & Frontend Design Document
## Subscription Management System

**Version:** 1.0  
**Style:** Corporate Trust  
**Theme:** Light & Dark Mode  
**Last Updated:** April 2026

---

## Table of Contents

1. [Design Philosophy](#1-design-philosophy)
2. [Design Token System](#2-design-token-system)
   - 2.1 [Color Palette — Light Mode](#21-color-palette--light-mode)
   - 2.2 [Color Palette — Dark Mode](#22-color-palette--dark-mode)
   - 2.3 [Semantic Color Tokens](#23-semantic-color-tokens)
   - 2.4 [Typography](#24-typography)
   - 2.5 [Spacing Scale](#25-spacing-scale)
   - 2.6 [Border Radius](#26-border-radius)
   - 2.7 [Shadows & Effects](#27-shadows--effects)
3. [Theming Architecture](#3-theming-architecture)
4. [Component Design Specs](#4-component-design-specs)
   - 4.1 [Buttons](#41-buttons)
   - 4.2 [Cards](#42-cards)
   - 4.3 [Form Inputs](#43-form-inputs)
   - 4.4 [Badges & Tags](#44-badges--tags)
   - 4.5 [Navigation](#45-navigation)
   - 4.6 [Tables](#46-tables)
   - 4.7 [Modals & Dialogs](#47-modals--dialogs)
   - 4.8 [Status Indicators](#48-status-indicators)
5. [Page-Level Design Specs](#5-page-level-design-specs)
   - 5.1 [Landing / Home](#51-landing--home)
   - 5.2 [Pricing Page](#52-pricing-page)
   - 5.3 [Product Detail Page](#53-product-detail-page)
   - 5.4 [Cart Page](#54-cart-page)
   - 5.5 [Checkout Page](#55-checkout-page)
   - 5.6 [Thank You Page](#56-thank-you-page)
   - 5.7 [Admin / Internal Dashboard](#57-admin--internal-dashboard)
   - 5.8 [Quotation Template Page](#58-quotation-template-page)
6. [Animation & Motion System](#6-animation--motion-system)
7. [Iconography](#7-iconography)
8. [Responsive Strategy](#8-responsive-strategy)
9. [Accessibility Standards](#9-accessibility-standards)
10. [Tailwind CSS Configuration](#10-tailwind-css-configuration)
11. [Global CSS Variables](#11-global-css-variables)

---

## 1. Design Philosophy

The Subscription Management System uses the **Corporate Trust** aesthetic — a modern enterprise SaaS style that is professional yet approachable, sophisticated yet warm. It rejects cold, sterile corporate UI in favor of a confident, vibrant presence built on dimensional depth and purposeful gradients.

### Core Principles

| Principle | Description |
|-----------|-------------|
| **Trustworthy Yet Vibrant** | Clean structure and professional typography balanced with indigo-violet gradients and colorful accents |
| **Dimensional Depth** | Isometric perspectives, soft colored shadows, and subtle 3D transforms create visual interest |
| **Refined Elegance** | Polished micro-interactions, smooth transitions, and generous white space signal premium quality |
| **Purposeful Gradients** | Indigo-to-violet gradients are the visual signature — used strategically in CTAs, headlines, and key UI moments |
| **Dual-Theme Integrity** | Every design decision is made with both Light and Dark modes in mind — no mode is an afterthought |

### Visual DNA

1. **Colored Shadows** — Soft shadows with blue/purple tints replace neutral grays
2. **Gradient Text** — Strategic gradient text in hero headlines and key headings
3. **Soft Background Blobs** — Large blurred gradient orbs for atmospheric depth
4. **Elevated Cards** — White/dark-surface cards that lift on hover with enhanced shadows
5. **Isometric Depth** — Subtle 3D transforms on decorative elements
6. **Dual-Tone Palette** — Indigo (primary) + Violet (secondary) forming a cohesive gradient spectrum

---

## 2. Design Token System

### 2.1 Color Palette — Light Mode

| Token Name | Hex | Tailwind Class | Usage |
|------------|-----|----------------|-------|
| `background` | `#F8FAFC` | `slate-50` | Page background |
| `surface` | `#FFFFFF` | `white` | Cards, modals, raised elements |
| `surface-muted` | `#F1F5F9` | `slate-100` | Subtle section backgrounds |
| `primary` | `#4F46E5` | `indigo-600` | Primary brand color, buttons, links |
| `primary-hover` | `#4338CA` | `indigo-700` | Primary hover state |
| `secondary` | `#7C3AED` | `violet-600` | Gradient endpoint, accents |
| `text-main` | `#0F172A` | `slate-900` | Primary body text, headings |
| `text-muted` | `#64748B` | `slate-500` | Supporting text, captions |
| `text-subtle` | `#94A3B8` | `slate-400` | Placeholders, disabled text |
| `accent-success` | `#10B981` | `emerald-500` | Success states, active badges |
| `accent-warning` | `#F59E0B` | `amber-500` | Warning indicators |
| `accent-error` | `#EF4444` | `red-500` | Error states, destructive actions |
| `border` | `#E2E8F0` | `slate-200` | Default borders |
| `border-focus` | `#4F46E5` | `indigo-500` | Focus ring color |

### 2.2 Color Palette — Dark Mode

| Token Name | Hex | Tailwind Class | Usage |
|------------|-----|----------------|-------|
| `background` | `#0A0F1E` | custom | Deep navy page background |
| `surface` | `#111827` | `gray-900` | Card and container surface |
| `surface-muted` | `#1E293B` | `slate-800` | Subtle section backgrounds |
| `primary` | `#6366F1` | `indigo-500` | Primary — slightly lighter for dark bg contrast |
| `primary-hover` | `#818CF8` | `indigo-400` | Primary hover on dark |
| `secondary` | `#8B5CF6` | `violet-500` | Gradient endpoint on dark |
| `text-main` | `#F1F5F9` | `slate-100` | Primary text on dark |
| `text-muted` | `#94A3B8` | `slate-400` | Supporting text on dark |
| `text-subtle` | `#64748B` | `slate-500` | Placeholders on dark |
| `accent-success` | `#34D399` | `emerald-400` | Success on dark |
| `accent-warning` | `#FBBF24` | `amber-400` | Warning on dark |
| `accent-error` | `#F87171` | `red-400` | Error on dark |
| `border` | `#1E293B` | `slate-800` | Borders on dark |
| `border-focus` | `#6366F1` | `indigo-500` | Focus ring on dark |

### 2.3 Semantic Color Tokens

These are the CSS custom properties to use across the codebase, resolving automatically based on the active theme:

```css
/* Usage: var(--color-background), bg-background, text-foreground, etc. */

--color-background      /* Page base */
--color-surface         /* Card / raised surface */
--color-surface-muted   /* Subtle section background */
--color-primary         /* Brand primary */
--color-primary-hover   /* Brand primary hover */
--color-secondary       /* Gradient secondary */
--color-text-main       /* Primary text */
--color-text-muted      /* Supporting text */
--color-text-subtle     /* Placeholder/disabled */
--color-border          /* Default border */
--color-border-focus    /* Focus ring */
--color-success         /* Positive state */
--color-warning         /* Alert state */
--color-error           /* Destructive state */
```

### 2.4 Typography

**Font Family:** `Plus Jakarta Sans`  
Import via Google Fonts or self-host via `next/font/google`.

```tsx
// app/layout.tsx
import { Plus_Jakarta_Sans } from 'next/font/google'

const jakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-jakarta',
})
```

#### Type Scale

| Element | Size (Mobile) | Size (Desktop) | Weight | Line Height | Letter Spacing |
|---------|--------------|----------------|--------|-------------|----------------|
| Hero H1 | `text-4xl` (36px) | `text-6xl` (60px) | 800 | 1.1 | -0.02em |
| Section H2 | `text-3xl` (30px) | `text-4xl` (36px) | 700 | 1.2 | -0.01em |
| Card H3 | `text-xl` (20px) | `text-2xl` (24px) | 600 | 1.3 | 0 |
| Subheading H4 | `text-lg` (18px) | `text-xl` (20px) | 600 | 1.4 | 0 |
| Body Large | `text-lg` (18px) | `text-lg` (18px) | 400 | 1.7 | 0 |
| Body Default | `text-base` (16px) | `text-base` (16px) | 400 | 1.6 | 0 |
| Body Small | `text-sm` (14px) | `text-sm` (14px) | 400 | 1.5 | 0 |
| Label | `text-sm` (14px) | `text-sm` (14px) | 600 | 1.4 | 0.01em |
| Caption / Muted | `text-xs` (12px) | `text-xs` (12px) | 400 | 1.4 | 0 |

#### Gradient Text Pattern

```tsx
// Used on hero headlines and key section titles
<span className="bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent dark:from-indigo-400 dark:to-violet-400">
  Gradient Word
</span>
```

**Rule:** Apply gradient to the last 2–3 words of a headline, not the entire string, for visual hierarchy.

### 2.5 Spacing Scale

Follows Tailwind's default 4px base unit. Key values:

| Token | Value | Usage |
|-------|-------|-------|
| `space-1` | 4px | Icon gaps, micro spacing |
| `space-2` | 8px | Internal element padding |
| `space-3` | 12px | Compact padding |
| `space-4` | 16px | Default element padding |
| `space-6` | 24px | Card padding |
| `space-8` | 32px | Section inner padding |
| `space-12` | 48px | Between major elements |
| `space-16` | 64px | Mobile section vertical padding |
| `space-20` | 80px | Tablet section vertical padding |
| `space-24` | 96px | Desktop section vertical padding |

### 2.6 Border Radius

| Token | Value | Usage |
|-------|-------|-------|
| `rounded-sm` | 4px | Small tags, badges |
| `rounded-md` | 6px | Small buttons, chips |
| `rounded-lg` | 8px | Inputs, secondary buttons |
| `rounded-xl` | 12px | Cards, panels, containers |
| `rounded-2xl` | 16px | Large feature cards |
| `rounded-full` | 9999px | Primary buttons, avatars, pill badges |

### 2.7 Shadows & Effects

#### Light Mode Shadows

```css
/* Card default */
--shadow-card: 0 4px 20px -2px rgba(79, 70, 229, 0.10);

/* Card hover */
--shadow-card-hover: 0 10px 25px -5px rgba(79, 70, 229, 0.15),
                     0 8px 10px -6px rgba(79, 70, 229, 0.10);

/* Button CTA */
--shadow-btn: 0 4px 14px 0 rgba(79, 70, 229, 0.30);

/* Glow badge */
--shadow-glow: 0 0 20px rgba(79, 70, 229, 0.50);

/* Modal */
--shadow-modal: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
```

#### Dark Mode Shadows

```css
/* Card default — darker tinted */
--shadow-card: 0 4px 20px -2px rgba(99, 102, 241, 0.15);

/* Card hover */
--shadow-card-hover: 0 10px 25px -5px rgba(99, 102, 241, 0.25),
                     0 8px 10px -6px rgba(99, 102, 241, 0.15);

/* Button CTA */
--shadow-btn: 0 4px 14px 0 rgba(99, 102, 241, 0.40);

/* Glow badge */
--shadow-glow: 0 0 24px rgba(99, 102, 241, 0.60);
```

#### Background Blob Pattern

```tsx
{/* Atmospheric depth blobs — used in hero and CTA sections */}
<div className="absolute inset-0 overflow-hidden pointer-events-none">
  <div className="absolute -top-40 -right-40 w-[500px] h-[500px] rounded-full
                  bg-gradient-to-br from-indigo-400/20 to-violet-400/20
                  dark:from-indigo-600/20 dark:to-violet-600/20
                  blur-3xl" />
  <div className="absolute -bottom-40 -left-40 w-[400px] h-[400px] rounded-full
                  bg-gradient-to-tr from-violet-400/15 to-indigo-400/15
                  dark:from-violet-600/15 dark:to-indigo-600/15
                  blur-3xl animate-pulse [animation-duration:4000ms]" />
</div>
```

---

## 3. Theming Architecture

### Implementation Strategy: `next-themes` + Tailwind `darkMode: 'class'`

```bash
npm install next-themes
```

```ts
// tailwind.config.ts
export default {
  darkMode: 'class',   // Toggled via <html class="dark">
  // ...
}
```

```tsx
// app/layout.tsx
import { ThemeProvider } from 'next-themes'

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}
```

### Theme Toggle Component

```tsx
// components/ui/ThemeToggle.tsx
'use client'
import { useTheme } from 'next-themes'
import { Sun, Moon } from 'lucide-react'

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  return (
    <button
      onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
      className="p-2 rounded-lg text-slate-500 hover:text-indigo-600
                 hover:bg-indigo-50 dark:hover:bg-indigo-950
                 dark:text-slate-400 dark:hover:text-indigo-400
                 transition-all duration-200 focus-visible:ring-2
                 focus-visible:ring-indigo-500 focus-visible:ring-offset-2"
      aria-label="Toggle theme"
    >
      <Sun className="h-5 w-5 hidden dark:block" />
      <Moon className="h-5 w-5 block dark:hidden" />
    </button>
  )
}
```

### Theming Pattern Convention

Always pair light and dark utilities together using the `dark:` prefix:

```tsx
// ✅ Correct pattern
className="bg-white dark:bg-gray-900 text-slate-900 dark:text-slate-100 border-slate-200 dark:border-slate-800"

// ❌ Avoid
className="bg-white text-slate-900"   // Missing dark mode handling
```

---

## 4. Component Design Specs

### 4.1 Buttons

#### Primary Button

```tsx
<button className="
  inline-flex items-center gap-2 px-6 py-2.5
  bg-gradient-to-r from-indigo-600 to-violet-600
  hover:from-indigo-700 hover:to-violet-700
  text-white font-semibold text-sm rounded-full
  shadow-[0_4px_14px_0_rgba(79,70,229,0.30)]
  hover:shadow-[0_6px_20px_0_rgba(79,70,229,0.40)]
  hover:-translate-y-0.5
  transition-all duration-200
  focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2
  dark:shadow-[0_4px_14px_0_rgba(99,102,241,0.40)]
">
  Get Started
</button>
```

#### Secondary Button

```tsx
<button className="
  inline-flex items-center gap-2 px-6 py-2.5
  bg-white dark:bg-gray-900
  border border-slate-200 dark:border-slate-700
  text-slate-700 dark:text-slate-200
  font-semibold text-sm rounded-full
  hover:bg-slate-50 dark:hover:bg-slate-800
  hover:border-slate-300 dark:hover:border-slate-600
  hover:-translate-y-0.5
  transition-all duration-200
  focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2
">
  Learn More
</button>
```

#### Destructive Button

```tsx
<button className="
  inline-flex items-center gap-2 px-6 py-2.5
  bg-red-500 hover:bg-red-600
  text-white font-semibold text-sm rounded-lg
  transition-all duration-200
  focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2
">
  Delete
</button>
```

#### Ghost / Icon Button

```tsx
<button className="
  p-2 rounded-lg
  text-slate-500 dark:text-slate-400
  hover:text-indigo-600 dark:hover:text-indigo-400
  hover:bg-indigo-50 dark:hover:bg-indigo-950/50
  transition-all duration-200
">
  <Icon className="h-5 w-5" />
</button>
```

---

### 4.2 Cards

#### Base Card

```tsx
<div className="
  bg-white dark:bg-gray-900
  border border-slate-100 dark:border-slate-800
  rounded-xl p-6
  shadow-[0_4px_20px_-2px_rgba(79,70,229,0.10)]
  dark:shadow-[0_4px_20px_-2px_rgba(99,102,241,0.15)]
  hover:shadow-[0_10px_25px_-5px_rgba(79,70,229,0.15)]
  dark:hover:shadow-[0_10px_25px_-5px_rgba(99,102,241,0.25)]
  hover:-translate-y-1
  transition-all duration-200
">
  {/* content */}
</div>
```

#### Feature / Stat Card

```tsx
<div className="bg-white dark:bg-gray-900 rounded-xl p-6 border border-slate-100 dark:border-slate-800 ...">
  {/* Icon container */}
  <div className="h-12 w-12 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 flex items-center justify-center mb-4">
    <Icon className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
  </div>
  <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-1">Card Title</h3>
  <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">Description text goes here.</p>
</div>
```

#### Pricing Card — Highlighted (Center / Popular)

```tsx
<div className="
  relative md:scale-105
  bg-gradient-to-b from-indigo-600 to-violet-700
  text-white rounded-2xl p-8
  shadow-[0_20px_40px_-10px_rgba(79,70,229,0.40)]
  ring-2 ring-indigo-400/50
">
  <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1
                   bg-gradient-to-r from-amber-400 to-orange-400
                   text-xs font-bold rounded-full text-slate-900 uppercase tracking-wider">
    Most Popular
  </span>
  {/* content */}
</div>
```

---

### 4.3 Form Inputs

#### Text Input

```tsx
<div className="space-y-1.5">
  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">
    Email Address
  </label>
  <input
    type="email"
    placeholder="you@example.com"
    className="
      w-full px-4 py-2.5 text-sm rounded-lg
      bg-white dark:bg-gray-900
      border border-slate-200 dark:border-slate-700
      text-slate-900 dark:text-slate-100
      placeholder:text-slate-400 dark:placeholder:text-slate-600
      focus:outline-none
      focus:ring-2 focus:ring-indigo-500 focus:ring-offset-1
      dark:focus:ring-indigo-400
      focus:border-indigo-500 dark:focus:border-indigo-400
      transition-all duration-200
    "
  />
  {/* Error state */}
  <p className="text-xs text-red-500 dark:text-red-400">Error message here</p>
</div>
```

#### Select / Dropdown

```tsx
<select className="
  w-full px-4 py-2.5 text-sm rounded-lg
  bg-white dark:bg-gray-900
  border border-slate-200 dark:border-slate-700
  text-slate-900 dark:text-slate-100
  focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-1
  dark:focus:ring-indigo-400
  transition-all duration-200 appearance-none cursor-pointer
">
  <option>Monthly</option>
  <option>Yearly</option>
</select>
```

#### Textarea

```tsx
<textarea className="
  w-full px-4 py-3 text-sm rounded-lg resize-none
  bg-white dark:bg-gray-900
  border border-slate-200 dark:border-slate-700
  text-slate-900 dark:text-slate-100
  placeholder:text-slate-400
  focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-1
  transition-all duration-200
" rows={4} />
```

---

### 4.4 Badges & Tags

#### Status Badges

```tsx
// Active / Success
<span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold
                 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400
                 border border-emerald-200 dark:border-emerald-800">
  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
  Active
</span>

// Draft
<span className="... bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700">
  Draft
</span>

// Overdue / Error
<span className="... bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-400 border-red-200 dark:border-red-800">
  Overdue
</span>

// Pending / Warning
<span className="... bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800">
  Pending
</span>
```

#### Subscription Lifecycle Badge Colors

| Status | Light | Dark |
|--------|-------|------|
| Draft | `bg-slate-100 text-slate-600` | `bg-slate-800 text-slate-400` |
| Quotation | `bg-blue-50 text-blue-700` | `bg-blue-950/40 text-blue-400` |
| Confirmed | `bg-indigo-50 text-indigo-700` | `bg-indigo-950/40 text-indigo-400` |
| Active | `bg-emerald-50 text-emerald-700` | `bg-emerald-950/40 text-emerald-400` |
| Closed | `bg-slate-100 text-slate-500` | `bg-slate-800 text-slate-500` |

#### Invoice Status Badge Colors

| Status | Light | Dark |
|--------|-------|------|
| Draft | `bg-slate-100 text-slate-600` | `bg-slate-800 text-slate-400` |
| Confirmed | `bg-indigo-50 text-indigo-700` | `bg-indigo-950/40 text-indigo-400` |
| Paid | `bg-emerald-50 text-emerald-700` | `bg-emerald-950/40 text-emerald-400` |
| Cancelled | `bg-red-50 text-red-600` | `bg-red-950/40 text-red-400` |

---

### 4.5 Navigation

#### Top Navigation Bar

```tsx
<nav className="
  sticky top-0 z-50 w-full
  bg-white/80 dark:bg-gray-900/80
  backdrop-blur-md
  border-b border-slate-200 dark:border-slate-800
  transition-colors duration-200
">
  <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
    {/* Logo */}
    <a href="/" className="flex items-center gap-2">
      <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-indigo-600 to-violet-600" />
      <span className="font-bold text-slate-900 dark:text-slate-100 text-lg">SubsMS</span>
    </a>

    {/* Nav links */}
    <div className="hidden md:flex items-center gap-6">
      <a href="/" className="text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">Home</a>
      <a href="/pricing" className="text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">Pricing</a>
      <a href="/shop" className="text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">Shop</a>
    </div>

    {/* Right actions */}
    <div className="flex items-center gap-3">
      <ThemeToggle />
      <a href="/account" className="text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors hidden md:block">My Account</a>
      <a href="/cart" className="relative p-2 rounded-lg hover:bg-indigo-50 dark:hover:bg-indigo-950/50 transition-colors">
        <ShoppingCart className="h-5 w-5 text-slate-700 dark:text-slate-300" />
        <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-gradient-to-br from-indigo-600 to-violet-600 text-white text-[10px] font-bold flex items-center justify-center">3</span>
      </a>
    </div>
  </div>
</nav>
```

#### Admin Sidebar

```tsx
// Sidebar item — active
<a className="flex items-center gap-3 px-4 py-2.5 rounded-xl
              bg-indigo-50 dark:bg-indigo-950/50
              text-indigo-700 dark:text-indigo-400 font-semibold text-sm">
  <Icon className="h-5 w-5" />
  Subscriptions
</a>

// Sidebar item — inactive
<a className="flex items-center gap-3 px-4 py-2.5 rounded-xl
              text-slate-600 dark:text-slate-400
              hover:bg-slate-100 dark:hover:bg-slate-800
              hover:text-slate-900 dark:hover:text-slate-200
              font-medium text-sm transition-all duration-200">
  <Icon className="h-5 w-5" />
  Invoices
</a>
```

---

### 4.6 Tables

```tsx
<div className="rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
  <table className="w-full text-sm">
    <thead>
      <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800">
        <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
          Column
        </th>
      </tr>
    </thead>
    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
      <tr className="bg-white dark:bg-gray-900 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors duration-150">
        <td className="px-4 py-3 text-slate-900 dark:text-slate-100">Cell value</td>
      </tr>
    </tbody>
  </table>
</div>
```

---

### 4.7 Modals & Dialogs

```tsx
{/* Overlay */}
<div className="fixed inset-0 z-50 bg-black/40 dark:bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
  {/* Panel */}
  <div className="
    w-full max-w-lg
    bg-white dark:bg-gray-900
    rounded-2xl
    shadow-[0_25px_50px_-12px_rgba(0,0,0,0.25)]
    dark:shadow-[0_25px_50px_-12px_rgba(0,0,0,0.60)]
    border border-slate-100 dark:border-slate-800
    p-6
  ">
    <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-1">Modal Title</h2>
    <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">Supporting description text.</p>
    {/* content */}
    <div className="flex gap-3 justify-end mt-6">
      {/* Cancel + Confirm buttons */}
    </div>
  </div>
</div>
```

---

### 4.8 Status Indicators

#### Subscription Lifecycle Progress Bar

```tsx
const steps = ['Draft', 'Quotation', 'Confirmed', 'Active', 'Closed']
const currentStep = 3 // 0-indexed

<div className="flex items-center gap-0">
  {steps.map((step, i) => (
    <div key={step} className="flex items-center">
      <div className={`flex items-center justify-center h-8 w-8 rounded-full text-xs font-bold
        ${i < currentStep ? 'bg-gradient-to-br from-indigo-600 to-violet-600 text-white' :
          i === currentStep ? 'bg-indigo-600 text-white ring-4 ring-indigo-100 dark:ring-indigo-950' :
          'bg-slate-100 dark:bg-slate-800 text-slate-400'}`}>
        {i < currentStep ? <Check className="h-4 w-4" /> : i + 1}
      </div>
      <span className={`ml-2 text-xs font-medium hidden sm:block
        ${i <= currentStep ? 'text-slate-900 dark:text-slate-100' : 'text-slate-400'}`}>
        {step}
      </span>
      {i < steps.length - 1 && (
        <div className={`h-0.5 w-8 mx-2 ${i < currentStep ? 'bg-indigo-600' : 'bg-slate-200 dark:bg-slate-700'}`} />
      )}
    </div>
  ))}
</div>
```

---

## 5. Page-Level Design Specs

### 5.1 Landing / Home

**Layout:** Full-width with `max-w-7xl` container  
**Sections:** Hero → Feature Highlights → Trusted By / Stats → CTA Banner

#### Hero Section

- **Background:** `bg-slate-50 dark:bg-[#0A0F1E]` with 2 atmospheric blob overlays
- **Layout:** Two-column grid (`lg:grid-cols-2`), text left, visual right
- **Headline:** Split gradient pattern — first phrase normal, last phrase indigo-to-violet gradient
- **Subtext:** `max-w-lg text-lg text-slate-500 dark:text-slate-400 leading-relaxed`
- **CTA Row:** Primary gradient button + secondary outline button with gap-4
- **Right Visual:** Isometric card with `perspective-[2000px]` parent, child `rotate-x-[5deg] rotate-y-[-12deg]`, showing a mini dashboard preview

```
┌─────────────────────────────────────────────┐
│  [blob top-right]         [blob bottom-left] │
│                                              │
│  Manage Subscriptions      ╔═══════════════╗ │
│  at Scale. With            ║  [Dashboard   ║ │
│  [gradient: Confidence.]   ║   preview     ║ │
│                            ║   card 3D]    ║ │
│  [Primary CTA] [Secondary] ╚═══════════════╝ │
└─────────────────────────────────────────────┘
```

#### Stats Bar

- 4-column grid: Active Subscriptions / Revenue / Invoices Generated / Uptime
- Each stat: large bold number with gradient, label below in muted text

#### Dark CTA Banner

- `bg-gradient-to-r from-indigo-900 to-indigo-950` (both modes)
- White headline + muted indigo subtext + white outlined button

---

### 5.2 Pricing Page

**Route:** `/pricing`  
**Layout:** Centered, max-w-5xl  
**Sections:** Header → Billing Toggle → 3 Pricing Cards

#### Billing Toggle

```tsx
<div className="flex items-center gap-3 p-1 bg-slate-100 dark:bg-slate-800 rounded-full w-fit mx-auto">
  <button className={`px-5 py-2 rounded-full text-sm font-semibold transition-all duration-200
    ${billing === 'monthly'
      ? 'bg-white dark:bg-gray-900 text-slate-900 dark:text-slate-100 shadow-sm'
      : 'text-slate-500 dark:text-slate-400'}`}>
    Monthly
  </button>
  <button className={`... ${billing === 'yearly' ? 'bg-white...' : 'text-slate-500...'}`}>
    Yearly
    <span className="ml-2 text-[10px] font-bold bg-emerald-500 text-white px-1.5 py-0.5 rounded-full">Save 17%</span>
  </button>
</div>
```

#### Pricing Card Grid

- 3-column grid: `md:grid-cols-3 gap-6 items-center`
- Left & right cards: standard white/dark card style
- Center card: gradient background (`from-indigo-600 to-violet-700`), `md:scale-105`, "Most Popular" badge

| Tier | Price | Highlight |
|------|-------|-----------|
| Monthly | ₹1,200/month | Standard card |
| Yearly | ₹12,000/year | Gradient card, "Most Popular" |
| Lifetime | ₹60,000/one-time | Standard card |

---

### 5.3 Product Detail Page

**Route:** `/product/[id]`  
**Layout:** Two-column (`lg:grid-cols-2`), image left, details right

- **Image:** `rounded-2xl overflow-hidden` with subtle `shadow-card`, hover zoom (`group-hover:scale-105 transition duration-500`)
- **Variant Selector:** Pill-style option buttons. Selected: `bg-indigo-600 text-white`. Default: `bg-white dark:bg-gray-800 border text-slate-700 dark:text-slate-300`
- **Extra Price Tag:** Small emerald badge showing additional price when variant is selected
- **Quantity Selector:** Stepper buttons (`-` and `+`) flanking an input, styled as a grouped control
- **Add to Cart CTA:** Full-width primary gradient button with cart icon + "Add to Cart"

---

### 5.4 Cart Page

**Route:** `/cart`  
**Layout:** Two-column on desktop — item list left (flex-1), order summary right (w-80)

#### Line Item Row

```
[Product image] | Product Name      | Qty stepper | ₹ price | [trash icon]
                 Variant: Brand: Odoo
```

#### Order Summary Panel

```tsx
<div className="bg-white dark:bg-gray-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6 space-y-4 sticky top-24">
  <h3 className="font-bold text-slate-900 dark:text-slate-100">Order Summary</h3>
  {/* Discount input */}
  <div className="flex gap-2">
    <input placeholder="Discount code" className="flex-1 input-style" />
    <button className="primary-btn">Apply</button>
  </div>
  {/* Breakdown */}
  <div className="space-y-2 text-sm">
    <div className="flex justify-between text-slate-600 dark:text-slate-400"><span>Subtotal</span><span>₹X</span></div>
    <div className="flex justify-between text-emerald-600 dark:text-emerald-400"><span>Discount</span><span>-₹X</span></div>
    <div className="flex justify-between text-slate-600 dark:text-slate-400"><span>Tax (18%)</span><span>₹X</span></div>
    <div className="flex justify-between font-bold text-slate-900 dark:text-slate-100 pt-2 border-t border-slate-200 dark:border-slate-700 text-base">
      <span>Total</span><span>₹X</span>
    </div>
  </div>
  <button className="w-full primary-btn">Proceed to Checkout</button>
</div>
```

---

### 5.5 Checkout Page

**Route:** `/checkout`  
**Layout:** Two-column — form left (flex-1), summary panel right (w-80)

#### Payment Method Selector

```tsx
// Card-style toggle — selected gets indigo ring
<div className={`flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all
  ${method === 'card'
    ? 'border-indigo-500 dark:border-indigo-400 bg-indigo-50 dark:bg-indigo-950/40'
    : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-gray-900'}`}>
  <CreditCard className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
  <span className="text-sm font-semibold text-slate-900 dark:text-slate-100">Credit Card</span>
</div>
```

#### Billing Address

- Pre-populated from saved profile
- "Use a different address" toggle that reveals the override form
- Fields: Name, Address, City, State, Zip — standard input styles

#### Stripe Integration Panel

- Clean white/dark card wrapping the Stripe Elements iframe
- `rounded-xl border border-slate-200 dark:border-slate-800 p-4`

---

### 5.6 Thank You Page

**Route:** `/thank-you`  
**Layout:** Centered, max-w-lg, full viewport height center alignment

```
        ✅ (animated check — emerald gradient circle)

     Thank you for your order!
   Your order #50001 is confirmed.

  ┌──────────────────────────────┐
  │  Order Summary               │
  │  Product Name × Qty  ₹XXXX  │
  │  ─────────────────────────   │
  │  Total:              ₹XXXX  │
  └──────────────────────────────┘

        [Print Receipt]  [Go to Dashboard]
```

- Animated success icon: scale-in `animate-[scaleIn_0.4s_ease-out]` with emerald-to-teal gradient circle
- Order number: large, bold, indigo gradient text
- Print button: secondary style with `Printer` lucide icon
- Dashboard link: ghost button

---

### 5.7 Admin / Internal Dashboard

**Layout:** Sidebar (w-64, fixed) + Main content area

#### Dashboard Home — KPI Cards

4 metric cards in a grid (`grid-cols-2 lg:grid-cols-4`):

| Metric | Icon | Color |
|--------|------|-------|
| Active Subscriptions | `RefreshCw` | Indigo |
| Monthly Revenue | `TrendingUp` | Emerald |
| Pending Invoices | `FileText` | Amber |
| Overdue Payments | `AlertCircle` | Red |

```tsx
<div className="bg-white dark:bg-gray-900 rounded-xl p-5 border border-slate-100 dark:border-slate-800 shadow-card">
  <div className="flex items-start justify-between mb-3">
    <div className="h-10 w-10 rounded-lg bg-indigo-50 dark:bg-indigo-950/50 flex items-center justify-center">
      <RefreshCw className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
    </div>
    <span className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-full">+12%</span>
  </div>
  <p className="text-2xl font-extrabold text-slate-900 dark:text-slate-100">1,284</p>
  <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Active Subscriptions</p>
</div>
```

#### Recent Activity Table

- Full-width table with sortable headers
- Pagination at bottom: `Previous` / page numbers / `Next` — indigo active page

---

### 5.8 Quotation Template Page

**Route:** `/admin/quotations`  
**Layout:** Two-column — form left, live preview panel right

- **Header inputs:** Quotation Title, Customer Name, Valid Until in a clean 3-column grid
- **Line Item Table:** Bordered table with `+Add Line Item` button at bottom (dashed border row)
- **Live Preview panel:** Right side renders a read-only invoice preview, updating as the form changes
- **Action Bar (sticky bottom):** `Save Draft` (secondary) + `Preview` (ghost) + `Send` (primary gradient) — right-aligned

---

## 6. Animation & Motion System

| Effect | Classes | Usage |
|--------|---------|-------|
| Card lift on hover | `hover:-translate-y-1 transition-all duration-200` | All interactive cards |
| Button lift | `hover:-translate-y-0.5 transition-all duration-200` | Primary & secondary buttons |
| Arrow nudge | `group-hover:translate-x-1 transition-transform duration-200` | CTA arrow icons |
| Image zoom | `group-hover:scale-105 transition-transform duration-500` | Product and blog images |
| Background pulse | `animate-pulse [animation-duration:4000ms]` | Background blobs |
| Isometric hero card | `perspective-[2000px]` parent, `rotate-x-[5deg] rotate-y-[-12deg]` | Hero visual |
| Smooth color transitions | `transition-colors duration-200` | Theme toggle, nav links |
| Badge glow | `shadow-[0_0_20px_rgba(79,70,229,0.5)]` | Numbered/special badges |
| Scale-in enter | `animate-[scaleIn_0.4s_ease-out]` | Success icon on thank-you page |

### Reduced Motion

```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

---

## 7. Iconography

**Library:** `lucide-react`

```bash
npm install lucide-react
```

#### Size Standards

| Context | Size Class |
|---------|-----------|
| Inline / text-level | `h-4 w-4` |
| Button icon | `h-4 w-4` |
| Nav / action icon | `h-5 w-5` |
| Feature / card icon | `h-6 w-6` |
| Hero / large feature | `h-8 w-8` |

#### Module Icon Map

| Module | Icon |
|--------|------|
| Subscriptions | `RefreshCw` |
| Products | `Package` |
| Invoices | `FileText` |
| Payments | `CreditCard` |
| Discounts | `Tag` |
| Taxes | `Percent` |
| Reports | `BarChart2` |
| Quotations | `ClipboardList` |
| Users | `Users` |
| Settings | `Settings` |
| Cart | `ShoppingCart` |
| Logout | `LogOut` |
| Theme toggle | `Sun` / `Moon` |

---

## 8. Responsive Strategy

**Mobile-first.** All base classes target 375px. Progressive enhancement via `sm:`, `md:`, `lg:`, `xl:`.

| Breakpoint | Width | Layout Change |
|------------|-------|---------------|
| Base | 375px+ | Single column, stacked layout |
| `sm` | 640px+ | Side-by-side stats, expanded nav |
| `md` | 768px+ | Two-column grid unlocks, pricing cards side-by-side |
| `lg` | 1024px+ | Full 2-col hero, sidebar appears, 3-4 col grids |
| `xl` | 1280px+ | Max container width reached (`max-w-7xl`) |

### Key Responsive Rules

- Sidebar navigation is hidden on mobile; replaced by a bottom tab bar or hamburger menu
- Pricing cards stack vertically on mobile with equal width
- Hero two-column flips to single column: visual moves below text on mobile
- Cart and Checkout switch from side-by-side to stacked on mobile (summary panel moves below items)
- Touch targets minimum 44×44px on all interactive elements
- Never require horizontal scrolling

---

## 9. Accessibility Standards

| Standard | Implementation |
|----------|----------------|
| **Color contrast** | All text meets WCAG AA (4.5:1 min). Slate-900 on Slate-50: AAA compliant |
| **Focus rings** | `focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2` on all interactive elements |
| **Semantic HTML** | `<nav>`, `<main>`, `<footer>`, `<button>`, `<h1>`–`<h3>` hierarchy enforced |
| **Heading order** | One `<h1>` per page; never skip heading levels |
| **ARIA labels** | Icon-only buttons must include `aria-label`. Hidden decorative icons use `aria-hidden="true"` |
| **Form labels** | All inputs must have a `<label>` with `htmlFor` — never label via placeholder alone |
| **Error messages** | Input errors use `aria-describedby` linking input to error `<p>` |
| **Reduced motion** | All animations respect `prefers-reduced-motion` |

---

## 10. Tailwind CSS Configuration

```ts
// tailwind.config.ts
import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: 'class',
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './pages/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-jakarta)', 'system-ui', 'sans-serif'],
      },
      colors: {
        brand: {
          primary: '#4F46E5',
          secondary: '#7C3AED',
          primaryDark: '#6366F1',
          secondaryDark: '#8B5CF6',
        },
      },
      boxShadow: {
        card: '0 4px 20px -2px rgba(79, 70, 229, 0.10)',
        'card-hover': '0 10px 25px -5px rgba(79, 70, 229, 0.15), 0 8px 10px -6px rgba(79, 70, 229, 0.10)',
        btn: '0 4px 14px 0 rgba(79, 70, 229, 0.30)',
        glow: '0 0 20px rgba(79, 70, 229, 0.50)',
      },
      backgroundImage: {
        'gradient-brand': 'linear-gradient(to right, #4F46E5, #7C3AED)',
      },
      animation: {
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      maxWidth: {
        '8xl': '88rem',
      },
    },
  },
  plugins: [],
}

export default config
```

---

## 11. Global CSS Variables

```css
/* app/globals.css */
@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');

@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    /* Light mode tokens */
    --color-background: #F8FAFC;
    --color-surface: #FFFFFF;
    --color-surface-muted: #F1F5F9;
    --color-primary: #4F46E5;
    --color-primary-hover: #4338CA;
    --color-secondary: #7C3AED;
    --color-text-main: #0F172A;
    --color-text-muted: #64748B;
    --color-text-subtle: #94A3B8;
    --color-border: #E2E8F0;
    --color-border-focus: #4F46E5;
    --color-success: #10B981;
    --color-warning: #F59E0B;
    --color-error: #EF4444;
    --shadow-card: 0 4px 20px -2px rgba(79, 70, 229, 0.10);
    --shadow-card-hover: 0 10px 25px -5px rgba(79, 70, 229, 0.15), 0 8px 10px -6px rgba(79, 70, 229, 0.10);
    --shadow-btn: 0 4px 14px 0 rgba(79, 70, 229, 0.30);
    --shadow-glow: 0 0 20px rgba(79, 70, 229, 0.50);
  }

  .dark {
    /* Dark mode tokens */
    --color-background: #0A0F1E;
    --color-surface: #111827;
    --color-surface-muted: #1E293B;
    --color-primary: #6366F1;
    --color-primary-hover: #818CF8;
    --color-secondary: #8B5CF6;
    --color-text-main: #F1F5F9;
    --color-text-muted: #94A3B8;
    --color-text-subtle: #64748B;
    --color-border: #1E293B;
    --color-border-focus: #6366F1;
    --color-success: #34D399;
    --color-warning: #FBBF24;
    --color-error: #F87171;
    --shadow-card: 0 4px 20px -2px rgba(99, 102, 241, 0.15);
    --shadow-card-hover: 0 10px 25px -5px rgba(99, 102, 241, 0.25), 0 8px 10px -6px rgba(99, 102, 241, 0.15);
    --shadow-btn: 0 4px 14px 0 rgba(99, 102, 241, 0.40);
    --shadow-glow: 0 0 24px rgba(99, 102, 241, 0.60);
  }

  * {
    border-color: var(--color-border);
    scroll-behavior: smooth;
  }

  body {
    background-color: var(--color-background);
    color: var(--color-text-main);
    font-family: var(--font-jakarta), system-ui, sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }

  @media (prefers-reduced-motion: reduce) {
    *, *::before, *::after {
      animation-duration: 0.01ms !important;
      transition-duration: 0.01ms !important;
    }
  }
}

@layer components {
  /* Reusable gradient text */
  .gradient-text {
    @apply bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent
           dark:from-indigo-400 dark:to-violet-400;
  }

  /* Shadow utilities */
  .shadow-card {
    box-shadow: var(--shadow-card);
  }
  .shadow-card-hover:hover {
    box-shadow: var(--shadow-card-hover);
  }
  .shadow-btn {
    box-shadow: var(--shadow-btn);
  }
  .shadow-glow {
    box-shadow: var(--shadow-glow);
  }
}
```

---

*This design document is the single source of truth for all frontend UI decisions. Any deviation from these specs must be reviewed with the design lead and versioned accordingly.*