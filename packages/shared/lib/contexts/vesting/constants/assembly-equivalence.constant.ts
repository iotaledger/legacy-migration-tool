import Big from 'big.js'

const IOTA_TOKENS_TO_DISTRIBUTE = Big('162139267000000')
const ASMB_TOKENS_TOTAL = Big('12466006635788105')

export const ASSEMBLY_IOTA_EQUIVALENCE_FACTOR = parseFloat(ASMB_TOKENS_TOTAL.div(IOTA_TOKENS_TO_DISTRIBUTE).toString())