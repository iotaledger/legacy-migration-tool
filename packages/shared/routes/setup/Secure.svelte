<script lang="typescript">
    import { Animation, Button, OnboardingLayout, Text } from 'shared/components'
    import { downloadRecoveryKit } from 'shared/lib/utils'
    import { Locale } from '@core/i18n'
    import { appRouter } from '@core/router'

    export let locale: Locale

    function handleContinueClick(): void {
        $appRouter.next()
    }

    function handleDownloadClick() {
        downloadRecoveryKit()
    }

    function handleBackClick(): void {
        $appRouter.previous()
    }
</script>

<OnboardingLayout onBackClick={handleBackClick}>
    <div slot="title">
        <Text type="h2">{locale('views.secure.title')}</Text>
    </div>
    <div slot="leftpane__content">
        <Text type="p" secondary classes="mb-4">{locale('views.secure.body1')}</Text>
        <Text type="p" secondary classes="mb-10">{locale('views.secure.body2')}</Text>
    </div>
    <div slot="leftpane__action" class="flex flex-col">
        <Button secondary classes="flex-1 mb-4" onClick={() => handleDownloadClick()}>
            {locale('actions.downloadRecoveryKit')}
        </Button>
        <Button classes="flex-1" onClick={() => handleContinueClick()}>{locale('actions.continue')}</Button>
    </div>
    <div slot="rightpane" class="w-full h-full flex justify-center bg-pastel-orange dark:bg-gray-900">
        <Animation classes="setup-anim-aspect-ratio" animation="secure-desktop" />
    </div>
</OnboardingLayout>
