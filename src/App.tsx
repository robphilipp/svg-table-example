import React, {useEffect, useMemo, useRef} from "react";
import './App.css'
import * as d3 from "d3";
import {DataFrame} from "data-frame-ts";
import {
    createTable,
    defaultBorder,
    defaultBorderElement,
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

const defaultBackground = 'rgb(227,227,227)';

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
                        .withTableFont({
                            ...defaultTableFont,
                            color: 'black',
                            family: defaultFontStyle.fontFamily,
                            size: defaultFontStyle.fontSize,
                            weight: defaultFontStyle.fontWeight
                        })
                        .withPadding({...defaultTablePadding, top: 10, left: 20})
                        .withColumnHeaderStyle({
                            ...defaultColumnHeaderStyle,
                            padding: {top: 10, bottom: 5},
                            dimension: {...defaultColumnHeaderStyle.dimension, maxHeight: 70},
                            alignText: 'right',
                            verticalAlignText: 'middle',
                            // background: {color: 'grey', opacity: 0.25},
                            font: {...defaultTableFont, color: 'black', weight: 650, size: 14},
                            border: {
                                ...defaultBorder,
                                bottom: {...defaultBorderElement, width: 0.5, color: 'darkgray'}
                            },
                        }, 1000)
                        // .withRowHeaderStyle({
                        //     ...defaultRowHeaderStyle,
                        //     alignText: 'left',
                        //     verticalAlignText: 'middle',
                        //     font: {...defaultTableFont, color: 'grey', weight: 650, size: 14},
                        //     background: {color: 'blue', opacity: 0.25},
                        //     dimension: {...defaultDimension, maxWidth: 300},
                        //     padding: {left: 50, right: 10},
                        //     border: {...defaultBorder, right: {...defaultBorderElement, width: 0.5, color: 'black'}},
                        // }, 1000)
                        // apply the column style to all the columns, with default (low) priority
                        .withRowStyles([], {
                            ...defaultRowStyle,
                            font: {...defaultTableFont, color: 'black'},
                            padding: {...defaultTablePadding, top: 10, bottom: 0},
                        })
                        .withColumnStyle(0, {
                            ...defaultColumnStyle,
                            dimension: {...defaultColumnStyle.dimension, maxWidth: 300},
                            padding: {left: 60, right: 10},
                            alignText: 'center',
                        })
                        .withColumnStyles([1, 2, 3, 4], {
                            ...defaultColumnStyle,
                            dimension: {...defaultColumnStyle.dimension, maxWidth: 300},
                            padding: {left: 60, right: 10},
                            alignText: 'right',
                        })
                        // // column 4 gets its own style
                        // .withColumnStyle(4, {
                        //     ...defaultColumnStyle,
                        //     alignText: 'left',
                        //     padding: {left: 0, right: 0}
                        // }, 100)
                        // // todo this style isn't flowing through to the table
                        // .withCellStyle(1, 4, {
                        //     ...defaultCellStyle,
                        //     alignText: 'center',
                        //     font: {...defaultTableFont, color: 'red', weight: 650}
                        // }, 210)
                        // .withCellStyleWhen((value, rowIndex) => Math.floor(parseFloat(value)) % 2 === 0 && rowIndex === 1, {
                        //     ...defaultCellStyle,
                        //     alignText: 'right',
                        //     verticalAlignText: 'bottom',
                        //     font: {...defaultTableFont, color: 'purple', weight: 650, size: 13},
                        //     background: {color: 'grey', opacity: 0.35},
                        //     padding: {left: 10, right: 10, top: 30, bottom: 10}
                        // }, 200)
                        // .withCellStyleWhen((value, rowIndex) => Math.floor(parseFloat(value)) % 2 === 1 && rowIndex === 2, {
                        //     ...defaultCellStyle,
                        //     alignText: 'right',
                        //     font: {...defaultTableFont, color: 'yellow', weight: 550, size: 13},
                        //     background: {color: 'blue', opacity: 0.35}
                        // }, 200)
                        // .withRowStyles([], {
                        //     ...defaultRowStyle,
                        //     font: {...defaultTableFont, color: 'green', weight: 550},
                        // }, 1)
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
            <div>SVG Table: ({tableId})</div>
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

export default App
