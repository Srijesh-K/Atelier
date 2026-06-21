export default function manifest() {
  return {
    name: "Atelier — A Sphere Hive",
    short_name: "Atelier",
    description: "Build the skills companies actually hire for. India's most immersive coding school.",
    start_url: "/",
    display: "standalone",
    background_color: "#0a0a0a",
    theme_color: "#0a0a0a",
    orientation: "portrait-primary",
    categories: ["education", "technology"],
    icons: [
      {
        src: "/logo.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any maskable",
      },
    ],
  };
}
