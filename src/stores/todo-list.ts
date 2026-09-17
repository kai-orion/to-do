import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { PartialDeep } from 'type-fest'
import { v4 as uuidv4 } from 'uuid'

export interface ITodo {
    isCompleted: boolean
    isPinned: boolean
    completedAt?: number
    data: ITodoData
}

export interface ITodoData {
    headline: string
    description: string
    steps: Iterable<ITodoStep>
    collectionName: string
    creationTimestamp: number
    uuid: string
    dueLabel?: string
}

export interface ITodoStep {
    headline: string
    isCompleted: boolean
}

export class TodoStepEntity implements ITodoStep {
    private _headline: string
    private _isCompleted: boolean

    constructor(args?: Partial<ITodoStep>) {
        this._headline = args?.headline ?? 'Untitled step'
        this._isCompleted = args?.isCompleted ?? false
    }

    public get headline(): string {
        return this._headline
    }
    public get isCompleted(): boolean {
        return this._isCompleted
    }
}

export class TodoStepsEntity implements Iterable<ITodoStep> {
    private stepsArray: Array<ITodoStep>

    constructor(args: Array<ITodoStep>) {
        this.stepsArray = args
    }

    [Symbol.iterator](): Iterator<ITodoStep, any, any> {
        let index = 0
        return ({
            next: (): IteratorResult<ITodoStep, undefined> => {
                if (index >= this.stepsArray.length) {
                    return ({
                        value: undefined,
                        done: true
                    })
                }
                return ({
                    value: this.stepsArray[index++],
                    done: false
                })
            },
            return: (): IteratorResult<ITodoStep> => {
                return ({
                    value: undefined,
                    done: true,
                })
            }
        })
    }

}

export class TodoEntity implements ITodo {
    public isCompleted: boolean
    public isPinned: boolean
    public completedAt?: number
    public data: ITodoData

    constructor(args?: PartialDeep<ITodo>) {
        this.isCompleted = args?.isCompleted ?? false
        this.isPinned = args?.isPinned ?? false
        this.completedAt = (args as { completedAt?: number } | undefined)?.completedAt
        this.data = {
            collectionName: 'All',
            creationTimestamp: new Date().getTime(),
            description: '',
            headline: 'Untitled',
            steps: new TodoStepsEntity([]),
            uuid: uuidv4(),
        }
        for (const prop of Object.entries(args?.data ?? {})) {
            // @ts-ignore
            this.data[prop[0]] = prop[1]
        }
    }
}

export interface ITodoStepData {
    headline: string
    isCompleted: boolean
    due?: string
}

const STORAGE_KEY = 'Symbol(__todo-list)'

function loadFromStorage(): Array<ITodo> | undefined {
    try {
        const raw = localStorage.getItem(STORAGE_KEY)
        if (!raw) return undefined
        return JSON.parse(raw) as Array<ITodo>
    } catch {
        return undefined
    }
}

function saveToStorage(todos: Array<ITodo>) {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(todos))
    } catch {
        // ignore quota errors
    }
}

export const useTodoListStore = defineStore('todo-list', () => {
    const todos = ref<Array<ITodo>>(loadFromStorage() ?? [])

    if (todos.value.length === 0) {
        const now = new Date().getTime()
        let seq = 0
        const nextTs = () => now + (seq++)
        const seed: Array<ITodo> = [
            new TodoEntity({
                isCompleted: false,
                data: {
                    headline: '欢迎使用待办事项',
                    description: '这里是你的 Today 列表，点击新建按钮创建第一条属于你的任务。',
                    collectionName: 'Today',
                    creationTimestamp: nextTs(),
                },
            }),
            new TodoEntity({
                isCompleted: false,
                data: {
                    headline: '勾选以完成任务',
                    description: '点击任务左侧的复选框，即可将它标记为已完成。',
                    collectionName: 'Today',
                    creationTimestamp: nextTs(),
                },
            }),
            new TodoEntity({
                isCompleted: false,
                data: {
                    headline: '试试子任务和拖拽排序',
                    description: '点击任务展开子步骤，也可以通过拖拽调整任务顺序。',
                    collectionName: 'Today',
                    creationTimestamp: nextTs(),
                    steps: new TodoStepsEntity([
                        new TodoStepEntity({ headline: '为这条任务添加一个子步骤', isCompleted: false }),
                        new TodoStepEntity({ headline: '拖动这条任务调整它的位置', isCompleted: false }),
                    ]),
                },
            }),
        ]
        todos.value.push(...seed)
        saveToStorage(todos.value)
    }

    function persist(): void {
        saveToStorage(todos.value)
    }

    function insertOneTodo(todo: ITodo): void {
        todos.value.push(todo)
        saveToStorage(todos.value)
    }

    function updateOneTodoCompletion(todo: ITodo, value: boolean): void {
        todo.isCompleted = value
        if (value) {
            todo.completedAt = new Date().getTime()
        } else {
            delete todo.completedAt
        }
        saveToStorage(todos.value)
    }

    function updateOneTodoPinned(todo: ITodo, value: boolean): void {
        todo.isPinned = value
        saveToStorage(todos.value)
    }

    function removeOneTodo(todo: ITodo) {
        todos.value.splice(todos.value.findIndex(e => e === todo), 1)
        saveToStorage(todos.value)
    }

    function findOneTodoByUuid(uuid: string): ITodo | undefined {
        return todos.value.find(t => t.data.uuid === uuid)
    }

    /** Read steps defensively: persisted shapes vary (array / { stepsArray } / iterable). Pure. */
    function findManyStepsByParent(parent: ITodo): Array<ITodoStepData> {
        const s = parent.data.steps as unknown
        const raw: Array<unknown> = Array.isArray(s)
            ? s
            : (s && typeof s === 'object' && Array.isArray((s as { stepsArray?: unknown }).stepsArray))
                ? (s as { stepsArray: Array<unknown> }).stepsArray
                : (() => {
                    try {
                        return [...(s as Iterable<unknown>)]
                    } catch {
                        return []
                    }
                })()
        return raw.map((item) => {
            const o = item as Record<string, unknown>
            const headline = (o['headline'] as string | undefined)
                ?? (o['_headline'] as string | undefined)
                ?? 'Untitled step'
            const isCompleted = (o['isCompleted'] as boolean | undefined)
                ?? (o['_isCompleted'] as boolean | undefined)
                ?? false
            const due = (o['due'] as string | undefined) ?? (o['_due'] as string | undefined)
            return { headline, isCompleted, due }
        })
    }

    function updateManyStepsByParent(parent: ITodo, steps: Array<ITodoStepData>) {
        parent.data.steps = steps.map(s => ({ ...s })) as unknown as Iterable<{ headline: string, isCompleted: boolean }>
        saveToStorage(todos.value)
    }

    function insertOneTodoFromFields(input: { headline: string, description?: string, collectionName: string, dueLabel?: string, pinned?: boolean, creationTimestamp?: number }) {
        insertOneTodo(new TodoEntity({
            isCompleted: false,
            isPinned: input.pinned ?? false,
            data: {
                headline: input.headline,
                description: input.description ?? '',
                collectionName: input.collectionName,
                creationTimestamp: input.creationTimestamp ?? Date.now(),
                dueLabel: input.dueLabel,
            },
        }))
    }

    function updateOneTodo(todo: ITodo, patch: { headline: string, description: string, dueLabel?: string }) {
        todo.data.headline = patch.headline
        todo.data.description = patch.description
        todo.data.dueLabel = patch.dueLabel
        saveToStorage(todos.value)
    }

    function insertOneStepByParent(parent: ITodo, headline: string, due?: string) {
        const steps = findManyStepsByParent(parent)
        steps.push({ headline, isCompleted: false, due })
        updateManyStepsByParent(parent, steps)
    }

    function updateOneStepByParent(parent: ITodo, index: number, headline: string): boolean {
        const steps = findManyStepsByParent(parent)
        if (!steps[index]) return false
        steps[index] = { headline, isCompleted: steps[index].isCompleted }
        updateManyStepsByParent(parent, steps)
        return true
    }

    function updateOneStepCompletionByParent(parent: ITodo, index: number, value: boolean) {
        const steps = findManyStepsByParent(parent)
        if (!steps[index]) return
        steps[index] = { headline: steps[index].headline, isCompleted: value }
        updateManyStepsByParent(parent, steps)
    }

    function removeOneStepByParent(parent: ITodo, index: number) {
        const steps = findManyStepsByParent(parent)
        steps.splice(index, 1)
        updateManyStepsByParent(parent, steps)
    }

    /**
     * Remove a step and insert it as a top-level todo — in the parent's own
     * list by default (unindent), or in `listName` when given (move to list).
     */
    function insertOneTodoFromStep(parent: ITodo, index: number, listName?: string) {
        const steps = findManyStepsByParent(parent)
        const [step] = steps.splice(index, 1)
        if (!step) return
        updateManyStepsByParent(parent, steps)
        insertOneTodoFromFields({ headline: step.headline, collectionName: listName ?? parent.data.collectionName })
    }

    function updateOneTodoCollection(todo: ITodo, listName: string) {
        todo.data.collectionName = listName
        saveToStorage(todos.value)
    }

    function updateOneTodoTimestamp(todo: ITodo, creationTimestamp: number) {
        todo.data.creationTimestamp = creationTimestamp
        saveToStorage(todos.value)
    }

    function updateOneTodoAttachment(todo: ITodo, fileName: string) {
        const tag = `Attachment: ${fileName}`
        todo.data.description = todo.data.description ? `${todo.data.description}\n${tag}` : tag
        saveToStorage(todos.value)
    }

    function updateManyTodosCollection(oldName: string, next: string) {
        for (const todo of todos.value) {
            if (todo.data.collectionName === oldName) todo.data.collectionName = next
        }
        saveToStorage(todos.value)
    }

    function removeManyTodosByList(listName: string) {
        for (let i = todos.value.length - 1; i >= 0; i--) {
            if (todos.value[i].data.collectionName === listName) todos.value.splice(i, 1)
        }
        saveToStorage(todos.value)
    }

    function removeManyCompletedTodosByList(listName: string) {
        for (let i = todos.value.length - 1; i >= 0; i--) {
            const t = todos.value[i]
            if (t.data.collectionName === listName && t.isCompleted) todos.value.splice(i, 1)
        }
        saveToStorage(todos.value)
    }

    function removeManyOldCompletedTodosByList(listName: string, cutoff: number) {
        for (let i = todos.value.length - 1; i >= 0; i--) {
            const t = todos.value[i]
            if (t.data.collectionName === listName && t.isCompleted && (t.completedAt ?? 0) < cutoff) {
                todos.value.splice(i, 1)
            }
        }
        saveToStorage(todos.value)
    }

    return {
        todos,
        updateOneTodoCompletion,
        updateOneTodoPinned,
        removeOneTodo,
        persist,
        findOneTodoByUuid,
        findManyStepsByParent,
        updateManyStepsByParent,
        insertOneTodoFromFields,
        insertOneTodoFromStep,
        updateOneTodo,
        insertOneStepByParent,
        updateOneStepByParent,
        updateOneStepCompletionByParent,
        removeOneStepByParent,
        updateOneTodoCollection,
        updateOneTodoTimestamp,
        updateOneTodoAttachment,
        updateManyTodosCollection,
        removeManyTodosByList,
        removeManyCompletedTodosByList,
        removeManyOldCompletedTodosByList,
    }
})
