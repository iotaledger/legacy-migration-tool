<script lang="typescript">
    import { Animation, Button, OnboardingLayout, Text } from 'shared/components'
    import { setProfileType } from 'shared/lib/profile'
    import { Locale } from '@core/i18n'
    import { ImportType, ProfileType } from 'shared/lib/typings/profile'
    import { createEventDispatcher } from 'svelte'

    export let locale: Locale

    const dispatch = createEventDispatcher()

    function handleContinueClick(importType: ImportType) {
        const profileType = importType === ImportType.Ledger ? ProfileType.Ledger : ProfileType.Software
        setProfileType(profileType)
        dispatch('next', { importType })
    }
    function handleBackClick() {
        dispatch('previous')
    }
</script>

<OnboardingLayout onBackClick={handleBackClick}>
    <div slot="title">
        <Text type="h2">{locale('views.import.title')}s</Text>
    </div>
    <div slot="leftpane__content">
        <Text type="p" secondary classes="mb-8">{locale('views.import.body')}</Text>
    </div>
    <div slot="leftpane__action" class="flex flex-col space-y-4">
        <Button icon="seed" classes="w-full" secondary onClick={() => handleContinueClick(ImportType.Seed)}>
            {locale('views.import.importSeed')}
            <Text type="p" secondary smaller>{locale('views.import.importSeedDescription')}</Text>
        </Button>
        <Button icon="doc" classes="w-full" secondary onClick={() => handleContinueClick(ImportType.File)}>
            {locale('views.import.importFile')}
            <Text type="p" secondary smaller>{locale('views.import.importFileDescription')}</Text>
        </Button>
        <Button icon="chip" classes="w-full mb-8" secondary onClick={() => handleContinueClick(ImportType.Ledger)}>
            {locale('views.import.importLedger')}
            <Text type="p" secondary smaller>{locale('views.import.importLedgerDescription')}</Text>
        </Button>
    </div>
    <div slot="rightpane" class="w-full h-full flex justify-center bg-pastel-purple dark:bg-gray-900">
        <Animation classes="setup-anim-aspect-ratio" animation="import-desktop" />
    </div>
</OnboardingLayout>
