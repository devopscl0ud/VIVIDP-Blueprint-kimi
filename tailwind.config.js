/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                'deep-space': '#0A0E1A',
                'nebula-blue': '#1E3A8A',
                'circuit-teal': '#0891B2',
                'electric-cyan': '#06B6D4',
                'success': '#10B981',
                'warning': '#F59E0B',
                'error': '#EF4444',
            },
            fontFamily: {
                sans: ['Inter', 'sans-serif'],
                mono: ['JetBrains Mono', 'monospace'],
            },
            borderRadius: {
                'card': '12px',
                'button': '8px',
            },
            boxShadow: {
                'card': '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                'hover': '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                'glow': '0 0 20px rgba(6, 182, 212, 0.3)',
            },
            animation: {
                'float': 'float 6s ease-in-out infinite',
                'pulse-glow': 'pulse-glow 3s ease-in-out infinite',
            },
            keyframes: {
                float: {
                    '0%, 100%': { transform: 'translateY(0px)' },
                    '50%': { transform: 'translateY(-20px)' },
                },
                'pulse-glow': {
                    '0%, 100%': { boxShadow: '0 0 20px rgba(6, 182, 212, 0.3)' },
                    '50%': { boxShadow: '0 0 40px rgba(6, 182, 212, 0.6)' },
                },
            },
        },
    },
    plugins: [],
}
