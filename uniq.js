/*
 * @Description: 
 * @Author: 郭军伟
 * @Date: 2020-10-22 14:29:06
 * @LastEditors: 郭军伟
 * @LastEditTime: 2020-10-22 14:29:52
 */
function uniq(arr) {
  return [...new Set(arr)];
}

const arr = [1, 2, 3, 5, 3, 2];
console.log(uniq(arr));
