

import { create } from "zustand";
import { createJSONStorage, devtools, persist } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";
import type { CartItem, Product } from "@/lib/mock-data";

type CartState = {
  items: CartItem[];
  isOpen: boolean;
};

type CartActions = {
  addItem: (product: Product, quantity?: number) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  toggleCart: () => void;
  openCart: () => void;
  closeCart: () => void;
};

type CartStore = CartState & CartActions;

const clampQuantity = (requested: number, stock: number) =>
  Math.max(1, Math.min(requested, stock));

export const useCartStore = create<CartStore>()(
  devtools(
    persist(
      immer<CartStore>((set) => ({
        items: [],
        isOpen: false,
        addItem: (product, quantity = 1) =>
          set((state) => {
            const existing = state.items.find(
              (item) => item.product.id === product.id,
            );
            const nextQuantity = clampQuantity(
              (existing?.quantity ?? 0) + quantity,
              product.stockCount,
            );

            if (existing) {
              existing.quantity = nextQuantity;
              return;
            }

            state.items.push({
              product,
              quantity: clampQuantity(quantity, product.stockCount),
            });
          }),
        removeItem: (productId) =>
          set((state) => {
            state.items = state.items.filter(
              (item) => item.product.id !== productId,
            );
          }),
        updateQuantity: (productId, quantity) =>
          set((state) => {
            const item = state.items.find(
              (entry) => entry.product.id === productId,
            );

            if (!item) return;
            if (quantity <= 0) {
              state.items = state.items.filter(
                (entry) => entry.product.id !== productId,
              );
              return;
            }

            item.quantity = clampQuantity(quantity, item.product.stockCount);
          }),
        clearCart: () =>
          set((state) => {
            state.items = [];
          }),
        toggleCart: () =>
          set((state) => {
            state.isOpen = !state.isOpen;
          }),
        openCart: () =>
          set((state) => {
            state.isOpen = true;
          }),
        closeCart: () =>
          set((state) => {
            state.isOpen = false;
          }),
      })),
      {
        name: "cart",
        version: 1,
        storage: createJSONStorage(() => localStorage),
        partialize: (state) => ({
          items: state.items,
          isOpen: state.isOpen,
        }),
        // Preserve any new defaults added in code while keeping persisted data.
        merge: (persistedState, currentState) => ({
          ...(currentState as CartStore),
          ...(persistedState as CartStore),
        }),
      },
    ),
  ),
);

// function cartReducer(state: CartState, action: CartAction): CartState {
//   switch (action.type) {
//     case "ADD_ITEM": {
//       const existingItem = state.items.find((item) => item.product.id === action.product.id)
//       if (existingItem) {
//         return {
//           ...state,
//           items: state.items.map((item) =>
//             item.product.id === action.product.id
//               ? { ...item, quantity: Math.min(item.quantity + (action.quantity || 1), action.product.stockCount) }
//               : item,
//           ),
//         }
//       }
//       return {
//         ...state,
//         items: [
//           ...state.items,
//           { product: action.product, quantity: Math.min(action.quantity || 1, action.product.stockCount) },
//         ],
//       }
//     }
//     case "REMOVE_ITEM":
//       return {
//         ...state,
//         items: state.items.filter((item) => item.product.id !== action.productId),
//       }
//     case "UPDATE_QUANTITY":
//       if (action.quantity <= 0) {
//         return {
//           ...state,
//           items: state.items.filter((item) => item.product.id !== action.productId),
//         }
//       }
//       return {
//         ...state,
//         items: state.items.map((item) =>
//           item.product.id === action.productId
//             ? { ...item, quantity: Math.min(action.quantity, item.product.stockCount) }
//             : item,
//         ),
//       }
//     case "CLEAR_CART":
//       return { ...state, items: [] }
//     case "TOGGLE_CART":
//       return { ...state, isOpen: !state.isOpen }
//     case "OPEN_CART":
//       return { ...state, isOpen: true }
//     case "CLOSE_CART":
//       return { ...state, isOpen: false }
//     default:
//       return state
//   }
// }

// export function CartProvider({ children }: { children: ReactNode }) {
//   const [state, dispatch] = useReducer(cartReducer, {
//     items: [],
//     isOpen: false,
//   })

//   return <CartContext.Provider value={{ state, dispatch }}>{children}</CartContext.Provider>
// }

// export function useCart() {
//   const context = useContext(CartContext)
//   if (!context) {
//     throw new Error("useCart must be used within a CartProvider")
//   }
//   return context
// }

// export function Providers({ children }: { children: ReactNode }) {
//   return <CartProvider>{children}</CartProvider>
// }
