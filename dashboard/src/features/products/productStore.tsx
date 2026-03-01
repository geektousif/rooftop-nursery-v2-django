import { create } from 'zustand'
import { persist } from 'zustand/middleware'

type ProductStore = {
  unsavedProduct: any
  setUnsavedProduct: (product: any) => void
  clearUnsavedProduct: () => void
}

export const useProductStore = create(
  persist<ProductStore>(
    (set) => ({
      unsavedProduct: null,
      setUnsavedProduct: (product) => set({ unsavedProduct: product }),
      clearUnsavedProduct: () => set({ unsavedProduct: null }),
    }),
    {
      name: 'product-draft-storage',
      partialize: (state) => ({
        unsavedProduct: state.unsavedProduct,
      }),
    },
  ),
)
