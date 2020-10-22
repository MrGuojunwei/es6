/*
 * @Description:
 * @Author: 郭军伟
 * @Date: 2020-10-22 10:47:10
 * @LastEditors: 郭军伟
 * @LastEditTime: 2020-10-22 14:19:56
 */
Promise.all = (promises) => {
  promises = Array.from(promises);
  if (promises.length === 0) {
    return Promise.resolve([]);
  } else {
    return new Promise((resolve, reject) => {
      let result = [],
        index = 0;
      for (let i = 0; i < promises.length; i++) {
        Promise.resolve(promises[i]).then(
          (data) => {
            result[index] = data;
            if (++index >= promises.length) {
              resolve(result);
            }
          },
          (error) => {
            reject(error);
          }
        );
      }
    });
  }
};
const promise1 = new Promise((resolve) => {
  setTimeout(() => {
    resolve('promise1');
  }, 1000);
});
const promise2 = new Promise((resolve) => {
  setTimeout(() => {
    resolve('promise2');
  }, 1000);
});
const promise3 = new Promise((resolve) => {
  setTimeout(() => {
    resolve('promise3');
  }, 1000);
});

Promise.all([promise1, promise2, promise3])
  .then((result) => {
    console.log(result);
  })
  .catch((err) => {
    console.log(err);
  });
