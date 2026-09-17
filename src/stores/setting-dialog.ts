import { defineStore } from "pinia";

export interface ISettingDialogStoreState {
    isOpen: boolean
}

export const useSettingDialog = defineStore('dialog-setting', {
    state: () => ({
        isOpen: false,
    } as ISettingDialogStoreState),
    actions: {
        toggle(value?: boolean | ((oldValue: boolean) => boolean)) {
            if (typeof value === 'function') {
                this.isOpen = value(this.isOpen)
            } else if (typeof value === 'boolean') {
                this.isOpen = value
            } else {
                this.isOpen = !this.isOpen
            }
        }
    }
})
