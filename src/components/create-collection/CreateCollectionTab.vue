<template>
    <md-primary-tab
        is-tab="false"
        inline-icon
        id="open-create-collection-dialog"
        ref="openCreateCollectionDialogRef"
    >
        Create collection
        <md-icon slot="icon">add</md-icon>

    </md-primary-tab>

    <!-- Create Collection Dialog -->
    <Teleport to="body">
        <md-dialog ref="createCollectionDialogRef">
            <span slot="headline">Create collection</span>
            <form
                slot="content"
                method="dialog"
                id="create-collection-dialog"
            >
                <md-outlined-text-field
                    id="create-collection-dialog-collection-name-text-field"
                    label="Collection Name"
                    type="text"
                    autofocus
                ></md-outlined-text-field>
            </form>
            <div slot="actions">
                <md-text-button
                    form="create-collection-dialog"
                    value="cancel"
                >Cancel</md-text-button>
                <md-text-button
                    form="create-collection-dialog"
                    value="apply"
                >Apply</md-text-button>
            </div>
        </md-dialog>
    </Teleport>
</template>

<script setup lang="ts">
import type { MdDialog, MdOutlinedTextField, MdPrimaryTab } from '@material/web/all'
import { onMounted, ref } from 'vue'
import { useTodoTabsStore } from '@stores/todo-tabs'

const todoTabs = useTodoTabsStore()

const createCollectionDialogRef = ref<MdDialog | null>(null)
const openCreateCollectionDialogRef = ref<MdPrimaryTab | null>(null)

onMounted(() => {
    openCreateCollectionDialogRef.value?.addEventListener('click', () => {
        createCollectionDialogRef.value?.show()
    })

    createCollectionDialogRef.value?.addEventListener('cancel', (e: Event) => {
        e.preventDefault()
    })
    createCollectionDialogRef.value?.addEventListener('open', () => {
        const form = createCollectionDialogRef.value?.querySelector('form')!
        form.reset()
    })
    createCollectionDialogRef.value?.addEventListener('close', () => {
        const form = createCollectionDialogRef.value?.querySelector('form')!
        if (createCollectionDialogRef.value?.returnValue === 'apply') {
            todoTabs.insertOneTab({
                label: (form.querySelector('#create-collection-dialog-collection-name-text-field') as MdOutlinedTextField).value
            })
        }
    })
})
</script>

<style scoped></style>
