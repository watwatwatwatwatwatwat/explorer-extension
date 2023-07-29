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
          primaryLight: "var(--main-color-light)",
          secondary: "var(--second-color)",
          border: "var(--border-color)",
          green: "var(--green)"
        },
        etherscan: {
          foreground: "var(--bs-heading-color,inherit)",
          card: "var(--bs-body-bg)",
          border: "var(--bs-border-color)",
          primary: "var(--bs-nav-pills-link-active-color)",
          secondary: "var(--second-color)",
          // Inner card background
          paper: "var(--bs-gray-100)"
        }
      },
      boxShadow: {
        astar: "0 2px 10px 0 rgba(0,0,0,.05)",
        etherscan: "0 0.5rem 1.2rem rgb(189 197 209 / 20%)"
      },
      borderRadius: {
        etherscanCard: "0.75rem",
        etherscanInnerCard: "0.5rem"
      }
    }
  }
}
