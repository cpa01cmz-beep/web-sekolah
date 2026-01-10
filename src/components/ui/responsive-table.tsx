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
  headers, 
  mobileCardClassName 
}: { 
  row: { id: string | number; cells: { key: string; content: React.ReactNode; className?: string }[] }
  headers: { key: string; label: string; className?: string }[]
  mobileCardClassName?: string
}) => {
  return (
      <tr key={row.id} className="border-b transition-colors hover:bg-muted/50">
        {row.cells.map((cell) => (
          <td
            key={cell.key}
            className={cn("p-2 align-middle", cell.className)}
          >
            {cell.content}
          </td>
        ))}
      </tr>
  );
});
TableRow.displayName = "TableRow"

const MobileCardRow = memo(({ 
  row, 
  headers, 
  mobileCardClassName 
}: { 
  row: { id: string | number; cells: { key: string; content: React.ReactNode; className?: string }[] }
  headers: { key: string; label: string; className?: string }[]
  mobileCardClassName?: string
}) => {
  return (
    <Card key={row.id} className={cn("p-4 md:hidden", mobileCardClassName)}>
      <CardContent className="p-0 space-y-3">
        {row.cells.map((cell) => {
          const header = headers.find((h) => h.key === cell.key)
          return (
            <div key={cell.key} className="flex flex-col gap-1">
              <span className="text-xs font-semibold text-muted-foreground">
                {header?.label}
              </span>
              <div className={cn(cell.className)}>{cell.content}</div>
            </div>
          )
        })}
      </CardContent>
    </Card>
  );
});
MobileCardRow.displayName = "MobileCardRow"

export function ResponsiveTable({ 
  headers, 
  rows, 
  mobileCardClassName,
  tableClassName,
  className 
}: ResponsiveTableProps) {
  return (
    <>
      <div className={cn("hidden md:block overflow-x-auto", className)}>
        <table className={cn("w-full caption-bottom text-sm", tableClassName)}>
          <thead>
            <tr className="border-b">
              {headers.map((header) => (
                <th
                  key={header.key}
                  className={cn(
                    "h-10 px-2 text-left align-middle font-medium text-muted-foreground",
                    header.className
                  )}
                  scope="col"
                >
                  {header.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <TableRow key={row.id} row={row} headers={headers} />
            ))}
          </tbody>
        </table>
      </div>

      <div className="md:hidden space-y-3">
        {rows.map((row) => (
          <MobileCardRow key={row.id} row={row} headers={headers} mobileCardClassName={mobileCardClassName} />
        ))}
      </div>
    </>
  )
}
ResponsiveTable.displayName = "ResponsiveTable"
