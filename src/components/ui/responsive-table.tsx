import * as React from "react"
import { memo } from "react"
import { cn } from "@/lib/utils"
import { Card, CardContent } from "@/components/ui/card"

interface ResponsiveTableProps extends React.HTMLAttributes<HTMLDivElement> {
  headers: { key: string; label: string; className?: string }[]
  rows: { id: string | number; cells: { key: string; content: React.ReactNode; className?: string }[] }[]
  mobileCardClassName?: string
  tableClassName?: string
}

const TableRow = memo(({
  row,
  _mobileCardClassName,
  rowIndex
}: {
  row: { id: string | number; cells: { key: string; content: React.ReactNode; className?: string }[] }
  _mobileCardClassName?: string
  rowIndex: number
}) => {
  return (
      <tr key={row.id} className="border-b transition-colors hover:bg-muted/50" role="row" aria-rowindex={rowIndex}>
        {row.cells.map((cell, cellIndex) => (
          <td
            key={cell.key}
            className={cn("p-2 align-middle", cell.className)}
            role="cell"
            aria-colindex={cellIndex + 1}
          >
            {cell.content}
          </td>
        ))}
      </tr>
  );
}, (prevProps, nextProps) => {
  return prevProps.row.id === nextProps.row.id &&
         prevProps.row.cells.length === nextProps.row.cells.length &&
         prevProps._mobileCardClassName === nextProps._mobileCardClassName;
});
TableRow.displayName = "TableRow"

const MobileCardRow = memo(({
  row,
  headers,
  mobileCardClassName,
  itemIndex
}: {
  row: { id: string | number; cells: { key: string; content: React.ReactNode; className?: string }[] }
  headers: { key: string; label: string; className?: string }[]
  mobileCardClassName?: string
  itemIndex?: number
}) => {
  return (
    <Card key={row.id} className={cn("p-4 md:hidden", mobileCardClassName)} role="listitem" aria-setsize={-1} aria-posinset={itemIndex}>
      <CardContent className="p-0 space-y-3">
        {row.cells.map((cell) => {
          const header = headers.find((h) => h.key === cell.key)
          return (
            <div key={cell.key} className="flex flex-col gap-1">
              <span className="text-xs font-semibold text-muted-foreground" id={`${row.id}-${cell.key}-label`}>
                {header?.label}
              </span>
              <div className={cn(cell.className)} aria-labelledby={`${row.id}-${cell.key}-label`}>{cell.content}</div>
            </div>
          )
        })}
      </CardContent>
    </Card>
  );
}, (prevProps, nextProps) => {
  return prevProps.row.id === nextProps.row.id && prevProps.mobileCardClassName === nextProps.mobileCardClassName;
});
MobileCardRow.displayName = "MobileCardRow"

export const ResponsiveTable = memo(function ResponsiveTable({ 
  headers, 
  rows, 
  mobileCardClassName,
  tableClassName,
  className 
}: ResponsiveTableProps) {
  return (
    <>
      <div className={cn("hidden md:block overflow-x-auto", className)}>
        <table className={cn("w-full caption-bottom text-sm", tableClassName)} role="table">
          <thead>
            <tr className="border-b" role="row">
              {headers.map((header, index) => (
                <th
                  key={header.key}
                  className={cn(
                    "h-10 px-2 text-left align-middle font-medium text-muted-foreground",
                    header.className
                  )}
                  scope="col"
                  role="columnheader"
                  aria-colindex={index + 1}
                >
                  {header.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody role="rowgroup">
            {rows.map((row, index) => (
              <TableRow key={row.id} row={row} _mobileCardClassName={mobileCardClassName} rowIndex={index + 1} />
            ))}
          </tbody>
        </table>
      </div>

      <div className="md:hidden space-y-3" role="list" aria-label={`${headers[0]?.label} list`}>
        {rows.map((row, index) => (
          <MobileCardRow key={row.id} row={row} headers={headers} mobileCardClassName={mobileCardClassName} itemIndex={index + 1} />
        ))}
      </div>
    </>
  );
});
ResponsiveTable.displayName = "ResponsiveTable"
