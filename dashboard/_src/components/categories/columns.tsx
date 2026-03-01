import type { ColumnDef } from '@tanstack/react-table'

export const generateColumns = (isParent: boolean = false) => {
  const columns: Array<ColumnDef<any>> = [
    {
      // TODO: Add image column
      header: '',
      accessorKey: 'image',
    },
    {
      header: 'Name',
      accessorKey: 'name',
    },
    {
      header: 'Parent Category',
      accessorKey: 'parent_category',
    },
    {
      header: 'Actions',
      accessorKey: 'actions',
    },
  ]

  if (isParent) {
    return columns.filter((col) => col.header !== 'Parent Category')
  }

  return columns
}
