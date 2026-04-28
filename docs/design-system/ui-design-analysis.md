# UI Design Analysis

## Source
The design source is `ui-design/Complete Coach.zip`, a Figma-generated Vite React bundle. It contains:
- React entrypoint: `src/main.tsx`.
- Router: `src/app/routes.tsx`.
- App shell: `src/app/App.tsx`.
- Page/component files under `src/app/components`.
- shadcn/Radix-style primitives under `src/app/components/ui`.
- Styles under `src/styles`.
- Reference screenshots under `src/imports/screen*.png`.
- Theme source: `src/styles/theme.css` and `default_shadcn_theme.css`.

## Implementation Rule
The UI must be carried forward verbatim for the first deliverable. “Verbatim” means:
- Preserve page layout, spacing rhythm, visual hierarchy, card shapes, color usage, and sidebar/topbar patterns.
- Preserve route structure and visible page labels unless a later accepted spec changes them.
- Preserve sample-data-driven UI state for the stub so the prototype is launchable before backend integration.
- Do not redesign, normalize, or simplify visual language in the first UI stub.
- Do not replace the Figma-exported design language with a generic shadcn starter theme.
- Refactor only for production maintainability, not visual change.

## Prototype Inventory
### Routing
The current prototype defines these routes:
- `/` dashboard.
- `/training`.
- `/training/programs`.
- `/training/exercises`.
- `/training/exercises/add`.
- `/nutrition`.
- `/nutrition/meal-plans`.
- `/nutrition/food-database`.
- `/education`.
- `/education/add`.
- `/supplementation`.
- `/supplementation/plans`.
- `/supplementation/database`.
- `/clients`.
- `/clients/crm`.
- `/clients/check-ins`.
- `/clients/:id`.
- `/forms`.
- `/social-media`.
- `/team-management`.
- `/packages`.
- `/messages`.

### Page Components
- `dashboard-layout.tsx`: app shell, sidebar, top search, notifications, user/settings area.
- `dashboard-page.tsx`: operations dashboard, revenue/capacity cards, tasks, pipeline, workload/task panels.
- `clients-page.tsx`: roster, filters, CSV import/export placeholder, status counts.
- `client-profile.tsx`: very large client profile with dashboard, training, nutrition, supplementation, calendar, charts, modals, drag/drop exercise editing.
- `crm-page.tsx`: lead pipeline with drag/drop stages.
- `forms-page.tsx`: form management/builder switch.
- `forms/form-management.tsx`: templates and recent forms.
- `forms/form-builder.tsx`: builder canvas, form components, style panel.
- `training-page.tsx`: training overview.
- `training-programs-page.tsx`: program assignments and templates.
- `exercise-database-page.tsx`: exercise library/search/filter cards.
- `add-exercise-page.tsx`: exercise creation form and media upload UI.
- `nutrition-page.tsx`: nutrition overview.
- `meal-plans-page.tsx`: meal plan library/assignments/templates.
- `food-database-page.tsx`: food database/search/pagination.
- `education-page.tsx`: educational vault/resources.
- `add-resource-page.tsx`: resource creation form.
- `supplementation-page.tsx`: supplementation overview.
- `supplement-plans-page.tsx`: active protocols and library.
- `supplement-database-page.tsx`: supplement library and new-protocol slide-in.
- `messages-page.tsx`: conversations and chat.
- `packages-page.tsx`: package/tier cards.
- `social-media-page.tsx`: content planning surface.
- `team-management-page.tsx`: team and workload/task display.

### UI Primitives
The archive already includes shadcn/Radix-style primitives for accordion, alert-dialog, alert, aspect-ratio, avatar, badge, breadcrumb, button, calendar, card, carousel, chart, checkbox, collapsible, command, context-menu, dialog, drawer, dropdown-menu, form, hover-card, input-otp, input, label, menubar, navigation-menu, pagination, popover, progress, radio-group, resizable, scroll-area, select, separator, sheet, sidebar, skeleton, slider, sonner, switch, table, tabs, textarea, toggle-group, toggle, tooltip, and helpers.

## Visual System
### Brand Direction
The design is a high-performance coaching operations interface:
- White and light gray operating surfaces.
- Strong indigo/purple primary action color.
- Orange accent for urgency/highlight.
- Rounded cards with large whitespace.
- Compact uppercase labels with tracking.
- Soft shadows and border cards.
- Fixed left sidebar with dense app navigation.
- Large editorial headers and bold metric cards.
- Fitness/media imagery for exercise, food, education, and client content.

### Primary Colors From Export
- Primary dark: `#030213`.
- Primary action: indigo/purple gradient and `#4f32d4`-style button treatment in screenshots.
- Accent orange: used for filters, urgent status, secondary action highlights.
- Muted background: `#f3f3f5`, `#ececf0`, `#e9ebef`, light gray cards.
- Destructive: `#d4183d`.

### Typography
The export does not include a custom font file; `fonts.css` is empty. The visual screenshots use a bold geometric sans style. First implementation should:
- Preserve exported CSS font-size and font-weight tokens.
- Use a production font selected to match the design closely, such as `Geist` or `Satoshi`, only after confirming licensing.
- Avoid default browser/system typography if it visibly diverges from screenshots.
- Document the chosen font in the stylesheet and ADR before implementation.

### Layout Rules
- Sidebar width in prototype is approximately `w-52`; screenshots show a wider fixed rail in some frames. Implement with a responsive fixed/sidebar shell that preserves screenshot proportions.
- Main content uses large padding, generally `p-8`.
- Cards use `rounded-xl` or larger and light borders.
- Top bars include search, notifications, settings, and profile controls.
- Mobile behavior is not fully represented in the export; implementation must add responsive behavior while preserving desktop parity.

### Accessibility Gaps To Fix Without Visual Drift
The Figma export uses many raw `button` and `input` elements and local state. Production UI stub must add:
- Accessible names for icon-only controls.
- Keyboard-accessible menus, dialogs, drawers, and drag/drop alternatives.
- Focus-visible states aligned to theme tokens.
- Semantic headings.
- Form labels and validation messages.
- `alt` text policy for meaningful images and empty alt for decorative imagery.

## Known Prototype Risks
- `client-profile.tsx` is 2,500+ lines and must be decomposed before production backend work.
- Several components exceed the 800-line project maximum or approach maintainability limits.
- Many records are static arrays directly inside components.
- Several handlers are placeholders, including import/upload/save actions.
- There is no auth, tenant boundary, API layer, persistence, test coverage, or observability.
- Some image URLs point to remote Unsplash assets; production needs R2-backed or explicitly allowed remote image configuration.
- CSV import currently uses browser-only file input and alert placeholder.
- Date values are hardcoded around April 2026 and must be made deterministic in tests.

## First Deliverable Requirements
The first build milestone must produce a working UI stub:
- Launchable with `pnpm dev` or equivalent documented command.
- Next.js App Router application under `apps/web`.
- All prototype routes render.
- Visual parity with supplied screenshots is prioritized over backend integration.
- Sample data is moved into typed fixtures.
- No production data model shortcuts are introduced in UI code.
- No hardcoded secrets.
- Stylesheet/theme generated from the design export is installed as the app design baseline.
- shadcn primitives are either regenerated to match the archive or imported and normalized with minimal visual drift.
- Component files are decomposed to stay below 800 lines.
- Smoke tests verify every route renders.
- Basic accessibility tests cover navigation, dialogs, forms, and keyboard focus.

