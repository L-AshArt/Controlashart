/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
    theme: {
        extend: {
              colors: {
                      rosa:    { DEFAULT: '#C4798A', light: '#FAF0F2', dark: '#A05870' },
                              gold:    { DEFAULT: '#B8952A', light: '#FDF6E3' },
                                      ok:      { DEFAULT: '#10B981', light: '#ECFDF5' },
                                              danger:  { DEFAULT: '#EF4444', light: '#FEF2F2' },
                                                      ink:     { DEFAULT: '#1A1A2E', 2: '#6B6B7B', 3: '#9B9BAB' },
                                                              surface: { DEFAULT: '#FFFFFF', bg: '#F4F5F7' },
                                                                    },
                                                                          fontFamily: {
                                                                                  sans: ['DM Sans', 'sans-serif'],
                                                                                          serif: ['Cormorant Garamond', 'serif'],
                                                                                                },
                                                                                                      boxShadow: {
                                                                                                              card: '0 1px 3px rgba(0,0,0,.08)',
                                                                                                                      'card-lg': '0 4px 12px rgba(0,0,0,.08)',
                                                                                                                            },
                                                                                                                                  borderRadius: {
                                                                                                                                          xl2: '1.25rem',
                                                                                                                                                  xl3: '1.5rem',
                                                                                                                                                        },
                                                                                                                                                            },
                                                                                                                                                              },
                                                                                                                                                                plugins: [],
                                                                                                                                                                } */