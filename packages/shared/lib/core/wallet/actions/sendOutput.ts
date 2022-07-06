import { selectedAccount } from '@core/account'
import { OutputTypes } from '@iota/types'
import { TransactionOptions } from '@iota/wallet'
import { isTransferring } from '@lib/wallet'
import { get } from 'svelte/store'
import { Activity } from '../classes'
import { addActivityToAccountActivitiesInAllAccountActivities } from '../stores'

export async function sendOutput(output: OutputTypes): Promise<void> {
    try {
        isTransferring.set(true)
        const account = get(selectedAccount)
        const transferOptions: TransactionOptions = {
            remainderValueStrategy: { strategy: 'ReuseAddress', value: null },
            skipSync: false,
        }
        const { transaction, transactionId } = await account.sendOutputs([output], transferOptions)
        addActivityToAccountActivitiesInAllAccountActivities(
            account.id,
            new Activity().setFromTransaction(transactionId, transaction, account)
        )
        isTransferring.set(false)
        return
    } catch (err) {
        isTransferring.set(false)
        throw err
    }
}