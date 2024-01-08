<script lang="typescript">
    import { Button, Text } from 'shared/components'
    import { closePopup } from 'shared/lib/popup'
    import { Locale } from '@core/i18n'

    export let locale: Locale

    export let balance = ''

    export let onProceed = (): void => {}

    function handleCancelClick() {
        closePopup()
    }
</script>

<div class="mb-8">
    <Text type="h4" classes="mb-5">{locale('popups.missingBundle.title')}</Text>
    <Text type="p" classes="mb-2" secondary>{locale('popups.missingBundle.body', { values: { value: balance } })}</Text>
</div>
<div class="flex flex-row justify-between w-full space-x-4 md:px-8">
    <Button secondary classes="w-full" onClick={handleCancelClick}>{locale('actions.cancel')}</Button>
    <Button classes="w-full" onClick={onProceed}>{locale('popups.missingBundle.proceed')}</Button>
</div>
