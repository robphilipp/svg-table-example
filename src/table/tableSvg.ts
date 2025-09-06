import {select, type Selection} from 'd3';
import {type RectSelection, type TextSelection} from "./d3types";
import {textHeightOf, textWidthOf} from "./tableUtils";
import {TableData} from "./tableData";
import {type Result} from "result-fn";
import {
    type CellStyle,
    defaultCellStyle,
    defaultColumnStyle,
    defaultFooterStyle,
    defaultRowHeaderStyle,
    defaultRowStyle,
    StyledTable,
    type TextAlignment, type VerticalTextAlignment
} from "./tableStyler";
import {DataFrame} from "data-frame-ts";
import {defaultFormatting} from "./tableFormatter";

export type ElementPlacementInfo = {
    cellSelection: RectSelection
    textSelection: TextSelection
    textWidth: number
    textHeight: number
    cellStyle: CellStyle
}

type TextAnchor = "start" | "middle" | "end"

function textAnchorFrom(align: TextAlignment): TextAnchor {
    switch (align) {
        case "left":
            return "start"
        case "center":
            return "middle"
        case "right":
            return "end"
    }
}

type DominantBaseline = "auto" | "text-top" | "central" | "middle" | "alphabetic" | "ideographic" | "hanging" | "mathematical"

function dominantBaselineFrom(align: VerticalTextAlignment): DominantBaseline {
    switch (align) {
        case "top":
            return "hanging"
        case "middle":
            return "central"
        case "bottom":
            return "auto"
    }
}

export type CellRenderingDimensions = {
    // the dimensions of the cell to be used when rendering
    width: number
    height: number
    // the coordinates relative to the table group of the text
    x: number
    y: number
    cellX: number
    cellY: number
}

export type TableRenderingInfo = {
    tableWidth: number
    tableHeight: number
    tableX: number
    tableY: number
    renderingInfo: TableData<ElementPlacementInfo & CellRenderingDimensions>
}

export function elementInfoFrom(textSelection: TextSelection, cellSelection: RectSelection, cellStyle: CellStyle): ElementPlacementInfo {
    return {
        cellSelection,
        textSelection,
        textWidth: textWidthOf(textSelection),
        textHeight: textHeightOf(textSelection),
        cellStyle
    }
}

// export class SvgTable<V> {
//     private constructor(
//         private readonly uniqueTableId: string,
//         private readonly tableSelection: GSelection,
//         private readonly renderingInfo: TableRenderingInfo,
//         private readonly styledTable: StyledTable<V>,
//         private readonly container: SVGSVGElement,
//         private readonly coordinates: [x: number, y: number] | ((width: number, height: number) => [x: number, y: number])
//     ) {
//     }
//
//     static createTable<V>(
//         styledTable: StyledTable<V>,
//         container: SVGSVGElement,
//         uniqueTableId: string,
//         coordinates: [x: number, y: number] | ((width: number, height: number) => [x: number, y: number])
//     ): Result<SvgTable<V>, string> {
//         // return new SvgTable(styledTable, container, uniqueTableId, coordinates)
//         // grab a copy of the data as a data-frame
//         const tableData = styledTable.tableData()
//
//         // add the group <g> representing the table, to which all the elements will be added, and
//         // the group will be translated to the mouse (x, y) coordinates as appropriate
//         const tableSelection = select<SVGSVGElement | null, any>(container)
//             .append('g')
//             .attr('id', tableId(uniqueTableId))
//             .attr('class', 'tooltip')
//             .style('fill', styledTable.tableBackground().color)
//             .style('font-family', styledTable.tableFont().family)
//             .style('font-size', styledTable.tableFont().size)
//             .style('font-weight', styledTable.tableFont().weight)
//
//         // creates an SVG group to hold the column header (if there is one), and
//         // then add a cell for each column header element
//         const {data: columnHeaders} = createColumnHeaderPlacementInfo(tableData, tableSelection, uniqueTableId, styledTable)
//         const {columnHeader, data: rowHeaders, footer} = createRowHeaderPlacementInfo(tableData, tableSelection, uniqueTableId, styledTable)
//         const {rowHeader, data: footers} = createFooterPlacementInfo(tableData, tableSelection, uniqueTableId, styledTable)
//         const data = createDataPlacementInfo(tableData, tableSelection, uniqueTableId, styledTable)
//
//         const {top, left} = styledTable.tablePadding()
//
//         return TableData
//             .fromDataFrame<ElementPlacementInfo>(data)
//             // the column header doesn't need to deal with the value providers, because it is
//             // the first one added and so there are no row-headers or footers yet.
//             .withColumnHeader(columnHeaders)
//             .flatMap(td => td.withRowHeader(
//                 rowHeaders,
//                 defaultFormatting<ElementPlacementInfo>(),
//                 () => columnHeader,
//                 () => footer
//             ))
//             .flatMap(td => td.withFooter(
//                 footers,
//                 defaultFormatting<ElementPlacementInfo>(),
//                 () => rowHeader
//             ))
//             .map(td => {
//                 const info = calculateRenderingInfo(td, styledTable, coordinates)
//                 tableSelection.attr('transform', `translate(${info.tableX + left}, ${info.tableY + top})`)
//                 return info
//             })
//             .map(renderingInfo => placeTextInTable(renderingInfo))
//             .map(renderingInfo => new SvgTable(uniqueTableId, tableSelection, renderingInfo, styledTable, container, coordinates))
//     }
//
//     private static updateTable<V>(
//         styledTable: StyledTable<V>,
//         container: SVGSVGElement,
//         uniqueTableId: string,
//         coordinates: [x: number, y: number] | ((width: number, height: number) => [x: number, y: number])
//     ): Result<SvgTable<V>, string> {
//         const {top, left} = styledTable.tablePadding()
//
//         return TableData
//             .fromDataFrame<ElementPlacementInfo>(data)
//             // the column header doesn't need to deal with the value providers, because it is
//             // the first one added and so there are no row-headers or footers yet.
//             .withColumnHeader(columnHeaders)
//             .flatMap(td => td.withRowHeader(
//                 rowHeaders,
//                 defaultFormatting<ElementPlacementInfo>(),
//                 () => columnHeader,
//                 () => footer
//             ))
//             .flatMap(td => td.withFooter(
//                 footers,
//                 defaultFormatting<ElementPlacementInfo>(),
//                 () => rowHeader
//             ))
//             .map(td => {
//                 const info = calculateRenderingInfo(td, styledTable, coordinates)
//                 tableSelection.attr('transform', `translate(${info.tableX + left}, ${info.tableY + top})`)
//                 return info
//             })
//             .map(renderingInfo => placeTextInTable(renderingInfo))
//             .map(renderingInfo => new SvgTable(uniqueTableId, tableSelection, renderingInfo, styledTable, container, coordinates))
//     }
// }

/**
 * Creates the table
 * @param styledTable
 * @param container
 * @param uniqueTableId
 * @param coordinates
 */
export function createTable<V>(
    styledTable: StyledTable<V>,
    container: SVGSVGElement,
    uniqueTableId: string,
    coordinates: [x: number, y: number] | ((width: number, height: number) => [x: number, y: number])
): Result<TableRenderingInfo, string> {

    // grab a copy of the data as a data-frame
    const tableData = styledTable.tableData()

    // add the group <g> representing the table, to which all the elements will be added, and
    // the group will be translated to the mouse (x, y) coordinates as appropriate
    const tableSelection = select<SVGSVGElement | null, any>(container)
        .append('g')
        .attr('id', tableId(uniqueTableId))
        .attr('class', 'tooltip')
        .style('fill', styledTable.tableBackground().color)
        .style('font-family', styledTable.tableFont().family)
        .style('font-size', styledTable.tableFont().size)
        .style('font-weight', styledTable.tableFont().weight)

    // creates an SVG group to hold the column header (if there is one), and
    // then add a cell for each column header element
    const {data: columnHeaders} = createColumnHeaderPlacementInfo(tableData, tableSelection, uniqueTableId, styledTable)
    const {columnHeader, data: rowHeaders, footer} = createRowHeaderPlacementInfo(tableData, tableSelection, uniqueTableId, styledTable)
    const {rowHeader, data: footers} = createFooterPlacementInfo(tableData, tableSelection, uniqueTableId, styledTable)
    const data = createDataPlacementInfo(tableData, tableSelection, uniqueTableId, styledTable)

    const {top, left} = styledTable.tablePadding()

    return TableData
        .fromDataFrame<ElementPlacementInfo>(data)
        // the column header doesn't need to deal with the value providers, because it is
        // the first one added and so there are no row-headers or footers yet.
        .withColumnHeader(columnHeaders)
        .flatMap(td => td.withRowHeader(
            rowHeaders,
            defaultFormatting<ElementPlacementInfo>(),
            () => columnHeader,
            () => footer
        ))
        .flatMap(td => td.withFooter(
            footers,
            defaultFormatting<ElementPlacementInfo>(),
            () => rowHeader
        ))
        .map(td => {
            const info = calculateRenderingInfo(td, styledTable, coordinates)
            tableSelection.attr('transform', `translate(${info.tableX + left}, ${info.tableY + top})`)
            return info
        })
        .map(renderingInfo => placeTextInTable(renderingInfo))
}

/*
    HELPER STUFF
 */

/*
    Add all the SVG elements representing the table and then update the
    coordinates for each of those elements to make a table
 */
enum ELEMENT_TYPE_ID {
    ROW_HEADER = "row-header",
    COLUMN_HEADER = "column-header",
    DATA = "data",
    FOOTER = "footer",
    CELL_TEXT = "cell-data",
    CELL = "cell"
}

export function tableId(uniqueTableId: string): string {
    return `svg-table-group-${uniqueTableId}`
}

function columnHeaderGroupId(uniqueTableId: string): string {
    return `svg-table-${ELEMENT_TYPE_ID.COLUMN_HEADER}-group-${uniqueTableId}`
}

function rowHeaderGroupId(uniqueTableId: string): string {
    return `svg-table-${ELEMENT_TYPE_ID.ROW_HEADER}-group-${uniqueTableId}`
}

function footerGroupId(uniqueTableId: string): string {
    return `svg-table-${ELEMENT_TYPE_ID.FOOTER}-group-${uniqueTableId}`
}

function dataGroupId(uniqueTableId: string): string {
    return `svg-table-${ELEMENT_TYPE_ID.DATA}-group-${uniqueTableId}`
}

function cellTextId(uniqueTableId: string, rowIndex: number, columnIndex: number): string {
    return `svg-table-${ELEMENT_TYPE_ID.CELL_TEXT}-${rowIndex}-${columnIndex}-${uniqueTableId}`
}

function cellId(uniqueTableId: string, rowIndex: number, columnIndex: number): string {
    return `svg-table-${ELEMENT_TYPE_ID.CELL}-${rowIndex}-${columnIndex}-${uniqueTableId}`
}


function createColumnHeaderPlacementInfo<V>(
    tableData: TableData<V>,
    tableSelection: Selection<SVGGElement, any, null, undefined>,
    uniqueTableId: string,
    styledTable: StyledTable<V>
): {rowHeader?: ElementPlacementInfo, data: Array<ElementPlacementInfo>} {
    return tableData.columnHeader(true)
        .map(columnHeader => {
            const groupSelection = tableSelection
                .append('g')
                .attr('id', columnHeaderGroupId(uniqueTableId))
                .attr('class', 'tooltip-table-header')

            return columnHeader.map((header, columnIndex) => {
                // the style with the highest priority for the cell
                const style = styledTable
                    .stylesForTableCoordinates(0, columnIndex)
                    .getOrElse({...defaultCellStyle})

                const cellSelection = groupSelection
                    .append<SVGRectElement>("rect")
                    .attr('id', cellId(uniqueTableId, 0, columnIndex))
                    .style('fill', style.background.color)

                const textSelection = groupSelection
                    .append<SVGTextElement>("text")
                    .attr('id', cellTextId(uniqueTableId, 0, columnIndex))
                    .style('font-family', style.font.family)
                    .style('font-size', style.font.size)
                    .style('font-weight', style.font.weight)
                    .style('fill', style.font.color)
                    .text(() => `${header}`)

                return elementInfoFrom(textSelection, cellSelection, {...style})
            })
        })
        .map(columnHeader => {
            const rowHeaderElem = tableData.hasRowHeader() ? columnHeader.shift() : undefined
            return {rowHeader: rowHeaderElem, data: columnHeader}
        })
        .getOrElse({rowHeader: undefined, data: [] as ElementPlacementInfo[]})
}

/**
 *
 * @param tableData
 * @param tableSelection
 * @param uniqueTableId
 * @param styledTable
 */
function createRowHeaderPlacementInfo<V>(
    tableData: TableData<V>,
    tableSelection: Selection<SVGGElement, any, null, undefined>,
    uniqueTableId: string,
    styledTable: StyledTable<V>
): {columnHeader?: ElementPlacementInfo, data: Array<ElementPlacementInfo>, footer?: ElementPlacementInfo} {
    return tableData
        .rowHeader(true, true)
        .map(rowHeader => {
            const groupSelection = tableSelection
                .append('g')
                .attr('id', rowHeaderGroupId(uniqueTableId))
                .attr('class', 'tooltip-table-row-header')
                .style('fill', styledTable.rowHeaderStyle()
                    .map(styling => styling.style.background.color)
                    .getOrElse(defaultRowHeaderStyle.background.color)
                )
            return rowHeader.map((header, rowIndex) => {
                // the style with the highest priority for the cell
                const style = styledTable
                    .stylesForTableCoordinates(rowIndex, 0)
                    .getOrElse({...defaultCellStyle})

                const cellSelection = groupSelection
                    .append<SVGRectElement>("rect")
                    .attr('id', cellId(uniqueTableId, rowIndex, 0))
                    .style('fill', style.background.color)

                const textSelection = groupSelection
                    .append<SVGTextElement>("text")
                    .attr('id', cellTextId(uniqueTableId, 0, rowIndex))
                    .style('font-family', style.font.family)
                    .style('font-size', style.font.size)
                    .style('font-weight', style.font.weight)
                    .style('fill', style.font.color)
                    .text(() => `${header}`)

                // return elementInfoFrom(textSelection, style.alignText, {...style.padding})
                return elementInfoFrom(textSelection, cellSelection, {...style})
            })
        })
        .map(rowHeader => {
            const columnHeaderElem = tableData.hasRowHeader() ? rowHeader.shift() : undefined
            const footerElem = tableData.hasFooter() ? rowHeader.pop() : undefined
            return {columnHeader: columnHeaderElem, data: rowHeader, footer: footerElem}
        })
        .getOrElse({columnHeader: undefined, data: [] as ElementPlacementInfo[], footer: undefined})
}

/**
 *
 * @param tableData
 * @param tableSelection
 * @param uniqueTableId
 * @param styledTable
 */
function createFooterPlacementInfo<V>(
    tableData: TableData<V>,
    tableSelection: Selection<SVGGElement, any, null, undefined>,
    uniqueTableId: string,
    styledTable: StyledTable<V>
): {rowHeader?: ElementPlacementInfo, data: Array<ElementPlacementInfo>} {
    return tableData
        .footer(true)
        .map(footer => {
            const groupSelection = tableSelection
                .append('g')
                .attr('id', footerGroupId(uniqueTableId))
                .attr('class', 'tooltip-table-footer')
                .style('fill', styledTable.columnHeaderStyle()
                    .map(styling => styling.style.background.color)
                    .getOrElse(defaultFooterStyle.background.color)
                )
            return footer.map((ftr, columnIndex) => {
                // the style with the highest priority for the cell
                const style = styledTable
                    .stylesForTableCoordinates(footer.length - 1, columnIndex)
                    .getOrElse({...defaultCellStyle})

                const cellSelection = groupSelection
                    .append<SVGRectElement>("rect")
                    .attr('id', cellId(uniqueTableId, 0, columnIndex))
                    .style('fill', style.background.color)

                const textSelection = groupSelection
                    .append<SVGTextElement>("text")
                    .attr('id', cellTextId(uniqueTableId, 0, columnIndex))
                    .style('font-family', style.font.family)
                    .style('font-size', style.font.size)
                    .style('font-weight', style.font.weight)
                    .style('fill', style.font.color)
                    .text(() => `${ftr}`)

                // return elementInfoFrom(textSelection, style.alignText, {...style.padding})
                return elementInfoFrom(textSelection, cellSelection, {...style})
            })
        })
        .map(footer => {
            const rowHeaderElem = tableData.hasRowHeader() ? footer.shift() : undefined
            return {rowHeader: rowHeaderElem, data: footer}
        })
        .getOrElse({rowHeader: undefined, data: [] as ElementPlacementInfo[]})
}

/**
 *
 * @param tableData
 * @param tableSelection
 * @param uniqueTableId
 * @param styledTable
 */
function createDataPlacementInfo<V>(
    tableData: TableData<V>,
    tableSelection: Selection<SVGGElement, any, null, undefined>,
    uniqueTableId: string,
    styledTable: StyledTable<V>
): DataFrame<ElementPlacementInfo> {
    // when the table has a column header, then the data starts at row 1
    // otherwise, the data starts at row 0
    const rowOffset = tableData.hasRowHeader() ? 1 : 0
    const columnOffset = tableData.hasColumnHeader() ? 1 : 0
    return tableData
        .data()
        .map(df => {
            const groupSelection = tableSelection
                .append('g')
                .attr('class', 'tooltip-table-data')
                .attr('id', dataGroupId(uniqueTableId))
            //
            return df.mapElements((element, rowIndex, columnIndex) => {
                // the style with the highest priority for the cell
                const style = styledTable
                    .stylesForTableCoordinates(rowIndex + rowOffset, columnIndex + columnOffset)
                    .getOrElse({...defaultCellStyle})

                const cellSelection = groupSelection
                    .append<SVGRectElement>("rect")
                    .attr('id', cellId(uniqueTableId, rowIndex + rowOffset, columnIndex + columnOffset))
                    .style('fill', style.background.color)
                    .style('fill-opacity', style.background.opacity)

                const textSelection = groupSelection
                    .append<SVGTextElement>("text")
                    .attr('id', cellTextId(uniqueTableId, rowIndex + rowOffset, columnIndex + columnOffset))
                    .style('font-family', style.font.family)
                    .style('font-size', style.font.size)
                    .style('font-weight', style.font.weight)
                    .style('fill', style.font.color)
                    .text(() => `${element}`)

                // return elementInfoFrom(textSelection, style.alignText, {...style.padding})
                return elementInfoFrom(textSelection, cellSelection, {...style})
            })
        })
        .getOrElse(DataFrame.empty<ElementPlacementInfo>())
}

/**
 * Calculates the
 * 1. table width and height,
 * 2. width of each column in the table,
 * 3. height of each row in the table,
 * 4.
 *
 * @param tableData
 * @param styledTable
 * @param coordinates
 */
function calculateRenderingInfo<V>(
    tableData: TableData<ElementPlacementInfo>,
    styledTable: StyledTable<V>,
    coordinates: [x: number, y: number] | ((width: number, height: number) => [x: number, y: number])
): TableRenderingInfo {

    type WithWidthHeight = ElementPlacementInfo & { cellWidth: number, cellHeight: number }

    type MinMax = { min: number, max: number, minValues: Array<number>, maxValues: Array<number> }

    /**
     * Calculates the min and max values for the extracted value from the cell
     * @param elements An array of rows (data frame row slices) or columns (data
     * frame column slices)
     * @param extractor
     */
    function minMaxFor(
        elements: Array<Array<WithWidthHeight>>,
        extractor: (cell: WithWidthHeight) => number
    ): MinMax {
        return elements.reduce(
            (minMax: MinMax, row: Array<WithWidthHeight>): MinMax => {
                const cellValue = row.map(cell => Math.ceil(extractor(cell)))
                const {min, max, minValues, maxValues} = minMax
                const mins = Math.min(...cellValue)
                minValues.push(mins)
                const maxes = Math.max(...cellValue)
                maxValues.push(maxes)
                return {
                    minValues,
                    min: Math.min(min, mins),
                    maxValues,
                    max: Math.max(max, maxes)
                }
            },
            {min: Infinity, max: -Infinity, minValues: [], maxValues: []})
    }

    const df = tableData.unwrapDataFrame()

    // 1. calculate the bounding box for the element
    // 2. calculate the cell width/height using the bounding width/height and the
    //    maximum and minimum cell width/height from the styling
    const whdf: DataFrame<WithWidthHeight> = df.mapElements((element, rowIndex, columnIndex) => {

        // grab the style for the cell
        const style = styledTable
            .stylesForTableCoordinates(rowIndex, columnIndex)
            .getOrElse({...defaultCellStyle})

        // calculate the actual width and height of the cell
        const {width, height} = calculateCellDimensions(style, element.textWidth, element.textHeight)

        return {...element, cellWidth: width, cellHeight: height}
    })

    // 3. calculate the cell width for each column based on the max and min width of
    //    all the cells in the column
    // 4. calculate the cell height for each row based on the max and min height of
    //    all the cells in the row
    // 5. calculate the table width/height by adding up all the column-widths/row-heights
    // 6. calculate the (x, y)-coordinates of the text for each cell
    // 7. update each cell's coordinates (here we need to update the header groups, footer
    //    groups, and then the cell's coordinates relative to their group.. :()
    const minMaxColumnWidths = minMaxFor(whdf.columnSlices(), cell => cell.cellWidth)
    const minMaxRowHeights = minMaxFor(whdf.rowSlices(), cell => cell.cellHeight)

    const columnWidths = df.columnSlices().map((_, index) => {
        if (index === 0 && tableData.hasRowHeader()) {
            return styledTable.rowHeaderStyle()
                // todo update the styling for the row-headers to include the width and the min and max width
                .map(_ => minMaxColumnWidths.maxValues[index])
                .getOrElse(Math.max(defaultColumnStyle.dimension.minWidth, Math.min(defaultColumnStyle.dimension.maxWidth, minMaxColumnWidths.maxValues[index])))
        }
        return styledTable.columnStyleFor(index)
            .map(styling => Math.max(styling.style.dimension.minWidth, Math.min(styling.style.dimension.maxWidth, minMaxColumnWidths.maxValues[index])))
            .getOrElse(Math.max(defaultColumnStyle.dimension.minWidth, Math.min(defaultColumnStyle.dimension.maxWidth, minMaxColumnWidths.maxValues[index])))
    })
    const rowHeights = df.rowSlices().map((_, index) => {
        if (index === 0 && tableData.hasColumnHeader()) {
            return styledTable.columnHeaderStyle()
                .map(styling => Math.max(styling.style.dimension.minHeight, Math.min(styling.style.dimension.maxHeight, minMaxRowHeights.maxValues[index])))
                .getOrElse(Math.max(defaultRowStyle.dimension.minHeight, Math.min(defaultRowStyle.dimension.maxHeight, minMaxRowHeights.maxValues[index])))
        }
        return styledTable.rowStyleFor(index)
            .map(styling => Math.max(
                styling.style.dimension.minHeight,
                Math.min(
                    styling.style.dimension.maxHeight,
                    minMaxRowHeights.maxValues[index]
                )
            ))
            .getOrElse(Math.max(defaultRowStyle.dimension.minHeight, Math.min(defaultRowStyle.dimension.maxHeight, minMaxRowHeights.maxValues[index])))
    })

    const dimAdjustedDf = df
        .mapElements((element, rowIndex, columnIndex): ElementPlacementInfo =>
            ({
                ...element,
                cellStyle: {
                    ...element.cellStyle,
                    dimension: {
                        ...element.cellStyle.dimension,
                        width: columnWidths[columnIndex],
                        height: rowHeights[rowIndex]
                    }
                }
            })
        )

    // todo gross as shit, is there a better way
    const cumColumnWidths = columnWidths.reduce((sum: Array<number>, curr: number, index) => {
        sum.push(Math.ceil(curr) + sum[index])
        return sum
    }, [0])
    const cumRowHeights = rowHeights.reduce((sum: Array<number>, curr: number, index) => {
        sum.push(Math.ceil(curr) + sum[index])
        return sum
    }, [0])
    const positionAdjustedDf = dimAdjustedDf
        .mapElements((element, rowIndex, columnIndex): ElementPlacementInfo & CellRenderingDimensions => {
            const cellWidth = element.cellStyle.dimension.width
            const cellHeight = element.cellStyle.dimension.height
            return {
                ...element,
                width: cellWidth,
                height: cellHeight,
                x: cumColumnWidths[columnIndex] + textXOffset(element, cellWidth),
                y: cumRowHeights[rowIndex] + textYOffset(element, cellHeight),
                cellX: cumColumnWidths[columnIndex],
                cellY: cumRowHeights[rowIndex]
            }
        })

    const tableWidth = columnWidths.reduce((sum, width) => sum + width, 0)
    const tableHeight = rowHeights.reduce((sum, height) => sum + height, 0)
    const [x, y] = (Array.isArray(coordinates)) ? coordinates : coordinates(tableWidth, tableWidth)

    return {
        tableWidth,
        tableHeight,
        tableX: x,
        tableY: y,
        renderingInfo: TableData.fromDataFrame(positionAdjustedDf)
    }
}


/**
 * Calculates the row and column dimensions based on the min and max width and hieght of
 * the cells.
 * @param style
 * @param width
 * @param height
 */
function calculateCellDimensions(style: CellStyle, width: number, height: number): {
    width: number,
    height: number
} {
    return {
        width: Math.max(
            Math.min(
                width + style.padding.left + style.padding.right,
                style.dimension.maxWidth
            ),
            style.dimension.minWidth
        ),
        height: Math.max(
            Math.min(
                height + style.padding.top + style.padding.bottom,
                style.dimension.maxHeight
            ),
            style.dimension.minHeight
        )
    }
}

/**
 * Calculates the x-offset of the text with the cell
 * @param element The element to render
 * @param cellWidth The width of the cell into which the text is rendered
 */
function textXOffset(element: ElementPlacementInfo, cellWidth: number): number {
    switch (element.cellStyle.alignText) {
        case "left":
            return element.cellStyle.padding.left

        case "center":
            return cellWidth / 2

        case "right":
            return cellWidth - element.cellStyle.padding.right

        default:
            return cellWidth / 2
    }
}

function textYOffset(element: ElementPlacementInfo, cellHeight: number): number {
    switch (element.cellStyle.verticalAlignText) {
        case "top":
            return element.cellStyle.padding.top

        case "middle":
            return cellHeight / 2

        case "bottom":
            return cellHeight - element.cellStyle.padding.bottom

        default:
            return cellHeight / 2
    }
}

/**
 * Places the text into the table at its (x, y) coordinates, and returns the {@link TableData} holding
 * the updated values.
 * @param tableRenderingInfo The information for rendering the text as a table
 * @return A {@link TableData} holding the updated values.
 */
function placeTextInTable(tableRenderingInfo: TableRenderingInfo): TableRenderingInfo {
    const updatedDf = tableRenderingInfo.renderingInfo.unwrapDataFrame()
        .mapElements(info => {
            info.cellSelection
                .attr('width', info.width)
                .attr('height', info.height)
                .attr('transform', `translate(${info.cellX}, ${info.cellY})`)
            info.textSelection
                .attr('text-anchor', textAnchorFrom(info.cellStyle.alignText))
                .attr('dominant-baseline', dominantBaselineFrom(info.cellStyle.verticalAlignText))
                .attr('transform', `translate(${info.x}, ${info.y})`)
            return info
        })
    return {
        ...tableRenderingInfo,
        renderingInfo: TableData.fromDataFrame(updatedDf)
    }
}

