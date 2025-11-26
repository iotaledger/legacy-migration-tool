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
    operationID: string
    targetAddress: string
    tokenMigrated: string
    txDigest: string
}

export interface RebasedErrorModel {
    title: string
    status: number
    detail: string
    instance: string
    type: string
    errors: RebasedErrorDetail[]
}
export interface RebasedErrorDetail {
    message: string
    location: string
    value: string
}
