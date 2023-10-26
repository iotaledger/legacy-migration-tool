import { Unit } from '@iota/unit-converter'
import { getNumberOfDecimalPlaces } from '@lib/utils'
import { convertToFiat, currencies, exchangeRates, formatNumber } from 'shared/lib/currency'
import { activeProfile } from 'shared/lib/profile'
import { Asset, Token } from 'shared/lib/typings/assets'
import { AvailableExchangeRates, CurrencyTypes } from 'shared/lib/typings/currency'
import { UNIT_MAP } from 'shared/lib/units'
import { selectedAccountStore } from 'shared/lib/wallet'
import { derived } from 'svelte/store'

export const assets = derived(
    [exchangeRates, currencies, activeProfile, selectedAccountStore],
    ([$exchangeRates, $currencies, $activeProfile, $selectedAccount]) => {
        if (!$activeProfile || !$selectedAccount) return []
        const profileCurrency = $activeProfile?.settings.currency ?? AvailableExchangeRates.USD

        const rawFiatPrice = convertToFiat(
            UNIT_MAP[Unit.Mi].val,
            $currencies?.[CurrencyTypes.USD],
            $exchangeRates?.[profileCurrency]
        )
        const numDecimalPlaces = getNumberOfDecimalPlaces(rawFiatPrice)
        const formattedFiatPrice = formatNumber(rawFiatPrice, numDecimalPlaces, numDecimalPlaces)

        const assets: Asset[] = [
            {
                name: Token.IOTA,
                balance: $selectedAccount.balance,
                fiatPrice: `${formattedFiatPrice} ${profileCurrency}`,
                fiatBalance: $selectedAccount.balanceEquiv,
                color: '#6E82A4',
            },
        ]
        return assets
    }
)
