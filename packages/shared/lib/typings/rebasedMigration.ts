export interface RebasedMigrationRequest {
    BundleTrytes: string[]
}

export interface DryRunRebasedMigrationResponse {
    eligibleAddresses: Record<string, number>
    targetAddress: string
    totalAmount: string
}

export interface RebasedMigrationResponse {
    migratedAddresses: Record<string, number>
    targetAddress: string
    tokenMigrated: string
    txDigest: string
}

export interface RebasedErrorModel {
    title: string
    status: number
    detail: string
    errors: {
        message: string
    }[]
}
