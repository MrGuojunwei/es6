/*
 * @Description: 
 * @Author: 郭军伟
 * @Date: 2020-10-22 09:50:18
 * @LastEditors: 郭军伟
 * @LastEditTime: 2020-10-22 09:56:41
 */
const curry = (fn, ...args) => {
  return args.length < fn.length
    ? (...remainArgs) => curry(fn, ...args, ...remainArgs)
    : fn(...args);
};

const sum = (a, b, c, d) => {
  return a + b + c + d;
};

const aa = curry(sum);

console.log(aa(1)(2)(3)(4));
console.log(aa(1, 2)(3)(4));
console.log(aa(1, 2, 3, 4));
