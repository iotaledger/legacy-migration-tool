<script lang="ts">
    import { Animation, Button, OnboardingLayout, Password, Text } from 'shared/components'
    import { localize } from '@core/i18n'
    import { updateStrongholdRouter } from '@core/router'
    import { Router } from '@core/router/router'
    import { activeProfileId } from '@lib/profile'
    import { destroyActor } from '@lib/wallet'
    import { strongholdPassword } from '@lib/app'

    export let parentRouter: Router<unknown>
    export let isRecovery: boolean

    const busy = false
    let password: string = ''
    let error: string = ''

    $: password, (error = '')

    function onBackClick(): void {
        destroyActor($activeProfileId)
        $updateStrongholdRouter.previous()
        parentRouter.previous()
    }

    function onContinueClick(): void {
        if (isRecovery) {
            $updateStrongholdRouter.next()
        } else {
            // TODO: Remove later once real logic is hooked in
            if (password === 'test') {
                strongholdPassword.set(password)
                $updateStrongholdRouter.next()
            } else {
                error = 'Must use "test" password'
            }
        }
    }
</script>

<update-stronghold-view>
    <OnboardingLayout {onBackClick}>
        <div slot="title">
            <Text type="h2" classes="mb-5">{localize('views.login.updateStronghold.title')}</Text>
        </div>
        <div slot="leftpane__content">
            <Text type="p" secondary classes="mb-8">
                {localize('views.login.updateStronghold.body')}
                {localize(`views.login.updateStronghold.${isRecovery ? 'continue' : 'providePassword'}`)}
            </Text>
            {#if !isRecovery}
                <Password
                    classes="mb-6"
                    {error}
                    bind:value={password}
                    locale={localize}
                    showRevealToggle
                    autofocus
                    disabled={busy}
                    submitHandler={onContinueClick}
                />
            {/if}
        </div>
        <div slot="leftpane__action">
            <Button classes="w-full" onClick={onContinueClick}>
                {localize('actions.continue')}
            </Button>
        </div>
        <div slot="rightpane" class="w-full h-full flex justify-center bg-pastel-orange dark:bg-gray-900">
            <Animation animation="backup-desktop" />
        </div>
    </OnboardingLayout>
</update-stronghold-view>