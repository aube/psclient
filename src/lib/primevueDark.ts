export function darkToggle(e: any) {
  const html = document.body.parentNode as any
  const isDark = html?.className === "p-dark"

  e.target.className = e.target.className.replace(
    isDark ? "pi-sun" : "pi-moon",
    isDark ? "pi-moon" : "pi-sun",
  )

  html.className = isDark ? "" : "p-dark"
}
