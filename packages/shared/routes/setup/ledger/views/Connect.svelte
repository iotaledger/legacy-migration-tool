<script lang="typescript">
    import { Animation, Button, Icon, Link, OnboardingLayout, Spinner, Text } from 'shared/components'
    import {
        getLedgerDeviceStatus,
        ledgerDeviceState,
        displayNotificationForLedgerProfile,
        pollLedgerDeviceStatus,
        stopPollingLedgerStatus,
    } from 'shared/lib/ledger'
    import { openPopup } from 'shared/lib/popup'
    import { LedgerDeviceState } from 'shared/lib/typings/ledger'
    import { walletSetupType } from 'shared/lib/wallet'
    import { createEventDispatcher, onDestroy, onMount } from 'svelte'
    import { Locale } from '@core/i18n'
    import { SetupType } from 'shared/lib/typings/setup'

    export let locale: Locale

    let polling = false

    const legacyLedger = $walletSetupType === SetupType.TrinityLedger

    let creatingAccount = false

    const LEDGER_STATUS_POLL_INTERVAL = 1500

    let isConnected = false
    let isAppOpen = false

    $: isConnected = $ledgerDeviceState !== LedgerDeviceState.NotDetected
    $: isAppOpen = $ledgerDeviceState === LedgerDeviceState.LegacyConnected
    $: animation = !isConnected
        ? 'ledger-disconnected-desktop'
        : isAppOpen
        ? 'ledger-connected-desktop'
        : 'ledger-app-closed-desktop'

    const dispatch = createEventDispatcher()

    onMount(() => {
        pollLedgerDeviceStatus(true, LEDGER_STATUS_POLL_INTERVAL)
        polling = true
    })

    onDestroy(stopPollingLedgerStatus)

    function handleGuidePopup() {
        openPopup({
            type: 'ledgerConnectionGuide',
        })
    }

    function handleContinueClick() {
        const _onCancel = () => {
            creatingAccount = false

            displayNotificationForLedgerProfile('error', true, true, true, true)
        }
        const _onConnected = () => {
            if ($ledgerDeviceState !== LedgerDeviceState.LegacyConnected) _onCancel()
            else dispatch('next')
        }

        getLedgerDeviceStatus(true, _onConnected, _onCancel, _onCancel)
    }

    function handleBackClick() {
        dispatch('previous')
    }
</script>

<OnboardingLayout
    onBackClick={handleBackClick}
    {locale}
    showLedgerProgress={legacyLedger}
    showLedgerVideoButton={legacyLedger}
>
    <div slot="leftpane__content">
        <Text type="h2" classes="mb-5">{locale('views.connectLedger.title')}</Text>
        <Text type="p" secondary classes="mb-5">{locale('views.connectLedger.body')}</Text>
        <div class="flex flex-col flex-nowrap space-y-2">
            <div class="flex flex-row items-center space-x-2">
                <Icon
                    icon={`status-${isConnected ? 'success' : 'error'}`}
                    classes={`text-white bg-${isConnected ? 'green' : 'red'}-600 rounded-full`}
                />
                <Text type="p" secondary>{locale('views.connectLedger.trafficLight1')}</Text>
            </div>
            <div class="flex flex-row items-center space-x-2">
                <Icon
                    icon={`status-${isAppOpen ? 'success' : 'error'}`}
                    classes={`text-white bg-${isAppOpen ? 'green' : 'red'}-600 rounded-full`}
                />
                <Text type="p" secondary>{locale('views.connectLedger.trafficLight2')}</Text>
            </div>
        </div>
    </div>
    <div slot="leftpane__action">
        <Link icon="info" onClick={handleGuidePopup} classes="mb-10 justify-center">
            {locale('popups.ledgerConnectionGuide.title')}
        </Link>
        <Button
            classes="w-full"
            disabled={(polling && (!isConnected || !isAppOpen)) || creatingAccount}
            onClick={handleContinueClick}
        >
            {#if creatingAccount}
                <Spinner busy message={locale('general.creatingAccount')} classes="justify-center" />
            {:else}{locale('actions.continue')}{/if}
        </Button>
    </div>
    <div slot="rightpane" class="w-full h-full flex justify-center items-center bg-gray-50 dark:bg-gray-900">
        <Animation
            width="100%"
            animation="ledger-bg-desktop"
            classes="absolute transform left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
        />
        <Animation width="100%" {animation} />
    </div>
</OnboardingLayout>
