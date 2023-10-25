import { get } from 'svelte/store'

import { isDeepLinkRequestActive } from '@common/deep-links'
import { selectedMessage } from '@lib/wallet'
import { appRouter, AppRouter } from './app-router'
import { accountRouter, AccountRouter } from './account-router'
import { ledgerRouter, LedgerRouter } from './subrouters'
import { clearSendParams } from '@lib/app'

export const initRouters = (): void => {
    appRouter.set(new AppRouter())
    ledgerRouter.set(new LedgerRouter())
    accountRouter.set(new AccountRouter())
}

export const resetRouters = (): void => {
    get(appRouter).reset()
    get(accountRouter).reset()
    isDeepLinkRequestActive.set(false)
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
