import { type MantineThemeOverride, virtualColor } from '@mantine/core'

const theme: MantineThemeOverride = {
  colors: {
    dark: [
      '#f5f7ff',
      '#7182bd',
      '#415085',
      '#303c66',
      '#171d33',
      '#1b223b',
      '#10121a',
      '#0b0c0f',
      '#0d0d0f',
      '#0b0b0b',
    ],
    gray: [
      '#faf9f6', // 0: Off-white (Background)
      '#f4f1ed', // 1: Card Backgrounds (Subtle contrast)
      '#e9e5df', // 2: Borders / Dividers
      '#ddd8d0', // 3: UI Elements (Disabled)
      '#c8c0b5', // 4: Icons / Placeholder text
      '#a69e92', // 5: Secondary Text
      '#857d71', // 6: Primary Text (Soft Black)
      '#635c52', // 7: Headings
      '#423d35', // 8: Dark accents
      '#211e1a', // 9: Almost Black
    ],
    // "Monstera" Green: A deep, rich forest green.
    // Much more professional than "Lime" or "Grass" green.
    nursery: [
      '#ebf5ee', // 0: Light tint (Badges)
      '#dbece1', // 1
      '#b6dcc3', // 2
      '#90cca4', // 3
      '#6ebd88', // 4
      '#56b375', // 5
      '#3fa060', // 6: Primary Brand Color (Vibrant but deep)
      '#30804b', // 7: Hover state
      '#23633a', // 8: Active state
      '#164728', // 9: Deepest forest
    ],

    blue: [
      '#dcdcee',
      '#d1d0f2',
      '#c5c4f7',
      '#b9b9fb',
      '#adadfd',
      '#adadff',
      '#4a49fe',
      '#0601e1',
      '#02017d',
      '#000018',
    ],
    green: [
      '#dafbe1',
      '#aceebb',
      '#6fdd8b',
      '#4ac26b',
      '#2da44e',
      '#1a7f37',
      '#116329',
      '#044f1e',
      '#003d16',
      '#002d11',
    ],
    yellow: [
      '#f7f1e5',
      '#faeacd',
      '#fce3b5',
      '#fddd9d',
      '#fed687',
      '#ffd685',
      '#ffb82d',
      '#ce8906',
      '#744d03',
      '#191102',
    ],
    orange: [
      '#fff1e5',
      '#ffd8b5',
      '#ffb77c',
      '#fb8f44',
      '#e16f24',
      '#bc4c00',
      '#953800',
      '#762c00',
      '#5c2200',
      '#471700',
    ],
    red: [
      '#f4f2ee',
      '#f7ede0',
      '#fae9d2',
      '#fde4c3',
      '#fee0b7',
      '#ffe0b5',
      '#feb550',
      '#e68605',
      '#804b02',
      '#190f02',
    ],
    pink: [
      '#fff0f6',
      '#ffdeeb',
      '#fcc2d7',
      '#faa2c1',
      '#f783ac',
      '#f06595',
      '#e64980',
      '#d6336c',
      '#c2255c',
      '#a61e4d',
    ],
    grape: [
      '#f8f0fc',
      '#f3d9fa',
      '#eebefa',
      '#e599f7',
      '#da77f2',
      '#cc5de8',
      '#be4bdb',
      '#ae3ec9',
      '#9c36b5',
      '#862e9c',
    ],
    violet: [
      '#f3f0ff',
      '#e5dbff',
      '#d0bfff',
      '#b197fc',
      '#9775fa',
      '#845ef7',
      '#7950f2',
      '#7048e8',
      '#6741d9',
      '#5f3dc4',
    ],
    indigo: [
      '#d6dbec',
      '#bfc7e6',
      '#a8b3e0',
      '#909fda',
      '#798bd4',
      '#798bd4',
      '#3d58c4',
      '#283e8b',
      '#152351',
      '#040918',
    ],
    cyan: [
      '#e3fafc',
      '#c5f6fa',
      '#99e9f2',
      '#66d9e8',
      '#3bc9db',
      '#22b8cf',
      '#15aabf',
      '#1098ad',
      '#0c8599',
      '#0b7285',
    ],
    teal: [
      '#e6fcf5',
      '#c3fae8',
      '#96f2d7',
      '#63e6be',
      '#38d9a9',
      '#20c997',
      '#12b886',
      '#0ca678',
      '#099268',
      '#087f5b',
    ],
    lime: [
      '#f4fce3',
      '#e9fac8',
      '#d8f5a2',
      '#c0eb75',
      '#a9e34b',
      '#94d82d',
      '#82c91e',
      '#74b816',
      '#66a80f',
      '#5c940d',
    ],
    fairy: virtualColor({
      name: 'fairy',
      dark: 'green',
      light: 'lime',
    }),
  },
  primaryColor: 'nursery',
  primaryShade: 6,
  white: 'rgba(255, 252, 252, 1)',
  black: '#24292f',
  autoContrast: true,
  luminanceThreshold: 0.3,
  defaultRadius: 'md',
  defaultGradient: {
    from: 'yellow',
    to: 'lime',
    deg: 99,
  },
  fontFamily: 'Nunito Variable',
  fontFamilyMonospace: 'Source Code Pro',
  headings: {
    fontFamily: 'Playfair Display Variable',
    fontWeight: '600',
    sizes: {
      h1: {
        fontSize: '2.25rem',
        lineHeight: '1.3',
        fontWeight: '700',
      },
      h2: {
        fontSize: '1.85rem',
        lineHeight: '1.35',
        fontWeight: '600',
      },
      h3: {
        fontSize: '1.475rem',
        lineHeight: '1.35',
        fontWeight: '600',
      },
      h4: {
        fontSize: '1.25rem',
        lineHeight: '1.3',
        fontWeight: '500',
      },
      h5: {
        fontSize: '1.025rem',
        lineHeight: '1.3',
        fontWeight: '500',
      },
      h6: {
        fontSize: '0.975rem',
        lineHeight: '1.4',
        fontWeight: '800',
      },
    },
  },
  scale: 1,
  radius: {
    xs: '0.125rem',
    sm: '0.25rem',
    md: '0.5rem',
    lg: '1rem',
    xl: '2.2rem',
  },
  spacing: {
    xs: '0.525rem',
    sm: '1.15rem',
    md: '1.5rem',
    lg: '1.65rem',
    xl: '2.5rem',
  },
  breakpoints: {
    xs: '36em',
    sm: '48em',
    md: '62em',
    lg: '75em',
    xl: '88em',
  },
  shadows: {
    md: '0 4px 20px rgba(0, 0, 0, 0.05)',
    xl: '0 8px 30px rgba(0, 0, 0, 0.08)',
  },

  components: {
    Card: {
      defaultProps: { padding: 'lg', shadow: 'sm', withBorder: true },
      styles: (theme) => ({
        root: {
          borderColor: theme.colors.gray[2], // Limestone border
          backgroundColor: '#ffffff',
        },
      }),
    },
    // Pill-shaped buttons feel more "D2C Brand" friendly
    Button: {
      defaultProps: { radius: 'xl', fw: 600 },
    },
    Badge: {
      defaultProps: { radius: 'sm', variant: 'light' },
    },
  },
  fontSmoothing: true,
  focusRing: 'auto',
  cursorType: 'pointer',
}

export default theme
