import {
  type UIEvent,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import {
  MantineReactTable,
  useMantineReactTable,
  type MRT_ColumnDef,
  type MRT_ColumnFiltersState,
  type MRT_SortingState,
  type MRT_RowVirtualizer,
} from 'mantine-react-table'
import {
  ActionIcon,
  Box,
  Button,
  Center,
  Text,
  Tooltip,
  Badge,
  Group,
} from '@mantine/core'
import {
  useInfiniteQuery,
  useMutation,
  useQueryClient,
} from '@tanstack/react-query'
import { productApi, productVariantApi } from '@/api/services/products'
import { UserRoles } from '@/utils/constants'
import { CustomLoader } from '../common/Loader'
import {
  IconEdit,
  IconEye,
  IconPackageImport,
  IconPhoto,
  IconTrash,
} from '@tabler/icons-react'
import { Link } from '@tanstack/react-router'
import { SwitchWithThumb } from '../common/Switch'

// --- Types ---
type ProductApiResponse = {
  next: string | null
  previous: string | null
  results: Array<Product>
}

export type Product = {
  id: string
  sku: string
  name: string
  slug: string
  price: string
  mrp: string
  discount_percentage: number
  unit: string
  unit_value: string
  image_url: string
  in_stock: boolean // Changed to boolean based on filter logic, check your API
  available_quantity: number
  vendor_name: string
  category_name: string
  avg_rating: string | null
  review_count: number
  is_active: boolean
}

const InfiniteProductTable = () => {
  // --- Refs ---
  const tableContainerRef = useRef<HTMLDivElement>(null)
  const rowVirtualizerInstanceRef = useRef<MRT_RowVirtualizer>(null)

  // --- State ---
  const [columnFilters, setColumnFilters] = useState<MRT_ColumnFiltersState>([])
  const [globalFilter, setGlobalFilter] = useState<string>()
  const [sorting, setSorting] = useState<MRT_SortingState>([])

  const queryClient = useQueryClient()

  const updateStatusMutation = useMutation({
    mutationFn: productApi.update,

    onMutate: async ({ id, data: { is_active } }) => {
      await queryClient.cancelQueries({ queryKey: ['products'] })

      const previousData = queryClient.getQueryData<any>([
        'products',
        columnFilters,
        globalFilter,
        sorting,
      ])

      // Optimistic update
      queryClient.setQueryData(
        ['products', columnFilters, globalFilter, sorting],
        (oldData: any) => {
          if (!oldData) return oldData

          return {
            ...oldData,
            pages: oldData.pages.map((page: any) => ({
              ...page,
              results: page.results.map((product: Product) =>
                product.id === id ? { ...product, is_active } : product,
              ),
            })),
          }
        },
      )

      return { previousData }
    },

    onError: (_err, _variables, context) => {
      if (context?.previousData) {
        queryClient.setQueryData(
          ['products', columnFilters, globalFilter, sorting],
          context.previousData,
        )
      }
    },

    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: ['products'],
      })
    },
  })

  // --- Columns (Memoized) ---
  const columns = useMemo<MRT_ColumnDef<Product>[]>(
    () => [
      {
        accessorKey: 'name',
        header: 'Product Name',
        size: 250,
        Cell: ({ cell }) => (
          <Box>
            <Link
              to="/admin/products/edit/$id"
              params={{
                id: cell.row.original.id,
              }}
              style={{ textDecoration: 'none' }}
            >
              <Text c="teal" fw={500}>
                {cell.getValue<string>()}
              </Text>
            </Link>
          </Box>
        ),
      },
      {
        accessorKey: 'sku',
        header: 'SKU',
        size: 150,
        Cell: ({ cell }) => (
          <Badge variant="outline" color="gray" tt="none">
            {cell.getValue<string>()}
          </Badge>
        ),
      },
      {
        accessorKey: 'price',
        header: 'Price',
        size: 100,
        // Optional: Formatter
        Cell: ({ cell }) => `₹${cell.getValue<number>()}`,
      },
      {
        accessorKey: 'in_stock',
        header: 'Status',
        size: 120,
        Cell: ({ cell }) => (
          <Badge
            color={cell.getValue<boolean>() ? 'green' : 'red'}
            variant="light"
          >
            {cell.getValue<boolean>() ? 'In Stock' : 'Out of Stock'}
          </Badge>
        ),
      },
      {
        accessorKey: 'available_quantity',
        header: 'Qty',
        size: 100,
      },
      {
        accessorKey: 'vendor_name',
        header: 'Vendor',
        size: 150,
      },

      {
        accessorKey: 'is_active',
        header: 'Active',
        size: 120,
        Cell: ({ row }) => {
          const product = row.original

          return (
            <SwitchWithThumb
              label=""
              checked={product.is_active}
              onChanged={(event) =>
                updateStatusMutation.mutate({
                  role: UserRoles.ADMIN,
                  id: product.id,
                  data: { is_active: event.currentTarget.checked },
                })
              }
              disabled={updateStatusMutation.isPending}
            />
          )
        },
      },
    ],
    [],
  )

  // --- Data Fetching ---
  const {
    data,
    fetchNextPage,
    isError,
    isFetching,
    isLoading,
    isFetchingNextPage,
    hasNextPage,
  } = useInfiniteQuery({
    queryKey: ['products', columnFilters, globalFilter, sorting],
    queryFn: async ({ pageParam }) => {
      const params: Record<string, any> = {}

      // 1. Cursor
      if (pageParam) {
        params.cursor = pageParam
      }

      // 2. Sorting
      if (sorting.length > 0) {
        const sortField = sorting[0]
        const prefix = sortField.desc ? '-' : ''
        params.ordering = `${prefix}${sortField.id}`
      }

      // 3. Global Search
      if (globalFilter) {
        params.search = globalFilter
      }

      // 4. Column Filters
      columnFilters.forEach((filter) => {
        const { id, value } = filter
        if (id === 'category_slug') params.category = value
        if (id === 'in_stock')
          params.in_stock =
            value === 'true' || value === true ? 'true' : 'false'
        // Add other specific filter mappings here
      })

      // API Call
      const response = await productVariantApi.list(UserRoles.ADMIN, params)
      return response.data as ProductApiResponse
    },
    initialPageParam: null as string | null,
    getNextPageParam: (lastPage) => {
      if (!lastPage.next) return undefined
      const url = new URL(lastPage.next)
      return url.searchParams.get('cursor')
    },
    refetchOnWindowFocus: false,
  })

  // Flatten Data
  const flatData = useMemo(
    () => data?.pages.flatMap((page) => page.results) ?? [],
    [data],
  )

  const totalFetched = flatData.length

  // --- Scroll & Virtualization Logic ---

  const fetchMoreOnBottomReached = useCallback(
    (containerRefElement?: HTMLDivElement | null) => {
      if (containerRefElement) {
        const { scrollHeight, scrollTop, clientHeight } = containerRefElement

        // Fetch when within 400px of bottom
        // AND not currently fetching
        // AND has more pages
        if (
          scrollHeight - scrollTop - clientHeight < 400 &&
          !isFetching &&
          hasNextPage
        ) {
          fetchNextPage()
        }
      }
    },
    [fetchNextPage, isFetching, hasNextPage],
  )

  // Scroll to top when filters change
  useEffect(() => {
    if (rowVirtualizerInstanceRef.current) {
      try {
        rowVirtualizerInstanceRef.current.scrollToIndex(0)
      } catch (e) {
        console.error(e)
      }
    }
  }, [sorting, columnFilters, globalFilter])

  // Initial check (for large screens where initial load doesn't trigger scroll)
  useEffect(() => {
    fetchMoreOnBottomReached(tableContainerRef.current)
  }, [fetchMoreOnBottomReached])

  // --- Table Instance ---
  const table = useMantineReactTable({
    columns,
    data: flatData,
    enablePagination: false,
    enableRowNumbers: true,
    enableRowVirtualization: true, // Critical for performance
    manualFiltering: true,
    manualSorting: true,
    getRowId: (row) => row.id,

    // Container Props (Scroll Listener)
    mantineTableContainerProps: {
      ref: tableContainerRef,
      style: {
        height: 'calc(100vh - 200px)',
        maxHeight: '800px',
        overflow: 'auto', // Ensure both scrollbars appear
        width: '100%',
      }, // Responsive height
      onScroll: (event: UIEvent<HTMLDivElement>) =>
        fetchMoreOnBottomReached(event.target as HTMLDivElement),
    },

    // UI Props
    mantineToolbarAlertBannerProps: {
      color: 'red',
      children: 'Error loading data',
    },
    layoutMode: 'grid', // Ensures horizontal scroll works with virtualization
    defaultColumn: {
      minSize: 100, // Enforce minimum width
      maxSize: 1000,
      size: 150,
    },

    // State Management
    onColumnFiltersChange: setColumnFilters,
    onGlobalFilterChange: setGlobalFilter,
    onSortingChange: setSorting,
    state: {
      columnFilters,
      globalFilter,
      isLoading,
      showAlertBanner: isError,
      showProgressBars: isFetching,
      sorting,
    },

    // Virtualization
    rowVirtualizerInstanceRef,
    rowVirtualizerOptions: { overscan: 10 },

    // Actions & Layout
    enableRowActions: true,
    positionActionsColumn: 'last',
    // enableColumnPinning: true,
    // initialState: {
    //   columnPinning: {
    //     right: ['mrt-row-actions'],
    //   },
    // },
    renderTopToolbarCustomActions: () => (
      <Button
        component={Link}
        to="/admin/products/new"
        leftSection={<IconPackageImport size="1rem" />}
      >
        Create New Product
      </Button>
    ),
    renderRowActions: ({ row }) => (
      <Group gap="xs" wrap="nowrap">
        <Tooltip label="Manage Images">
          <ActionIcon
            color="blue"
            onClick={() => console.log('Images', row.original.id)}
          >
            <IconPhoto size="1rem" />
          </ActionIcon>
        </Tooltip>
        <Tooltip label="Quick Edit">
          <ActionIcon color="orange" onClick={() => table.setEditingRow(row)}>
            <IconEdit size="1rem" />
          </ActionIcon>
        </Tooltip>
        <Tooltip label="Delete">
          <ActionIcon
            color="red"
            onClick={() => console.log('Delete', row.original.id)}
          >
            <IconTrash size="1rem" />
          </ActionIcon>
        </Tooltip>
      </Group>
    ),

    // Footer (Loader)
    renderBottomToolbarCustomActions: () => (
      <Center w="100%" h={50}>
        {isFetchingNextPage ? (
          <CustomLoader fullScreen={false} />
        ) : (
          <Text size="sm" c="dimmed">
            {hasNextPage
              ? 'Scroll for more...'
              : `Showing ${totalFetched} products`}
          </Text>
        )}
      </Center>
    ),
  })

  return <MantineReactTable table={table} />
}

export default InfiniteProductTable
