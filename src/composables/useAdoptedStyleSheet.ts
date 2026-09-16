import { useDocument } from './useDocument'

export function useAdoptedStyleSheet() {

    const { element, isSupported } = useDocument()

    const insertOneStyleSheet = (sheet: CSSStyleSheet) => {
        if (!isSupported) return
        element.value!.adoptedStyleSheets.push(sheet)
    }

    return ({
        insertOneStyleSheet,
    })
}
