# Spec: First Deliverable - Working UI Stub

## Goal
Create a launchable Next.js UI stub that carries the `ui-design/Complete Coach.zip` experience forward verbatim using sample data. This is intentionally not the production backend build. It establishes the visual system, route shell, component decomposition, fixture strategy, and UI test baseline.

## Non-Negotiable Requirements
- Do not change the visual design unless required for accessibility or responsive behavior.
- Use the generated stylesheet baseline in `docs/design-system/complete-coach-theme.css`.
- Preserve all major routes from the prototype.
- Preserve sample data behavior from the prototype where backend wiring is not implemented.
- Move sample data into typed fixture files instead of keeping large arrays inside page components.
- Split oversized components, especially `client-profile.tsx`, into focused components under 800 lines.
- Add tests before implementation.
- No hardcoded secrets or external service keys.
- No production API placeholders that pretend persistence exists.
- Document any UI parity deviation explicitly.

## Scope
### Included
- Scaffold `apps/web` as a Next.js App Router app.
- Install React, TypeScript, Tailwind, shadcn/Radix-compatible dependencies, lucide icons, Recharts, React DnD, date utilities, and test tooling.
- Port the design-export routes to App Router.
- Implement app shell/sidebar/topbar.
- Implement all page stubs with sample data.
- Create shared design tokens and stylesheet from design export.
- Create typed fixtures for clients, leads, tasks, messages, forms, exercises, foods, meal plans, supplements, packages, resources, and team members.
- Implement route smoke tests.
- Implement component tests for critical interactions.
- Implement Playwright E2E smoke for navigation.
- Add accessibility checks for shell/forms/dialogs where practical.
- Add README instructions for launching UI stub.

### Out Of Scope
- Real authentication.
- Real database persistence.
- Real R2 upload/download.
- Real Stripe/Resend/Inngest integration.
- Production API routes beyond harmless fixture-backed development endpoints if absolutely needed.
- AI features.
- Full social media integrations.
- Client portal production flows.

## Route Mapping
The first UI stub must support:
- `/`
- `/training`
- `/training/programs`
- `/training/exercises`
- `/training/exercises/add`
- `/nutrition`
- `/nutrition/meal-plans`
- `/nutrition/food-database`
- `/education`
- `/education/add`
- `/supplementation`
- `/supplementation/plans`
- `/supplementation/database`
- `/clients`
- `/clients/crm`
- `/clients/check-ins`
- `/clients/[id]`
- `/forms`
- `/social-media`
- `/team-management`
- `/packages`
- `/messages`

## Suggested File Structure
```text
apps/web/
  app/
    (dashboard)/
      layout.tsx
      page.tsx
      training/page.tsx
      training/programs/page.tsx
      training/exercises/page.tsx
      training/exercises/add/page.tsx
      nutrition/page.tsx
      nutrition/meal-plans/page.tsx
      nutrition/food-database/page.tsx
      education/page.tsx
      education/add/page.tsx
      supplementation/page.tsx
      supplementation/plans/page.tsx
      supplementation/database/page.tsx
      clients/page.tsx
      clients/crm/page.tsx
      clients/check-ins/page.tsx
      clients/[id]/page.tsx
      forms/page.tsx
      social-media/page.tsx
      team-management/page.tsx
      packages/page.tsx
      messages/page.tsx
    globals.css
  components/
    app-shell/
    dashboard/
    clients/
    client-profile/
    crm/
    forms/
    training/
    nutrition/
    education/
    supplementation/
    messages/
    packages/
    social-media/
    team/
    ui/
  fixtures/
  lib/
  styles/
  tests/
```

## Component Decomposition Targets
### App Shell
- `DashboardShell`
- `SidebarNav`
- `TopSearch`
- `NotificationMenu`
- `UserMenu`

### Dashboard
- `RevenueCard`
- `CapacityCard`
- `PriorityTasksCard`
- `WorkTodoSection`
- `LivePipeline`
- `TaskCreationPanel`
- `WorkloadBoard`

### Client Profile
Break the exported `client-profile.tsx` into:
- `ClientProfileHeader`
- `ClientMetricCards`
- `ClientProgressChart`
- `ClientProfileTabs`
- `TrainingCalendar`
- `WorkoutDetailDialog`
- `TrainingProgramPanel`
- `EditProgramDialog`
- `DraggableExerciseRow`
- `NutritionPlanPanel`
- `MealPlanSelector`
- `ManageMealPlansDialog`
- `SupplementationPanel`
- `ClientEventsCalendar`
- `AddEventDialog`
- `CheckInHistory`

### Forms
- `FormManagement`
- `FormTemplateCard`
- `RecentFormRow`
- `FormBuilderShell`
- `FormElementPalette`
- `FormPreview`
- `FormStylePanel`
- `DraggableFormElement`

## Fixture Strategy
Fixtures must be typed and deterministic:
- `fixtures/clients.ts`
- `fixtures/leads.ts`
- `fixtures/tasks.ts`
- `fixtures/forms.ts`
- `fixtures/check-ins.ts`
- `fixtures/exercises.ts`
- `fixtures/training-programs.ts`
- `fixtures/foods.ts`
- `fixtures/meal-plans.ts`
- `fixtures/supplements.ts`
- `fixtures/education-resources.ts`
- `fixtures/messages.ts`
- `fixtures/packages.ts`
- `fixtures/team.ts`

Do not embed large sample arrays in React components.

## Styling Requirements
- Import Tailwind v4.
- Import the theme generated from `docs/design-system/complete-coach-theme.css`.
- Preserve shadcn variable naming.
- Add brand utility classes only if repeated patterns cannot be expressed cleanly with Tailwind utilities.
- No global CSS overrides that unexpectedly alter shadcn primitives.
- Keep desktop parity first, then responsive behavior.

## Testing Requirements
Write tests before porting implementation:
- Route smoke tests assert every route renders a unique heading.
- Sidebar navigation test asserts active states and nested section behavior.
- Dashboard test asserts period selector changes displayed revenue label.
- Clients test asserts search/filter/sort behavior.
- CRM test asserts lead stage movement.
- Forms test asserts adding/removing/reordering fields.
- Supplement database test asserts new protocol panel opens/closes and creates fixture-local item.
- Messages test asserts selecting conversation and sending a local message.
- Accessibility smoke checks for shell navigation, form labels, dialogs, and focus handling.
- Playwright test navigates all primary sidebar routes.

## Verification Commands
The implementation milestone must define and pass:
- `pnpm install`
- `pnpm --dir apps/web lint`
- `pnpm --dir apps/web typecheck`
- `pnpm --dir apps/web test`
- `pnpm --dir apps/web test:e2e`
- `pnpm --dir apps/web build`

## Acceptance Criteria
- The app launches locally and all listed routes render.
- The visual system matches the Figma-exported design closely enough for direct manual comparison against screenshots.
- There are no component files over 800 lines.
- Sample data is centralized in typed fixtures.
- No hardcoded secrets.
- All tests pass.
- Build passes.
- README documents how to run the UI stub.
- Any visual parity differences are documented in `docs/design-system/ui-parity-notes.md`.

