<script lang="typescript">
    import { Platform } from 'shared/lib/platform'
    import { Animation, Button, Link, OnboardingLayout, Text } from 'shared/components'
    import { Locale } from '@core/i18n'
    import { SetupType } from 'shared/lib/typings/setup'
    import { appRouter } from '@core/router'

    export let locale: Locale

    function handleContinueClick(setupType: SetupType): void {
        $appRouter.next({ setupType })
    }

    function handleBackClick(): void {
        $appRouter.previous()
    }
</script>

<OnboardingLayout onBackClick={handleBackClick}>
    <div slot="title">
        <Text type="h2">{locale('views.setup.title')}</Text>
    </div>
    <div slot="leftpane__content">
        <div class="relative flex flex-col items-center bg-gray-100 dark:bg-gray-900 rounded-2xl mt-16 p-8 pt-16">
            <Text type="h3" classes="mb-6 text-center">{locale('views.setup.chrysalisTitle')}</Text>
            <Text type="p" secondary classes="mb-8">{locale('views.setup.chrysalisBody')}</Text>
            <Link onClick={() => Platform.openUrl('https://blog.iota.org/iota-stardust-upgrade/')}>
                {locale('views.setup.learnMore')}
            </Link>
        </div>
    </div>
    <div slot="leftpane__action" class="flex flex-col space-y-4">
        <Button icon="transfer" classes="w-full" secondary onClick={() => handleContinueClick(SetupType.Import)}>
            {locale('actions.restoreWallet')}
            <Text type="p" secondary smaller>{locale('actions.restoreWalletDescription')}</Text>
        </Button>
    </div>
    <div slot="rightpane" class="w-full h-full flex justify-center bg-pastel-blue dark:bg-gray-900">
        <Animation classes="setup-anim-aspect-ratio" animation="setup-desktop" />
    </div>
</OnboardingLayout>
