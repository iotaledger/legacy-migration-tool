<script lang="typescript">
    import { Icon, ProgressFlow } from 'shared/components'
    import { ledgerMigrationProgresses } from 'shared/lib/migration'
    import { openPopup } from 'shared/lib/popup'
    import { Locale } from '@core/i18n'

    export let locale: Locale

    export let allowBack = true
    export let busy = false
    export let showLedgerProgress = false
    export let showLedgerVideoButton = false

    export let onBackClick = (): void => {}
</script>

<!-- https://github.com/sveltejs/svelte/issues/4546 -->
{#if false}
    <slot />
{/if}
<!--  -->
<div data-label="onboarding-layout" class="relative w-full h-full flex flex-row">
    <div data-label="leftpane" class="h-full flex justify-center p-10 bg-white dark:bg-gray-800" style="width: 38%;">
        <div class="w-full h-full flex flex-col justify-between" style="max-width: 406px;">
            <div class="flex flex-col h-full">
                {#if allowBack}
                    <button
                        on:click={onBackClick}
                        class="mb-8 w-6 h-6 {busy && 'pointer-events-none opacity-50'}"
                        disabled={busy}
                    >
                        <Icon
                            icon="arrow-left"
                            classes={busy ? 'pointer-events-none text-gray-500' : 'cursor-pointer text-blue-500'}
                        />
                    </button>
                {/if}
                <div data-label="leftpane-content" class="h-full flex flex-col">
                    <div class="mb-5">
                        <slot name="title" />
                    </div>
                    <slot name="leftpane__content" />
                </div>
            </div>
            <div data-label="leftpane-action" class="mt-6">
                <slot name="leftpane__action" />
            </div>
        </div>
    </div>
    <div data-label="rightpane" style="width: 62%;" class="relative bg-gray-100 dark:bg-gray-900">
        <slot name="rightpane" />
        {#if showLedgerProgress}
            <div class="absolute transform bottom-8 left-1/2 -translate-x-1/2 w-full px-20">
                <ProgressFlow progress={$ledgerMigrationProgresses} />
            </div>
        {/if}
    </div>
</div>

<style type="text/scss">
    header {
        margin-top: env(safe-area-inset-top);
        :global(h1),
        :global(h2),
        :global(h3),
        :global(h4),
        :global(h5) {
            @apply font-bold;
            @apply text-16;
            @apply leading-140;
        }
    }
    footer {
        margin-bottom: env(safe-area-inset-bottom);
    }
</style>
