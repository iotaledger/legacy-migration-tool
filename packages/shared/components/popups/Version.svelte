<script lang="typescript">
    import { Button, Logo, Text } from 'shared/components'
    import { getVersionDetails, appVersion } from 'shared/lib/appVersion'
    import { Locale } from '@core/i18n'
    import { closePopup } from 'shared/lib/popup'
    import { onMount } from 'svelte'
    import { get } from 'svelte/store'
    import { stage } from 'shared/lib/app'
    import { Stage } from 'shared/lib/typings/stage'

    export let locale: Locale

    let isPreRelease = true

    function handleCloseClick() {
        closePopup()
    }

    onMount(async () => {
        // @ts-ignore: This value is replaced by Webpack DefinePlugin
        if (!devMode) {
            await getVersionDetails()
            if (get(stage) === Stage.PROD) {
                isPreRelease = false
            }
        }
    })
</script>

<Text type="h4" classes="mb-5">{locale('popups.version.title', { values: { version: $appVersion } })}</Text>
<div class="flex w-full flex-row flex-wrap">
    <div class="w-full p-4 bg-gray-50 dark:bg-gray-800 flex justify-center content-center">
        <Logo width="50%" logo="logo-iota-full" />
    </div>
    <div class="w-full text-center my-6 px-8">
        <Text type="h5" highlighted classes="mb-2">
            {#if isPreRelease}
                <!-- Capitalize first letter of stage name -->
                {`IOTA Legacy Migration Tool ${$stage.toString().replace(/^\w/, (c) => c.toUpperCase())}`}
            {:else}
                {locale('popups.version.upToDateTitle')}
            {/if}
        </Text>
        <Text smaller secondary>
            {#if isPreRelease}
                {locale('popups.version.preReleaseDescription')}
            {:else}
                {locale('popups.version.upToDateDescription', {
                    values: { version: $appVersion },
                })}
            {/if}
        </Text>
    </div>
    <div class="changelog overflow-y-auto">
        <Text secondary classes="whitespace-pre-wrap">{$appVersion}</Text>
    </div>

    <div class="flex flex-row justify-center w-full">
        <Button secondary onClick={() => handleCloseClick()}>{locale('actions.close')}</Button>
    </div>
</div>

<style type="text/scss">
    .changelog {
        max-height: 50vh;
    }
</style>
