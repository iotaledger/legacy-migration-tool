<script lang="typescript">
    import { Locale, localize } from '@core/i18n'
    import { appRouter, ledgerRouter } from '@core/router'
    import { openPopup } from '@lib/popup'
    import { getDefaultStrongholdName } from '@lib/utils'
    import { Animation, Button, Icon, OnboardingLayout, Text } from 'shared/components'
    import { cleanupSignup } from 'shared/lib/app'
    import {
        resetMigrationState,
        totalMigratedBalance,
        migrationAddress,
        exportMigrationLog,
    } from 'shared/lib/migration'
    import { showAppNotification } from 'shared/lib/notifications'
    import { Platform } from 'shared/lib/platform'
    import { activeProfile, updateProfile } from 'shared/lib/profile'
    import { LedgerAppName } from 'shared/lib/typings/ledger'
    import { SetupType } from 'shared/lib/typings/setup'
    import { formatUnitBestMatch } from 'shared/lib/units'
    import { api, walletSetupType } from 'shared/lib/wallet'
    import { getRebasedAddressUrl } from 'shared/lib/network'
    import { onMount } from 'svelte'
    import { convertBech32AddressToEd25519Address } from '../../lib/ed25519'

    export let locale: Locale

    let localizedBody = 'body'
    let localizedValues = {}

    let exportStrongholdBusy = false

    onMount(() => {
        if ($walletSetupType === SetupType.TrinityLedger) {
            localizedBody = 'trinityLedgerBody'
            localizedValues = { legacy: LedgerAppName.IOTALegacy }
            updateProfile('ledgerMigrationCount', $activeProfile.ledgerMigrationCount + 1)
        } else {
            localizedBody = 'softwareMigratedBody'
        }
    })

    function exportStronghold(): void {
        function onPasswordSuccess(password: string, callback?: (cancelled: boolean, err?: string) => void): void {
            Platform.getStrongholdBackupDestination(getDefaultStrongholdName())
                .then((result) => {
                    if (result) {
                        Platform.saveStrongholdBackup({ allowAccess: true })
                        api.backup(result, password, {
                            onSuccess() {
                                Platform.saveStrongholdBackup({ allowAccess: false })
                                updateProfile('lastStrongholdBackupTime', new Date())
                                callback(false)
                                _finally()
                            },
                            onError(err) {
                                callback(false, err.error)
                                _finally()
                            },
                        })
                    } else {
                        callback(true)
                    }
                })
                .catch((err) => {
                    callback(false, err.error)
                    _finally()
                })
        }
        function _callback(cancelled, err): void {
            if (!cancelled) {
                if (err) {
                    showAppNotification({
                        type: 'error',
                        message: localize(err),
                    })
                    _finally()
                }
            }
        }
        function _finally(): void {
            exportStrongholdBusy = false
        }

        exportStrongholdBusy = true
        openPopup({
            type: 'password',
            props: {
                onSuccess: (password) => {
                    onPasswordSuccess(password, _callback)
                },
                onError: _finally,
                onCancelled: _finally,
                returnPassword: true,
                subtitle: localize('popups.password.backup'),
            },
        })
    }

    function consultExplorerClick() {
        const network = $activeProfile.isDeveloperProfile ? 'devnet' : 'mainnet'
        const address = `0x${convertBech32AddressToEd25519Address($migrationAddress.bech32)}`
        const url = getRebasedAddressUrl(address, network)
        Platform.openUrl(url)
    }

    function migrateAnotherProfile(): void {
        cleanupSignup()
        resetMigrationState()
        $ledgerRouter.reset()
        $appRouter.reset()
    }
</script>

<OnboardingLayout allowBack={false}>
    <div slot="leftpane__content">
        <div class="relative flex flex-col items-center bg-gray-100 dark:bg-gray-900 rounded-2xl mt-10 p-10 pb-6">
            <div class="bg-green-500 rounded-2xl absolute -top-6 w-12 h-12 flex items-center justify-center">
                <Icon icon="success-check" classes="text-white" />
            </div>
            <Text type="h2" classes="mb-6 text-center">{locale('views.congratulations.fundsMigrated')}</Text>
            <Text type="p" secondary classes="mb-6 text-center">
                {locale(`views.congratulations.${localizedBody}`, { values: localizedValues })}
            </Text>
            <Text type="h2">{formatUnitBestMatch($totalMigratedBalance, true)}</Text>
        </div>
    </div>
    <div slot="leftpane__action" class="flex flex-col space-y-4">
        <button on:click={() => consultExplorerClick()}>
            <Text type="p" highlighted>{locale('views.congratulations.consultExplorer')}</Text>
        </button>
        <Button
            icon="profile"
            classes="w-full"
            secondary
            onClick={migrateAnotherProfile}
            disabled={exportStrongholdBusy}
        >
            {locale('views.congratulations.migrateAnotherProfile')}
        </Button>
        <Button classes="w-full" onClick={exportMigrationLog}>
            {locale('views.congratulations.exportMigration')}
        </Button>
    </div>
    <div slot="rightpane" class="w-full h-full flex justify-center bg-pastel-yellow dark:bg-gray-900">
        <Animation classes="setup-anim-aspect-ratio" animation="congratulations-desktop" />
    </div>
</OnboardingLayout>
