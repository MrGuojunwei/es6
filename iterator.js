/*
 * @Description: 
 * @Author: 郭军伟
 * @Date: 2020-10-22 14:30:22
 * @LastEditors: 郭军伟
 * @LastEditTime: 2020-10-22 14:32:49
 */
let arr = [1,2,3];
// 可迭代对象特点
// 拥有Symbol.iterator属性  可以适用for of  能被Array.from转换为数组
console.log(arr[Symbol.iterator]);