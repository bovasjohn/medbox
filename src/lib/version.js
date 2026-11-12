// Injected at build time by vite.config.js (see define there).
export const APP_VERSION = __APP_VERSION__
export const VERSION_CODE = __VERSION_CODE__ // five digits, e.g. 00001
export const BUILD_CODE = __BUILD_CODE__
export const VERSION_LABEL = `v${APP_VERSION} · code ${VERSION_CODE} (build ${BUILD_CODE})`
