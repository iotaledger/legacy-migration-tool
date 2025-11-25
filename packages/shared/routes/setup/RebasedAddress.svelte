<script lang="typescript">
    import { Button, Input, OnboardingLayout, Text } from 'shared/components'
    import { appRouter } from '@core/router'
    import { migrationAddress } from '../../lib/migration'
    import { hexAddressToTernary } from '../../lib/ed25519'
    import { Platform } from 'shared/lib/platform'

    export let locale
    export let busy = false

    let rebasedAddress = ''
    let error = ''

    const IOTA_WALLET_GUIDE_URL = 'https://wiki.iota.org/get-started/wallets'
    const IOTA_ADDRESS_LENGTH = 32

    function isHex(value: string): boolean {
        return /^(0x|0X)?[a-fA-F0-9]+$/.test(value) && value.length % 2 === 0
    }

    function getHexByteLength(value: string): number {
        return /^(0x|0X)/.test(value) ? (value.length - 2) / 2 : value.length / 2
    }

    function isValidIotaAddress(value: string): boolean {
        return isHex(value) && getHexByteLength(value) === IOTA_ADDRESS_LENGTH
    }

    $: {
        if (!rebasedAddress) {
            error = ''
        } else if (!isValidIotaAddress(rebasedAddress)) {
            error = locale('views.rebasedAddress.error.invalidAddress')
        } else {
            error = ''
        }
    }

    function handleContinue() {
        if (!rebasedAddress) {
            error = locale('views.rebasedAddress.error.addressRequired')
            return
        }

        if (!isValidIotaAddress(rebasedAddress)) {
            error = locale('views.rebasedAddress.error.invalidAddress')
            return
        }

        try {
            busy = true
            const trytes = hexAddressToTernary(rebasedAddress)
            migrationAddress.set({ ed25519: rebasedAddress, trytes })
            $appRouter.next()
        } catch (err) {
            error = 'Failed to convert address: ' + err.message
        } finally {
            busy = false
        }
    }

    function consultGuide() {
        Platform.openUrl(IOTA_WALLET_GUIDE_URL)
    }

    function handleBackClick() {
        $appRouter.previous()
    }
</script>

<OnboardingLayout onBackClick={handleBackClick} {busy}>
    <div slot="title">
        <Text type="h2">{locale('views.rebasedAddress.title')}</Text>
    </div>
    <div slot="leftpane__content">
        <Text type="p" secondary classes="mb-6">
            {locale('views.rebasedAddress.description')}
        </Text>

        <Input
            bind:value={rebasedAddress}
            {error}
            placeholder={locale('views.rebasedAddress.placeholder')}
            disabled={busy}
            classes="w-full"
            {locale}
        />
    </div>
    <div slot="leftpane__action">
        <Button classes="w-full" onClick={handleContinue} disabled={busy || !rebasedAddress || !!error}>
            {locale('actions.continue')}
        </Button>
    </div>
    <div slot="rightpane" class="w-full h-full flex flex-col items-center justify-start p-8 overflow-y-auto">
        <div class="bg-gray-100 dark:bg-gray-900 rounded-2xl p-8 max-w-md w-full space-y-6">
            <!-- How to Get Address Guide -->
            <div>
                <Text type="h3" classes="mb-4">
                    {locale('views.rebasedAddress.howTo.title')}
                </Text>
                <Text type="p" secondary classes="text-sm mb-4">
                    {locale('views.rebasedAddress.howTo.description')}
                </Text>
                <div class="space-y-2 text-sm">
                    <Text type="p" secondary>{locale('views.rebasedAddress.howTo.steps.step1')}</Text>
                    <Text type="p" secondary>{locale('views.rebasedAddress.howTo.steps.step2')}</Text>
                    <Text type="p" secondary>{locale('views.rebasedAddress.howTo.steps.step3')}</Text>
                    <Text type="p" secondary>{locale('views.rebasedAddress.howTo.steps.step4')}</Text>
                    <Text type="p" secondary>{locale('views.rebasedAddress.howTo.steps.step5')}</Text>
                </div>
                <div class="mt-4 pt-4 border-t border-gray-300 dark:border-gray-700">
                    <Text type="p" secondary classes="text-sm mb-2">
                        {locale('views.rebasedAddress.howTo.walletGuide')}
                    </Text>
                    <button on:click={() => consultGuide()}>
                        <Text type="p" highlighted>{locale('views.rebasedAddress.howTo.guideLink')} →</Text>
                    </button>
                    <Text type="p" secondary classes="text-xs mt-3">
                        {locale('views.rebasedAddress.howTo.alternativeWallets')}
                    </Text>
                </div>
            </div>

            <!-- Address Format Info -->
            <div class="pt-4 border-t border-gray-300 dark:border-gray-700">
                <Text type="h3" classes="mb-4">
                    {locale('views.rebasedAddress.info.title')}
                </Text>
                <Text type="p" secondary classes="text-sm mb-4">
                    {locale('views.rebasedAddress.info.description')}
                </Text>
                <div class="mb-2">
                    <Text type="p" secondary classes="text-xs mb-2">
                        {locale('views.rebasedAddress.info.example')}
                    </Text>
                    <Text
                        type="p"
                        secondary
                        classes="bg-white dark:bg-gray-800 rounded-lg p-3 text-xs break-all border text-xs"
                    >
                        0x7ad1aee6262b8823aa74177692d917f2603c30587df6916f666eeb692f22b38d
                    </Text>
                </div>
            </div>
        </div>
    </div>
</OnboardingLayout>
