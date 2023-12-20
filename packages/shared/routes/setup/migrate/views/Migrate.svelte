<script lang="typescript">
    import { Animation, Box, Button, OnboardingLayout, Spinner, Text } from 'shared/components'
    import { convertToFiat, currencies, exchangeRates, formatCurrency } from 'shared/lib/currency'
    import { Platform } from 'shared/lib/platform'
    import { getLegacyErrorMessage, promptUserToConnectLedger } from 'shared/lib/ledger'
    import {
        ADDRESS_SECURITY_LEVEL,
        confirmedBundles,
        createLedgerMigrationBundle,
        createMigrationBundle,
        generateMigrationAddress,
        hardwareIndexes,
        hasBundlesWithSpentAddresses,
        hasSingleBundle,
        migration,
        migrationAddress,
        migrationLog,
        prepareMigrationLog,
        sendOffLedgerMigrationRequest,
        totalMigratedBalance,
        unselectedInputs,
    } from 'shared/lib/migration'
    import { showAppNotification } from 'shared/lib/notifications'
    import { closePopup } from 'shared/lib/popup'
    import { newProfile, saveProfile, setActiveProfile } from 'shared/lib/profile'
    import { formatUnitBestMatch } from 'shared/lib/units'
    import { createEventDispatcher, onDestroy, onMount } from 'svelte'
    import { get } from 'svelte/store'
    import { Locale } from '@core/i18n'
    import { AvailableExchangeRates, CurrencyTypes } from 'shared/lib/typings/currency'
    import { walletSetupType } from 'shared/lib/wallet'
    import { SetupType } from 'shared/lib/typings/setup'

    export let locale: Locale

    const dispatch = createEventDispatcher()

    const { didComplete, bundles, data } = $migration
    const { balance } = $data

    const migratableBalance = balance - $unselectedInputs.reduce((acc, input) => acc + input.balance, 0)

    const fiatbalance = formatCurrency(
        convertToFiat(
            migratableBalance,
            get(currencies)?.[CurrencyTypes.USD],
            get(exchangeRates)?.[AvailableExchangeRates.USD]
        ),
        AvailableExchangeRates.USD
    )

    let loading = false

    let timeout

    let singleMigrationBundleHash

    const legacyLedger = $walletSetupType === SetupType.TrinityLedger
    $: animation = legacyLedger ? 'ledger-migrate-desktop' : 'migrate-desktop'

    let closeTransport = () => {}

    const unsubscribe = confirmedBundles.subscribe((newConfirmedBundles) => {
        newConfirmedBundles.forEach((bundle) => {
            if ($hasSingleBundle && bundle.confirmed) {
                didComplete.set(true)
                loading = false
                dispatch('next')
            }
        })
    })

    function handleContinueClick() {
        if ($hasSingleBundle && !$hasBundlesWithSpentAddresses) {
            loading = true

            if (legacyLedger) {
                const _onConnected = () => {
                    Platform.ledger
                        .selectSeed($hardwareIndexes.accountIndex, $hardwareIndexes.pageIndex, ADDRESS_SECURITY_LEVEL)
                        .then(({ iota, callback }) => {
                            closeTransport = callback
                            return createLedgerMigrationBundle(
                                0,
                                get(migrationAddress),
                                iota.prepareTransfers,
                                callback
                            )
                        })
                        .then(({ trytes, bundleHash }) => {
                            closePopup(true) // close transaction popup
                            singleMigrationBundleHash = bundleHash
                            const reverseTrytesLedger = trytes.reverse()
                            prepareMigrationLog(bundleHash, reverseTrytesLedger, migratableBalance)
                            return sendOffLedgerMigrationRequest(reverseTrytesLedger, 0)
                        })
                        .then((receipt) => {
                            migrationLog.update((_migrationLog) =>
                                _migrationLog.map((log) => ({
                                    ...log,
                                    requestId: receipt?.request?.requestId || '',
                                }))
                            )
                            totalMigratedBalance.set(migratableBalance)
                            loading = false
                            if ($newProfile) {
                                // Save profile
                                saveProfile($newProfile)
                                setActiveProfile($newProfile.id)

                                newProfile.set(null)
                            }
                        })
                        .catch((error) => {
                            loading = false
                            closePopup(true) // close transaction popup
                            closeTransport()
                            showAppNotification({
                                type: 'error',
                                message: locale(getLegacyErrorMessage(error)),
                            })
                            console.error(error)
                        })
                }
                const _onCancel = () => {
                    loading = false
                }
                promptUserToConnectLedger(true, _onConnected, _onCancel)
            } else {
                createMigrationBundle($bundles[0], get(migrationAddress))
                    .then((trytes: string[]) => {
                        // TODO: Check the bundlehash with software profiles
                        const reverseTrytesSoftware = trytes.reverse()
                        prepareMigrationLog('', reverseTrytesSoftware, migratableBalance)
                        return sendOffLedgerMigrationRequest(reverseTrytesSoftware, 0)
                    })
                    .then((receipt) => {
                        migrationLog.update((_migrationLog) =>
                            _migrationLog.map((log) => ({
                                ...log,
                                requestId: receipt?.request?.requestId || '',
                            }))
                        )
                        totalMigratedBalance.set(migratableBalance)
                        loading = false
                        if ($newProfile) {
                            // Save profile
                            saveProfile($newProfile)
                            setActiveProfile($newProfile.id)

                            newProfile.set(null)
                        }
                    })
                    .catch((error) => {
                        loading = false
                        showAppNotification({
                            type: 'error',
                            message: error.message || 'Failed to prepare transfers',
                        })
                        console.error(error)
                    })
            }
        } else {
            loading = true
            timeout = setTimeout(() => {
                dispatch('next')
            }, 2000)
        }
    }

    // TODO: complete function functionality
    function learnAboutMigrationsClick() {
        Platform.openUrl('https://blog.iota.org/firefly-token-migration/')
    }

    onMount(async () => {
        if (!get(migrationAddress)) {
            try {
                migrationAddress.set(await generateMigrationAddress(legacyLedger))
            } catch (error) {
                showAppNotification({
                    type: 'error',
                    message: error.error || 'Error generating migration address',
                })
            }
        }
    })

    onDestroy(() => {
        clearTimeout(timeout)
        unsubscribe()
    })
</script>

<OnboardingLayout allowBack={false} {locale} showLedgerProgress={legacyLedger} showLedgerVideoButton={legacyLedger}>
    <div slot="title">
        <Text on:click={() => learnAboutMigrationsClick()} type="h2">{locale('views.migrate.title')}</Text>
    </div>
    <div slot="leftpane__content">
        <Text type="p" secondary classes="mb-4">{locale('views.migrate.body1')}</Text>
        <Text type="p" secondary highlighted classes="mb-8 font-bold">{locale('views.migrate.body2')}</Text>
        <Box
            classes="flex flex-col flex-grow items-center py-12 bg-gray-50 dark:bg-gray-900 dark:bg-opacity-50 rounded-lg "
        >
            <Text type="h2">{formatUnitBestMatch(migratableBalance, true)}</Text>
            <Text type="p" highlighted classes="py-1 uppercase">{fiatbalance}</Text>
        </Box>
    </div>
    <div slot="leftpane__action" class="flex flex-col space-y-7">
        <button on:click={learnAboutMigrationsClick}>
            <Text type="p" highlighted>{locale('views.migrate.learn')}</Text>
        </button>
        <Button disabled={loading || !$migrationAddress} classes="w-full" onClick={() => handleContinueClick()}>
            {#if loading}
                <Spinner busy={loading} message={locale('views.migrate.migrating')} classes="justify-center" />
            {:else}{locale('views.migrate.beginMigration')}{/if}
        </Button>
    </div>
    <div slot="rightpane" class="w-full h-full flex justify-center bg-pastel-blue dark:bg-gray-900">
        <Animation classes="setup-anim-aspect-ratio" {animation} />
    </div>
</OnboardingLayout>
