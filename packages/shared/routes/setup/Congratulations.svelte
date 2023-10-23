<script lang="typescript">
    import { onDestroy, onMount } from 'svelte'
    import { Animation, Button, Icon, OnboardingLayout, Text } from 'shared/components'
    import { Platform } from 'shared/lib/platform'
    import { promptUserToConnectLedger } from 'shared/lib/ledger'
    import { LOG_FILE_NAME, migration, migrationLog, resetMigrationState } from 'shared/lib/migration'
    import { activeProfile } from 'shared/lib/profile'
    import { appRouter, ledgerRouter } from '@core/router'
    import { getProfileDataPath, walletSetupType } from 'shared/lib/wallet'
    import { Locale } from '@core/i18n'
    import { SetupType } from 'shared/lib/typings/setup'

    export let locale: Locale

    const { didComplete } = $migration

    const wasMigrated = $didComplete

    let logExported = false
    let isNotALedgerProfile: boolean = false

    onMount(() => {
        if (!wasMigrated) {
            if ($walletSetupType === SetupType.FireflyLedger || $walletSetupType === SetupType.TrinityLedger) {
                isNotALedgerProfile = false
            } else {
                isNotALedgerProfile = true
            }
        }
    })

    const handleContinueClick = (): void => {
        if (wasMigrated) {
            const _continue = () => {
                if ($walletSetupType === SetupType.TrinityLedger) {
                    /**
                     * We check for the new Ledger IOTA app to be connected after migration
                     * because the last app the user had open was the legacy one
                     */
                    promptUserToConnectLedger(false, () => $appRouter.next())
                } else {
                    $appRouter.next()
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
                            logExported = true
                            _continue()
                        }
                    })
                    .catch(console.error)
            }
            if (logExported) {
                _continue()
            } else {
                _exportMigrationLog()
            }
        } else {
            $appRouter.next()
        }
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
        <Button icon="profile" classes="w-full" secondary>
            {locale('views.congratulations.migrateAnotherProfile')}
        </Button>
        {#if isNotALedgerProfile}
            <Button icon="export" classes="w-full" secondary>
                {locale('views.congratulations.exportStronghold')}
            </Button>
        {/if}
        <Button classes="w-full" onClick={() => handleContinueClick()}>
            {locale(`${wasMigrated && !logExported ? 'views.congratulations.exportMigration' : 'actions.finishSetup'}`)}
        </Button>
    </div>
    <div slot="rightpane" class="w-full h-full flex justify-center bg-pastel-yellow dark:bg-gray-900">
        <Animation classes="setup-anim-aspect-ratio" animation="congratulations-desktop" />
    </div>
</OnboardingLayout>
