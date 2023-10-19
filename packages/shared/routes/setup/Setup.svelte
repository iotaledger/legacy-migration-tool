<script lang="typescript">
    import { Platform } from 'shared/lib/platform'
    import { Animation, Button, Link, OnboardingLayout, Text } from 'shared/components'
    import { SetupType } from 'shared/lib/typings/setup'
    import { appRouter } from '@core/router'

    function handleContinueClick(setupType: SetupType): void {
        $appRouter.next({ setupType })
    }

    function handleBackClick(): void {
        $appRouter.previous()
    }
</script>

<OnboardingLayout onBackClick={handleBackClick}>
    <div slot="title">
        <Text type="h2">Migrate your wallet</Text>
    </div>
    <div slot="leftpane__content">
        <div class="relative flex flex-col items-center bg-gray-100 dark:bg-gray-900 rounded-2xl mt-16 p-8 pt-16">
            <Text type="h3" classes="mb-6 text-center">Stardust Migration Update</Text>
            <Text type="p" secondary classes="mb-8"
                >From October 4th 2023, users can migrate their tokens to the new Stardust network. We recommend you
                migrate your existing tokens as soon as possible.</Text
            >
            <Link onClick={() => Platform.openUrl('https://blog.iota.org/iota-stardust-upgrade/')}>
                Learn about the migration
            </Link>
        </div>
    </div>
    <div slot="leftpane__action" class="flex flex-col space-y-4">
        <Button icon="transfer" classes="w-full" secondary onClick={() => handleContinueClick(SetupType.Import)}>
            Migrate a wallet
            <Text type="p" secondary smaller>Migrate to Stardust an existing wallet</Text>
        </Button>
    </div>
    <div slot="rightpane" class="w-full h-full flex justify-center bg-pastel-blue dark:bg-gray-900">
        <Animation classes="setup-anim-aspect-ratio" animation="setup-desktop" />
    </div>
</OnboardingLayout>
