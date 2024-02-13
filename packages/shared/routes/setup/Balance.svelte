<script lang="typescript">
    import { get } from 'svelte/store'
    import { Animation, Box, Button, OnboardingLayout, Spinner, Text, Toast } from 'shared/components'
    import { convertToFiat, currencies, exchangeRates, formatCurrency } from 'shared/lib/currency'
    import { Platform } from 'shared/lib/platform'
    import { displayNotificationForLedgerProfile, promptUserToConnectLedger } from 'shared/lib/ledger'
    import {
        ADDRESS_SECURITY_LEVEL,
        getLedgerMigrationData,
        getMigrationData,
        hardwareIndexes,
        hasAnySpentAddressWithNoBundleHashes,
        migration,
        resetMigrationState,
        spentAddressesWithNoBundleHashes,
        unselectedInputs,
    } from 'shared/lib/migration'
    import { closePopup, openPopup } from 'shared/lib/popup'
    import { formatUnitBestMatch } from 'shared/lib/units'
    import { onDestroy } from 'svelte'
    import { Locale } from '@core/i18n'
    import { AvailableExchangeRates, CurrencyTypes } from 'shared/lib/typings/currency'
    import { walletSetupType } from 'shared/lib/wallet'
    import { SetupType } from 'shared/lib/typings/setup'
    import { appRouter } from '@core/router'
    import { addMigrationError } from '@lib/errors'

    export let locale: Locale

    let isCheckingForBalance: boolean
    const legacyLedger = $walletSetupType === SetupType.TrinityLedger

    const { seed, data, bundles } = $migration

    let _data = $data
    let _bundles = $bundles

    const getFiatBalance = (balance: number) => {
        const balanceAsFiat = convertToFiat(
            balance,
            get(currencies)?.[CurrencyTypes.USD],
            get(exchangeRates)?.[AvailableExchangeRates.USD]
        )

        if (balanceAsFiat === 0) {
            return `< ${formatCurrency(0.01, AvailableExchangeRates.USD)}`
        }
        return formatCurrency(balanceAsFiat, AvailableExchangeRates.USD)
    }

    const { balance } = _data

    let fiatBalance = getFiatBalance(balance)

    let error = getError(balance)
    let formattedBalance = formatUnitBestMatch(balance, true)

    bundles.subscribe((updatedBundles) => {
        _bundles = updatedBundles
        error = getError(_data.balance)
    })

    unselectedInputs.subscribe(() => {
        error = getError(_data.balance)
    })

    const unsubscribe = data.subscribe((updatedData) => {
        _data = updatedData

        fiatBalance = getFiatBalance(_data.balance)
        formattedBalance = formatUnitBestMatch(_data.balance, true)
        error = getError(_data.balance)
    })

    function getError(_balance) {
        if (_balance === 0) {
            return {
                allowToProceed: false,
                text: locale(`views.balance.${legacyLedger ? 'zeroBalanceLedgerLegacy' : 'zeroBalance'}`),
            }
        }

        if (!_bundles.length) {
            return {
                allowToProceed: false,
                text: locale('views.migrate.tooManyAddressesToMigrate'),
            }
        }

        return {
            allowToProceed: true,
            text: null,
        }
    }

    function handleContinueClick(): void {
        const spentAddressesWithNoBundleHashesTotalBalance = $spentAddressesWithNoBundleHashes.reduce(
            (acc, input) => acc + input.balance,
            0
        )
        if ($hasAnySpentAddressWithNoBundleHashes) {
            openPopup({
                type: 'missingBundle',
                props: {
                    onProceed: () => {
                        closePopup()
                        $appRouter.next()
                    },
                    balance: `${formatUnitBestMatch(
                        spentAddressesWithNoBundleHashesTotalBalance,
                        true
                    )} (${getFiatBalance(spentAddressesWithNoBundleHashesTotalBalance).toUpperCase()})`,
                },
            })
        } else {
            $appRouter.next()
        }
    }

    function handleBackClick(): void {
        if (!isCheckingForBalance) {
            // If a user goes back from this point, reset migration state
            resetMigrationState()
            $appRouter.previous()
        }
    }

    function checkAgain(): void {
        isCheckingForBalance = true
        if (legacyLedger) {
            const _onConnected = () => {
                Platform.ledger
                    .selectSeed($hardwareIndexes.accountIndex, $hardwareIndexes.pageIndex, ADDRESS_SECURITY_LEVEL)
                    .then(({ iota, callback }) =>
                        getLedgerMigrationData(iota.getAddress, callback, $data.lastCheckedAddressIndex)
                    )
                    .then(() => {
                        isCheckingForBalance = false
                    })
                    .catch((err) => {
                        const error = err?.message ? err.message : err?.toString()
                        isCheckingForBalance = false

                        console.error(error)

                        displayNotificationForLedgerProfile('error', true, true, false, true, error)
                        addMigrationError(error)
                    })
            }
            const _onCancel = () => (isCheckingForBalance = false)
            promptUserToConnectLedger(true, _onConnected, _onCancel)
        } else {
            getMigrationData($seed, $data.lastCheckedAddressIndex)
                .then(() => {
                    isCheckingForBalance = false
                })
                .catch((err) => {
                    const error = err?.message ? err.message : err?.toString()
                    isCheckingForBalance = false
                    console.error(error)
                    addMigrationError(error)
                })
        }
    }

    onDestroy(unsubscribe)
</script>

<OnboardingLayout
    busy={isCheckingForBalance}
    onBackClick={handleBackClick}
    {locale}
    showLedgerProgress={legacyLedger}
    showLedgerVideoButton={legacyLedger}
>
    <div slot="title">
        <Text type="h2">{locale('views.balance.title')}</Text>
    </div>
    <div slot="leftpane__content">
        <Text type="p" secondary classes="mb-5">{locale('views.balance.body')}</Text>
        <Box
            classes="flex flex-col flex-grow items-center py-12 bg-gray-50 dark:bg-gray-900 dark:bg-opacity-50 rounded-lg "
        >
            <Text type="h2">{formattedBalance}</Text>
            <Text type="p" highlighted classes="py-1 uppercase">{fiatBalance}</Text>
        </Box>
        {#if error.text}
            <Toast classes="mt-4" type="error" message={error.text} />
        {/if}
    </div>
    <div slot="leftpane__action" class="flex flex-row justify-between items-center space-x-4">
        <Button secondary classes="flex-1" disabled={isCheckingForBalance} onClick={checkAgain}>
            {#if isCheckingForBalance}
                <Spinner
                    busy={isCheckingForBalance}
                    message={locale('views.migrate.findingBalance')}
                    classes="justify-center"
                />
            {:else}{locale('actions.checkAgain')}{/if}
        </Button>
        <Button
            classes="flex-1"
            disabled={isCheckingForBalance || !error.allowToProceed}
            onClick={() => handleContinueClick()}
        >
            {locale('actions.continue')}
        </Button>
    </div>
    <div slot="rightpane" class="w-full h-full flex justify-center bg-pastel-yellow dark:bg-gray-900">
        <Animation classes="setup-anim-aspect-ratio" animation="balance-desktop" />
    </div>
</OnboardingLayout>
