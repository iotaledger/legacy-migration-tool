<script lang="typescript">
    import { Animation, Button, ImportTextfield, OnboardingLayout, Spinner, Text } from 'shared/components'
    import { createEventDispatcher, getContext } from 'svelte'
    import { Locale } from '@core/i18n'
    import { ImportRouter } from '@core/router'

    export let locale: Locale

    const dispatch = createEventDispatcher()
    const { importType, isGettingMigrationData } = getContext<ImportRouter>('importRouter')

    let input = ''

    function handleContinueClick(): void {
        dispatch('next', { migrationSeed: input })
    }

    function handleBackClick(): void {
        if (!$isGettingMigrationData) {
            dispatch('previous')
        }
    }
</script>

<OnboardingLayout onBackClick={handleBackClick}>
    <div slot="title">
        <Text type="h2">{locale(`views.importFromText.${$importType}.title`)}</Text>
    </div>
    <div slot="leftpane__content">
        <Text type="p" secondary classes="mb-8">{locale(`views.importFromText.${$importType}.body`)}</Text>
        <Text type="h5" classes="mb-3">{locale(`views.importFromText.${$importType}.enter`)}</Text>
        <ImportTextfield disabled={$isGettingMigrationData} type={$importType} bind:value={input} {locale} />
    </div>
    <div slot="leftpane__action" class="flex flex-row flex-wrap justify-between items-center space-x-4">
        <Button
            classes="flex-1"
            disabled={input.length === 0 || $isGettingMigrationData}
            onClick={() => handleContinueClick()}
        >
            {#if $isGettingMigrationData}
                <Spinner
                    busy={$isGettingMigrationData}
                    message={locale('views.migrate.restoringWallet')}
                    classes="justify-center"
                />
            {:else}{locale('actions.continue')}{/if}
        </Button>
    </div>
    <div slot="rightpane" class="w-full h-full flex justify-center bg-pastel-blue dark:bg-gray-900">
        <Animation classes="setup-anim-aspect-ratio" animation="import-from-text-desktop" />
    </div>
</OnboardingLayout>
