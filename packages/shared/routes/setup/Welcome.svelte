<script lang="typescript">
    import { appRouter } from '@core/router'
    import { Animation, Button, Dropdown, Logo, OnboardingLayout, Text } from 'shared/components'
    import { appSettings } from 'shared/lib/appSettings'
    import { SUPPORTED_LOCALES, setLanguage, _ } from '@core/i18n'
    import { Locale } from '@core/i18n'

    export let locale: Locale

    $: languageList = Object.values(SUPPORTED_LOCALES).map((locale) => ({ value: locale, label: locale }))

    function handleContinueClick(): void {
        $appRouter.next()
    }

    function handleLanguage(item: { value: string }): void {
        setLanguage(item)
        locale = $_
    }
</script>

<OnboardingLayout allowBack={false}>
    <div slot="leftpane__content">
        <div class="flex flex-col space-y-4 mb-8">
            <Logo width="64px" logo="logo-firefly" classes="mb-6" />
            <Text type="h1">{locale('views.onboarding1.title')}</Text>
            <Text type="p" secondary>{locale('views.onboarding1.body')}</Text>
        </div>
        <Dropdown
            sortItems={true}
            onSelect={handleLanguage}
            value={SUPPORTED_LOCALES[$appSettings.language]}
            items={languageList}
        />
    </div>
    <div slot="leftpane__action">
        <Button onClick={() => handleContinueClick()} classes="w-full">{locale('actions.continue')}</Button>
    </div>
    <div slot="rightpane" class="w-full h-full flex justify-center bg-pastel-blue dark:bg-gray-900">
        <Animation classes="setup-anim-aspect-ratio" animation="welcome-desktop" />
    </div>
</OnboardingLayout>

<style type="text/scss">
    .languages {
        max-height: calc(100vh - 100vw - 150px);
        @screen md {
            max-height: inherit;
        }
        button {
            &.active {
                @apply bg-blue-500;
                @apply bg-opacity-10;
                :global(p) {
                    @apply text-blue-500;
                }
            }
        }
    }
</style>
