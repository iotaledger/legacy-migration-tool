import { TRYTES_TRITS_LUT, TRYTE_ALPHABET } from '@iota/converter'
import { Bech32 } from '@lib/bech32'
import { hexToBytes, toHexString } from '@lib/utils'
import { blake2b } from 'blakejs'

const B1T6_TRYTE_VALUE_TO_TRITS: readonly (readonly number[])[] = [
    [-1, -1, -1],
    [0, -1, -1],
    [1, -1, -1],
    [-1, 0, -1],
    [0, 0, -1],
    [1, 0, -1],
    [-1, 1, -1],
    [0, 1, -1],
    [1, 1, -1],
    [-1, -1, 0],
    [0, -1, 0],
    [1, -1, 0],
    [-1, 0, 0],
    [0, 0, 0],
    [1, 0, 0],
    [-1, 1, 0],
    [0, 1, 0],
    [1, 1, 0],
    [-1, -1, 1],
    [0, -1, 1],
    [1, -1, 1],
    [-1, 0, 1],
    [0, 0, 1],
    [1, 0, 1],
    [-1, 1, 1],
    [0, 1, 1],
    [1, 1, 1],
]

const B1T6_VALUE_TO_CHAR: string[] = B1T6_TRYTE_VALUE_TO_TRITS.map((pattern) => {
    const idx = TRYTES_TRITS_LUT.findIndex(
        (tritsPattern) =>
            tritsPattern[0] === pattern[0] && tritsPattern[1] === pattern[1] && tritsPattern[2] === pattern[2]
    )

    if (idx === -1) {
        throw new Error('Unable to build b1t6 lookup table.')
    }

    return TRYTE_ALPHABET.charAt(idx)
})

const B1T6_CHAR_TO_VALUE: Record<string, number> = {}
for (let i = 0; i < B1T6_VALUE_TO_CHAR.length; i++) {
    B1T6_CHAR_TO_VALUE[B1T6_VALUE_TO_CHAR[i]] = i
}

const TRANSFER_PREFIX = 'TRANSFER'
const TRANSFER_SUFFIX = '9'
const ED25519_ADDRESS_SIZE = 32
const CHECKSUM_SIZE = 4

/**
 * Converts a Bech32 address to an Ed25519 address.
 */
export function convertBech32AddressToEd25519Address(bech32Address: string, includeTypeByte: boolean = false): string {
    if (!bech32Address) return ''

    return toHexString(Array.from(Bech32.decode(bech32Address).data).slice(includeTypeByte ? 0 : 1))
}

function blake2b256(data: Uint8Array): Uint8Array {
    return new Uint8Array(blake2b(data, undefined, 32))
}

function b1t6EncodeToTrytes(data: Uint8Array): string {
    let result = ''

    for (let i = 0; i < data.length; i++) {
        const int8 = (data[i] << 24) >> 24
        const value = int8 + 364
        const low = value % 27
        const high = Math.trunc(value / 27)

        result += B1T6_VALUE_TO_CHAR[low] + B1T6_VALUE_TO_CHAR[high]
    }

    return result
}

function encodeMigrationAddress(ed25519Address: Uint8Array): string {
    if (ed25519Address.length !== ED25519_ADDRESS_SIZE) {
        throw new Error(`Expected ${ED25519_ADDRESS_SIZE} bytes for an Ed25519 address.`)
    }

    const hash = blake2b256(ed25519Address)
    const addressWithChecksum = new Uint8Array(ED25519_ADDRESS_SIZE + CHECKSUM_SIZE)
    addressWithChecksum.set(ed25519Address, 0)
    addressWithChecksum.set(hash.slice(0, CHECKSUM_SIZE), ED25519_ADDRESS_SIZE)

    return TRANSFER_PREFIX + b1t6EncodeToTrytes(addressWithChecksum) + TRANSFER_SUFFIX
}

export function ed25519HexToTernary(hexAddress: string): string {
    // Strip 0x prefix if present
    const normalizedHex = hexAddress.toLowerCase().startsWith('0x') ? hexAddress.slice(2) : hexAddress

    const ed25519Address = hexToBytes(normalizedHex)
    if (ed25519Address.length !== ED25519_ADDRESS_SIZE) {
        throw new Error(`Invalid Ed25519 hex length: expected ${ED25519_ADDRESS_SIZE * 2} hex chars.`)
    }

    return encodeMigrationAddress(new Uint8Array(ed25519Address))
}
