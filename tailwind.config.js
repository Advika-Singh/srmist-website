/** Tailwind is used only by the Tilt image grid. Preflight is off so it cannot disturb the existing styles. */
export default {
  content: ['./src/ui/TiltGrid.jsx'],
  corePlugins: { preflight: false },
  theme: { extend: {} },
  plugins: [],
}
