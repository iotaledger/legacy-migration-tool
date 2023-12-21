<script lang="typescript">
    import { createEventDispatcher, onDestroy, onMount } from 'svelte'
    import { get } from 'svelte/store'
    import { Animation, Button, OnboardingLayout, Spinner, Text, TransactionItem } from 'shared/components'
    import { Platform } from 'shared/lib/platform'
    import {
        displayNotificationForLedgerProfile,
        ledgerDeviceState,
        promptUserToConnectLedger,
    } from 'shared/lib/ledger'
    import {
        ADDRESS_SECURITY_LEVEL,
        confirmedBundles,
        createLedgerMigrationBundle,
        createMigrationBundle,
        exportMigrationLog,
        generateMigrationAddress,
        hardwareIndexes,
        hasMigratedAndConfirmedAllSelectedBundles,
        hasMigratedAndConfirmedSomeSelectedBundles,
        hasMigratedAnyBundle,
        migration,
        migrationAddress,
        prepareMigrationLog,
        sendOffLedgerMigrationRequest,
        totalMigratedBalance,
        unmigratedBundles,
        updateErrorInMigrationLog,
        updateRequestInMigrationLog,
    } from 'shared/lib/migration'
    import { closePopup, popupState } from 'shared/lib/popup'
    import { newProfile, saveProfile, setActiveProfile } from 'shared/lib/profile'
    import { walletSetupType } from 'shared/lib/wallet'
    import { SetupType } from 'shared/lib/typings/setup'
    import { LedgerAppName, LedgerDeviceState } from 'shared/lib/typings/ledger'
    import { Locale } from '@core/i18n'
    import { Bundle } from '@lib/typings/migration'
    import { showAppNotification } from '@lib/notifications'
    import { addMigrationError } from '@lib/errors'

    export let locale: Locale

    let busy = false
    let migrated = false
    let migratingFundsMessage = ''
    let fullSuccess = $hasMigratedAndConfirmedAllSelectedBundles
    let someSuccess = $hasMigratedAndConfirmedSomeSelectedBundles

    const legacyLedger = $walletSetupType === SetupType.TrinityLedger
    $: animation = legacyLedger ? 'ledger-migrate-desktop' : 'migrate-desktop'

    let closeTransport = () => {}

    let hasBroadcastAnyBundle = false

    const { didComplete } = $migration

    let transactions = get(unmigratedBundles).map((_bundle, index) => ({
        ..._bundle,
        name: locale('views.transferFragmentedFunds.transaction', { values: { number: index + 1 } }),
        balance: _bundle.inputs.reduce((acc, input) => acc + input.balance, 0),
        status: 0,
        errorText: null,
    }))

    $: if (
        legacyLedger &&
        busy &&
        $ledgerDeviceState !== LedgerDeviceState.LegacyConnected &&
        transactions.every((tx) => tx.status !== 1)
    ) {
        migrated = true
        busy = false
    }

    const hasMigratedAndConfirmedAllSelectedBundlesUnsubscribe = hasMigratedAndConfirmedAllSelectedBundles.subscribe(
        (_hasMigratedAndConfirmedAllSelectedBundles) => {
            fullSuccess = _hasMigratedAndConfirmedAllSelectedBundles

            migrated = _hasMigratedAndConfirmedAllSelectedBundles

            if (_hasMigratedAndConfirmedAllSelectedBundles) {
                migratingFundsMessage = locale('actions.continue')
                busy = false
            }
        }
    )

    const hasMigratedAndConfirmedSomeSelectedBundlesUnsubscribe = hasMigratedAndConfirmedSomeSelectedBundles.subscribe(
        (_hasMigratedAndConfirmedSomeSelectedBundles) => {
            someSuccess = _hasMigratedAndConfirmedSomeSelectedBundles
        }
    )

    let migratedAndUnconfirmedBundles = []

    const confirmedBundlesUnsubscribe = confirmedBundles.subscribe((newConfirmedBundles) => {
        newConfirmedBundles.forEach((bundle) => {
            if (bundle.confirmed) {
                migratedAndUnconfirmedBundles = migratedAndUnconfirmedBundles.filter(
                    (bundleHash) => bundleHash !== bundle.bundleHash
                )

                transactions = transactions.map((item) => {
                    if (item.index === bundle.index) {
                        return { ...item, status: 2 }
                    }

                    return item
                })
            }
        })
    })

    const dispatch = createEventDispatcher()

    function handleBackClick() {
        if (!busy) {
            dispatch('previous')
        }
    }

    function handleContinueClick() {
        didComplete.set(true)
        dispatch('next')
    }

    function handleRerunClick() {
        if (legacyLedger) {
            const _onConnected = () => rerunMigration()
            promptUserToConnectLedger(true, _onConnected)
        } else {
            rerunMigration()
        }
    }

    function setMigratingTransaction(transaction, status) {
        busy = true
        migrated = false
        transactions = transactions.map((_transaction, i) => {
            if (_transaction.index === transaction.index) {
                return { ..._transaction, status }
            }

            return _transaction
        })
    }

    function rerunMigration() {
        const _unmigratedBundles = $unmigratedBundles
        const unmigratedBundleIndexes = _unmigratedBundles.map((_bundle) => _bundle.index)
        transactions = transactions.map((item) => {
            if (unmigratedBundleIndexes.includes(item.index)) {
                return { ...item, status: 0, errorText: null }
            }

            return item
        })

        migrateFunds(true)
    }

    function persistProfile() {
        if (legacyLedger && !$newProfile) {
            return
        }

        // When the first migration bundle is broadcast, then persist profile
        saveProfile($newProfile)
        setActiveProfile($newProfile.id)

        newProfile.set(null)
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
        hasMigratedAndConfirmedAllSelectedBundlesUnsubscribe()
        confirmedBundlesUnsubscribe()
        hasMigratedAndConfirmedSomeSelectedBundlesUnsubscribe()
    })

    function handleMigrateClick() {
        if (legacyLedger) {
            const _onConnected = () => migrateFunds()
            promptUserToConnectLedger(true, _onConnected)
        } else {
            migrateFunds()
        }
    }

    function migrateFunds(isRerun?: boolean) {
        migratingFundsMessage = locale('views.migrate.migrating')

        transactions.reduce(
            (promise, transaction, idx) =>
                transaction.status === 0
                    ? // @ts-ignore
                      promise
                          .then((acc) => {
                              if (legacyLedger) {
                                  return Platform.ledger
                                      .selectSeed(
                                          $hardwareIndexes.accountIndex,
                                          $hardwareIndexes.pageIndex,
                                          ADDRESS_SECURITY_LEVEL
                                      )
                                      .then(({ iota, callback }) => {
                                          closeTransport = callback
                                          return createLedgerMigrationBundle(
                                              transaction.index,
                                              get(migrationAddress),
                                              iota.prepareTransfers,
                                              callback
                                          )
                                      })
                                      .then(({ trytes, bundleHash }) => {
                                          closePopup(true) // close transaction popup
                                          setMigratingTransaction(transaction, 1)
                                          transactions = transactions.map((_transaction, i) => {
                                              if (_transaction.index === transaction.index) {
                                                  return { ..._transaction, bundleHash }
                                              }
                                              return _transaction
                                          })
                                          const reverseTrytesLedger = trytes.reverse()
                                          prepareMigrationLog(
                                              reverseTrytesLedger,
                                              transaction.balance,
                                              bundleHash,
                                              isRerun ? idx : undefined
                                          )
                                          return sendOffLedgerMigrationRequest(reverseTrytesLedger, transaction.index)
                                      })
                                      .then((receipt) => {
                                          updateRequestInMigrationLog(receipt?.request, idx)
                                          totalMigratedBalance.update((value) => (value += transaction.balance))

                                          if (!hasBroadcastAnyBundle) {
                                              hasBroadcastAnyBundle = true
                                              persistProfile()
                                          }
                                      })
                                      .catch((err) => {
                                          const error = err?.message ? err.message : err?.toString()
                                          updateErrorInMigrationLog(error, idx)
                                          addMigrationError(error)
                                          throw new Error(error)
                                      })
                              } else {
                                  setMigratingTransaction(transaction, 1)

                                  return createMigrationBundle(transaction as Bundle, get(migrationAddress))
                                      .then((trytes: string[]) => {
                                          const reverseTrytesSoftware = trytes.reverse()
                                          prepareMigrationLog(
                                              reverseTrytesSoftware,
                                              transaction.balance,
                                              undefined,
                                              isRerun ? idx : undefined
                                          )
                                          return sendOffLedgerMigrationRequest(reverseTrytesSoftware, transaction.index)
                                      })
                                      .then((receipt) => {
                                          updateRequestInMigrationLog(receipt?.request, idx)
                                          totalMigratedBalance.update((value) => (value += transaction.balance))

                                          if (!hasBroadcastAnyBundle) {
                                              hasBroadcastAnyBundle = true

                                              persistProfile()
                                          }
                                      })
                                      .catch((err) => {
                                          const error = err?.message ? err.message : err?.toString()
                                          updateErrorInMigrationLog(error, idx)
                                          addMigrationError(error)
                                          throw new Error(error)
                                      })
                              }
                          })
                          .catch((error) => {
                              console.error(error)

                              if (legacyLedger) {
                                  closePopup(true) // close transaction popup
                                  closeTransport()
                                  displayNotificationForLedgerProfile('error', false, true, false, true, error)
                              }
                              showAppNotification({
                                  type: 'error',
                                  message: error.message || 'Failed to prepare transfers',
                              })

                              transactions = transactions.map((_transaction, i) => {
                                  if (_transaction.index === transaction.index) {
                                      return { ..._transaction, status: -1, errorText: 'Migration failed' }
                                  }

                                  return _transaction
                              })
                          })
                          .finally(() => {
                              if (transactions.every((tx) => tx.status !== 0 && tx.status !== 1)) {
                                  migrated = true
                                  busy = false
                              }
                          })
                    : promise,
            Promise.resolve([])
        )
    }
</script>

<OnboardingLayout
    allowBack={!$hasMigratedAnyBundle && !busy}
    {locale}
    onBackClick={handleBackClick}
    class=""
    showLedgerProgress={legacyLedger}
    showLedgerVideoButton={legacyLedger}
>
    <div slot="title">
        <Text type="h2">{locale('views.migrate.title')}</Text>
    </div>
    <div slot="leftpane__content" class="h-full flex flex-col flex-wrap">
        <Text type="p" secondary classes="mb-4">{locale('views.transferFragmentedFunds.body1')}</Text>
        {#if legacyLedger}
            <Text type="p" secondary classes="mb-4">
                {locale('views.transferFragmentedFunds.body2', { values: { legacy: LedgerAppName.IOTALegacy } })}
            </Text>
        {/if}
        <div class="flex-auto overflow-y-auto h-1 space-y-4 w-full scrollable-y scroll-secondary">
            {#each transactions as transaction}
                <TransactionItem {...transaction} {locale} />
            {/each}
        </div>
    </div>
    <div slot="leftpane__action" class="flex flex-col items-center space-y-4">
        {#if !migrated && $migrationAddress}
            <Button
                disabled={busy}
                classes="w-full py-3 mt-2 text-white {$popupState.active && 'opacity-20'}"
                onClick={() => handleMigrateClick()}
            >
                {#if !busy}
                    {locale('views.transferFragmentedFunds.migrate')}
                {:else}
                    <Spinner {busy} message={migratingFundsMessage} classes="justify-center" />
                {/if}
            </Button>
        {:else if fullSuccess}
            <Button classes="w-full py-3 mt-2" onClick={() => handleContinueClick()}
                >{locale('actions.continue')}</Button
            >
        {:else}
            <div class="flex flex-row gap-2 w-full items-strech justify-center h-full">
                <Button classes={$popupState.active && 'opacity-20'} onClick={() => handleRerunClick()}>
                    {locale('views.transferFragmentedFunds.rerun')}
                </Button>
                {#if someSuccess}
                    <Button onClick={() => handleContinueClick()}>
                        {locale('actions.continue')}
                    </Button>
                {/if}
                <Button onClick={exportMigrationLog}>
                    {locale('views.congratulations.exportMigration')}
                </Button>
            </div>
        {/if}
    </div>
    <div slot="rightpane" class="w-full h-full flex justify-center bg-pastel-blue dark:bg-gray-900">
        <Animation classes="setup-anim-aspect-ratio" {animation} />
    </div>
</OnboardingLayout>
