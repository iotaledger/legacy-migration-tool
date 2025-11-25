import { getHexByteLength, isHex } from './utils'
const IOTA_ADDRESS_LENGTH = 32

export const isValidAddressAndPrefix = (address: string, expectedAddressPrefix: string): boolean =>
    new RegExp(`^${expectedAddressPrefix}1[02-9ac-hj-np-z]{59}$`).test(address)

export const isValidIotaAddress = (value: string): boolean =>
    isHex(value) && getHexByteLength(value) === IOTA_ADDRESS_LENGTH
