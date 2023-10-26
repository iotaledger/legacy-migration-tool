<script lang="typescript">
    import { Locale, localize } from '@core/i18n'
    import { appRouter, ledgerRouter } from '@core/router'
    import { cleanupSignup } from '@lib/app'
    import { promptUserToConnectLedger } from '@lib/ledger'
    import { showAppNotification } from '@lib/notifications'
    import { openPopup } from '@lib/popup'
    import { getDefaultStrongholdName } from '@lib/utils'
    import { Animation, Button, Icon, OnboardingLayout, Text } from 'shared/components'
    import { LOG_FILE_NAME, migration, migrationLog, resetMigrationState } from 'shared/lib/migration'
    import { Platform } from 'shared/lib/platform'
    import { activeProfile, updateProfile } from 'shared/lib/profile'
    import { SetupType } from 'shared/lib/typings/setup'
    import { api, getProfileDataPath, walletSetupType } from 'shared/lib/wallet'
    import { onDestroy } from 'svelte'

    export let locale: Locale

    const { didComplete } = $migration
    const wasMigrated = $didComplete

    let exportStrongholdBusy = false

    $: isLedgerProfile = $walletSetupType === SetupType.TrinityLedger

    const exportMigrationLog = (): void => {
        function _onAppRouterNext(): void {
            cleanupSignup()
            $appRouter.next()
        }
        if (wasMigrated) {
            const _continue = () => {
                if ($walletSetupType === SetupType.TrinityLedger) {
                    /**
                     * We check for the new Ledger IOTA app to be connected after migration
                     * because the last app the user had open was the legacy one
                     */
                    promptUserToConnectLedger(false, _onAppRouterNext)
                } else {
                    _onAppRouterNext()
                }
            }
            const _exportMigrationLog = () => {
                getProfileDataPath($activeProfile.id)
                    .then((source) =>
                        $walletSetupType === SetupType.TrinityLedger
                            ? Platform.exportLedgerMigrationLog($migrationLog, `${$activeProfile.id}-${LOG_FILE_NAME}`)
                            : Platform.exportMigrationLog(
                                  `${source}/${LOG_FILE_NAME}`,
                                  `${$activeProfile.id}-${LOG_FILE_NAME}`
                              )
                    )
                    .then((result) => {
                        if (result) {
                            _continue()
                        }
                    })
                    .catch(console.error)
            }
            _exportMigrationLog()
        } else {
            _onAppRouterNext()
        }
    }

    const migrateAnotherProfile = (): void => {
        cleanupSignup()
        $appRouter.reset()
    }

    function handleExportClick() {
        reset()
        exportStrongholdBusy = true

        const _callback = (cancelled, err) => {
            if (!cancelled) {
                if (err) {
                    showAppNotification({
                        type: 'error',
                        message: localize(err),
                    })
                    exportStrongholdBusy = false
                }
            }
        }

        openPopup({
            type: 'password',
            props: {
                onSuccess: (password) => {
                    exportStronghold(password, _callback)
                },
                returnPassword: true,
                subtitle: localize('popups.password.backup'),
            },
        })
    }

    function reset() {
        exportStrongholdBusy = false
    }

    function exportStronghold(password: string, callback?: (cancelled: boolean, err?: string) => void): void {
        Platform.getStrongholdBackupDestination(getDefaultStrongholdName())
            .then((result) => {
                if (result) {
                    Platform.saveStrongholdBackup({ allowAccess: true })
                    api.backup(result, password, {
                        onSuccess() {
                            Platform.saveStrongholdBackup({ allowAccess: false })
                            updateProfile('lastStrongholdBackupTime', new Date())
                            callback(false)
                        },
                        onError(err) {
                            callback(false, err.error)
                        },
                    })
                } else {
                    callback(true)
                }
            })
            .catch((err) => {
                callback(false, err.error)
            })
    }

    onDestroy(() => {
        if (wasMigrated) {
            resetMigrationState()
        }
        $ledgerRouter.reset()
    })
</script>

<OnboardingLayout allowBack={false}>
    <div slot="leftpane__content">
        <div class="relative flex flex-col items-center bg-gray-100 dark:bg-gray-900 rounded-2xl mt-10 p-10 pb-6">
            <div class="bg-green-500 rounded-2xl absolute -top-6 w-12 h-12 flex items-center justify-center">
                <Icon icon="success-check" classes="text-white" />
            </div>
            <Text type="h2" classes="mb-5 text-center">{locale('views.congratulations.title')}</Text>
            <Text type="p" secondary classes="mb-2 text-center">{locale('views.congratulations.body')}</Text>
        </div>
    </div>
    <div slot="leftpane__action" class="flex flex-col space-y-4">
        <Button icon="profile" classes="w-full" secondary onClick={migrateAnotherProfile}>
            {locale('views.congratulations.migrateAnotherProfile')}
        </Button>
        {#if !isLedgerProfile}
            <Button icon="export" classes="w-full" secondary onClick={handleExportClick}>
                {locale('views.congratulations.exportStronghold')}
            </Button>
        {/if}
        <Button classes="w-full" onClick={exportMigrationLog}>
            {locale('views.congratulations.exportMigration')}
        </Button>
    </div>
    <div slot="rightpane" class="w-full h-full flex justify-center bg-pastel-yellow dark:bg-gray-900">
        <Animation classes="setup-anim-aspect-ratio" animation="congratulations-desktop" />
    </div>
</OnboardingLayout>
