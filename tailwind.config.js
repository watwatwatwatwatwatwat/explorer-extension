/** @type {import('tailwindcss').Config} */
module.exports = {
  mode: "jit",
  content: ["./**/*.tsx"],
  prefix: "kekkai-",
  plugins: [],
  theme: {
    extend: {
      colors: {
        astar: {
          foreground: "var(--black-color)",
          paper: "var(--table-bg)",
          primary: "var(--main-color)",
          primaryLight: 'var(--main-color-light)',
          secondary: "var(--second-color)",
          border: "var(--border-color)",
          green: 'var(--green)',
        }
      },
      boxShadow: {
        astar: "0 2px 10px 0 rgba(0,0,0,.05)"
      }
    }
  }
}
