import {
  updatePrimaryPalette,
  palette,
} from '@primeuix/themes';


const getNextColorPalette = (() => {

  // https://primevue.org/theming/styled/#Palette

  const colors = ['{red}', '#696969', '{yellow}', '{indigo}', '#10b981', '{gray}']
  let c = 'red'
  return function() {
    const idx = colors.findIndex(i => i === c)
    c = colors[idx + 1] || colors[0]
    return palette(c);
  }
})()

// change current theme to next
export const paletteToggle = () => {
  const values = getNextColorPalette();
  updatePrimaryPalette(values);
}
