import { Platform } from 'shared/lib/platform'
import { writable } from 'svelte/store'

export const appVersion = writable<string>('')

Platform.onEvent('version-details', (nativeAppVersion) => {
    appVersion.set(nativeAppVersion)
})

export async function getVersionDetails(): Promise<void> {
    const verDetails = await Platform.getVersionDetails()
    appVersion.set(verDetails)
}
