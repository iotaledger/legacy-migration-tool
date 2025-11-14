<script lang="typescript">
    import { Animation, Box, Button, OnboardingLayout, Spinner, Text } from 'shared/components'
    import { Platform } from 'shared/lib/platform'
    import { getLegacyErrorMessage, promptUserToConnectLedger } from 'shared/lib/ledger'
    import {
        ADDRESS_SECURITY_LEVEL,
        confirmedBundles,
        createLedgerMigrationBundle,
        createMigrationBundle,
        exportMigrationLog,
        hardwareIndexes,
        hasBundlesWithSpentAddresses,
        hasSingleBundle,
        migration,
        migrationAddress,
        migrationLog,
        prepareMigrationLog,
        sendRebasedMigrationRequest,
        totalMigratedBalance,
        unselectedInputs,
        updateMigrationLog,
    } from 'shared/lib/migration'
    import { showAppNotification } from 'shared/lib/notifications'
    import { closePopup } from 'shared/lib/popup'
    import { newProfile, saveProfile, setActiveProfile } from 'shared/lib/profile'
    import { formatUnitBestMatch } from 'shared/lib/units'
    import { createEventDispatcher, onDestroy, onMount } from 'svelte'
    import { get } from 'svelte/store'
    import { Locale } from '@core/i18n'
    import { walletSetupType } from 'shared/lib/wallet'
    import { SetupType } from 'shared/lib/typings/setup'
    import { addMigrationError } from '@lib/errors'
    import { RebasedMigrationResponse } from 'shared/lib/typings/rebasedMigration'

    export let locale: Locale

    const dispatch = createEventDispatcher()

    const { didComplete, bundles, data } = $migration
    const { balance } = $data

    const migratableBalance = balance - $unselectedInputs.reduce((acc, input) => acc + input.balance, 0)

    let loading = false

    let timeout

    let hasError: boolean = false

    const legacyLedger = $walletSetupType === SetupType.TrinityLedger
    $: animation = legacyLedger ? 'ledger-migrate-desktop' : 'migrate-desktop'

    let closeTransport = () => {}

    function isRebasedErrorModel(error: any): boolean {
        return error && typeof error === 'object' && 'status' in error && 'title' in error && 'errors' in error
    }

    function getErrorMessage(err: any): string {
        if (isRebasedErrorModel(err)) {
            const errorMessages = err.errors?.map((e) => e.message).join(', ') || err.detail
            return `${err.title} (${err.status}): ${errorMessages}`
        }
        return err?.message ?? err?.toString()
    }
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
                    prepareMigrationLog([], migratableBalance)
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
                            const reverseTrytesLedger = trytes.reverse()
                            updateMigrationLog(get(migrationLog).length - 1, {
                                trytes: reverseTrytesLedger,
                                bundleHash,
                            })
                            return sendRebasedMigrationRequest(reverseTrytesLedger, 0)
                        })
                        .then((response: RebasedMigrationResponse) => {
                            updateMigrationLog(get(migrationLog).length - 1, {
                                requestData: JSON.stringify(response),
                            })
                            totalMigratedBalance.set(migratableBalance)
                            loading = false
                            if ($newProfile) {
                                // Save profile
                                saveProfile($newProfile)
                                setActiveProfile($newProfile.id)

                                newProfile.set(null)
                            }
                        })
                        .catch((err) => {
                            const errorMessage = getErrorMessage(err)

                            loading = false
                            closePopup(true) // close transaction popup
                            closeTransport()

                            const legacyErrorMessage = getLegacyErrorMessage(err)
                            showAppNotification({
                                type: 'error',
                                message:
                                    legacyErrorMessage === 'error.global.generic'
                                        ? errorMessage
                                        : locale(legacyErrorMessage),
                            })

                            console.error(err)

                            // Update migration log with stringified error object and message
                            updateMigrationLog(get(migrationLog).length - 1, {
                                error: JSON.stringify(err, null, 2),
                                errorMessage,
                            })

                            hasError = true
                            addMigrationError(errorMessage)
                        })
                }
                const _onCancel = () => {
                    loading = false
                }
                promptUserToConnectLedger(true, _onConnected, _onCancel)
            } else {
                prepareMigrationLog([], migratableBalance)
                createMigrationBundle($bundles[0], get(migrationAddress))
                    .then((trytes: string[]) => {
                        const reverseTrytesSoftware = trytes.reverse()
                        updateMigrationLog(get(migrationLog).length - 1, {
                            trytes: reverseTrytesSoftware,
                        })
                        return sendRebasedMigrationRequest(reverseTrytesSoftware, 0)
                    })
                    .then((response: RebasedMigrationResponse) => {
                        updateMigrationLog(get(migrationLog).length - 1, {
                            requestData: JSON.stringify(response),
                        })
                        totalMigratedBalance.set(migratableBalance)
                        loading = false
                        if ($newProfile) {
                            // Save profile
                            saveProfile($newProfile)
                            setActiveProfile($newProfile.id)

                            newProfile.set(null)
                        }
                    })
                    .catch((err) => {
                        const errorMessage = getErrorMessage(err)
                        loading = false
                        showAppNotification({
                            type: 'error',
                            message: errorMessage || 'Failed to prepare transfers',
                        })
                        console.error(err)
                        updateMigrationLog(get(migrationLog).length - 1, {
                            error: JSON.stringify(err, null, 2),
                            errorMessage,
                        })

                        hasError = true
                        addMigrationError(errorMessage)
                    })
            }
        } else {
            loading = true
            timeout = setTimeout(() => {
                dispatch('next')
            }, 2000)
        }
    }

    function learnAboutMigrationsClick() {
        Platform.openUrl('https://blog.iota.org/iota-legacy-migration-tool/')
    }

    onMount(() => {
        if (!get(migrationAddress)) {
            showAppNotification({
                type: 'error',
                message: 'Error getting migration address',
            })
        }
    })

    onDestroy(() => {
        clearTimeout(timeout)
        unsubscribe()
    })
</script>

<OnboardingLayout allowBack={false} {locale} showLedgerVideoButton={legacyLedger}>
    <div slot="title">
        <Text on:click={() => learnAboutMigrationsClick()} type="h2">{locale('views.migrate.title')}</Text>
    </div>
    <div slot="leftpane__content">
        <Text type="p" secondary classes="mb-4">{locale('views.migrate.body1')}</Text>

        {#if $migrationAddress?.ed25519}
            <div
                class="mb-6 p-4 bg-gray-50 dark:bg-gray-900 dark:bg-opacity-50 rounded-lg border border-gray-200 dark:border-gray-700"
            >
                <Text type="p" secondary classes="text-xs mb-2">Migration Address:</Text>
                <Text type="p" classes="font-mono text-xs break-all">{$migrationAddress.ed25519}</Text>
            </div>
        {/if}

        <Text type="p" secondary highlighted classes="mb-8 font-bold">{locale('views.migrate.body2')}</Text>
        <Box
            classes="flex flex-col flex-grow items-center py-12 bg-gray-50 dark:bg-gray-900 dark:bg-opacity-50 rounded-lg "
        >
            <Text type="h2">{formatUnitBestMatch(migratableBalance, true)}</Text>
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
        {#if hasError}
            <div class="rounded-lg border-2 border-red-500 bg-red-50 dark:bg-red-900 dark:bg-opacity-20 p-6 space-y-3">
                <Text error secondary classes="text-center">
                    {locale('views.migrate.errorInstructions')}
                </Text>
            </div>
            <Button classes="w-full" onClick={exportMigrationLog}>
                {locale('views.congratulations.exportMigration')}
            </Button>
        {/if}
    </div>
    <div slot="rightpane" class="w-full h-full flex justify-center bg-pastel-blue dark:bg-gray-900">
        <Animation classes="setup-anim-aspect-ratio" {animation} />
    </div>
</OnboardingLayout>
