// tailwind.config.ts
import type { Config } from 'tailwindcss';

const config: Config = {
    content: [
        './index.html',
        './src/**/*.{js,ts,jsx,tsx}',
    ],
    theme: {
        extend: {
            colors: {
                brand: {
                    primary: '#22333B',
                    secondary: '#950952',
                    tertiary: '#A0C1D1',
                    accent1: '#F5F2B2',
                    accent2: '#B8C480',
                    // legacy keys kept for compatibility
                    softYellow: '#F5F2B2',
                    softGreen: '#B8C480',
                },
            },
            fontFamily: {
                sans: [
                    'system-ui',
                    '-apple-system',
                    'BlinkMacSystemFont',
                    '"Segoe UI"',
                    'sans-serif',
                ],
                display: [
                    'system-ui',
                    '-apple-system',
                    'BlinkMacSystemFont',
                    '"Segoe UI"',
                    'sans-serif',
                ],
            },
            boxShadow: {
                brand: '0 8px 24px rgba(34, 51, 59, 0.08)',
            },
            borderRadius: {
                '2xl': '1.25rem',
            },
        },
    },
    plugins: [],
};

export default config;
