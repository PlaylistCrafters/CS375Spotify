function generateRandomString(len) {
  let text = "";
  let possible =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

  for (let i = 0; i < len; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }

  return text;
}

function getXRandomItems(iterable, length) {
  return Array.from(iterable)
    .slice()
    .sort(() => Math.random() - 0.5)
    .slice(0, length);
}

function getXRandomItem(iterable) {
  const array = Array.from(iterable);
  if (array.length === 0) {
    return null;
  }
  const randomIndex = Math.floor(Math.random() * array.length);
  return array[randomIndex];
}

function getRandomKey(obj) {
  const keys = Object.keys(obj);
  const randomIndex = Math.floor(Math.random() * keys.length);
  return keys[randomIndex];
}

function intersectArrays(arrays) {
  // returns a list of all common values between the arrays
  if (arrays.length === 0) {
    return [];
  }
  // use first array as base
  const commonSet = new Set(arrays[0]);
  // iterate through the rest of the arrays and intersect with the first set
  for (let i = 1; i < arrays.length; i++) {
    if (commonSet.size === 0) {
      // all lists do not share at least one common value
      break;
    }
    const currentSet = new Set(arrays[i]);
    for (const item of commonSet) {
      if (!currentSet.has(item)) {
        commonSet.delete(item);
      }
    }
  }
  return Array.from(commonSet);
}

function extractListsByKey(objects, key) {
  return objects.map((obj) => obj[key]);
}

module.exports = {
  generateRandomString,
  getXRandomItems,
  getXRandomItem,
  getRandomKey,
  intersectArrays,
  extractListsByKey,
};
