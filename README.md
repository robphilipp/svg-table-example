# SVG Table Example

This project is a tiny React app that demonstrates how to render a data table entirely in SVG using the `svg-table` library. The example displays a year of U.S. Treasury bill rates and highlights day-over-day changes:

- Green cells indicate the rate increased from the previous day.
- Red cells indicate the rate decreased from the previous day.

The code shows how to:
- Convert an in-memory array into a `DataFrame`.
- Turn that into `TableData` with a header row.
- Format numeric columns with `TableFormatter`.
- Apply padding, fonts, alignment, borders, and conditional cell styling with `TableStyler`.
- Render the result to SVG with `createTable`.

## Getting started

Prerequisites:
- Node.js 16+ and npm

Install dependencies and start the dev server:

- npm install
- npm start

This uses Create React App (react-scripts). The app will open on http://localhost:3000.

To create a production build:

- npm run build

## Where the example logic lives

- src/App.tsx — The main example. It renders the SVG table and contains all styling/formatting logic.
- src/us-treasury-bills-data.ts — The header and data array for the table.
- public/us-trs-bill.csv and public/us-treas-bills-array.txt — Additional example data files (not required at runtime by the app as written).

## How it works (high level)

Inside App.tsx:
1. Build a DataFrame from `usTreasuryBillsData` using `DataFrame.from(..., true)`.
2. Use `TableData.fromDataFrame(df).withColumnHeader(usTreasuryBillsHeader)` to add a header row.
3. Format the numeric columns with `TableFormatter` (e.g., to fixed 2 decimals).
4. Apply base styles via `TableStyler`:
   - Set table font, padding, header styles (bold, borders, alignment).
   - Align the first column (dates) to center; numeric columns to the right.
5. Apply conditional cell styles with `.withCellStyleWhen(...)`:
   - Green background/text when today > previous day.
   - Red background/text when today < previous day.
6. Call `createTable(...)` to render the styled table into an `<svg>` node referenced by `containerRef`.
7. Use d3 to resize the SVG container to fit the rendered content and apply overall background and color styles.

## Customization points

You can tweak several aspects in App.tsx:
- Colors and background: via component props `color` and `backgroundColor` or by extending `svgStyle`.
- Typography: adjust `defaultFontStyle` and the font in `withTableFont`/header styles.
- Padding and dimensions: tune `defaultTablePadding`, column max widths/heights, and per-cell padding.
- Conditional styling rules: change the predicates used by `.withCellStyleWhen(...)` to highlight other patterns.
- Data: swap out `usTreasuryBillsData` and `usTreasuryBillsHeader` for your own data/labels.

## Component props

The `App` component accepts:
- tableId: number — A unique id used to namespace header definitions in the SVG.
- width: number — Not directly used for layout in this example but kept for parity with typical chart components.
- height: number — Same as above.
- margin?: Partial<Margin> — Extra space around the table; used when computing final SVG size.
- color?: string — Base text color applied to the SVG container (default: light gray used as a neutral base).
- backgroundColor?: string — Background for the SVG container.
- svgStyle?: Partial<SvgStyle> — Additional inline styles applied to the root `<svg>` element.

See the type definitions and usage near the top of `src/App.tsx` for details.

## License

This example is provided under the MIT License. See LICENSE for details.