<script lang="typescript">
    import { Locale } from '@core/i18n'
    import { appRouter } from '@core/router'
    import {
        Animation,
        Button,
        ButtonCheckbox,
        CollapsibleBlock,
        Logo,
        OnboardingLayout,
        Text,
    } from 'shared/components'
    import { stage } from 'shared/lib/app'
    import { initAppSettings } from 'shared/lib/appSettings'
    import { initialiseMigrationListeners } from 'shared/lib/migration'
    import { showAppNotification } from 'shared/lib/notifications'
    import { Platform } from 'shared/lib/platform'
    import { openPopup } from 'shared/lib/popup'
    import { newProfile, profiles, storeProfile, validateProfileName } from 'shared/lib/profile'
    import { Stage } from 'shared/lib/typings/stage'
    import { destroyActor, getProfileDataPath, initialise } from 'shared/lib/wallet'
    import { get } from 'svelte/store'

    export let locale: Locale

    let error = ''
    let busy = false

    const TMP_PROFILE_NAME = 'MigrationProfile'
    let isDeveloperProfile = $newProfile?.isDeveloperProfile ?? get(stage) !== Stage.PROD

    $: hasDeveloperProfileChanged = $newProfile?.isDeveloperProfile !== isDeveloperProfile

    async function handleContinueClick(): Promise<void> {
        const _profiles = get(profiles)
        const trimmedProfileName = TMP_PROFILE_NAME.trim() + _profiles.length

        try {
            validateProfileName(trimmedProfileName)
        } catch (err) {
            return (error = err.message)
        }
        cleanUpIfPreviouslyInitialized()
        await initialiseProfileAndContinue(trimmedProfileName)
    }

    function cleanUpIfPreviouslyInitialized(): void {
        const previousInitializedId = $newProfile?.id
        if (hasDeveloperProfileChanged && previousInitializedId) {
            destroyActor(previousInitializedId)
        }
    }

    async function initialiseProfileAndContinue(name: string): Promise<void> {
        try {
            busy = true
            if (hasDeveloperProfileChanged) {
                storeProfile(name, isDeveloperProfile)

                const path = await getProfileDataPath($newProfile.id)
                const machineId = await Platform.getMachineId()
                const { sendCrashReports } = $initAppSettings ?? { sendCrashReports: false }
                initialise($newProfile.id, path, sendCrashReports, machineId)
                initialiseMigrationListeners()
            }

            if (get(stage) === Stage.PROD && isDeveloperProfile) {
                openPopup({
                    type: 'confirmDeveloperProfile',
                    props: {
                        handleContinueClick: () => $appRouter.next(),
                    },
                })
            } else {
                $appRouter.next()
            }
        } catch (err) {
            showAppNotification({
                type: 'error',
                message: locale(err.error ? err.error : 'error.global.generic'),
            })
        } finally {
            busy = false
        }
    }
</script>

<OnboardingLayout allowBack={false}>
    <div slot="leftpane__content">
        <div class="flex flex-col space-y-4 mb-8">
            <Logo width="64px" logo="logo-iota" classes="mb-6" />
            <Text type="h1">{locale('views.onboarding1.title')}</Text>
            <Text type="p" secondary>
                {locale('views.onboarding1.body')}
            </Text>
            {#if get(stage) !== Stage.PROD}
                <CollapsibleBlock
                    label={locale('views.profile.advancedOptions')}
                    showBlock={get(newProfile)?.isDeveloperProfile ?? false}
                >
                    <ButtonCheckbox icon="dev" bind:value={isDeveloperProfile}>
                        <div class="text-left">
                            <Text type="p">{locale('views.profile.developer.label')}</Text>
                            <Text type="p" secondary>{locale('views.profile.developer.info')}</Text>
                        </div>
                    </ButtonCheckbox>
                </CollapsibleBlock>
            {/if}
        </div>
    </div>
    <div slot="leftpane__action">
        <Button onClick={() => handleContinueClick()} classes="w-full">{locale('actions.continue')}</Button>
    </div>
    <div slot="rightpane" class="w-full h-full flex justify-center bg-pastel-blue dark:bg-gray-900">
        <Animation classes="setup-anim-aspect-ratio" animation="welcome-desktop" />
    </div>
</OnboardingLayout>
