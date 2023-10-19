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
        <Text type="h2">Recover or migrate funds</Text>
    </div>
    <div slot="leftpane__content">
        <Text type="p" secondary classes="mb-8"
            >If you have an existing seed or wallet back up file, you can import it here. If you hold older network
            funds, you will be taken through the migration steps to move to the Stardust network.</Text
        >
    </div>
    <div slot="leftpane__action" class="flex flex-col space-y-4">
        <Button icon="seed" classes="w-full" secondary onClick={() => handleContinueClick(ImportType.Seed)}>
            I have an 81 character seed
            <Text type="p" secondary smaller>Enter a seed and migrate funds to Stardust</Text>
        </Button>
        <Button icon="doc" classes="w-full" secondary onClick={() => handleContinueClick(ImportType.File)}>
            I have a file backup
            <Text type="p" secondary smaller>Upload a Seedvault or Stronghold file</Text>
        </Button>
        <Button icon="chip" classes="w-full mb-8" secondary onClick={() => handleContinueClick(ImportType.Ledger)}>
            I have a Ledger backup
            <Text type="p" secondary smaller>Restore or migrate a Ledger profile</Text>
        </Button>
    </div>
    <div slot="rightpane" class="w-full h-full flex justify-center bg-pastel-purple dark:bg-gray-900">
        <Animation classes="setup-anim-aspect-ratio" animation="import-desktop" />
    </div>
</OnboardingLayout>
