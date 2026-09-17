export type ISortMode = 'my-order' | 'date' | 'deadline' | 'starred' | 'title'

export interface ISortOption {
    value: ISortMode
    label: string
}
