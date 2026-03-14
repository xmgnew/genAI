/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/app/**/*.{js,jsx}",
    "./src/components/**/*.{js,jsx}",
    "./src/lib/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      colors: {
        ink: "#101826",
        mint: "#C9F36B",
        mist: "#E9F1F8",
        coral: "#FF8A65",
        ocean: "#4DA6FF",
      },
      boxShadow: {
        panel: "0 30px 70px rgba(16, 24, 38, 0.12)",
      },
      backgroundImage: {
        mesh:
          "radial-gradient(circle at top left, rgba(201,243,107,0.3), transparent 30%), radial-gradient(circle at top right, rgba(77,166,255,0.22), transparent 32%), linear-gradient(180deg, #f6fbff 0%, #eef4f8 100%)",
      },
    },
  },
  plugins: [],
};
