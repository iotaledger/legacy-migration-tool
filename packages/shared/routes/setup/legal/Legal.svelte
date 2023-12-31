<script lang="typescript">
    import { Button, Checkbox, OnboardingLayout, Text } from 'shared/components'
    import Content from './Content.svelte'
    import { lastAcceptedTos, lastAcceptedPrivacyPolicy } from 'shared/lib/appSettings'
    import { TOS_VERSION, PRIVACY_POLICY_VERSION } from 'shared/lib/app'
    import { appRouter } from '@core/router'
    import { Locale } from '@core/i18n'

    export let locale: Locale

    let checked = false
    let termsAccepted = false

    $: termsAccepted = checked

    function handleContinueClick(): void {
        lastAcceptedTos.set(TOS_VERSION)
        lastAcceptedPrivacyPolicy.set(PRIVACY_POLICY_VERSION)
        $appRouter.next()
    }
    function handleBackClick(): void {
        $appRouter.previous()
    }
</script>

<OnboardingLayout onBackClick={handleBackClick}>
    <div slot="title">
        <Text type="h2">{locale('views.legal.title')}</Text>
    </div>
    <div slot="leftpane__content">
        <Text type="p" secondary classes="mb-8">{locale('views.legal.body')}</Text>
    </div>
    <div slot="leftpane__action" class="flex flex-col space-y-8">
        <Checkbox label="I've read and I accept the Privacy Policy & Terms of Service" bind:checked />
        <Button classes="w-full" disabled={!termsAccepted} onClick={() => handleContinueClick()}
            >{locale('actions.continue')}</Button
        >
    </div>
    <div slot="rightpane" class="w-full h-full flex items-center px-40 py-20">
        <div
            class="legal-content block relative max-h-full overflow-y-auto w-full text-justify pr-10 scroll-quaternary"
        >
            <Content />
        </div>
    </div>
</OnboardingLayout>

<style type="text/scss">
    .legal-content {
        :global(ul) {
            display: block;
            list-style-type: disc;
            margin-block-start: 1em;
            margin-block-end: 1em;
            margin-inline-start: 0px;
            margin-inline-end: 0px;
            padding-inline-start: 20px;
        }
    }
</style>
