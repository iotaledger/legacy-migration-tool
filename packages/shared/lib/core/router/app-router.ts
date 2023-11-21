import { get, writable } from 'svelte/store'

import {
    cleanupSignup,
    login,
    needsToAcceptLatestPrivacyPolicy,
    needsToAcceptLatestTos,
    strongholdPassword,
    walletPin,
} from '@lib/app'
import { activeProfile } from '@lib/profile'
import { ImportType, ProfileType } from '@lib/typings/profile'
import { SetupType } from '@lib/typings/setup'
import { walletSetupType } from '@lib/wallet'

import { AppRoute } from './enums'
import { Router } from './router'
import { LegacyMigrationEvent } from './types'

export const appRoute = writable<AppRoute>(null)
export const appRouter = writable<AppRouter>(null)

export class AppRouter extends Router<AppRoute> {
    constructor() {
        super(AppRoute.Welcome, appRoute)
        this.init()
    }

    public init(): void {
        this.routeStore.set(AppRoute.Welcome)
    }

    public reset(): void {
        this.history = []
        this.init()
    }

    public next(event?: LegacyMigrationEvent): void {
        // TODO: only handle route changes, not app variables
        const params = event || {}
        const currentRoute = get(this.routeStore)
        let nextRoute: AppRoute

        switch (currentRoute) {
            case AppRoute.Welcome:
                {
                    const showLegalPage = needsToAcceptLatestPrivacyPolicy() || needsToAcceptLatestTos()
                    if (showLegalPage) {
                        nextRoute = AppRoute.Legal
                    } else {
                        nextRoute = AppRoute.CrashReporting
                    }
                }
                break
            case AppRoute.Legal:
                nextRoute = AppRoute.CrashReporting
                break
            case AppRoute.CrashReporting:
                walletSetupType.set(SetupType.Import)
                nextRoute = AppRoute.Import
                break
            case AppRoute.Create: {
                const profileType = get(activeProfile)?.type
                if (profileType === ProfileType.Software) {
                    nextRoute = AppRoute.Secure
                } else if (profileType === ProfileType.Ledger || ProfileType.LedgerSimulator) {
                    nextRoute = AppRoute.Protect
                }
                break
            }
            case AppRoute.Secure:
                nextRoute = AppRoute.Password
                break
            case AppRoute.Password: {
                const { password } = params
                if (password) {
                    strongholdPassword.set(password)
                    nextRoute = AppRoute.Backup
                }
                break
            }
            case AppRoute.Backup:
                if (get(walletSetupType) === SetupType.Seed || get(walletSetupType) === SetupType.Seedvault) {
                    nextRoute = AppRoute.Migrate
                } else {
                    nextRoute = AppRoute.Congratulations
                }
                break
            case AppRoute.Import: {
                const { importType } = params
                walletSetupType.set(importType as unknown as SetupType)
                nextRoute = AppRoute.Congratulations
                if ([ImportType.Stronghold, ImportType.TrinityLedger, ImportType.FireflyLedger].includes(importType)) {
                    nextRoute = AppRoute.Protect
                } else if (importType === ImportType.Seed || importType === ImportType.SeedVault) {
                    nextRoute = AppRoute.Balance
                }
                break
            }
            case AppRoute.Balance:
                if (get(walletSetupType) === SetupType.TrinityLedger) {
                    nextRoute = AppRoute.Migrate
                } else {
                    nextRoute = AppRoute.Password
                }
                break
            case AppRoute.Migrate:
                nextRoute = AppRoute.Congratulations
                break
            case AppRoute.LedgerSetup:
                if (get(walletSetupType) === SetupType.TrinityLedger) {
                    nextRoute = AppRoute.Balance
                } else {
                    nextRoute = AppRoute.Congratulations
                }
                break
            case AppRoute.Congratulations:
                cleanupSignup()
                login()
                nextRoute = AppRoute.Dashboard
                break
        }
        this.setNext(nextRoute)
    }

    public forceNextRoute(route: AppRoute): void {
        this.setNext(route)
    }
}
