# Info Panel Behavior

The info panel is a left-side sidebar that displays contextual information. It does not overlay the chart; instead, it sits on the left and the chart’s left margin is increased to make room for it.

## Layout

- **Position**: Fixed on the left side of the viewport
- **Chart layout**: The chart’s left margin is expanded to accommodate the panel when it is open
- **No overlay**: The panel does not cover the chart; the chart is pushed to the right

## Initial state

- On app load, the panel shows **intro.md** with the title
- The panel is expanded (visible)

## Collapse / expand

- **Collapse button**: Uses `<<` instead of an X
- **Expand button**: When collapsed, a `>>` button is shown to expand again
- **Collapse action**: Clicking `<<` slides the panel away and replaces it with the `>>` expand button
- **Expand action**: Clicking `>>` slides the panel back in

## Content display

- **Click on circle or label**: Shows information for that object, unit, or axis label
- **Click elsewhere**: Returns to the intro view (title + intro.md)
- **Sources**: Objects use their description from `content/descriptions/`; axis labels use unit descriptions

## Collapsed-state behavior

- **When collapsed**:
  - Clicking an object: Expands the panel and shows that object’s info
  - Clicking anywhere else (empty space): Collapses again (if it was auto-expanded)
  - Clicking the `>>` expand button: Expands the panel and shows the intro
- **Auto-collapse rule**: If the panel was expanded by clicking an object (not by clicking `>>`), clicking elsewhere collapses it again
- **Manual expand rule**: If the user expanded via the `>>` button, clicking elsewhere does **not** auto-collapse; the panel stays open
