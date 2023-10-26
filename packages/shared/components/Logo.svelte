<script lang="typescript">
    import { stage } from 'shared/lib/app'
    import { appSettings } from 'shared/lib/appSettings'
    import { get } from 'svelte/store'

    export let logo = undefined
    export let width = undefined
    export let height = undefined
    export let classes = ''
    export let overrideStage: undefined | 'alpha' | 'beta' | 'prod' = undefined

    $: darkModeEnabled = $appSettings.darkMode
    $: selected = logos[logo]?.[overrideStage ?? get(stage)]

    const logos = {
        'logo-iota-full': {
            alpha: 'iota_logo_full.svg',
            beta: 'iota_logo_full.svg',
            prod: 'iota_logo_full.svg',
        },
        'logo-iota': {
            alpha: 'logo_iota.svg',
            beta: 'logo_iota.svg',
            prod: 'logo_iota.svg',
        },
        'logo-stronghold': {
            alpha: 'stronghold.svg',
            beta: 'stronghold.svg',
            prod: 'stronghold.svg',
        },
        'logo-chrysalis-gem': {
            alpha: 'chrysalis_gem.svg',
            beta: 'chrysalis_gem.svg',
            prod: 'chrysalis_gem.svg',
        },
    }
</script>

{#if selected}
    <img
        data-label="logo"
        class={classes}
        width={width || '100%'}
        height={height || '100%'}
        src={`assets/logos/${darkModeEnabled ? 'darkmode' : 'lightmode'}/${selected}`}
        alt=""
    />
{/if}
