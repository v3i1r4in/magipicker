const {
  contextBridge
} = require("electron");
const {
  getColorHexRGB,

  // for more control and customized checks
  DARWIN_IS_PLATFORM_PRE_CATALINA, // darwin only, undefined on other platform
  darwinGetColorHexRGB, // darwin only, throw error on other platform
  darwinGetScreenPermissionGranted, // darwin only, throw error on other platform
  darwinRequestScreenPermissionPopup // darwin only, throw error on other platform
} = require('electron-color-picker');

const saveColorToClipboard = async () => {
  if (process.platform === 'darwin' && !DARWIN_IS_PLATFORM_PRE_CATALINA) {
    const isGranted = await darwinGetScreenPermissionGranted() // initial check
    console.log('darwinGetScreenPermissionGranted:', isGranted)
    if (!isGranted) {
      await darwinRequestScreenPermissionPopup()
      console.warn('no permission granted yet, try again')
      return ''
    }
    const color = await darwinGetColorHexRGB().catch((error) => {
      console.warn('[ERROR] getColor', error)
      return ''
    })
    console.log(`getColor: ${color}`)
    return color;
  } else {
    const color = await getColorHexRGB().catch((error) => {
      console.warn('[ERROR] getColor', error)
      return ''
    })
    console.log(`getColor: ${color}`)
    return color;
  }
}

contextBridge.exposeInMainWorld("getColor", saveColorToClipboard);
