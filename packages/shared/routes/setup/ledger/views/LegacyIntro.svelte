<script lang="typescript">
    import { Button, OnboardingLayout, Text, Animation, Illustration } from 'shared/components'
    import { initialiseMigrationListeners } from 'shared/lib/migration'
    import { showAppNotification } from 'shared/lib/notifications'
    import { api, isBackgroundSyncing } from 'shared/lib/wallet'
    import { createEventDispatcher, onMount } from 'svelte'
    import { get } from 'svelte/store'
    import { Locale } from '@core/i18n'

    export let locale: Locale

    const dispatch = createEventDispatcher()

    function handleNextClick() {
        dispatch('next')
    }

    function handleBackClick() {
        dispatch('previous')
    }

    onMount(() => {
        // This is the first screen that mounts when a user wants to migrate additional account index
        initialiseMigrationListeners()
        if (get(isBackgroundSyncing)) {
            api.stopBackgroundSync({
                onSuccess() {
                    isBackgroundSyncing.set(false)
                },
                onError(err) {
                    showAppNotification({
                        type: 'error',
                        message: locale('error.account.syncing'),
                    })
                },
            })
        }
    })
</script>

<OnboardingLayout onBackClick={handleBackClick}>
    <div slot="leftpane__content">
        <Text type="h2" classes="mb-5">{locale('views.legacyLedgerIntro.title')}</Text>
        <Text type="p" secondary classes="mb-5">{locale('views.legacyLedgerIntro.body1')}</Text>
        <Text type="p" secondary classes="mb-8">{locale('views.legacyLedgerIntro.body2')}</Text>
    </div>
    <div slot="leftpane__action">
        <Button classes="w-full" onClick={handleNextClick}>{locale('actions.continue')}</Button>
    </div>
    <!-- TODO: modify this temp animation -->
    <div slot="rightpane" class="w-full h-full flex justify-center items-center bg-gray-50 dark:bg-gray-900">
        <Animation
            width="100%"
            animation="ledger-bg-desktop"
            classes="absolute z-0 transform left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
        />
        <Illustration width="100%" illustration="ledger-install-new-app-desktop" classes="z-0" />
    </div>
</OnboardingLayout>
