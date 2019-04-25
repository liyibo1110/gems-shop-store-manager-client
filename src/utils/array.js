export function arrayRemove(array, val) {
  const index = array.indexOf(val)
  if (index > -1) {
    array.splice(index, 1)
  }
}

export function arrayRemoveByIndex(array, index) {
  array.splice(index, 1)
}
