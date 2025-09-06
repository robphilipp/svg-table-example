import './App.css'
import {useEffect, useMemo, useRef} from "react";
import * as d3 from "d3";
import {DataFrame} from "data-frame-ts";
import {createTable} from "./table/tableSvg.ts";
import {TableFormatter} from "./table/tableFormatter.ts";
import {defaultTableFont} from "./table/tableUtils.ts";
import {
    defaultCellStyle,
    defaultColumnHeaderStyle,
    defaultColumnStyle,
    defaultRowHeaderStyle,
    defaultRowStyle,
    defaultTablePadding,
    TableStyler
} from "./table/tableStyler.ts";
import {TableData} from "./table/tableData.ts";


const defaultBackground = '#202020';

export const initialSvgStyle: SvgStyle = {
    // width: '100%',
    top: 0,
    left: 0
};

export const defaultMargin: Margin = {top: 30, right: 20, bottom: 30, left: 50}

interface Props {
    tableId: number
    /**
     * The width of the chart container
     */
    width: number
    /**
     * The height of the chart container
     */
    height: number
    /**
     * The margin between the edges of the chart container and the axes
     */
    margin?: Partial<Margin>
    /**
     * The base/default color of the chart lines. This can be overridden by the {@link Props.svgStyle} property.
     */
    color?: string
    /**
     * The base/default background color. This can be overridden by the {@link Props.svgStyle} property.
     */
    backgroundColor?: string
    /**
     * Overrides for the SVG style
     */
    svgStyle?: Partial<SvgStyle>
}

function App(props: Props) {
    const {
        tableId,
        width,
        height,
        color = '#d2933f',
        backgroundColor = defaultBackground,
    } = props

    const margin = {...defaultMargin, ...props.margin}

    const svgStyle = useMemo<SvgStyle>(
        () => ({...initialSvgStyle, ...props.svgStyle}),
        // () => ({...initialSvgStyle, ...props.svgStyle, width: props.width, height: props.height}),
        [props.height, props.svgStyle, props.width]
    )

    const tooltipStyle = defaultTooltipStyle

    // hold a reference to the current width and the plot dimensions
    // const plotDimRef = useRef<Dimensions>(plotDimensionsFrom(width, height, margin))

    // const mainGRef = useRef<GSelection | null>(null)
    const containerRef = useRef<SVGSVGElement>(null)

    // const [dimensions, setDimensions] = useState<[number, number]>([width, height])
    // const [svgWidth, setSvgWidth] = useState<number>(width)
    // const [svgHeight, setSvgHeight] = useState<number>(height)

    useEffect(
        () => {
            if (containerRef.current) {
                // build up the svg style from the defaults and any svg style object
                // passed in as properties
                const style = Object.getOwnPropertyNames(svgStyle)
                    .map(name => `${name}: ${svgStyle[name]}; `)
                    .join("")

                // when the chart "backgroundColor" property is set (i.e. not the default value),
                // then we need add it to the styles, overwriting any color that may have been
                // set in the svg style object
                const background = backgroundColor !== defaultBackground ?
                    `background-color: ${backgroundColor}; ` :
                    ''

                const renderingInfo = DataFrame
                    .from<number | string>([
                        [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
                        [1.1, 2.2, 3.3, 4.4, 5.5, 6.6, 7.7, 8.8, 9.9, 10.10],
                    ])
                    // create the table data that has the column headers
                    .flatMap(df => TableData
                        .fromDataFrame(df)
                        .withColumnHeader(['one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten'])
                        .flatMap(td => td.withRowHeader(['row 1', 'row 2']))
                    )
                    // add the dat formatters for the (x, y) values
                    .flatMap(tableData => TableFormatter.fromTableData(tableData)
                        // .addRowFormatter(1, value => formatTime(value as number, "ms"))
                        .addRowFormatter(1, value => `${value as number} ms`)
                        .flatMap(tf => tf.addRowFormatter(2, value => `${value as number} kg`))
                        .flatMap(tf => tf.formatTable())
                    )
                    .map(tableData => TableStyler.fromTableData(tableData)
                        .withTableFont({
                            ...defaultTableFont,
                            color: 'black',
                            family: tooltipStyle.fontFamily,
                            size: tooltipStyle.fontSize,
                            weight: tooltipStyle.fontWeight
                        })
                        .withPadding({...defaultTablePadding, top: 20, left: 20})
                        .withColumnHeaderStyle({
                            ...defaultColumnHeaderStyle,
                            padding: {top: 10, bottom: 0},
                            dimension: {...defaultColumnHeaderStyle.dimension, maxHeight: 70},
                            alignText: 'center',
                            // verticalAlignText: 'bottom',
                            background: {color: 'grey', opacity: 0.25},
                            font: {...defaultTableFont, color: 'black', weight: 650, size: 14}
                        })
                        .withRowHeaderStyle({
                            ...defaultRowHeaderStyle,
                            alignText: 'left',
                            verticalAlignText: 'middle',
                            font: {...defaultTableFont, color: 'grey', weight: 650, size: 14},
                            background: {color: 'blue', opacity: 0.25},
                            padding: {left: 50, right: 10}
                        })
                        // apply the column style to all the columns, with default (low) priority
                        .withColumnStyles([], {
                            ...defaultColumnStyle,
                            padding: {left: 10, right: 10},
                            alignText: 'right',
                        })
                        // column 4 gets its own style
                        .withColumnStyle(4, {
                            ...defaultColumnStyle,
                            alignText: 'left',
                            padding: {left: 0, right: 0}
                        }, 100)
                        // todo this style isn't flowing through to the table
                        .withCellStyle(1, 4, {
                            ...defaultCellStyle,
                            alignText: 'center',
                            font: {...defaultTableFont, color: 'red', weight: 650}
                        }, 210)
                        .withCellStyleWhen((value, rowIndex) => Math.floor(parseFloat(value)) % 2 === 0 && rowIndex === 1, {
                            ...defaultCellStyle,
                            alignText: 'right',
                            verticalAlignText: 'bottom',
                            font: {...defaultTableFont, color: 'purple', weight: 650, size: 13},
                            background: {color: 'grey', opacity: 0.35},
                            padding: {left: 10, right: 10, top: 30, bottom: 10}
                        }, 200)
                        .withCellStyleWhen((value, rowIndex) => Math.floor(parseFloat(value)) % 2 === 1 && rowIndex === 2, {
                            ...defaultCellStyle,
                            alignText: 'right',
                            font: {...defaultTableFont, color: 'yellow', weight: 550, size: 13},
                            background: {color: 'blue', opacity: 0.35}
                        }, 200)
                        .withRowStyles([], {
                            ...defaultRowStyle,
                            font: {...defaultTableFont, color: 'green', weight: 550},
                        }, 1)
                        .styleTable()
                    )
                    .flatMap(styledTable => createTable(
                        styledTable,
                        containerRef.current as SVGSVGElement,
                        `t-header-${tableId}`,
                        [10, 10]
                    ))
                    .map(renderingInfo => {
                        const {
                            tableX: x,
                            tableY: y,
                            tableWidth: contentWidth,
                            tableHeight: contentHeight
                        } = renderingInfo
                        return {x, y, contentWidth, contentHeight}
                    })
                    .getOrThrow()

                // update the dimension and style of the base SVG container
                d3.select<SVGSVGElement, any>(containerRef.current)
                    .attr('width', renderingInfo.contentWidth + margin.left + margin.right)
                    .attr('height', renderingInfo.contentHeight + margin.top + margin.bottom)
                    .attr('style', style + background + ` color: ${color}`)
            }
        },
        [color, backgroundColor, svgStyle, tableId, width, height]
    )


    return (<>
        <div>
            <div>SVG Table: ({tableId})</div>
            <svg ref={containerRef}/>
        </div>

    </>)
}

export interface SvgStyle {
    height?: string | number;
    width?: string | number;
    outline?: string;

    [propName: string]: any;
}

export interface Margin {
    top: number
    right: number
    bottom: number
    left: number
}

// interface Dimensions {
//     width: number
//     height: number
// }

/**
 * Properties for rendering the tooltip. This is the style for the container
 * of the content.
 */
export interface TooltipStyle {
    /**
     * Visibility of the tooltip when the mouse hovers over a data series or point.
     */
    visible: boolean

    /**
     * The size of the font displayed in the tooltip
     */
    fontSize: number
    /**
     * The color of the text displayed in the tooltip
     */
    fontColor: string
    /**
     * The font family for the text displayed in the tooltip
     */
    fontFamily: string
    /**
     * The font weight for the text displayed in the tooltip
     */
    fontWeight: number

    /**
     * The background color
     */
    backgroundColor: string;
    backgroundOpacity: number;

    borderColor: string;
    borderOpacity: number;
    borderWidth: number;
    borderRadius: number;

    paddingLeft: number;
    paddingRight: number;
    paddingTop: number;
    paddingBottom: number;
}

export const defaultTooltipStyle: TooltipStyle = {
    visible: false,

    fontSize: 12,
    fontColor: 'rgba(10,31,58,0.99)',
    // fontColor: '#d2933f',
    fontFamily: 'sans-serif',
    fontWeight: 250,

    backgroundColor: '#202020',
    backgroundOpacity: 0.8,

    borderColor: '#d2933f',
    borderOpacity: 1,
    borderWidth: 1,
    borderRadius: 5,

    paddingLeft: 10,
    paddingRight: 10,
    paddingTop: 5,
    paddingBottom: 10,
};

// function createPlotContainer(
//     chartId: number,
//     container: SVGSVGElement,
//     plotDimensions: Dimensions,
//     color: string
// ): GSelection {
//     const {width, height} = plotDimensions
//     return d3.select<SVGSVGElement, any>(container)
//         .attr('width', Math.max(0, width))
//         .attr('height', Math.max(0, height))
//         .attr('color', color)
//         .append<SVGGElement>('g')
//         .attr('id', `main-container-${chartId}`)
// }

// const plotDimensionsFrom =
//     (containerWidth: number, containerHeight: number, plotMargins: Margin): Dimensions => ({
//         width: containerWidth - plotMargins.left - plotMargins.right,
//         height: containerHeight - plotMargins.top - plotMargins.bottom
//     })

// function App() {
//   const [count, setCount] = useState(0)
//
//   return (
//     <>
//       <div>
//         <a href="https://vite.dev" target="_blank">
//           <img src={viteLogo} className="logo" alt="Vite logo" />
//         </a>
//         <a href="https://react.dev" target="_blank">
//           <img src={reactLogo} className="logo react" alt="React logo" />
//         </a>
//       </div>
//       <h1>Vite + React</h1>
//       <div className="card">
//         <button onClick={() => setCount((count) => count + 1)}>
//           count is {count}
//         </button>
//         <p>
//           Edit <code>src/App.tsx</code> and save to test HMR
//         </p>
//       </div>
//       <p className="read-the-docs">
//         Click on the Vite and React logos to learn more
//       </p>
//     </>
//   )
// }

export default App
