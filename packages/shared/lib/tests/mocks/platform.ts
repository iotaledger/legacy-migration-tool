import { IPlatform } from '../../typings/platform'
import { EventMap } from '../../typings/events'
import { AppSettings } from '../../typings/app'
import { Error } from '../../typings/error'

const Platform: IPlatform = {
    BarcodeManager: undefined,
    NotificationManager: undefined,
    PincodeManager: undefined,
    ledger: undefined,
    close(): void {},
    exportMigrationLog(content: unknown, defaultFileName: string): Promise<boolean | null> {
        return Promise.resolve(undefined)
    },
    exportTransactionHistory(defaultPath: string, contents: string): Promise<string | null> {
        return Promise.resolve(undefined)
    },
    getActiveProfile(): string {
        return ''
    },
    getDiagnostics(): Promise<{ label: string; value: string }[]> {
        return Promise.resolve([])
    },
    getMachineId(): Promise<string> {
        return Promise.resolve('')
    },
    getOS(): Promise<string> {
        return Promise.resolve('')
    },
    saveStrongholdBackup({ allowAccess }: { allowAccess: boolean }): Promise<void> {
        return Promise.resolve(undefined)
    },
    getStrongholdBackupDestination(defaultPath: string): Promise<string | null> {
        return Promise.resolve(undefined)
    },
    getUserDataPath(): Promise<string> {
        return Promise.resolve('')
    },
    getVersionDetails(): Promise<string> {
        return Promise.resolve(undefined)
    },
    hookErrorLogger(logger: (error: Error) => void): void {},
    importLegacySeed(buffer: unknown, password: string): Promise<string> {
        return Promise.resolve('')
    },
    isMaximized(): Promise<boolean> {
        return Promise.resolve(false)
    },
    listProfileFolders(profileStoragePath: string): Promise<string[]> {
        return Promise.resolve([])
    },
    maximize(): Promise<boolean> {
        return Promise.resolve(false)
    },
    minimize(): void {},
    onEvent<K extends keyof EventMap>(eventName: K, callback: (param: EventMap[K]) => void) {},
    openUrl(url: string): void {},
    popupMenu(): void {},
    removeListenersForEvent<K extends keyof EventMap>(eventName: K) {},
    removeProfileFolder(profilePath: string): Promise<void> {
        return Promise.resolve(undefined)
    },
    renameProfileFolder(oldPath: string, newPath: string): Promise<void> {
        return Promise.resolve(undefined)
    },
    saveRecoveryKit(kitData: ArrayBuffer): Promise<void> {
        return Promise.resolve(undefined)
    },
    unhandledException(title: string, err: Error | unknown): Promise<void> {
        return Promise.resolve(undefined)
    },
    updateActiveProfile(id: string): void {},
    updateAppSettings(settings: Partial<AppSettings>): Promise<void> {
        return Promise.resolve(undefined)
    },
    updateMenu(attribute: string, value: unknown): void {},
    validateSeedVault(buffer: unknown): Promise<boolean> {
        return Promise.resolve(false)
    },
    loadJsonFile(filepath: string): Promise<unknown> {
        return Promise.resolve({ filepath })
    },
    copyFile(source: string, destination: string): Promise<void> {
        return Promise.resolve(undefined)
    },
    deleteFile(source: string): Promise<void> {
        return Promise.resolve(undefined)
    },
}

window['__CAPACITOR__'] = Platform
window['__ELECTRON__'] = Platform
