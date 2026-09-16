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

    constructor(params?: Partial<ITodoStep>) {
        this._headline = params?.headline ?? 'Untitled step'
        this._isCompleted = params?.isCompleted ?? false
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

    constructor(stepArray: Array<ITodoStep>) {
        this.stepsArray = stepArray
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

    constructor(params?: PartialDeep<ITodo>) {
        this.isCompleted = params?.isCompleted ?? false
        this.isPinned = params?.isPinned ?? false
        this.completedAt = (params as { completedAt?: number } | undefined)?.completedAt
        this.data = {
            collectionName: 'All',
            creationTimestamp: new Date().getTime(),
            description: '',
            headline: 'Untitled',
            steps: new TodoStepsEntity([]),
            uuid: uuidv4(),
        }
        for (const prop of Object.entries(params?.data ?? {})) {
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

/** Read steps defensively: persisted shapes vary (array / { stepsArray } / iterable). Pure. */
export function readTodoSteps(todo: ITodo): Array<ITodoStepData> {
    const s = todo.data.steps as unknown
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
                data: { headline: '在线灵动岛', collectionName: 'Today', creationTimestamp: nextTs() },
            }),
            new TodoEntity({
                isCompleted: false,
                data: { headline: 'as any v.s. as unknown', collectionName: 'Blog', creationTimestamp: nextTs() },
            }),
            new TodoEntity({
                isCompleted: false,
                data: {
                    headline: 'AI 回答收录系列',
                    description: '将一些AI对话中展现的知识记录。',
                    collectionName: 'Blog',
                    creationTimestamp: nextTs(),
                },
            }),
            new TodoEntity({
                isCompleted: false,
                data: {
                    headline: 'Series: Vue',
                    description: '修整。',
                    collectionName: 'Blog',
                    creationTimestamp: nextTs(),
                    steps: new TodoStepsEntity([
                        new TodoStepEntity({ headline: 'Update Lifecircle Hooks', isCompleted: false }),
                    ]),
                },
            }),
            new TodoEntity({
                isCompleted: false,
                data: {
                    headline: '全域拖动位置检测',
                    description: '预定义屏幕各区域，拖动元素后检测目标落在哪个区域。',
                    collectionName: 'MDC',
                    creationTimestamp: nextTs(),
                },
            }),
            new TodoEntity({
                isCompleted: false,
                data: { headline: 'Drawer左右拖动切换位置', collectionName: 'MDC', creationTimestamp: nextTs() },
            }),
            new TodoEntity({
                isCompleted: false,
                data: { headline: 'BottomSheet和SideSheet拖动互换', collectionName: 'MDC', creationTimestamp: nextTs() },
            }),
            new TodoEntity({
                isCompleted: false,
                data: {
                    headline: '屏幕隐形层：页面最顶层有一个透明预先布局的元素专用于快速定位',
                    collectionName: 'MDC',
                    creationTimestamp: nextTs(),
                },
            }),
            new TodoEntity({
                isCompleted: false,
                data: { headline: 'Comp: Menu', collectionName: 'MDC', creationTimestamp: nextTs() },
            }),
            new TodoEntity({
                isCompleted: false,
                data: { headline: '有声读书 - 视频', collectionName: 'Concepts', creationTimestamp: nextTs() },
            }),
        ]
        const completedSeeds: Array<{ list: string, count: number }> = [
            { list: 'Blog', count: 16 },
            { list: 'MDC', count: 13 },
        ]
        for (const { list, count } of completedSeeds) {
            for (let i = 0; i < count; i++) {
                seed.push(new TodoEntity({
                    isCompleted: true,
                    completedAt: new Date(2025, 10, 6).getTime() - i * 86400000,
                    data: {
                        headline: `Completed ${list} ${i + 1}`,
                        collectionName: list,
                        creationTimestamp: nextTs(),
                    },
                }))
            }
        }
        // Today completed items mirror the prototype's expanded state.
        const todayDone: Array<{ headline: string, at: number }> = [
            { headline: '电脑+USB-C', at: new Date(2026, 5, 25).getTime() },
            { headline: 'Mdc: FAB - Hidden prop', at: new Date(2025, 11, 4).getTime() },
            { headline: 'C#: Language Syntax Basic', at: new Date(2025, 10, 6).getTime() },
        ]
        for (const item of todayDone) {
            seed.push(new TodoEntity({
                isCompleted: true,
                completedAt: item.at,
                data: {
                    headline: item.headline,
                    collectionName: 'Today',
                    creationTimestamp: nextTs(),
                },
            }))
        }
        todos.value.push(...seed)
        saveToStorage(todos.value)
    }

    function persist(): void {
        saveToStorage(todos.value)
    }

    function create(todo: ITodo): void {
        todos.value.push(todo)
        saveToStorage(todos.value)
    }

    function completeField(todo: ITodo, value: boolean): void {
        todo.isCompleted = value
        if (value) {
            todo.completedAt = new Date().getTime()
        } else {
            delete todo.completedAt
        }
        saveToStorage(todos.value)
    }

    function pinField(todo: ITodo, value: boolean): void {
        todo.isPinned = value
        saveToStorage(todos.value)
    }

    function remove(todo: ITodo) {
        todos.value.splice(todos.value.findIndex(e => e === todo), 1)
        saveToStorage(todos.value)
    }

    function findByUuid(uuid: string): ITodo | undefined {
        return todos.value.find(t => t.data.uuid === uuid)
    }

    function stepsOf(todo: ITodo): Array<ITodoStepData> {
        return readTodoSteps(todo)
    }

    function saveSteps(todo: ITodo, steps: Array<ITodoStepData>) {
        todo.data.steps = steps.map(s => ({ ...s })) as unknown as Iterable<{ headline: string, isCompleted: boolean }>
        saveToStorage(todos.value)
    }

    function createTask(input: { headline: string, description?: string, collectionName: string, dueLabel?: string, pinned?: boolean, creationTimestamp?: number }) {
        create(new TodoEntity({
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

    function updateTask(todo: ITodo, patch: { headline: string, description: string, dueLabel?: string }) {
        todo.data.headline = patch.headline
        todo.data.description = patch.description
        todo.data.dueLabel = patch.dueLabel
        saveToStorage(todos.value)
    }

    function addStep(parent: ITodo, headline: string, due?: string) {
        const steps = readTodoSteps(parent)
        steps.push({ headline, isCompleted: false, due })
        saveSteps(parent, steps)
    }

    function updateStep(parent: ITodo, index: number, headline: string): boolean {
        const steps = readTodoSteps(parent)
        if (!steps[index]) return false
        steps[index] = { headline, isCompleted: steps[index].isCompleted }
        saveSteps(parent, steps)
        return true
    }

    function setStepCompleted(parent: ITodo, index: number, value: boolean) {
        const steps = readTodoSteps(parent)
        if (!steps[index]) return
        steps[index] = { headline: steps[index].headline, isCompleted: value }
        saveSteps(parent, steps)
    }

    function removeStep(parent: ITodo, index: number) {
        const steps = readTodoSteps(parent)
        steps.splice(index, 1)
        saveSteps(parent, steps)
    }

    /** Unindent: remove the step and promote it to a top-level task in the same list. */
    function promoteStep(parent: ITodo, index: number) {
        const steps = readTodoSteps(parent)
        const [step] = steps.splice(index, 1)
        if (!step) return
        saveSteps(parent, steps)
        createTask({ headline: step.headline, collectionName: parent.data.collectionName })
    }

    /** Move a step out of its parent into another list as a top-level task. */
    function moveStepToList(parent: ITodo, index: number, listName: string) {
        const steps = readTodoSteps(parent)
        const [step] = steps.splice(index, 1)
        if (!step) return
        saveSteps(parent, steps)
        createTask({ headline: step.headline, collectionName: listName })
    }

    function moveTaskTo(todo: ITodo, listName: string) {
        todo.data.collectionName = listName
        saveToStorage(todos.value)
    }

    function retimeTask(todo: ITodo, creationTimestamp: number) {
        todo.data.creationTimestamp = creationTimestamp
        saveToStorage(todos.value)
    }

    function addAttachment(todo: ITodo, fileName: string) {
        const tag = `Attachment: ${fileName}`
        todo.data.description = todo.data.description ? `${todo.data.description}\n${tag}` : tag
        saveToStorage(todos.value)
    }

    function renameCollection(oldName: string, next: string) {
        for (const todo of todos.value) {
            if (todo.data.collectionName === oldName) todo.data.collectionName = next
        }
        saveToStorage(todos.value)
    }

    function removeInList(listName: string) {
        for (let i = todos.value.length - 1; i >= 0; i--) {
            if (todos.value[i].data.collectionName === listName) todos.value.splice(i, 1)
        }
        saveToStorage(todos.value)
    }

    function removeCompletedIn(listName: string) {
        for (let i = todos.value.length - 1; i >= 0; i--) {
            const t = todos.value[i]
            if (t.data.collectionName === listName && t.isCompleted) todos.value.splice(i, 1)
        }
        saveToStorage(todos.value)
    }

    function removeOldCompleted(listName: string, cutoff: number) {
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
        create,
        completeField,
        pinField,
        remove,
        persist,
        findByUuid,
        stepsOf,
        saveSteps,
        createTask,
        updateTask,
        addStep,
        updateStep,
        setStepCompleted,
        removeStep,
        promoteStep,
        moveStepToList,
        moveTaskTo,
        retimeTask,
        addAttachment,
        renameCollection,
        removeInList,
        removeCompletedIn,
        removeOldCompleted,
    }
})
