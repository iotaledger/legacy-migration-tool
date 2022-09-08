import { AssetFilterUnit, DateFilterUnit, NumberFilterUnit, SelectionFilterUnit } from './filter-unit.interface'

export type Filter = ActivityFilter | AssetFilter

export interface ActivityFilter {
    amount: NumberFilterUnit
    status: SelectionFilterUnit
    type: SelectionFilterUnit
    asset: AssetFilterUnit
    date: DateFilterUnit
    showRejected: SelectionFilterUnit
    showHidden: SelectionFilterUnit
}

export interface AssetFilter {
    verificationStatus: SelectionFilterUnit
    showHidden: SelectionFilterUnit
}