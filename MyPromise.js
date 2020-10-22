/*
 * @Description:
 * @Author: 郭军伟
 * @Date: 2020-10-21 15:14:53
 * @LastEditors: 郭军伟
 * @LastEditTime: 2020-10-21 18:26:56
 */
const PENDING = 'pending';
const FULFILLED = 'fulfilled';
const REJECTED = 'rejected';

function MyPromise(fn) {
  this.status = PENDING;
  this.value = null;
  this.reason = null;
  this.onFulfilledCallbacks = [];
  this.onRejectedCallbacks = [];

  const that = this;
  function resolve(value) {
    setTimeout(function () {
      if (that.status === PENDING) {
        that.status = FULFILLED;
        that.value = value;
        that.onFulfilledCallbacks.forEach((callback) => {
          callback(that.value);
        });
      }
    }, 0);
  }

  function reject(reason) {
    setTimeout(function () {
      if (that.status === PENDING) {
        that.status === REJECTED;
        that.reason = reason;
        that.onRejectedCallbacks.forEach((callback) => {
          callback(that.reason);
        });
      }
    }, 0);
  }

  try {
    fn(resolve, reject);
  } catch (error) {
    reject(error);
  }
}

MyPromise.prototype.then = function (onFulfilled, onRejected) {
  let realOnFulfilled = onFulfilled;
  let realOnRejected = onRejected;
  let that = this;
  if (typeof realOnFulfilled !== 'function') {
    realOnFulfilled = function (value) {
      return value;
    };
  }
  if (typeof realOnRejected !== 'function') {
    realOnRejected = function (reason) {
      if (reason instanceof Error) {
        throw reason;
      } else {
        throw new Error(reason);
      }
    };
  }

  if (this.status === FULFILLED) {
    const promise2 = new MyPromise(function (resolve, reject) {
      try {
        if (typeof onFulfilled !== 'function') {
          resolve(that.value);
        } else {
          let x = realOnFulfilled(that.value);
          resolvePromise(promise2, x, resolve, reject);
        }
      } catch (error) {
        reject(error);
      }
    });
    return promise2;
  }
  if (this.status === REJECTED) {
    return new MyPromise(function (resolve, reject) {
      try {
        if (typeof onRejected !== 'function') {
          reject(that.reason);
        } else {
          realOnRejected(that.reason);
          resolve();
        }
      } catch (error) {
        reject(error);
      }
    });
  }
  if (this.status === PENDING) {
    return new MyPromise(function (resolve, reject) {
      that.onFulfilledCallbacks.push(function () {
        try {
          realOnFulfilled(that.value);
        } catch (error) {
          reject(error);
        }
      });
      that.onRejectedCallbacks.push(function () {
        try {
          realOnRejected(that.reason);
        } catch (error) {
          reject(error);
        }
      });
    });
  }
};

function resolvePromise(promise, x, resolve, reject) {
  if (promise === x) {
    return reject(
      new TypeError('The promise and the return value are the same')
    );
  }

  if (x instanceof MyPromise) {
    if (x.status === PENDING) {
      x.then(resolve, reject);
    } else if (x.status === FULFILLED) {
      resolve(x.value);
    } else if (x.status === REJECTED) {
      reject(x.reason);
    }
  } else if (
    Object.prototype.toString.call(x) === '[object Object]' ||
    typeof x === 'function'
  ) {
    try {
      const then = x.then;
    } catch (error) {
      reject(error);
    }
    if (typeof then === 'function') {
      var called = false;
      try {
        then.call(
          x,
          function (y) {
            if (called) return;
            called = true;
            resolvePromise(promise, y, resolve, reject);
          },
          function (r) {
            if (called) return;
            called = true;
            reject(r);
          }
        );
      } catch (error) {
        if (called) return;
        reject(error);
      }
    } else {
      resolve(x);
    }
  } else {
    resolve(x);
  }
}

MyPromise.deferred = function () {
  const result = {};
  result.promise = new MyPromise(function (resolve, reject) {
    result.resolve = resolve;
    result.reject = reject;
  });
  return result;
};

module.exports = MyPromise;
