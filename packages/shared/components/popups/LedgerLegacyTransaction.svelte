<script lang="typescript" xmlns="http://www.w3.org/1999/html">
    import { Animation, Text } from 'shared/components'
    import { formatAddressForLedger } from 'shared/lib/ledger'
    import { MINIMUM_MIGRATABLE_AMOUNT, asyncGetAddressChecksum } from 'shared/lib/migration'
    import { Input, Transfer } from 'shared/lib/typings/migration'
    import { formatUnitBestMatch } from 'shared/lib/units'
    import { Locale } from '@core/i18n'

    export let locale: Locale

    export let transfer: Transfer
    export let inputs: Input[]

    const outputAmount: number = inputs.reduce(
        (acc, input) => acc + (input.balance < MINIMUM_MIGRATABLE_AMOUNT ? MINIMUM_MIGRATABLE_AMOUNT : input.balance),
        0
    )

    // Hardcoded strings because Ledger does not translate them
    const checksumString = (checksum): string => `Chk: ${checksum}`
    const inputString = (index): string => `Input [${index}]`
    const outputString = 'Output'
</script>

<Text type="h4" classes="mb-6">{locale('popups.ledgerTransaction.transaction.title')}</Text>
{#if outputAmount !== transfer.value}
    <Text type="p" error classes="mb-6" secondary>{locale('popups.ledgerTransaction.transaction.warning')}</Text>
{:else}
    <Text type="p" classes="mb-6" secondary>{locale('popups.ledgerTransaction.transaction.info')}</Text>
{/if}

<div class="relative w-full h-1/2 bg-white dark:bg-gray-900 flex justify-center content-center">
    <Animation
        width="100%"
        animation="ledger-bg-desktop"
        classes="absolute transform left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
    />
    <Animation animation="ledger-confirm-address-desktop" />
</div>

<div class="transaction flex flex-col space-y-4 scrollable-y">
    <div class="rounded-lg bg-gray-50 dark:bg-gray-800 p-5 text-center">
        <Text type="h5" highlighted classes="mb-2">{outputString}</Text>
        <Text type="pre">{formatUnitBestMatch(transfer.value)}</Text>
        {#if outputAmount !== transfer.value}
            <Text error type="pre"
                >{locale('popups.ledgerTransaction.transaction.inputWarning')} {formatUnitBestMatch(outputAmount)}</Text
            >
        {/if}
        <Text type="pre">{formatAddressForLedger(transfer.address, true)}</Text>
        <Text type="pre">
            {#await asyncGetAddressChecksum(transfer.address)}...{:then checksum}{checksumString(checksum)}{/await}
        </Text>
    </div>
    {#each inputs as { address, balance, index }}
        <div class="rounded-lg bg-gray-50 dark:bg-gray-800 p-5 text-center">
            <Text type="h5" highlighted classes="mb-2">{inputString(index)}</Text>
            <Text type="pre">{formatUnitBestMatch(balance)}</Text>
            {#if balance < MINIMUM_MIGRATABLE_AMOUNT}
                <Text error type="pre"
                    >{locale('popups.ledgerTransaction.transaction.inputWarning')}
                    {formatUnitBestMatch(MINIMUM_MIGRATABLE_AMOUNT)}</Text
                >
            {/if}
            <Text type="pre">{formatAddressForLedger(address)}</Text>
            <Text type="pre">
                {#await asyncGetAddressChecksum(address, true)}...{:then checksum}{checksumString(checksum)}{/await}
            </Text>
        </div>
    {/each}
</div>

<style>
    .transaction {
        max-height: 30vh;
    }
</style>
