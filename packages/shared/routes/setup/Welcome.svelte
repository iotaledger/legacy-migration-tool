<script lang="typescript">
    import { appRouter } from '@core/router'
    import { Animation, Button, Logo, OnboardingLayout, Text } from 'shared/components'
    import { Locale } from '@core/i18n'

    export let locale: Locale

    function handleContinueClick(): void {
        $appRouter.next()
    }
</script>

<OnboardingLayout allowBack={false}>
    <div slot="leftpane__content">
        <div class="flex flex-col space-y-4 mb-8">
            <Logo width="64px" logo="logo-firefly" classes="mb-6" />
            <Text type="h1">{locale('views.onboarding1.title')}</Text>
            <Text type="p" secondary>
                {locale('views.onboarding1.body')}
            </Text>
        </div>
    </div>
    <div slot="leftpane__action">
        <Button onClick={() => handleContinueClick()} classes="w-full">{locale('actions.continue')}</Button>
    </div>
    <div slot="rightpane" class="w-full h-full flex justify-center bg-pastel-blue dark:bg-gray-900">
        <Animation classes="setup-anim-aspect-ratio" animation="welcome-desktop" />
    </div>
</OnboardingLayout>
