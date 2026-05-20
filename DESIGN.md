---
name: Luminous Ether
colors:
  surface: '#f7f9fb'
  surface-dim: '#d8dadc'
  surface-bright: '#f7f9fb'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f2f4f6'
  surface-container: '#eceef0'
  surface-container-high: '#e6e8ea'
  surface-container-highest: '#e0e3e5'
  on-surface: '#191c1e'
  on-surface-variant: '#3c494e'
  inverse-surface: '#2d3133'
  inverse-on-surface: '#eff1f3'
  outline: '#6c797f'
  outline-variant: '#bbc9cf'
  surface-tint: '#00677f'
  primary: '#00677f'
  on-primary: '#ffffff'
  primary-container: '#00d1ff'
  on-primary-container: '#00566a'
  inverse-primary: '#4cd6ff'
  secondary: '#9f4212'
  on-secondary: '#ffffff'
  secondary-container: '#fd8955'
  on-secondary-container: '#6e2600'
  tertiary: '#00696d'
  on-tertiary: '#ffffff'
  tertiary-container: '#51d2d8'
  on-tertiary-container: '#00585b'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#b7eaff'
  primary-fixed-dim: '#4cd6ff'
  on-primary-fixed: '#001f28'
  on-primary-fixed-variant: '#004e60'
  secondary-fixed: '#ffdbcd'
  secondary-fixed-dim: '#ffb597'
  on-secondary-fixed: '#360f00'
  on-secondary-fixed-variant: '#7d2d00'
  tertiary-fixed: '#79f5fb'
  tertiary-fixed-dim: '#59d8de'
  on-tertiary-fixed: '#002021'
  on-tertiary-fixed-variant: '#004f52'
  background: '#f7f9fb'
  on-background: '#191c1e'
  surface-variant: '#e0e3e5'
typography:
  display-lg:
    fontFamily: Hanken Grotesk
    fontSize: 120px
    fontWeight: '800'
    lineHeight: 110px
    letterSpacing: -0.04em
  display-lg-mobile:
    fontFamily: Hanken Grotesk
    fontSize: 64px
    fontWeight: '800'
    lineHeight: 60px
    letterSpacing: -0.04em
  headline-lg:
    fontFamily: Hanken Grotesk
    fontSize: 80px
    fontWeight: '300'
    lineHeight: 88px
  headline-md:
    fontFamily: Hanken Grotesk
    fontSize: 48px
    fontWeight: '600'
    lineHeight: 56px
  body-lg:
    fontFamily: Hanken Grotesk
    fontSize: 20px
    fontWeight: '400'
    lineHeight: 32px
  body-md:
    fontFamily: Hanken Grotesk
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  label-md:
    fontFamily: Hanken Grotesk
    fontSize: 14px
    fontWeight: '600'
    lineHeight: 20px
    letterSpacing: 0.02em
rounded:
  sm: 0.5rem
  DEFAULT: 1rem
  md: 1.5rem
  lg: 2rem
  xl: 3rem
  full: 9999px
spacing:
  container-max: 1280px
  gutter: 2rem
  margin-x: 2rem
  section-gap: 8rem
---

## Brand & Style

The brand personality is futuristic, ethereal, and technologically sophisticated. It aims to evoke a sense of weightlessness and immersive clarity, targeting developers, digital artists, and tech-forward innovators.

The visual style is a refined mix of **Glassmorphism** and **Minimalism**. It relies on high-quality background blurs (frosted glass), vibrant organic gradients, and precise typography. The interface should feel like a transparent lens overlaying a bright, airy atmosphere. Depth is communicated through translucency and light rather than heavy shadows.

## Colors

This design system uses a **light mode default** to create a high-key environment where luminous highlights interact with clean, airy surfaces.

- **Primary:** A vibrant Cyan-Blue used for key highlights and gradients.
- **Secondary:** A warm Sunset Orange used for high-contrast "Call to Action" elements.
- **Neutral:** Cool grays and off-whites are used for primary text and boundaries, ensuring a crisp look.
- **Background:** The background is not a solid color but a bright, dynamic composition of large, blurred radial gradients in soft teal and pale blue tones.

## Typography

The typography system uses **Hanken Grotesk** to provide a sharp, contemporary, and technical feel.

The hierarchy is built on extreme contrast. Large display headings use heavy weights and tight tracking to command attention, while secondary headings utilize a light weight to create a sophisticated, editorial effect. Body text uses a generous line height for readability. Secondary text should be rendered with reduced opacity (approx. 70%) against the bright backgrounds to maintain the ethereal hierarchy.

## Elevation & Depth

Depth is achieved through **Glassmorphism** and **Tonal Layers** adapted for light mode.

- **Surface Tiers:** Background elements are blurred using a `backdrop-filter: blur(20px)` with a translucent white tint.
- **Outlines:** Use "Ghost Borders"—ultra-thin (1px) semi-transparent strokes—to define shapes without closing them off.
- **Interactive Depth:** On hover, increase the opacity of the background blur or the brightness of the inner glow to simulate the element "lifting" closer to the user.

## Shapes

The shape language is defined by **Pill-shaped** (fully rounded) containers. This softness balances the sharp, technical nature of the typography. Every interactive element—from buttons to the "New Feature" chips—should utilize high border-radius values to maintain the fluid, organic aesthetic of the design system.

## Components

### Buttons

- **Primary:** Vibrant gradient (Primary to Secondary) with white text. High roundedness.
- **Secondary/Ghost:** Semi-transparent fill with a thin 1px border (10% opacity). Text is deep charcoal.
- **Tertiary:** Pure text with a subtle underline or arrow icon on hover.

### Chips / Badges

Small, pill-shaped containers with a `backdrop-filter: blur(10px)` and a subtle border. Used for "New" announcements or tags.

### Navigation

Top-aligned, minimal text links with high letter spacing. The "Login" button is a standout pill-shaped glass element.

### Inputs

Fully rounded containers with a subtle white frosted glass effect. Focus states should be indicated by a glow effect using the primary color.

### Cards

Large radius containers. Use `backdrop-filter` to ensure text readability over the dynamic background. Borders should be barely visible, acting more as a catch-light than a structural boundary.
