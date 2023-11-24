import Big from 'big.js'
import { getCurrencyPosition, formatNumber } from 'shared/lib/currency'

export enum Unit {
    iota = 'IOTA',
    micro = 'micro',
}

export const IOTA_DECIMALS = 6
export const IOTA_VALUE = 10 ** IOTA_DECIMALS

// Set this to avoid small numbers switching to exponential format
Big.NE = -20

/**
 * The maximum number of IOTA tokens in the network.
 */
export const MAX_NUM_IOTAS = 2_779_530_283_277_761

/**
 * Formats IOTA value
 *
 * @method formatUnitBestMatch
 *
 * @param {number} value
 * @param {boolean} includeUnits Include the units in the output
 *
 * @returns {string}
 */
export const formatUnitBestMatch = (value: number, includeUnits: boolean = true): string =>
    formatUnitPrecision(value, getUnit(value), includeUnits, false)

/**
 * Format a value with the provided value precision
 * @param valueRaw The raw value to format
 * @param unit The unit precision
 * @param includeUnits Include the units in the output
 * @param grouped Group the thousands
 */
export function formatUnitPrecision(
    valueRaw: number,
    unit: Unit,
    includeUnits: boolean = true,
    grouped: boolean = false
): string {
    // At the moment we have no symbol for IOTA so we always put the currency code
    // at the end, in the future when we have a symbol this can be updated to position
    // it correctly to the left when necessary
    const currencyPosition = getCurrencyPosition()

    if (!valueRaw) {
        return includeUnits ? (currencyPosition === 'left' ? `0 ${unit}` : `0 ${unit}`) : '0'
    }

    const converted = changeUnits(valueRaw, Unit.micro, unit)

    const formatted = formatNumber(converted, 0, unit === Unit.micro ? 0 : IOTA_DECIMALS, 0, grouped)

    if (includeUnits) {
        return currencyPosition === 'left' ? `${formatted} ${unit}` : `${formatted} ${unit}`
    } else {
        return formatted
    }
}

/**
 * Gets relevant unit for IOTA value
 *
 * @method getUnit
 *
 * @param {number} value
 *
 * @returns {Unit}
 */
const getUnit = (value: number): Unit => {
    let bestUnits: Unit = Unit.iota

    if (!value || value === 0) {
        return Unit.micro
    }

    const checkLength = Math.abs(value).toString().length
    if (checkLength <= IOTA_DECIMALS) {
        bestUnits = Unit.micro
    }

    return bestUnits
}

/**
 * Convert the value to different units.
 * @param value The value to convert.
 * @param fromUnit The form unit.
 * @param toUnit The to unit.
 * @returns The formatted unit.
 */
export const changeUnits = (value: number, fromUnit: Unit, toUnit: Unit): number => {
    if (value === 0) {
        return 0
    }

    if (fromUnit === toUnit) {
        return value
    }

    const scaledValue = Number(new Big(value).div(IOTA_VALUE))
    return toUnit === Unit.micro ? Math.round(scaledValue) : scaledValue
}
