import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { PartialDeep } from 'type-fest'
import { makeUuid } from '../utils/uuid'

export interface ITodo {
    isCompleted: boolean
    isPinned: boolean
    data: ITodoData
}

export interface ITodoData {
    headline: string
    description: string
    steps: Iterable<ITodoStep>
    collectionName: string
    creationTimestamp: number
    uuid: string
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
    public data: ITodoData

    constructor(params?: PartialDeep<ITodo>) {
        this.isCompleted = params?.isCompleted ?? false
        this.isPinned = params?.isPinned ?? false
        this.data = {
            collectionName: 'All',
            creationTimestamp: new Date().getTime(),
            description: '',
            headline: 'Untitled',
            steps: new TodoStepsEntity([]),
            uuid: makeUuid(),
        }
        for (const prop of Object.entries(params?.data ?? {})) {
            // @ts-ignore
            this.data[prop[0]] = prop[1]
        }
    }
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
        todos.value.push(
            new TodoEntity({
                data: {
                    headline: 'Example 1',
                    collectionName: 'All',
                }
            })
        )
        saveToStorage(todos.value)
    }

    function create(todo: ITodo): void {
        todos.value.push(todo)
        saveToStorage(todos.value)
    }

    function completeField(todo: ITodo, value: boolean): void {
        todo.isCompleted = value
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

    return {
        todos,
        create,
        completeField,
        pinField,
        remove,
    }
})
