export const debounce = (fn, delay) => {
    let timer = null

    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timer)
            fn(...args)
        }

        clearTimeout(timer)
        timer = setTimeout(later, delay)
    }
}
