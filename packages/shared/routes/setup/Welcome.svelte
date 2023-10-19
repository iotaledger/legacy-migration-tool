<script lang="typescript">
    import { appRouter } from '@core/router'
    import { Animation, Button, Logo, OnboardingLayout, Text } from 'shared/components'

    function handleContinueClick(): void {
        $appRouter.next()
    }
</script>

<OnboardingLayout allowBack={false}>
    <div slot="leftpane__content">
        <div class="flex flex-col space-y-4 mb-8">
            <Logo width="64px" logo="logo-firefly" classes="mb-6" />
            <Text type="h1">Welcome to Legacy Migration Tool</Text>
            <Text type="p" secondary>
                This tool will help you migrate your data to be compatible with the new protocol.
            </Text>
        </div>
    </div>
    <div slot="leftpane__action">
        <Button onClick={() => handleContinueClick()} classes="w-full">Continue</Button>
    </div>
    <div slot="rightpane" class="w-full h-full flex justify-center bg-pastel-blue dark:bg-gray-900">
        <Animation classes="setup-anim-aspect-ratio" animation="welcome-desktop" />
    </div>
</OnboardingLayout>
