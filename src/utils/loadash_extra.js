
function sortObject(obj) {
  let sortingObj = {},
    isobj = isObject(obj),
    keys = isobj ? Object.keys(obj) : Array.from(Array(obj.length).keys());
  for (let k of keys) {
    if (Array.isArray(obj[k]) || isObject(obj[k])) {
      obj[k] = sortObject(obj[k]);
      sortingObj[k] = JSON.stringify(obj[k]);
    } else sortingObj[k] = obj[k].toString();
  }
  return Object.keys(sortingObj)
    .sort(
      isobj
        ? (a, b) => (a > b ? 1 : -1)
        : (a, b) => (sortingObj[a] > sortingObj[b] ? 1 : -1)
    )
    .reduce(
      (re, sk, i) => ((re[isobj ? sk : i] = obj[sk]), re),
      isobj ? {} : []
    );
}
function isObject(obj) {
  try {
    return (
      obj.toString() === "[object Object]" &&
      JSON.stringify(obj).slice(0, 1) === "{"
    );
  } catch (e) {} //eslint-disable-line
  return false;
}
function isEqual(a, b) {
  if ((isObject(a) || Array.isArray(a)) && (isObject(b) || Array.isArray(b))) {
    return JSON.stringify(sortObject(a)) === JSON.stringify(sortObject(b));
  } else return a == b;
}

export default {
  sortObject,
  isObject,
  isEqual
}
