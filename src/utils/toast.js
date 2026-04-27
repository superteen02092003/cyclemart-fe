const listeners = new Set()

export const toast = {
  show(message, type = 'success') {
    listeners.forEach(fn => fn({ message, type }))
  },
  success(message) { this.show(message, 'success') },
  error(message) { this.show(message, 'error') },
  warning(message) { this.show(message, 'warning') },
  info(message) { this.show(message, 'info') },
  _subscribe(fn) {
    listeners.add(fn)
    return () => listeners.delete(fn)
  },
}
