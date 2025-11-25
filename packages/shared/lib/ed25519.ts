import { TRYTES_TRITS_LUT, TRYTE_ALPHABET } from '@iota/converter'
import { Bech32 } from '@lib/bech32'
import { hexToBytes, toHexString } from '@lib/utils'
import { blake2b } from 'blakejs'

/**
 * Converts a Bech32 address to an Ed25519 address.
 */
export function convertBech32AddressToEd25519Address(bech32Address: string, includeTypeByte: boolean = false): string {
    if (!bech32Address) return ''
    return toHexString(Array.from(Bech32.decode(bech32Address).data).slice(includeTypeByte ? 0 : 1))
}

// LEGACY TRYTE ENCODING
// ====================
// Sources:
// https://hackmd.io/@iota-protocol/rkO-r1qAv#Generating-the-81-tryte-migration-address
// https://github.com/iotaledger-archive/iota.js/blob/13fb32839caa190d525e8ad936cf7f43b408ca19/packages/iota/src/encoding/b1t6.ts#L7
// https://github.com/iotaledger/tips/blob/f95ce04680d53fef0ade905c03109ce6fd600af7/tips/TIP-0005/tip-0005.md

/**
 * B1T6 encoding lookup table: Maps each of the 27 possible tryte values (0-26)
 * to their corresponding 3-trit representation in balanced ternary.
 * Balanced ternary uses values: -1, 0, 1
 * This table is used to convert byte values into groups of 6 trits (2 trytes).
 */
const B1T6_TRYTE_VALUE_TO_TRITS: readonly (readonly number[])[] = [
    [-1, -1, -1], // 0
    [0, -1, -1], // 1
    [1, -1, -1], // 2
    [-1, 0, -1], // 3
    [0, 0, -1], // 4
    [1, 0, -1], // 5
    [-1, 1, -1], // 6
    [0, 1, -1], // 7
    [1, 1, -1], // 8
    [-1, -1, 0], // 9
    [0, -1, 0], // 10
    [1, -1, 0], // 11
    [-1, 0, 0], // 12
    [0, 0, 0], // 13
    [1, 0, 0], // 14
    [-1, 1, 0], // 15
    [0, 1, 0], // 16
    [1, 1, 0], // 17
    [-1, -1, 1], // 18
    [0, -1, 1], // 19
    [1, -1, 1], // 20
    [-1, 0, 1], // 21
    [0, 0, 1], // 22
    [1, 0, 1], // 23
    [-1, 1, 1], // 24
    [0, 1, 1], // 25
    [1, 1, 1], // 26
]

/**
 * Maps each of the 27 tryte values (0-26) to their corresponding character representation.
 * This is built by matching the trit patterns from B1T6_TRYTE_VALUE_TO_TRITS
 * with the standard IOTA tryte alphabet (9ABCDEFGHIJKLMNOPQRSTUVWXYZ).
 */
const B1T6_VALUE_TO_CHAR: string[] = B1T6_TRYTE_VALUE_TO_TRITS.map((pattern) => {
    // Find the index in the standard tryte lookup table that matches this trit pattern
    const idx = TRYTES_TRITS_LUT.findIndex(
        (tritsPattern) =>
            tritsPattern[0] === pattern[0] && tritsPattern[1] === pattern[1] && tritsPattern[2] === pattern[2]
    )
    if (idx === -1) {
        throw new Error('Unable to build b1t6 lookup table.')
    }
    // Return the corresponding character from the tryte alphabet
    return TRYTE_ALPHABET.charAt(idx)
})

// Constants for the migration address format
const TRANSFER_PREFIX = 'TRANSFER' // 8-tryte prefix identifying this as a migration address
const TRANSFER_SUFFIX = '9' // Single tryte padding to reach 81 trytes total
const HEX_ADDRESS_SIZE = 32 // Ed25519, Secp256k1 or Secp256r1 addresses are always 32 bytes
const CHECKSUM_SIZE = 4 // First 4 bytes of BLAKE2b-256 hash used as checksum

/**
 * Computes BLAKE2b-256 hash of the input data.
 * @param data - Input bytes to hash
 * @returns 32-byte hash digest
 */
function blake2b256(data: Uint8Array): Uint8Array {
    return new Uint8Array(blake2b(data, undefined, 32))
}

/**
 * Encodes binary data to trytes using the b1t6 encoding scheme.
 * Each byte is converted to 6 trits (represented as 2 trytes).
 *
 * Algorithm per RFC-15:
 * 1. Interpret each byte as a signed 8-bit integer (range: -128 to 127)
 * 2. Add 364 to shift into positive range for modulo operations
 * 3. Split into low (remainder mod 27) and high (quotient / 27) values
 * 4. Map each value to its corresponding tryte character
 *
 * @param data - Binary data to encode
 * @returns Tryte string representation
 */
function b1t6EncodeToTrytes(data: Uint8Array): string {
    let result = ''

    for (let i = 0; i < data.length; i++) {
        // Convert unsigned byte to signed 8-bit integer using bit shifting
        // (data[i] << 24) shifts left 24 bits, then >> 24 shifts right with sign extension
        const int8 = (data[i] << 24) >> 24

        // Add 364 to convert from range [-128, 127] to [236, 491]
        // This ensures positive values for the modulo operation
        // 364 = 13 * 27 + 13, chosen to work with the b1t6 encoding scheme
        const value = int8 + 364

        // Split the value into two tryte values (each 0-26)
        const low = value % 27 // Remainder: encodes lower 3 trits
        const high = Math.trunc(value / 27) // Quotient: encodes upper 3 trits

        // Convert both values to their tryte characters and append
        // This produces 2 trytes (6 trits total) for each byte
        result += B1T6_VALUE_TO_CHAR[low] + B1T6_VALUE_TO_CHAR[high]
    }

    return result
}

/**
 * Encodes an Ed25519, Secp256k1 or Secp256r1 address into an 81-tryte legacy migration address.
 *
 * Process per Draft RFC-8:
 * 1. Compute BLAKE2b-256 hash of the 32-byte Ed25519, Secp256k1 or Secp256r1 address
 * 2. Append first 4 bytes of hash as checksum (total: 36 bytes)
 * 3. Encode the 36 bytes using b1t6 encoding (produces 72 trytes)
 * 4. Prepend "TRANSFER" prefix (8 trytes)
 * 5. Append "9" suffix (1 tryte) to reach 81 trytes total
 *
 * @param addressBytes - 32-byte Ed25519, Secp256k1 or Secp256r1 address
 * @returns 81-tryte legacy address
 */
function encodeMigrationAddress(addressBytes: Uint8Array): string {
    // Validate input length
    if (addressBytes.length !== HEX_ADDRESS_SIZE) {
        throw new Error(`Expected ${HEX_ADDRESS_SIZE} bytes for an Ed25519, Secp256k1 or Secp256r1 address.`)
    }

    // Step 1: Compute BLAKE2b-256 hash of the address
    const hash = blake2b256(addressBytes)

    // Step 2: Create 36-byte array: 32 bytes (address) + 4 bytes (checksum)
    const addressWithChecksum = new Uint8Array(HEX_ADDRESS_SIZE + CHECKSUM_SIZE)
    addressWithChecksum.set(addressBytes, 0) // Copy address
    addressWithChecksum.set(hash.slice(0, CHECKSUM_SIZE), HEX_ADDRESS_SIZE) // Append first 4 bytes of hash

    // Step 3-5: Encode and format the final 81-tryte address
    // - TRANSFER_PREFIX: 8 trytes
    // - b1t6EncodeToTrytes(36 bytes): 72 trytes (36 * 2)
    // - TRANSFER_SUFFIX: 1 tryte
    // Total: 8 + 72 + 1 = 81 trytes
    return TRANSFER_PREFIX + b1t6EncodeToTrytes(addressWithChecksum) + TRANSFER_SUFFIX
}

/**
 * Converts a hex address from hexadecimal format to an 81-tryte legacy address.
 * This is the main entry point for the conversion process.
 *
 * @param hexAddress - Ed25519, Secp256k1 or Secp256r1 address in hexadecimal format (with or without '0x' prefix)
 * @returns 81-tryte legacy migration address
 * @throws Error if the hex address is not exactly 64 characters (32 bytes)
 */
export function hexAddressToTernary(hexAddress: string): string {
    // Normalize hex input by removing '0x' prefix if present
    const normalizedHex = hexAddress.toLowerCase().startsWith('0x') ? hexAddress.slice(2) : hexAddress

    // Convert hex string to byte array
    const addressBytes = hexToBytes(normalizedHex)

    // Validate that we have exactly 32 bytes (64 hex characters)
    if (addressBytes.length !== HEX_ADDRESS_SIZE) {
        throw new Error(`Invalid hex address length: expected ${HEX_ADDRESS_SIZE * 2} hex chars.`)
    }

    // Perform the encoding to legacy tryte format
    return encodeMigrationAddress(new Uint8Array(addressBytes))
}

// END LEGACY TRYTE ENCODING
// ========================
