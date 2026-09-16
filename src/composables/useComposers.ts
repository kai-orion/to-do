import { ref } from 'vue'
import type { ITodo } from '../stores/todo-list'

export type EditingState =
    | { kind: 'task', uuid: string }
    | { kind: 'step', parentUuid: string, index: number }

/**
 * Pure composable: inline add / rename / edit / sub-add draft state machine.
 * No Pinia, no router — usable anywhere. The page passes `closePop` in and
 * owns all persistence (store calls stay in the page / store-touching hooks).
 */
export function useComposers(opts: { closePop: () => void }) {
    const addingTo = ref<string | null>(null)
    const draftTitle = ref('')
    const draftDesc = ref('')
    const draftDue = ref('')
    const renaming = ref<string | null>(null)
    const renameDraft = ref('')

    const editing = ref<EditingState | null>(null)
    const editTitle = ref('')
    const editDesc = ref('')
    const editDue = ref('')

    const subAddingTo = ref<string | null>(null)
    const subDraftTitle = ref('')
    const subDraftDesc = ref('')
    const subDraftDue = ref('')

    function cancelComposer() {
        addingTo.value = null
        renaming.value = null
        editing.value = null
        subAddingTo.value = null
        draftTitle.value = ''
        draftDesc.value = ''
        draftDue.value = ''
        renameDraft.value = ''
        editTitle.value = ''
        editDesc.value = ''
        editDue.value = ''
        subDraftTitle.value = ''
        subDraftDesc.value = ''
        subDraftDue.value = ''
    }

    function startAdd(listName: string) {
        cancelComposer()
        addingTo.value = listName
        draftTitle.value = ''
        draftDesc.value = ''
        draftDue.value = ''
    }

    function startRename(listName: string) {
        opts.closePop()
        cancelComposer()
        renaming.value = listName
        renameDraft.value = listName
    }

    function startEdit(todo: ITodo) {
        cancelComposer()
        editing.value = { kind: 'task', uuid: todo.data.uuid }
        editTitle.value = todo.data.headline
        editDesc.value = todo.data.description ?? ''
        editDue.value = todo.data.dueLabel ?? ''
    }

    function startStepEdit(parentUuid: string, index: number, headline: string | undefined) {
        if (headline === undefined) return
        cancelComposer()
        editing.value = { kind: 'step', parentUuid, index }
        editTitle.value = headline
        editDesc.value = ''
        editDue.value = ''
    }

    function startSubAdd(parentUuid: string) {
        opts.closePop()
        cancelComposer()
        subAddingTo.value = parentUuid
        subDraftTitle.value = ''
        subDraftDesc.value = ''
        subDraftDue.value = ''
    }

    return {
        addingTo,
        draftTitle,
        draftDesc,
        draftDue,
        renaming,
        renameDraft,
        editing,
        editTitle,
        editDesc,
        editDue,
        subAddingTo,
        subDraftTitle,
        subDraftDesc,
        subDraftDue,
        startAdd,
        cancelComposer,
        startRename,
        startEdit,
        startStepEdit,
        startSubAdd,
    }
}
