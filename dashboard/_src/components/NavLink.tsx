// import {
//   Link as RouterNavLink,
//   type LinkProps as NavLinkProps
// } from '@tanstack/react-router'
// import { forwardRef } from 'react'
// import { cn } from '@/lib/utils'

import { Link } from '@tanstack/react-router'

// interface NavLinkCompatProps extends Omit<NavLinkProps, 'className'> {
//   className?: string
//   activeClassName?: string
//   pendingClassName?: string
// }

// const NavLink = forwardRef<HTMLAnchorElement, NavLinkCompatProps>(
//   ({ className, activeClassName, pendingClassName, to, ...props }, ref) => {
//     return (
//       <RouterNavLink
//         ref={ref}
//         to={to}
//         className={(active) =>
//           cn(
//             className,
//             isActive && activeClassName,
//             isPending && pendingClassName,
//           )
//         }
//         activeOptions={{
//           exact: true
//         }}
//         {...props}
//       />
//     )
//   },
// )

// NavLink.displayName = 'NavLink'

// export { NavLink }

export function NavLink({ children, ...props }: any) {
  return <Link {...props}>{children}</Link>
}

NavLink.displayName = 'NavLink'

export default NavLink
