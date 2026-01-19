export const CustomLoader = ({ fullScreen = true, text = 'Nurturing...' }) => {
  return (
    <div
      className={`${fullScreen ? 'fixed inset-0 z-50' : 'w-full h-64'} bg-[#FDFCF8] flex flex-col items-center justify-center`}
    >
      {/* Animation Container */}
      <div className="relative w-32 h-32">
        {/* 1. The Soil / Pot Base */}
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-16 h-4 bg-[#D5896F]/20 rounded-[100%] blur-sm animate-pulse" />

        {/* SVG Drawing Area */}
        <svg viewBox="0 0 100 100" className="w-full h-full overflow-visible">
          <style>
            {`
              /* 1. Water Drop Falls */
              @keyframes drop-fall {
                0% { transform: translateY(-60px) scale(0); opacity: 0; }
                10% { transform: translateY(-60px) scale(1); opacity: 1; }
                30% { transform: translateY(0px) scale(1); opacity: 1; } /* Hits Bulb */
                35% { transform: translateY(5px) scale(0.5); opacity: 0; } /* Absorbed */
                100% { transform: translateY(5px) scale(0); opacity: 0; }
              }

              /* 2. Bulb Reacts (Squash & Stretch on impact) */
              @keyframes bulb-react {
                0%, 25% { transform: scale(1); }
                30% { transform: scale(1.3, 0.7); } /* Impact squash */
                40% { transform: scale(0.9, 1.1); } /* Stretch up */
                50%, 100% { transform: scale(1); }
              }

              /* 3. Stem Grows (Delayed until after water) */
              @keyframes sprout-grow {
                0%, 40% { stroke-dasharray: 0, 100; opacity: 0; }
                60% { stroke-dasharray: 40, 100; opacity: 1; }
                90% { stroke-dasharray: 40, 100; opacity: 1; }
                100% { stroke-dasharray: 40, 100; opacity: 0; }
              }

              /* 4. Leaves Unfurl */
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

              /* 5. Soil Ripple (Impact Ring) */
              @keyframes ripple {
                0%, 29% { r: 0; opacity: 0; }
                30% { r: 6; opacity: 0.5; stroke-width: 2; }
                50% { r: 15; opacity: 0; stroke-width: 0; }
                100% { r: 15; opacity: 0; }
              }
            `}
          </style>

          {/* Group centered at bottom-center of SVG (50, 80) */}
          <g transform="translate(50, 80)">
            {/* RIPPLE EFFECT (When drop hits) */}
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

            {/* THE WATER DROP (Imported path, scaled & positioned) */}
            <g style={{ animation: 'drop-fall 3s ease-in infinite' }}>
              {/* Centered the user's drop path roughly by translating -12 -12 */}
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
      </div>

      {/* Loading Text */}
      <div className="mt-2 flex flex-col items-center gap-1">
        <h3 className="font-serif text-[#2F5233] text-lg font-bold tracking-wide animate-pulse">
          {text}
        </h3>
        <p className="font-sans text-[#D5896F] text-[10px] uppercase tracking-widest">
          Watering & Growing
        </p>
      </div>
    </div>
  )
}

// export default NurseryLoader
