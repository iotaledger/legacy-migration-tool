const { notarize } = require('@electron/notarize')
const path = require('path')

/**
 *
 * @param {string} appName
 * @returns void
 */
module.exports = async (appName) => {
    if (process.platform !== 'darwin' || process.env.MACOS_SKIP_NOTARIZATION === 'true') {
        return true
    }

    const APPLE_ID = process.env.LEGACY_MIGRATION_TOOL_APPLE_ID
    const APPLE_ID_PASSWORD = process.env.LEGACY_MIGRATION_TOOL_APPLE_ID_PASSWORD

    if (!APPLE_ID) {
        throw Error('Notarization failed: Environment variable "LEGACY_MIGRATION_TOOL_APPLE_ID" is not defined')
    }

    if (!APPLE_ID_PASSWORD) {
        throw Error(
            'Notarization failed: Environment variable "LEGACY_MIGRATION_TOOL_APPLE_ID_PASSWORD" is not defined'
        )
    }

    await notarize({
        tool: 'notarytool',
        appPath: path.resolve(__dirname, `../out/mac/${appName}.app`),
        appleId: APPLE_ID,
        appleIdPassword: APPLE_ID_PASSWORD,
        teamId: 'UG77RJKZHH',
    })
}
