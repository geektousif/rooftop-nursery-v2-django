import { useMemo, useState } from 'react'
import {
  MantineReactTable,
  createRow,
  type MRT_ColumnDef,
  type MRT_Row,
  type MRT_TableOptions,
  useMantineReactTable,
} from 'mantine-react-table'
import {
  Box,
  Button,
  ActionIcon,
  Tooltip,
  darken,
  lighten,
  useMantineTheme,
} from '@mantine/core'
import {
  QueryClientProvider,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query'
import { type Category, usStates } from './makeData.ts'
import { IconEdit, IconTrash, IconTagPlus } from '@tabler/icons-react'
import { useColorScheme } from '@mantine/hooks'
import categoryApi from '@/api/services/categories.ts'
import { notifications } from '@mantine/notifications'

const Example = () => {
  const theme = useMantineTheme()
  const scheme = useColorScheme()
  const [creatingRowIndex, setCreatingRowIndex] = useState<number | undefined>()
  const [validationErrors, setValidationErrors] = useState<
    Record<string, string | undefined>
  >({})

  const columns = useMemo<MRT_ColumnDef<Category>[]>(
    () => [
      // {
      //   accessorKey: 'city',
      //   header: 'City',
      //   mantineEditTextInputProps: {
      //     required: true,
      //     error: !!validationErrors?.city,
      //     description: validationErrors?.city,
      //     onFocus: () =>
      //       setValidationErrors({
      //         ...validationErrors,
      //         city: undefined,
      //       }),
      //   },
      // },
      {
        accessorKey: 'id',
        header: 'ID',
        enableEditing: false,
        enableSorting: false,
      },
      {
        accessorKey: 'name',
        header: 'Name',
        mantineEditTextInputProps: {
          required: true,
          error: !!validationErrors?.name,
          description: validationErrors?.name,
          onFocus: () =>
            setValidationErrors({
              ...validationErrors,
              name: undefined,
            }),
        },
      },
      {
        accessorKey: 'code',
        header: 'Category Code',
        enableSorting: false,
      },
    ],
    [validationErrors],
  )

  const { mutateAsync: createCategory, isPending: isCreatingCategory } =
    useCreateCategory()
  const {
    data: fetchedCategories = [],
    isError: isLoadingCategoriesError,
    isFetching: isFetchingCategories,
    isLoading: isLoadingCategories,
  } = useGetCategories()
  const { mutateAsync: updateCategory, isPending: isUpdatingCategory } =
    useUpdateCategory()
  const { mutateAsync: deleteCategory, isPending: isDeletingCategory } =
    useDeleteCategory()

  const handleCreateCategory: MRT_TableOptions<Category>['onCreatingRowSave'] =
    async ({ values, row, table }) => {
      const newValidationErrors = validateCategory(values)
      if (Object.values(newValidationErrors).some((error) => error)) {
        setValidationErrors(newValidationErrors)
        return
      }
      setValidationErrors({})
      console.log('values', row.original.parent)
      await createCategory({
        ...values,
        id: undefined,
        parent: row.original.parent || null, // Use the parent_id from values that we set when creating the row
        children: undefined,
      })
      table.setCreatingRow(null)
    }

  const handleSaveCategory: MRT_TableOptions<Category>['onEditingRowSave'] =
    async ({ values, table }) => {
      const newValidationErrors = validateCategory(values)
      if (Object.values(validationErrors).some((error) => error)) {
        setValidationErrors(newValidationErrors)
        return
      }
      setValidationErrors({})
      await updateCategory(values)
      table.setEditingRow(null)
    }

  const openDeleteConfirmModal = (row: MRT_Row<Category>) => {
    if (window.confirm('Are you sure you want to delete this category?')) {
      deleteCategory(row.original.id)
    }
  }

  const table = useMantineReactTable({
    columns,
    data: fetchedCategories,
    createDisplayMode: 'row',
    editDisplayMode: 'row',
    enableColumnPinning: true,
    enableEditing: true,
    enableExpanding: true,
    positionCreatingRow: creatingRowIndex,
    getRowId: (row) => row.id,
    getSubRows: (row) => row.children || [],
    mantineToolbarAlertBannerProps: isLoadingCategoriesError
      ? {
          color: 'red',
          children: 'Error loading data',
        }
      : undefined,
    mantineTableContainerProps: {
      style: {
        minHeight: '500px',
      },
    },
    mantineTableBodyRowProps: ({ row }) => ({
      style: {
        td: {
          backgroundColor: darken(
            lighten(theme.colors[theme.primaryColor][0], 0.1),
            row.depth * (scheme === 'dark' ? 0.2 : 0.1),
          ),
        },
      },
    }),
    onCreatingRowCancel: () => setValidationErrors({}),
    onCreatingRowSave: handleCreateCategory,
    onEditingRowCancel: () => setValidationErrors({}),
    onEditingRowSave: handleSaveCategory,
    renderRowActions: ({ row, renderedRowIndex, table }) => (
      <Box style={{ display: 'flex', gap: '0.5rem' }}>
        <Tooltip label="Add Subordinate">
          <ActionIcon
            color="blue"
            onClick={() => {
              // Find the actual position in the flattened row model
              const rows = table.getRowModel().rows
              const rowIndex = rows.findIndex((r) => r.id === row.id)

              console.log('Adding subordinate to parent:', row.id)
              setCreatingRowIndex(rowIndex !== -1 ? rowIndex + 1 : 0)
              table.setCreatingRow(
                createRow(
                  table,
                  {
                    id: null!,
                    name: '',
                    isActive: true,
                    parent: row.id, // This is correct - using the current row's id as parent
                    code: '',
                    children: undefined,
                  },
                  -1,
                  row.depth + 1,
                ),
              )
            }}
          >
            <IconTagPlus size="1rem" />
          </ActionIcon>
        </Tooltip>
        <Tooltip label="Edit">
          <ActionIcon color="green" onClick={() => table.setEditingRow(row)}>
            <IconEdit size="1rem" />
          </ActionIcon>
        </Tooltip>
        <Tooltip label="Delete">
          <ActionIcon color="red.8" onClick={() => openDeleteConfirmModal(row)}>
            <IconTrash size="1rem" />
          </ActionIcon>
        </Tooltip>
      </Box>
    ),
    renderTopToolbarCustomActions: ({ table }) => (
      <Button
        leftSection={<IconTagPlus size="1rem" />}
        onClick={() => {
          setCreatingRowIndex(table.getRowModel().rows.length)
          table.setCreatingRow(true)
        }}
      >
        Create New Category
      </Button>
    ),
    initialState: {
      columnPinning: { left: [], right: ['mrt-row-actions'] },
      expanded: true,
      pagination: { pageSize: 20, pageIndex: 0 },
    },
    state: {
      isLoading: isLoadingCategories,
      isSaving: isCreatingCategory || isUpdatingCategory || isDeletingCategory,
      showAlertBanner: isLoadingCategoriesError,
      showProgressBars: isFetchingCategories,
    },
  })

  return <MantineReactTable table={table} />
}

//CREATE hook (post new user to api)
function useCreateCategory() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (category: Category) => {
      console.info('create category', category)
      //send api update request here
      return await categoryApi.create({
        ...category,
        parent_id: category.parent,
        parent: undefined,
      })
    },
    //client side optimistic update
    // onMutate: (newCategory: Category) => {
    //   queryClient.setQueryData(
    //     ['categories'],
    //     (_prevCategories: Category[]) => {
    //       const prevCategories: Category[] = JSON.parse(
    //         JSON.stringify(_prevCategories),
    //       )
    //       newCategory.children = undefined
    //       if (newCategory.parent) {
    //         const parent = findCategoryInTree(
    //           newCategory.parent,
    //           prevCategories,
    //         )
    //         if (parent) {
    //           parent.children = [
    //             ...(parent.children || []),
    //             {
    //               ...newCategory,
    //               id: `${parent.id}.${(parent.children?.length || 0) + 1}`,
    //             },
    //           ]
    //         }
    //       } else {
    //         prevCategories.push({
    //           ...newCategory,
    //           id: `${prevCategories.length + 1}`,
    //         })
    //       }
    //       return [...prevCategories]
    //     },
    //   )
    // },
    onSettled: () => {
      notifications.show({
        message: 'Category created successfully',
        color: 'green',
      })
      queryClient.invalidateQueries({ queryKey: ['categories'] })
    }, //refetch users after mutation, disabled for demo
  })
}

//READ hook (get users from api)
function useGetCategories() {
  return useQuery<Category[]>({
    queryKey: ['categories'],
    queryFn: async () => {
      //send api request here
      return await categoryApi.list() //fake api call
    },
    refetchOnWindowFocus: false,
  })
}

//UPDATE hook (put user in api)
function useUpdateCategory() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (category: Category) => {
      console.info('update category', category)
      //send api update request here
      return await categoryApi.update(category.id!, category)
    },
    //client side optimistic update
    onMutate: (newCategoryInfo: Category) => {
      queryClient.setQueryData(['categories'], (prev: any) => {
        let category = findCategoryInTree(newCategoryInfo.id!, prev)
        category = { ...category, ...newCategoryInfo }
        return [...prev]
      })
    },
    // onSettled: () => queryClient.invalidateQueries({ queryKey: ['users'] }), //refetch users after mutation, disabled for demo
  })
}

//DELETE hook (delete user in api)
function useDeleteCategory() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (categoryId: string) => {
      console.info('delete category', categoryId)
      //send api update request here
      return await categoryApi.delete(categoryId)
    },
    //client side optimistic update
    onMutate: (categoryId: string) => {
      queryClient.setQueryData(['categories'], (prevCategory: any) => {
        const newCategory: Category[] = JSON.parse(JSON.stringify(prevCategory))
        //remove user
        const category = findCategoryInTree(categoryId, newCategory)
        if (category) {
          const parent = findCategoryInTree(category.parent, newCategory)
          if (parent) {
            parent.children = parent.children?.filter(
              (subCategory) => subCategory.id !== category.id,
            )
          } else {
            return newCategory.filter((category) => category.id !== categoryId)
          }
        }
        return [...newCategory]
      })
    },
    // onSettled: () => queryClient.invalidateQueries({ queryKey: ['users'] }), //refetch users after mutation, disabled for demo
  })
}

const ExampleWithProviders = () => {
  const queryClient = useQueryClient()
  return (
    <QueryClientProvider client={queryClient}>
      <Example />
    </QueryClientProvider>
  )
}

export default ExampleWithProviders

// validateUser and findUserInTree functions remain the same
const validateRequired = (value: string) => !!value.length

function validateCategory(category: Category) {
  return {
    name: !validateRequired(category.name) ? 'Name is Required' : '',
  }
}

function findCategoryInTree(
  parent: string | null,
  categories: Category[],
): Category | null {
  for (let i = 0; i < categories.length; i++) {
    if (categories[i].id === parent) {
      return categories[i]
    }
    if (categories[i].children) {
      const found = findCategoryInTree(parent, categories[i].children!)
      if (found) return found
    }
  }
  return null
}
