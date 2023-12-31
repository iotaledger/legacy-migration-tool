import { AppSettings } from './app'
import { ILedger } from './ledger'
import { INotificationManager } from './notificationManager'
import { IPincodeManager } from './pincodeManager'
import { Error } from './error'
import { EventMap } from './events'
import { IBarcodeManager } from './barcodeManager'

export enum Platforms {
    DESKTOP = 'desktop',
}

export interface IPlatform {
    ledger: ILedger
    getStrongholdBackupDestination(defaultPath: string): Promise<string | null>
    saveStrongholdBackup({ allowAccess }: { allowAccess: boolean }): Promise<void>
    exportTransactionHistory(defaultPath: string, contents: string): Promise<string | null>
    exportMigrationLog(content: unknown, defaultFileName: string): Promise<boolean | null>
    getUserDataPath(): Promise<string>
    getDiagnostics(): Promise<{ label: string; value: string }[]>
    getOS(): Promise<string> | string
    getMachineId(): Promise<string>
    updateAppSettings(settings: Partial<AppSettings>): Promise<void>
    getActiveProfile(): string
    updateActiveProfile(id: string): void
    removeProfileFolder(profilePath: string): Promise<void>
    renameProfileFolder(oldPath: string, newPath: string): Promise<void>
    listProfileFolders(profileStoragePath: string): Promise<string[]>
    updateMenu(attribute: string, value: unknown): void
    popupMenu(): void
    maximize(): Promise<boolean>
    minimize(): void
    close(): void
    isMaximized(): Promise<boolean>
    saveRecoveryKit(kitData: ArrayBuffer): Promise<void>
    openUrl(url: string): void
    hookErrorLogger(logger: (error: Error) => void): void
    loadJsonFile(filepath: string): Promise<unknown>
    copyFile(source: string, destination: string): Promise<void>
    deleteFile(source: string): Promise<void>

    NotificationManager: INotificationManager | undefined
    PincodeManager: IPincodeManager | undefined
    BarcodeManager: IBarcodeManager | undefined

    getVersionDetails(): Promise<string>

    unhandledException(title: string, err: Error | unknown): Promise<void>

    // SeedVault API methods
    importLegacySeed(buffer: unknown, password: string): Promise<string>
    validateSeedVault(buffer: unknown): Promise<boolean>

    onEvent<K extends keyof EventMap>(eventName: K, callback: (param: EventMap[K]) => void)
    removeListenersForEvent<K extends keyof EventMap>(eventName: K)
}
