/*
 * @Description:
 * @Author: 郭军伟
 * @Date: 2020-10-22 14:23:33
 * @LastEditors: 郭军伟
 * @LastEditTime: 2020-10-22 14:28:04
 */
// function flattenDeep(arr) {
//   return arr.flat(Math.pow(2, 53) - 1);
// }
function flattenDeep(arr) {
  return arr.reduce((pre, val) => {
    return Array.isArray(val) ? pre.concat(flattenDeep(val)) : pre.concat(val);
  }, []);
}

const testArr = [1, [2, [3, [4], 5]]];
console.log(flattenDeep(testArr));
