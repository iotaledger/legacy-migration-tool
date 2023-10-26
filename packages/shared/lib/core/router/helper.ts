import { get } from 'svelte/store'

import { clearSendParams } from '@lib/app'
import { selectedMessage } from '@lib/wallet'
import { accountRouter, AccountRouter } from './account-router'
import { appRouter, AppRouter } from './app-router'
import { ledgerRouter, LedgerRouter } from './subrouters'

export const initRouters = (): void => {
    appRouter.set(new AppRouter())
    ledgerRouter.set(new LedgerRouter())
    accountRouter.set(new AccountRouter())
}

export const resetRouters = (): void => {
    get(appRouter).reset()
    get(accountRouter).reset()
}

export const resetAccountRouter = (resetPanels: boolean = true): void => {
    if (resetPanels) {
        get(accountRouter).reset()
        clearSendParams()
    }
    selectedMessage.set(null)
}

export const resetWalletRoute = (): void => {
    resetAccountRouter()
}
