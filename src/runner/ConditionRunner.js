/**
 * Checks if values equal.
 * @param {String|any=} value Value to compare
 * @param {String|any=} condition Comparator value
 * @return {Boolean} True if objects matches.
 */
export function isEqual(value, condition) {
  let valueTyped = value;
  let conditionTyped = condition;
  if (typeof value !== 'undefined') {
    valueTyped = String(value);
  }
  if (typeof condition !== 'undefined') {
    conditionTyped = String(condition);
  }
  if (!Number.isNaN(condition)) {
    conditionTyped = Number(conditionTyped);
    valueTyped = Number(valueTyped);
  }
  return conditionTyped === valueTyped;
}

/**
 * Oposite of `isEqual()`.
 *
 * @param {String|any} value Value to compare
 * @param {String|any} condition Comparator value
 * @return {Boolean} False if objects matches.
 */
export function isNotEqual(value, condition) {
  return !isEqual(value, condition);
}

/**
 * Checks if value is less than comparator.
 *
 * @param {String|any} value Value to compare
 * @param {String|any} condition Comparator value
 * @return {Boolean} True if value is less than condition.
 */
export function isLessThan(value, condition) {
  const valueNumber = Number(value);
  if (Number.isNaN(valueNumber)) {
    return false;
  }
  const conditionNumber = Number(condition);
  if (Number.isNaN(conditionNumber)) {
    return false;
  }
  return valueNumber < conditionNumber;
}

/**
 * Checks if value is less than or equal to comparator.
 *
 * @param {String|any} value Value to compare
 * @param {String|any} condition Comparator value
 * @return {Boolean} True if value is less than or equal to `condition`.
 */
export function isLessThanEqual(value, condition) {
  const valueNumber = Number(value);
  if (Number.isNaN(valueNumber)) {
    return false;
  }
  const conditionNumber = Number(condition);
  if (Number.isNaN(conditionNumber)) {
    return false;
  }
  return valueNumber <= conditionNumber;
}

/**
 * Checks if value is greater than comparator.
 *
 * @param {String|any} value Value to compare
 * @param {String|any} condition Comparator value
 * @return {Boolean} True if value is greater than `condition`.
 */
export function isGreaterThan(value, condition) {
  const valueNumber = Number(value);
  if (Number.isNaN(valueNumber)) {
    return false;
  }
  const conditionNumber = Number(condition);
  if (Number.isNaN(conditionNumber)) {
    return false;
  }
  return valueNumber > conditionNumber;
}

/**
 * Checks if value is greater than or equal to comparator.
 *
 * @param {String|any} value Value to compare
 * @param {String|any} condition Comparator value
 * @return {Boolean} True if value is greater than or equal to `condition`.
 */
export function isGreaterThanEqual(value, condition) {
  const valueNumber = Number(value);
  if (Number.isNaN(valueNumber)) {
    return false;
  }
  const conditionNumber = Number(condition);
  if (Number.isNaN(conditionNumber)) {
    return false;
  }
  return valueNumber >= conditionNumber;
}

/**
 * Checks if value contains the `condition`.
 * It works on strings, arrays and objects.
 *
 * @param {String|any} value Value to compare
 * @param {String|any} condition Comparator value
 * @return {Boolean} True if value contains the `condition`.
 */
export function contains(value, condition) {
  if (!value) {
    return false;
  }
  if (typeof value === 'string') {
    return value.indexOf(condition) !== -1;
  }
  if (value instanceof Array) {
    if (!Number.isNaN(condition) && typeof condition !== 'number') {
      const result = value.indexOf(Number(condition));
      if (result !== -1) {
        return true;
      }
    }
    return value.indexOf(condition) !== -1;
  }
  if (typeof value !== 'object') {
    return false;
  }
  return condition in value;
}

/**
 * Checks if `value` can be tested agains regular expression.
 *
 * @param {String|any} value Value to compare
 * @param {String|any} condition Comparator value - regex string.
 * @return {Boolean} Value of calling `test()` function on stirng.
 */
export function isRegex(value, condition) {
  let re;
  try {
    re = new RegExp(condition, 'm');
  } catch (e) {
    return false;
  }
  const result = String(value);
  return re.test(result);
}

/**
 * Checks if given condition is satisfied by both value and operator.
 *
 * @param {any} value Value rread from the response / request object
 * @param {string} operator Comparition term.
 * @param {string|number} condition Value to compare.
 * @return {Boolean} True if the condition is satisfied and false otherwise.
 */
export function checkCondition(value, operator, condition) {
  switch (operator) {
    case 'equal':
      return isEqual(value, condition);
    case 'not-equal':
      return isNotEqual(value, condition);
    case 'greater-than':
      return isGreaterThan(value, condition);
    case 'greater-than-equal':
      return isGreaterThanEqual(value, condition);
    case 'less-than':
      return isLessThan(value, condition);
    case 'less-than-equal':
      return isLessThanEqual(value, condition);
    case 'contains':
      return contains(value, condition);
    case 'regex':
      return isRegex(value, condition);
    default:
      return false;
  }
}