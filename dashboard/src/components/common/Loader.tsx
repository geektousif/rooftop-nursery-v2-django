import React from 'react'
import { Box, Stack, Text, Center, rem } from '@mantine/core'

interface CustomLoaderProps {
  fullScreen?: boolean
  text?: string
}

export const CustomLoader: React.FC<CustomLoaderProps> = ({
  fullScreen = true,
  text = 'Nurturing...',
}) => {
  return (
    <Center
      style={{
        position: fullScreen ? 'fixed' : 'relative',
        inset: fullScreen ? 0 : undefined,
        zIndex: 9999, // High z-index to sit on top of everything
        width: fullScreen ? '100vw' : '100%',
        height: fullScreen ? '100vh' : rem(256), // Equivalent to h-64
        backgroundColor: '#FDFCF8',
        flexDirection: 'column',
      }}
    >
      {/* We inject the CSS Keyframes here. 
        This keeps the component self-contained without needing an external CSS file.
      */}
      <style>
        {`
          @keyframes drop-fall {
            0% { transform: translateY(-60px) scale(0); opacity: 0; }
            10% { transform: translateY(-60px) scale(1); opacity: 1; }
            30% { transform: translateY(0px) scale(1); opacity: 1; }
            35% { transform: translateY(5px) scale(0.5); opacity: 0; }
            100% { transform: translateY(5px) scale(0); opacity: 0; }
          }
          @keyframes bulb-react {
            0%, 25% { transform: scale(1); }
            30% { transform: scale(1.3, 0.7); }
            40% { transform: scale(0.9, 1.1); }
            50%, 100% { transform: scale(1); }
          }
          @keyframes sprout-grow {
            0%, 40% { stroke-dasharray: 0, 100; opacity: 0; }
            60% { stroke-dasharray: 40, 100; opacity: 1; }
            90% { stroke-dasharray: 40, 100; opacity: 1; }
            100% { stroke-dasharray: 40, 100; opacity: 0; }
          }
          @keyframes leaf-unfurl-left {
            0%, 55% { transform: scale(0) rotate(-45deg); opacity: 0; }
            70% { transform: scale(1) rotate(0deg); opacity: 1; }
            90% { transform: scale(1) rotate(0deg); opacity: 1; }
            100% { transform: scale(0) rotate(-45deg); opacity: 0; }
          }
          @keyframes leaf-unfurl-right {
            0%, 60% { transform: scale(0) rotate(45deg); opacity: 0; }
            75% { transform: scale(1) rotate(0deg); opacity: 1; }
            90% { transform: scale(1) rotate(0deg); opacity: 1; }
            100% { transform: scale(0) rotate(45deg); opacity: 0; }
          }
          @keyframes ripple {
            0%, 29% { r: 0; opacity: 0; }
            30% { r: 6; opacity: 0.5; stroke-width: 2; }
            50% { r: 15; opacity: 0; stroke-width: 0; }
            100% { r: 15; opacity: 0; }
          }
          @keyframes pulse-opacity {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.5; }
          }
        `}
      </style>

      {/* Animation Container (w-32 h-32 = 128px) */}
      <Box w={128} h={128} style={{ position: 'relative' }}>
        {/* The Soil / Pot Base Shadow */}
        <Box
          style={{
            position: 'absolute',
            bottom: rem(8),
            left: '50%',
            transform: 'translateX(-50%)',
            width: rem(64),
            height: rem(16),
            backgroundColor: 'rgba(213, 137, 111, 0.2)', // #D5896F/20
            borderRadius: '100%',
            filter: 'blur(4px)',
            animation: 'pulse-opacity 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
          }}
        />

        {/* SVG Drawing Area */}
        <svg
          viewBox="0 0 100 100"
          style={{ width: '100%', height: '100%', overflow: 'visible' }}
        >
          <g transform="translate(50, 80)">
            {/* RIPPLE EFFECT */}
            <circle
              cx="0"
              cy="0"
              r="0"
              fill="none"
              stroke="#D5896F"
              style={{ animation: 'ripple 3s ease-out infinite' }}
            />

            {/* THE BULB (Base) */}
            <circle
              cx="0"
              cy="0"
              r="6"
              fill="#D5896F"
              style={{ animation: 'bulb-react 3s ease-in-out infinite' }}
            />

            {/* THE WATER DROP */}
            <g style={{ animation: 'drop-fall 3s ease-in infinite' }}>
              <path
                d="M12 2c-5.33 4-8 8-8 12 0 4.42 3.58 8 8 8s8-3.58 8-8c0-4-2.67-8-8-12zm0 18c-3.31 0-6-2.69-6-6 0-1 0-3 6-9 6 6 6 8 6 9 0 3.31-2.69 6-6 6z"
                fill="#60A5FA"
                transform="translate(-12, -22) scale(0.8)"
              />
            </g>

            {/* THE STEM */}
            <path
              d="M0,0 Q0,-20 0,-45"
              fill="none"
              stroke="#2F5233"
              strokeWidth="4"
              strokeLinecap="round"
              style={{
                animation: 'sprout-grow 3s ease-in-out infinite',
                transformOrigin: 'bottom center',
              }}
            />

            {/* LEFT LEAF */}
            <path
              d="M0,-30 Q-15,-40 -20,-25 Q-10,-15 0,-30"
              fill="#76A84F"
              style={{
                animation: 'leaf-unfurl-left 3s ease-in-out infinite',
                transformOrigin: '0px -30px',
              }}
            />

            {/* RIGHT LEAF */}
            <path
              d="M0,-35 Q15,-45 20,-30 Q10,-20 0,-35"
              fill="#76A84F"
              style={{
                animation: 'leaf-unfurl-right 3s ease-in-out infinite',
                transformOrigin: '0px -35px',
              }}
            />
          </g>
        </svg>
      </Box>

      {/* Loading Text */}
      <Stack gap={4} align="center" mt="xs">
        <Text
          c="#2F5233"
          size="lg"
          fw={700}
          style={{
            fontFamily: 'serif',
            letterSpacing: '0.025em', // wide
            animation: 'pulse-opacity 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
          }}
        >
          {text}
        </Text>
        <Text
          c="#D5896F"
          size={rem(10)}
          tt="uppercase"
          style={{ letterSpacing: '0.1em' }} // widest
        >
          Watering & Growing
        </Text>
      </Stack>
    </Center>
  )
}
