import {
  flexRender,
  getCoreRowModel,
  getExpandedRowModel,
  useReactTable,
} from '@tanstack/react-table'
import { ChevronDownIcon, ChevronRightIcon } from 'lucide-react'
import * as React from 'react'
import { useState } from 'react'
import { Button } from '_src/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '_src/components/ui/table'
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar'
import { Badge } from '../ui/badge'
import type { ColumnDef } from '@tanstack/react-table'

export const title = 'Expandable Sub-Rows'

type Category = {
  id: string
  name: string
  is_active: boolean
  created_at: string
  image_url: string
  parent_category: string | null
  subcategories?: Array<SubCategory>
}

type SubCategory = {
  id: string
  name: string
  is_active: boolean
  created_at: string
  image_url: string
  parent_category: string | null
}

const data: Array<Category> = [
  {
    id: '1',
    name: 'Indoor Plants',
    is_active: true,
    created_at: '2024-01-01',
    image_url: 'https://example.com/indoor-plants.jpg',
    parent_category: null,
  },
  {
    id: '2',
    name: 'Outdoor Plants',
    is_active: true,
    created_at: '2024-01-02',
    image_url: 'https://example.com/outdoor-plants.jpg',
    parent_category: null,
    subcategories: [
      {
        id: '2-1',
        name: 'Flowering Plants',
        is_active: true,
        created_at: '2024-01-03',
        image_url: 'https://example.com/flowering-plants.jpg',
        parent_category: '2',
      },
      {
        id: '2-2',
        name: 'Shrubs',
        is_active: true,
        created_at: '2024-01-04',
        image_url: 'https://example.com/shrubs.jpg',
        parent_category: '2',
      },
    ],
  },
]

const columns: Array<ColumnDef<Category>> = [
  {
    id: 'expander',
    header: () => null,
    cell: ({ row }) => {
      return row.original.subcategories &&
        row.original.subcategories.length > 0 ? (
        <Button
          className="h-8 w-8 p-0"
          onClick={() => row.toggleExpanded()}
          size="sm"
          variant="ghost"
        >
          {row.getIsExpanded() ? (
            <ChevronDownIcon className="size-4" />
          ) : (
            <ChevronRightIcon className="size-4" />
          )}
        </Button>
      ) : null
    },
  },
  {
    accessorKey: 'image_url',
    header: 'Image',
    cell: ({ row }) => (
      <Avatar>
        <AvatarImage
          src={row.getValue('image_url')}
          alt={row.getValue('name')}
        />
        <AvatarFallback>{row.getValue('name')}</AvatarFallback>
      </Avatar>
    ),
  },
  {
    accessorKey: 'name',
    header: 'Name',
    cell: ({ row }) => (
      <div className="font-medium">{row.getValue('name')}</div>
    ),
  },
  {
    accessorKey: 'parent_category',
    header: 'Parent Category',
    cell: ({ row }) => (
      <div className="font-medium">{row.getValue('parent_category')}</div>
    ),
  },
  {
    accessorKey: 'is_active',
    header: 'Is Active',
    cell: ({ row }) => {
      const isActive = row.getValue('is_active')
      return (
        <Badge variant={isActive ? 'default' : 'destructive'}>
          {isActive ? 'Active' : 'Inactive'}
        </Badge>
      )
    },
  },
  {
    accessorKey: '',
    header: 'Actions',
    cell: ({ row }) => (
      <div className="flex gap-2">
        <Button size="sm" variant="outline">
          Edit
        </Button>
        <Button size="sm" variant="destructive">
          Delete
        </Button>
      </div>
    ),
  },
]

const CategoryTable = () => {
  //       const [tableData, setTableData] = useState(data)
  //   const [globalFilter, setGlobalFilter] = useState('')
  //   const [sorting, setSorting] = useState<SortingState>([])
  //   const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  //   const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})
  //   const [rowSelection, setRowSelection] = useState({})

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getExpandedRowModel: getExpandedRowModel(),
    getRowCanExpand: (row) => !!row.original.subcategories,
  })

  return (
    <div className="w-full">
      <div className="rounded-md border bg-background">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext(),
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <React.Fragment key={row.id}>
                  <TableRow>
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id}>
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext(),
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                  {row.getIsExpanded() && row.original.subcategories && (
                    <TableRow>
                      <TableCell colSpan={columns.length}>
                        <div className="rounded-md w-full bg-muted/50 p-4">
                          <Table className="space-y-2">
                            {row.original.subcategories.map((sub) => (
                              <TableRow
                                className="flex items-center gap-4 text-sm"
                                key={sub.id}
                              >
                                <TableCell className="flex-1"></TableCell>
                                <TableCell className="flex-1">
                                  <Avatar>
                                    <AvatarImage
                                      src={sub.image_url}
                                      alt={sub.name}
                                    />
                                    <AvatarFallback>{sub.name}</AvatarFallback>
                                  </Avatar>
                                </TableCell>
                                <TableCell className="flex-1 font-medium">
                                  {sub.name}
                                </TableCell>
                                <TableCell className="flex-1 text-muted-foreground">
                                  {sub.parent_category}
                                </TableCell>
                                <TableCell className="flex-1">
                                  <Badge
                                    variant={
                                      sub.is_active ? 'default' : 'destructive'
                                    }
                                  >
                                    {sub.is_active ? 'Active' : 'Inactive'}
                                  </Badge>
                                </TableCell>
                                <TableCell className="grow">
                                  <div className="flex gap-2">
                                    <Button size="sm" variant="outline">
                                      Edit
                                    </Button>
                                    <Button size="sm" variant="destructive">
                                      Delete
                                    </Button>
                                  </div>
                                </TableCell>
                              </TableRow>
                            ))}
                          </Table>
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </React.Fragment>
              ))
            ) : (
              <TableRow>
                <TableCell
                  className="h-24 text-center"
                  colSpan={columns.length}
                >
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}

export default CategoryTable
