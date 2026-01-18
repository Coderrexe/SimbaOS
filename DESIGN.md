# SimbaOS Design System

## Luxury Technical Instrument - Command Center Interface

This document describes the design philosophy, tokens, patterns, and implementation details for the SimbaOS spatial cockpit interface.

---

## Design Philosophy

### Core Principle: "Spatial Cockpit"

SimbaOS is not a traditional web app with tabs and pages. It's a **unified command surface** where you operate from a single living workspace. Think Tony Stark's JARVIS interface meets a professional instrument panel.

**Key Characteristics:**

- **Single command surface** with dynamic panels, not separate pages
- **Selection-driven editing** - click any object, inspector shows details
- **Mode-based context** - Plan/Execute/Reflect changes what you see
- **Tactile feedback** - every interaction feels responsive and alive
- **Calm but powerful** - premium aesthetics without distraction

---

## Design Tokens

### Color System

#### Light Mode

```css
--bg: 0 0% 98% /* Background */ --surface: 0 0% 100% /* Primary surface */
  --surface2: 0 0% 96% /* Elevated surface */ --surface3: 0 0% 94%
  /* Most elevated */ --border: 220 13% 91% /* Default border */
  --border-subtle: 220 13% 95% /* Subtle border */ --text: 220 13% 9%
  /* Primary text */ --text-muted: 220 9% 46% /* Secondary text */
  --text-subtle: 220 9% 65% /* Tertiary text */ --accent: 262 83% 58%
  /* Primary accent (purple) */ --accent2: 195 100% 50%
  /* Secondary accent (cyan) */ --accent-muted: 262 83% 95%
  /* Muted accent bg */ --danger: 0 84% 60% /* Error/warning */ --success: 142
  71% 45% /* Success/positive */ --warning: 38 92% 50% /* Warning/attention */;
```

#### Dark Mode (Default - Premium)

```css
--bg: 220 27% 6% /* Deep background */ --surface: 220 23% 9%
  /* Primary surface */ --surface2: 220 20% 12% /* Elevated surface */
  --surface3: 220 18% 15% /* Most elevated */ --border: 220 13% 20%
  /* Default border */ --border-subtle: 220 13% 16% /* Subtle border */
  --text: 220 13% 98% /* Primary text */ --text-muted: 220 9% 65%
  /* Secondary text */ --text-subtle: 220 9% 46% /* Tertiary text */
  --accent: 262 80% 65% /* Primary accent (brighter purple) */ --accent2: 195
  100% 60% /* Secondary accent (brighter cyan) */ --accent-muted: 262 50% 15%
  /* Muted accent bg */;
```

### Elevation System

```css
--shadow1: Subtle elevation (cards, buttons) --shadow2: Medium elevation
  (panels, dropdowns) --shadow3: High elevation (modals, overlays)
  --shadow-glow: Accent glow effect;
```

### Spacing Scale

```css
--space-1: 0.25rem /* 4px */ --space-2: 0.5rem /* 8px */ --space-3: 0.75rem
  /* 12px */ --space-4: 1rem /* 16px */ --space-6: 1.5rem /* 24px */
  --space-8: 2rem /* 32px */ --space-12: 3rem /* 48px */;
```

### Border Radius

```css
--radius-sm: 0.375rem /* 6px - small elements */ --radius: 0.5rem
  /* 8px - default */ --radius-lg: 0.75rem /* 12px - cards */ --radius-xl: 1rem
  /* 16px - large panels */;
```

---

## Layout Architecture

### The Spatial Cockpit Structure

```
┌─────────────────────────────────────────────────────────┐
│  Left Rail (64px)  │  Center Stage (flex)  │  Inspector │
│  Icon navigation   │  Dynamic panels       │  (400px)   │
│  Collapsible       │  Grid-based           │  Contextual│
│                    │  Scrollable           │            │
│                    │                       │            │
│                    │  ┌─────────────────┐  │            │
│                    │  │  Top Outcomes   │  │            │
│                    │  └─────────────────┘  │            │
│                    │  ┌─────────────────┐  │            │
│                    │  │  Timeline       │  │            │
│                    │  └─────────────────┘  │            │
│                    │                       │            │
├────────────────────┴───────────────────────┴────────────┤
│  Bottom Command Bar (56px)                              │
│  Mode switcher | Timer | Quick capture | Hints          │
└─────────────────────────────────────────────────────────┘
```

### Left Rail

- **Width:** 64px collapsed, 200px expanded
- **Behavior:** Expands on hover, shows labels
- **Icons:** 20px, with tooltips
- **System status:** Bottom indicator (sync, offline)

### Center Stage

- **Layout:** CSS Grid, responsive
- **Panels:** Drag-reorderable (future)
- **Spacing:** 24px gaps between panels
- **Max width:** 1600px, centered

### Right Inspector

- **Width:** 400px
- **Trigger:** Click any card/object in Center Stage
- **Animation:** Slide in from right (200ms)
- **Tabs:** Details, Links, Activity, History
- **Close:** X button or click outside

### Bottom Command Bar

- **Height:** 56px
- **Always visible:** Fixed position
- **Sections:** Mode (left), Timer (center-left), Capture (center), Hints (right)

---

## Component Library

### Surface

Base container with elevation levels.

```tsx
<Surface level={1 | 2 | 3} glass={boolean} glow={boolean}>
  Content
</Surface>
```

**Usage:**

- `level={1}` - Default cards
- `level={2}` - Elevated panels
- `level={3}` - Highest elevation (modals)
- `glass={true}` - Glassmorphic effect
- `glow={true}` - Accent glow

### Panel

Titled container for Center Stage widgets.

```tsx
<Panel
  title="Panel Title"
  subtitle="Description"
  action={<Button />}
  selected={boolean}
>
  Content
</Panel>
```

### GlowBadge

Small status indicators with optional glow.

```tsx
<GlowBadge
  variant="accent|success|danger|warning|neutral"
  glow={boolean}
  pulse={boolean}
>
  Label
</GlowBadge>
```

### Micro Visualizations

**ProgressRing:**

```tsx
<ProgressRing value={75} max={100} size={40} color="accent" />
```

**MicroSparkline:**

```tsx
<MicroSparkline data={[4, 6, 5, 7, 8]} color="accent" />
```

**StreakDots:**

```tsx
<StreakDots days={[true, true, false, true]} />
```

---

## Motion System

### Principles

- **Fast & subtle:** 150-250ms typical
- **Purposeful:** Motion as feedback, not decoration
- **Respectful:** Honors `prefers-reduced-motion`

### Standard Transitions

```tsx
// Selection (lift)
transition: transform 150ms ease, box-shadow 150ms ease
transform: translateY(-1px)

// Inspector slide-in
transition: x 200ms ease-out
initial: { x: 400, opacity: 0 }
animate: { x: 0, opacity: 1 }

// Mode switch
layoutId animation with 200ms duration

// Overlay fade
transition: opacity 200ms ease
```

### Animation Guidelines

- **Hover states:** 150ms
- **Selection:** 150ms
- **Panel transitions:** 200ms
- **Modal/overlay:** 200-250ms
- **No constant motion:** Static by default, animate on interaction

---

## Interaction Patterns

### 1. Selection-Driven Editing ✓

**How it works:**

- Click any card/object in Center Stage
- Right Inspector slides in with full details
- Edit in place, see changes reflected immediately
- Close inspector or select another object

**Implementation:**

```tsx
const { selection, setSelection } = useCommand();
setSelection({ type: "task", id: "123" });
```

### 2. Mode System ✓

**Three modes:**

- **Plan:** Prioritization, scheduling, organizing
- **Execute:** Focus mode, "Right Now", minimal distractions
- **Reflect:** Reviews, metrics, journaling

**Behavior:**

- Stored in localStorage
- Changes Center Stage content
- Affects command palette actions
- Visual indicator in Command Bar

**Keyboard:**

- `⌘1` - Plan mode
- `⌘2` - Execute mode
- `⌘3` - Reflect mode

### 3. Right Now Focus Overlay ✓

**Trigger:** Command palette or "Start Focus" button

**Features:**

- Full-screen overlay
- Shows one recommended task
- "Why this now" explanation
- 25-minute focus timer
- Start/Pause/Complete actions

**Implementation:**

```tsx
const { showRightNow, setShowRightNow } = useCommand();
setShowRightNow(true);
```

### 4. Quick Capture ✓

**Location:** Bottom Command Bar

**Parsing logic (to implement):**

- Starts with `@` → Person contact
- Starts with `#` → Project tag
- Contains date → Calendar block
- Contains `[]` → Checkbox task
- Default → Inbox item

**Example:**

```
"Call @Mom tomorrow" → Task with person link and due date
"#SimbaOS implement auth" → Project task
"Read article on PMF" → Inbox note
```

### 5. Micro-Visualizations ✓

**Embedded in cards:**

- Progress rings for completion
- Sparklines for trends
- Streak dots for habits
- "Last touched" timestamps

### 6. Contextual Command Palette ✓

**Trigger:** `⌘K`

**Features:**

- Global commands (always available)
- Contextual commands (based on selection)
- Mode-specific actions
- Quick capture parsing
- Keyboard navigation

### 7. Smart Attention Pings ✓

**Signals Panel shows:**

- Overdue important items
- Stale projects (>7 days untouched)
- Neglected habits (broken streaks)
- Relationship follow-ups

**Design:** Quiet, non-intrusive, informational

---

## Keyboard Shortcuts

### Global

- `⌘K` - Command palette
- `⌘1` - Plan mode
- `⌘2` - Execute mode
- `⌘3` - Reflect mode
- `⌘F` - Start Right Now focus
- `⌘N` - Quick capture (focus input)
- `Esc` - Close overlay/inspector

### Navigation

- `⌘↑` - Previous panel
- `⌘↓` - Next panel
- `⌘←` - Collapse inspector
- `⌘→` - Expand inspector

### Selection

- `↑↓` - Navigate items
- `↵` - Select/open
- `⌘↵` - Quick action
- `⌫` - Delete (with confirmation)

---

## Adding New Widgets to Center Stage

### Step 1: Create the Panel Component

```tsx
// src/components/command/panels/MyNewPanel.tsx
import { Panel } from "@/components/command/Panel";
import { useCommand } from "@/lib/command-context";

export function MyNewPanel() {
  const { setSelection } = useCommand();

  return (
    <Panel title="My Widget" subtitle="Description">
      <div className="space-y-3">
        {/* Your content */}
        <button
          onClick={() => setSelection({ type: "task", id: "1" })}
          className="surface-2 p-3 rounded-[var(--radius)] lift-on-hover"
        >
          Click me
        </button>
      </div>
    </Panel>
  );
}
```

### Step 2: Add to Command Page

```tsx
// src/app/command/page.tsx
import { MyNewPanel } from "@/components/command/panels/MyNewPanel";

export default function CommandPage() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <MyNewPanel />
      {/* Other panels */}
    </div>
  );
}
```

### Step 3: Make it Mode-Aware (Optional)

```tsx
export function MyNewPanel() {
  const { mode } = useCommand();

  if (mode === "execute") {
    // Show minimal version in Execute mode
    return <MinimalVersion />;
  }

  return <FullVersion />;
}
```

---

## Performance Guidelines

### Critical Metrics

- **First paint:** < 1s
- **Time to interactive:** < 2s
- **Panel transitions:** 60fps
- **No layout shift:** Stable layouts

### Optimization Strategies

1. **Lazy load panels:** Use React.lazy for heavy widgets
2. **Virtualize lists:** For >50 items
3. **Memoize expensive calculations:** useMemo for sorting/filtering
4. **Debounce search:** 150ms delay on input
5. **Optimize re-renders:** React.memo on static components

### Bundle Size Targets

- **Initial JS:** < 200KB gzipped
- **CSS:** < 30KB gzipped
- **Fonts:** System fonts (no web fonts)

---

## Accessibility

### Keyboard Navigation

- All interactive elements focusable
- Visible focus indicators
- Logical tab order
- Escape to close overlays

### Screen Readers

- Semantic HTML (nav, main, aside, article)
- ARIA labels on icon buttons
- Live regions for dynamic updates
- Skip links for main content

### Motion

- Respects `prefers-reduced-motion`
- All animations can be disabled
- No essential information conveyed only through motion

### Color Contrast

- Text: 4.5:1 minimum
- Interactive elements: 3:1 minimum
- Focus indicators: High contrast

---

## Future Enhancements

### Phase 2

- [ ] Drag-and-drop panel reordering
- [ ] Custom panel layouts (save/load)
- [ ] Collaborative features (share views)
- [ ] Advanced filtering in panels
- [ ] Bulk actions on selections

### Phase 3

- [ ] Mobile-optimized command center
- [ ] Offline-first with sync
- [ ] Plugin system for custom widgets
- [ ] AI-powered recommendations
- [ ] Voice commands

---

## Technical Stack

- **Framework:** Next.js 15 (App Router)
- **Language:** TypeScript
- **Styling:** TailwindCSS + CSS Variables
- **Animation:** Framer Motion
- **State:** React Context (command-context)
- **Icons:** Lucide React
- **Charts:** Custom SVG components

---

## File Structure

```
src/
├── app/
│   ├── command/
│   │   ├── layout.tsx          # Command center wrapper
│   │   └── page.tsx            # Main cockpit page
│   └── globals.css             # Design tokens
├── components/
│   └── command/
│       ├── Surface.tsx         # Base container
│       ├── Panel.tsx           # Widget container
│       ├── GlowBadge.tsx       # Status badges
│       ├── MicroChart.tsx      # Visualizations
│       ├── LeftRail.tsx        # Navigation
│       ├── RightInspector.tsx  # Details panel
│       ├── CommandBar.tsx      # Bottom bar
│       ├── CommandPalette.tsx  # ⌘K interface
│       └── RightNowOverlay.tsx # Focus mode
└── lib/
    └── command-context.tsx     # Global state
```

---

## Design Principles Summary

1. **Single surface, not pages** - Everything accessible from /command
2. **Selection drives editing** - Click to inspect and modify
3. **Mode changes context** - Plan/Execute/Reflect reshapes the view
4. **Fast and tactile** - Every interaction feels responsive
5. **Calm luxury** - Premium without being loud
6. **Keyboard-first** - Power users can fly
7. **Contextual intelligence** - Right actions at the right time

---

**Last updated:** January 2026
**Version:** 1.0.0
