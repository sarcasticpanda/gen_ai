---
name: ReportMaster AI
colors:
  surface: '#13131b'
  surface-dim: '#13131b'
  surface-bright: '#393841'
  surface-container-lowest: '#0d0d15'
  surface-container-low: '#1b1b23'
  surface-container: '#1f1f27'
  surface-container-high: '#292932'
  surface-container-highest: '#34343d'
  on-surface: '#e4e1ed'
  on-surface-variant: '#c7c4d7'
  inverse-surface: '#e4e1ed'
  inverse-on-surface: '#303038'
  outline: '#908fa0'
  outline-variant: '#464554'
  surface-tint: '#c0c1ff'
  primary: '#c0c1ff'
  on-primary: '#1000a9'
  primary-container: '#8083ff'
  on-primary-container: '#0d0096'
  inverse-primary: '#494bd6'
  secondary: '#bdc2ff'
  on-secondary: '#131e8c'
  secondary-container: '#2f3aa3'
  on-secondary-container: '#a8afff'
  tertiary: '#ffb783'
  on-tertiary: '#4f2500'
  tertiary-container: '#d97721'
  on-tertiary-container: '#452000'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#e1e0ff'
  primary-fixed-dim: '#c0c1ff'
  on-primary-fixed: '#07006c'
  on-primary-fixed-variant: '#2f2ebe'
  secondary-fixed: '#e0e0ff'
  secondary-fixed-dim: '#bdc2ff'
  on-secondary-fixed: '#000767'
  on-secondary-fixed-variant: '#2f3aa3'
  tertiary-fixed: '#ffdcc5'
  tertiary-fixed-dim: '#ffb783'
  on-tertiary-fixed: '#301400'
  on-tertiary-fixed-variant: '#703700'
  background: '#13131b'
  on-background: '#e4e1ed'
  surface-variant: '#34343d'
typography:
  display:
    fontFamily: Inter
    fontSize: 32px
    fontWeight: '700'
    lineHeight: '1.2'
    letterSpacing: -0.02em
  heading:
    fontFamily: Inter
    fontSize: 22px
    fontWeight: '600'
    lineHeight: '1.3'
  body:
    fontFamily: Inter
    fontSize: 15px
    fontWeight: '400'
    lineHeight: '1.6'
  data-tabular:
    fontFamily: JetBrains Mono
    fontSize: 14px
    fontWeight: '500'
    lineHeight: '1.4'
    letterSpacing: -0.01em
  label-caps:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '600'
    lineHeight: '1'
    letterSpacing: 0.05em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  base: 4px
  xxs: 4px
  xs: 8px
  sm: 12px
  md: 16px
  lg: 24px
  xl: 32px
  layout_margin: 24px
  layout_gutter: 16px
---

## Brand & Style

This design system establishes a high-fidelity environment tailored for institutional financial analysis. The aesthetic bridge between the information density of a Bloomberg Terminal and the refined utility of Linear.app creates a workspace that feels both authoritative and hyper-efficient. 

The brand personality is clinical, secure, and world-class. It prioritizes data clarity over decorative elements, utilizing subtle background lifts and precise borders to define hierarchy. The emotional response is one of absolute control and "industrial-grade" reliability, suitable for premium enterprise SaaS users who manage high-stakes financial reporting.

## Colors

The palette is strictly dark-mode centric, optimized for long-duration focus. The "Electric Indigo" primary serves as the singular point of interaction, while "Accent-glow" is reserved for high-priority active states and data visualizations. 

Surfaces are tiered using incrementally lighter values rather than shadows to imply depth. The border color is the foundational structural element, ensuring sharp definition between widgets and navigation panels even in low-light environments.

## Typography

The typography system uses a dual-font strategy. **Inter** handles all interface elements, providing a neutral and highly legible frame for the application. **JetBrains Mono** is mandated for all numerical data, financial tables, and AI-generated code blocks to ensure tabular alignment and a technical "terminal" feel.

Strict hierarchy is maintained by using variable weights. Display and Heading styles should be used sparingly for primary dashboard titles, while Body and Data styles will carry the majority of the information load.

## Layout & Spacing

This design system utilizes a **fluid grid** with a maximum container width for ultra-wide displays. The spacing rhythm is based on a 4px baseline, ensuring all components align to a predictable mathematical scale.

Layouts should prioritize high information density. Sidebars and utility panels should use "Surface" colors, while the main workspace/content area utilizes the "Background" color to create a focused, inset effect. Use "sm" (12px) and "md" (16px) spacing for internal component padding to maintain the compact aesthetic.

## Elevation & Depth

Depth is conveyed through **Tonal Layers** and **Low-Contrast Outlines**. In alignment with the "Linear.app" aesthetic, drop shadows are strictly prohibited. Instead, hierarchy is established by:

1.  **Z-Index 0 (Background):** The lowest layer, used for the main application canvas.
2.  **Z-Index 1 (Surface):** Navigational elements, sidebars, and header bars.
3.  **Z-Index 2 (Surface-2):** Cards, modals, and active widgets.

All interactive elements must feature a 1px border (#1E2333). When an element is hovered or focused, the depth is communicated by shifting the background color to a lighter tier or adding an inner glow from the Accent color, rather than casting a shadow.

## Shapes

The design system employs a consistent 12px (0.75rem) corner radius for all primary containers, buttons, and input fields. This "Rounded" approach softens the technical edge of the dark interface, making it feel modern and sophisticated. Smaller sub-components, such as tags or utility buttons, may use a reduced 6px radius to maintain visual proportion.

## Components

### Buttons
- **Primary:** Solid Electric Indigo background with white bold text. No shadow; 1px border-top in Accent-glow for a "lifted" look.
- **Secondary:** Surface-2 background with a 1px Border (#1E2333). 
- **Ghost:** Transparent background, visible 1px border only on hover.

### Inputs & Fields
- Use Surface-2 for the background.
- Focus state: Border changes to Electric Indigo with a subtle 2px outer ring of Accent-glow at 20% opacity.
- Labels use the `label-caps` typography style for a technical feel.

### Cards & Panels
- Must have a 1px border (#1E2333).
- Use Surface-2 for cards that sit atop Surface, and Surface for cards that sit atop Background.

### Data Tables
- Header rows use Surface-2 with `label-caps` text.
- Row cells use JetBrains Mono for all numerical data.
- Hover state on rows should use a subtle background tint of #1E2333.

### Status Indicators
- **Chips:** Small, 4px rounded radius. Background at 10% opacity of the status color (Success, Warning, Danger) with a solid 1px border of the same color.
- **Glows:** For critical AI-driven insights, use a 2px horizontal "glow bar" of the Accent-glow color at the top of the component.