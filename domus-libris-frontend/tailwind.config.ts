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
            },
        },
    },
    plugins: [],
};

export default config;
