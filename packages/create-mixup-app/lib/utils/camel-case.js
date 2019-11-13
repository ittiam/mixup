module.exports = function camelCase(split, name) {
  const toUpperCase = str => str.toUpperCase();
  const upperFirstChar = str => str.replace(/^[a-z]{1}/, toUpperCase);

  return name.split(split).reduce((res, cur) => res + upperFirstChar(cur));
};
