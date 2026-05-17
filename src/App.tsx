import React, {useEffect, useMemo, useRef} from "react";
import './App.css'
import * as d3 from "d3";
import {DataFrame} from "data-frame-ts";
import {
    CellStyle,
    createTable,
    defaultBorder,
    defaultBorderElement, defaultCellStyle,
    defaultColumnHeaderStyle,
    defaultColumnStyle, defaultRowStyle,
    defaultTableFont,
    defaultTablePadding,
    type Margin,
    TableData,
    TableFormatter,
    TableStyler
} from "svg-table";
import {usTreasuryBillsData, usTreasuryBillsHeader} from "./us-treasury-bills-data";

enum Direction {UP, DOWN}

const defaultBackground = 'rgb(227,227,227)';

export const initialSvgStyle: SvgStyle = {
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

/**
 * Simple example of rendering a year's worth of US treasury bill data in an SVG table.
 * When the treasury bill rate has increased from the previous day, the cell is green.
 * When the treasury bill rate has decreased from the previous day, the cell is red.
 * @param props
 * @constructor
 */
function App(props: Props) {
    const {
        tableId,
        width,
        height,
        color = 'rgb(227,227,227)',
        backgroundColor = defaultBackground,
    } = props

    const margin = {...defaultMargin, ...props.margin}

    const svgStyle = useMemo<SvgStyle>(
        () => ({...initialSvgStyle, ...props.svgStyle}),
        [props.svgStyle]
    )

    // reference to the SVG container that will hold the table
    const containerRef = useRef<SVGSVGElement>(null)

    useEffect(
        () => {
            if (containerRef.current) {
                // build up the svg style from the defaults and any svg style object
                // passed in as properties
                const style = Object.getOwnPropertyNames(svgStyle)
                    .map(name => `${name}: ${svgStyle[name]}; `)
                    .join("")

                // when the "backgroundColor" property is set (i.e. not the default value),
                // then add it to the styles, overwriting any color that may have been
                // set in the svg style object
                const background = backgroundColor !== defaultBackground ?
                    `background-color: ${backgroundColor}; ` :
                    ''

                const renderingInfo = DataFrame.from<number | string>(usTreasuryBillsData, true)
                    // create the table data that has the column headers
                    .flatMap(df => TableData.fromDataFrame(df)
                        .withColumnHeader(usTreasuryBillsHeader)
                    )
                    // format the percentages as fixed point numbers
                    .flatMap(tableData => TableFormatter.fromTableData(tableData)
                        .addColumnFormatters([1, 2, 3, 4], value => `${(value as number).toFixed(2)}`)
                        .flatMap(td => td.formatTable())
                    )
                    .map(tableData => TableStyler.fromTableData(tableData)
                        // set the base font for the table
                        .withTableFont({
                            ...defaultTableFont,
                            color: 'black',
                            family: defaultFontStyle.fontFamily,
                            size: defaultFontStyle.fontSize,
                            weight: defaultFontStyle.fontWeight
                        })
                        // padding for the overall table
                        .withPadding({...defaultTablePadding, top: 10, left: 0})
                        // adjust the header row with a bolder font, give it a bit more spacing,
                        // and add border-lines on the top and bottom. this should be a high
                        // priority style, which by default has a priority of Infinity.
                        .withColumnHeaderStyle({
                            ...defaultColumnHeaderStyle,
                            padding: {top: 10, bottom: 5},
                            dimension: {...defaultColumnHeaderStyle.dimension, maxHeight: 70},
                            // want the header text to be right-aligned and vertically centered
                            alignText: 'right',
                            verticalAlignText: 'middle',
                            font: {...defaultTableFont, color: 'black', weight: 650, size: 14},
                            border: {
                                ...defaultBorder,
                                top: {...defaultBorderElement, width: 0.5, color: 'darkgray'},
                                bottom: {...defaultBorderElement, width: 0.5, color: 'darkgray'}
                            },
                        })
                        .withRowStyles([], {
                            ...defaultRowStyle,
                            font: {...defaultTableFont, color: 'black'},
                            padding: {...defaultTablePadding, top: 10, bottom: 0},
                        })
                        // we want the "observed-date" column to be centered
                        .withColumnStyle(0, {
                            ...defaultColumnStyle,
                            dimension: {...defaultColumnStyle.dimension, maxWidth: 300},
                            padding: {left: 60, right: 10},
                            alignText: 'center',
                        })
                        // all the numeric columns should be right-aligned
                        .withColumnStyles([1, 2, 3, 4], {
                            ...defaultColumnStyle,
                            dimension: {...defaultColumnStyle.dimension, maxWidth: 300},
                            padding: {left: 60, right: 10},
                            alignText: 'right',
                        })
                        //
                        // the next two styles apply conditionally
                        //
                        // when the current day's rate is higher than the previous day's rate, we want to
                        // highlight it with green text and a somewhat transparent background.
                        .withCellStyleWhen(
                            (value, rowIndex, columnIndex) => {
                                if (columnIndex > 0 && rowIndex > 0 && rowIndex < tableData.tableRowCount() - 1) {
                                    return tableData.unwrapDataFrame()
                                        .elementAt(rowIndex + 1, columnIndex)
                                        .map(elem => value > elem)
                                        .getOrElse(false)
                                }
                                return false
                            },
                            highlightedCellStyle(Direction.UP),
                            200)
                        // when the current day's rate is lower than the previous day's rate, we want to
                        // highlight it with red text and a somewhat transparent background.
                        .withCellStyleWhen(
                            (value, rowIndex, columnIndex) => {
                                if (columnIndex > 0 && rowIndex > 0 && rowIndex < tableData.tableRowCount() - 1) {
                                    return tableData.unwrapDataFrame()
                                        .elementAt(rowIndex + 1, columnIndex)
                                        .map(elem => value < elem)
                                        .getOrElse(false)
                                }
                                return false
                            },
                            highlightedCellStyle(Direction.DOWN),
                            100)
                        .styleTable()
                    )
                    // now create the SVG table
                    .flatMap(styledTable => createTable(
                        styledTable,
                        containerRef.current as SVGSVGElement,
                        `t-header-${tableId}`,
                        [10, 10]
                    ))
                    // and return the rendering information we'll need to update the dimensions of the
                    // SVG container so that the table data fits
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
        [
            color, backgroundColor,
            svgStyle,
            tableId,
            width, height,
            margin.left, margin.right, margin.top, margin.bottom,
            defaultFontStyle.fontFamily, defaultFontStyle.fontSize, defaultFontStyle.fontWeight
        ]
    )


    return (<>
        <div>
            <h3>U.S. Treasury Bills (SVG Table)</h3>
            <div style={{fontSize: 12}}>Green cells indicate a rate increase from previous day.</div>
            <div style={{fontSize: 12}}>Red cells indicate a rate decrease from previous day.</div>
            {/* This is the SVG DOM element into which the table will be rendered */}
            <svg ref={containerRef}/>
        </div>

    </>)
}

type SvgStyle = {
    height?: string | number;
    width?: string | number;
    outline?: string;

    [propName: string]: any;
}

/**
 * Properties for rendering the tooltip. This is the style for the container
 * of the content.
 */
type FontStyle = {
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
}

const defaultFontStyle: FontStyle = {
    fontSize: 12,
    fontColor: 'rgb(227,227,227)',
    fontFamily: 'sans-serif',
    fontWeight: 250,
};

function highlightedCellStyle(direction: Direction): CellStyle {
    const color = direction === Direction.UP ? 'green' : 'red'
    return {
        ...defaultCellStyle,
        alignText: 'right',
        font: {...defaultTableFont, color, weight: 450, size: 13},
        background: {color, opacity: 0.15},
        padding: {left: 60, right: 10, top: 10, bottom: 0}
    }
}

export default App
