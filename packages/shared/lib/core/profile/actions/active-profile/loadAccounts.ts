import { loadAccount } from '@core/account'
import { getAccounts } from '@core/profile-manager'
import { get } from 'svelte/store'
import { activeAccounts, activeProfile } from '../../stores'

export async function loadAccounts(): Promise<void> {
    try {
        const { hasLoadedAccounts } = get(activeProfile)
        const accountsResponse = await getAccounts()
        if (accountsResponse.length === 0) {
            hasLoadedAccounts.set(true)
            return
        }
        if (accountsResponse) {
            const loadedAccounts = await Promise.all(
                accountsResponse?.map((accountResponse) => loadAccount(accountResponse))
            )
            activeAccounts.set(loadedAccounts.sort((a, b) => a.meta.index - b.meta.index))
            hasLoadedAccounts.set(true)
        }
    } catch (err) {
        console.error(err)
    }
}
