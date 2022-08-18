export function validValue(valueToCheck: any) {
  if (valueToCheck != undefined && valueToCheck != null && valueToCheck != '') {
    console.log('ValidValue - true', valueToCheck);
    return true;
  } else {
    console.log('ValidValue - false', valueToCheck);
    return false;
  }
}
