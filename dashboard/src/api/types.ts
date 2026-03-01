export type ProductFilters = {
  category_slug?: string | null
  search?: string | null
  vendor_id?: string | null
  min_price?: number | null
  max_price?: number | null
  in_stock_only?: boolean
  sort_by?: string
  tags?: string[]
}
