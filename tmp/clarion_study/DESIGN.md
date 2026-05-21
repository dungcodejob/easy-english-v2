# Design System Strategy: The Scholarly Sanctuary

## 1. Overview & Creative North Star
The North Star for this design system is **"The Scholarly Sanctuary."** 

In the crowded landscape of gamified language apps, we diverge from "loud" and "hectic" aesthetics. Instead, we embrace a high-end editorial approach that feels like a quiet, sun-drenched library. We move beyond the "standard app" look by utilizing intentional asymmetry, deep tonal layering, and generous whitespace. The goal is to transform the learning process from a chore into a premium, focused experience. We prioritize cognitive ease through soft geometry and sophisticated color transitions, ensuring that the interface feels "invisible" while the educational content feels "heroic."

---

## 2. Colors: Depth Over Definition
Our palette is rooted in a professional, deep intellectualism (Navy/Teal) balanced by the warmth of academic curiosity (Amber/Gold).

### The "No-Line" Rule
To achieve a high-end feel, **1px solid borders are strictly prohibited for sectioning.** We do not "box in" knowledge. Instead, boundaries are defined through background color shifts. Use `surface-container-low` for a section sitting on a `surface` background to create a "pocket" of content without a harsh line.

### Surface Hierarchy & Nesting
Treat the UI as a series of physical layers—like fine vellum paper stacked on a heavy oak desk.
*   **Base:** `surface` (#faf9fd)
*   **Subtle Recess:** `surface-container-low` (#f4f3f7)
*   **Raised Content:** `surface-container-lowest` (#ffffff) for primary cards.
*   **Actionable Depth:** Use `surface-container-highest` (#e3e2e6) only for elements that require immediate tactile recognition.

### The "Glass & Gradient" Rule
Standard flat colors feel static. To inject "soul," apply subtle linear gradients to primary CTAs and Hero backgrounds:
*   **Primary Action:** Gradient from `primary` (#002046) to `primary_container` (#1b365d) at a 135° angle.
*   **Floating Elements:** Use Glassmorphism for overlays. Set the background to a semi-transparent `surface_bright` with a `backdrop-blur` of 12px-20px.

---

## 3. Typography: The Editorial Voice
We utilize a dual-font strategy to balance character and clarity.

*   **Display & Headline (Lexend):** Chosen for its geometric friendliness and exceptional legibility. Use `display-lg` and `headline-md` for achievement milestones or new lesson introductions. The wide apertures of Lexend reduce eye strain and feel modern.
*   **Body & Title (Be Vietnam Pro):** A sophisticated sans-serif that handles Vietnamese diacritics with elegance. It maintains a professional, "scholarly" tone without being overly formal.
*   **Hierarchy as Navigation:** Use `title-lg` for lesson headers in `on_primary_fixed` (#001b3d) to provide an authoritative anchor for the page. Reserve `label-md` for metadata (e.g., "5 mins left"), using `on_surface_variant` (#44474e) to de-emphasize secondary information.

---

## 4. Elevation & Depth: Tonal Layering
Traditional shadows and borders are replaced by **Tonal Layering.**

*   **The Layering Principle:** Place a `surface-container-lowest` card on a `surface-container-low` background. This creates a soft, natural lift that mimics physical paper.
*   **Ambient Shadows:** For floating elements (like Modals or FABs), use an extra-diffused shadow: `box-shadow: 0 12px 32px rgba(26, 27, 30, 0.06)`. Note the 6% opacity; it should feel like a whisper, not a weight.
*   **The "Ghost Border" Fallback:** If a border is required for accessibility (e.g., in high-contrast modes), use `outline-variant` (#c4c6cf) at **15% opacity**. Never use a 100% opaque stroke.
*   **Glassmorphism:** Use semi-transparent `surface_container_low` for navigation bars with a backdrop blur. This allows the curriculum content to "bleed through" as the user scrolls, creating a sense of continuity.

---

## 5. Components: Fluidity & Focus

### Buttons (The Interaction Pillars)
*   **Primary:** Gradient of `primary` to `primary_container`. Border-radius: `full`. Large horizontal padding (2rem) to create a "pill" look that feels approachable.
*   **Tertiary:** No background, no border. Use `on_primary_fixed_variant` (#2e476f) with `title-sm` typography.

### Learning Cards & Lists
*   **The Divider Prohibition:** Forbid the use of divider lines in lists. Use `0.75rem` of vertical whitespace (Gap) between items.
*   **Focus Cards:** For vocabulary cards, use `surface-container-lowest` with a `xl` (3rem) corner radius. This extreme roundness creates a friendly, non-threatening "learning object" feel.

### Input Fields (Focus-Oriented)
*   **The "In-Line" Look:** Inputs should not have a background. Use a `title-md` font weight with a `Ghost Border` at the bottom only. When focused, the bottom border transitions to `secondary` (#006b5e) with a 2px thickness.

### Progress Indicators
*   Use `tertiary_fixed_dim` (#ffb954) for progress bars. The warm orange provides a high-contrast "reward" color against the scholarly navy background, triggering a sense of accomplishment.

---

## 6. Do’s and Don’ts

### Do
*   **DO** use `lg` (2rem) and `xl` (3rem) corner radii for major containers to maintain the "approachable" brand promise.
*   **DO** utilize `tertiary` (#311d00) for "Aha!" moments or hint highlights.
*   **DO** ensure that Vietnamese diacritics have enough line-height (`leading-relaxed`) to avoid clipping in `body-md`.

### Don't
*   **DON'T** use black (#000000) for text. Always use `on_surface` (#1a1b1e) to reduce ocular fatigue during long study sessions.
*   **DON'T** use 90-degree corners. Even the smallest tooltip should have at least a `sm` (0.5rem) radius.
*   **DON'T** use traditional red for "Wrong Answers" if possible. Use `error_container` with `on_error_container` text to keep the environment supportive and "low-stakes."

---

## 7. Scaling & Spacing
*   **The "Breath" Rule:** Always double the standard padding when a student reaches a "Lesson Complete" screen. Use the `xl` (3rem) spacing scale to allow the user's brain to rest before the next cognitive load.
*   **Asymmetry:** In Hero sections, offset the `display-md` text to the left while placing a floating "Glass" card slightly off-center to the right. This breaks the "template" feel and creates a high-end, editorial layout.