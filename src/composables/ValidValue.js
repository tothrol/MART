export function validValue(valueToCheck) {
  if (valueToCheck != undefined && valueToCheck != null && valueToCheck != '') {
    console.log('ValidValue - true', valueToCheck)
    return true
  } else {
    console.log('ValidValue - false', valueToCheck)
    return false
  }
}
