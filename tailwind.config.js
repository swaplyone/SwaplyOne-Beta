/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        paper: {
          DEFAULT: '#FBF5EC',
          card: '#F7EFE5',
          cream: '#F3E9DD',
          grid: '#E8DDD0',
          dark: '#E5D8C8',
        },
        swaply: {
          black: '#1B242A',
          yellow: '#C49A62',
          coral: '#D96B52',
          mint: '#65AB84',
          purple: '#8371A3',
          blue: '#7EA7B8',
          craft: '#BA8E58',
          pink: '#D98A9C',
          orange: '#C49A62',
          green: '#65AB84'
        }
      },
      boxShadow: {
        'hard-sm': '2px 2px 0px #1B242A',
        'hard': '4px 4px 0px #1B242A',
        'hard-lg': '6px 6px 0px #1B242A',
        'hard-xl': '8px 8px 0px #1B242A',
        'hard-2xl': '12px 12px 0px #1B242A',
        'hard-coral': '4px 4px 0px #D96B52',
        'hard-yellow': '4px 4px 0px #C49A62',
        'hard-mint': '4px 4px 0px #65AB84',
        'hard-blue': '4px 4px 0px #7EA7B8',
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'Inter', 'system-ui', 'sans-serif'],
        serif: ['"Playfair Display"', 'Georgia', 'serif'],
        handwriting: ['Caveat', 'cursive'],
        marker: ['"Permanent Marker"', 'cursive'],
      },
      borderWidth: {
        '3': '3px',
        '4': '4px',
      }
    },
  },
  plugins: [],
}
