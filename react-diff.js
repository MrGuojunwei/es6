/*
 * @Description:
 * @Author: 郭军伟
 * @Date: 2020-10-22 14:51:04
 * @LastEditors: 郭军伟
 * @LastEditTime: 2020-10-23 16:06:53
 *
 */
// 新元素为单一的元素
function reconcileSingleElement(returnFiber, currentFirstChild, newChild) {
  const key = newChild.key;
  let child = currentFirstChild;
  while (child !== null) {
    // 判断child和newChild是否是同一个节点
    if (child.key === key) {
      if (child.elementType === newChild.type) {
        // 删除剩余的子节点
        deleteRemainingChildren(returnFiber, child.sibling);
        // 复用child节点
        const existing = useFiber(child, newChild.props);
        // 更新复用节点的ref和return
        existing.ref = coerceRef(returnFiber, child, newChild);
        existing.return = returnFiber;
        return existing;
      } else {
        deleteRemainingChildren(returnFiber, child);
        break;
      }
    } else {
      // key不同的情况，删除child
      deleteChild(returnFiber, child);
    }
    child = child.sibling;
  }
  // 子节点中没有相同节点的情况
  const created = createFiberFromElement(newChild, returnFiber.mode);
  created.ref = coerceRef(returnFiber, currentFirstChild, newChild);
  created.return = returnFiber;
  return created;
}

// 新元素为文本节点
function reconcileSingleTextNode(returnFiber, currentFirstChild, textConent) {
  if (currentFirstChild !== null && currentFirstChild.tag === HostText) {
    deleteRemainingChildren(returnFiber, currentFirstChild.sibling);
    // 复用第一个节点
    const existing = useFiber(currentFirstChild, textConent);
    existing.return = returnFiber;
    return existing;
  }
  deleteRemainingChildren(returnFiber, currentFirstChild);
  const created = createFiberFromText(textConent, returnFiber.mode);
  created.return = returnFiber;
  return created;
}

function placeChild(newFiber, lastPlacedIndex, newIdx) {
  newFiber.index = newIndex;
  if (!shouldTrackSideEffects) {
    return lastPlacedIndex;
  }
  const current = newFiber.alternate; // current== null,该节点为新增节点
  if (current !== null) {
    // current !== null 表示更新，存在已有节点
    const oldIndex = current.index;
    if (oldIndex < lastPlacedIndex) {
      newFiber.flags = Placement;
      return lastPlacedIndex;
    } else {
      // 该项依然留在老位置
      return oldIndex;
    }
  } else {
    newFiber.flags = Placement;
    return lastPlacedIndex;
  }
}
function updateTextNode(returnFiber, current, textContent) {
  // current节点不是可复用的文本节点
  if (current === null || current.tag !== HostText) {
    // 通过textContent创建文本节点Fiber
    const created = createFiberFromText(textContent, returnFiber.mode);
    created.return = returnFiber;
    return created;
  } else {
    // 找到可复用的文本节点了，则复用
    const existing = useFiber(current, textContent); // 复用文本节点
    existing.return = returnFiber;
    return existing;
  }
}
function updateElement(returnFiber, current, element) {
  if (current !== null) {
    if (current.elementType === element.type) {
      const existing = useFiber(current, element.props); // 复用节点
      existing.ref = coerceRef(returnFiber, current, element);
      existing.return = returnFiber;
      return existing;
    }
  }

  // 新节点
  const created = createFiberFromElement(element, returnFiber.mode);
  created.ref = coerceRef(returnFiber, current, element);
  created.return = returnFiber;
  return created;
}

// 将所有老节点添加到Map对象中
function mapRemainingChildren(returnFiber, currentFirstChild) {
  const existingChildren = new Map();

  let existingChild = currentFirstChild;
  while (existingChild !== null) {
    // key 不为null  元素节点
    if (existingChild.key !== null) {
      existingChildren.set(existingChild.key, existingChild);
    } else {
      // 不存在key  则使用index代替
      existingChildren.set(existingChild.index, existingChild);
    }
    existingChild = existingChild.sibling;
  }
  return existingChildren;
}

function updateFromMap(existingChildren, returnFiber, newIdx, newChild) {
  // 新节点是文本节点
  if (typeof newChild === 'string' || typeof newChild === 'number') {
    const matchedFiber = existingChildren.get(newIdx) || null; // 找index相同的节点复用
    return updateTextNode(returnFiber, matchedFiber, '' + newChild);
  }
  // newChild是元素节点的情况
  if (typeof newChild === 'object' && newChild !== null) {
    if (newChild.$$typeof === REACT_ELEMENT_TYPE) {
      const matchedFiber =
        existingChildren.get(newChild.key ? newChild.key : newChild.index) ||
        null;
      // 返回更新后的元素节点
      return updateElement(returnFiber, matchedFiber, newChild);
    }
  }
  return null;
}

function createChild(returnFiber, newChild) {
  // 处理文本节点
  if (typeof newChild === 'string' || typeof newChild === 'number') {
    const created = createFiberFromText('' + newChild, returnFiber.mode);
    created.return = returnFiber;
    return created;
  }
  // 处理元素节点
  if (typeof newChild === 'object' && newChild !== null) {
    if (newChild.$$typeof === REACT_ELEMENT_TYPE) {
      const created = createFiberFromElement(newChild, returnFiber.mode);
      created.ref = coerceRef(returnFiber, null, newChild);
      created.return = returnFiber;
      return created;
    }
  }

  return null;
}

function createFiberFromText(content, mode) {
  const fiber = createFiber(HostText, content, null);
  return fiber;
}
function createFiberFromElement(element, mode) {
  let owner = null;
  const type = element.type;
  const key = element.key;
  const pendingProps = element.props;
  const fiber = createFiberFromTypeAndProps(
    type,
    key,
    pendingProps,
    owner,
    mode
  );
  return fiber;
}
function coerceRef(returnFiber, current, element) {
  return element.ref;
}

// 新节点是包含多个节点的数组
function reconcileChildrenArray(returnFiber, currentFirstChild, newChildren) {
  let resultingFirstChild = null;
  let previousNewFiber = null;
  let oldFiber = currentFirstChild;
  let lastPlacedIndex = 0;
  let newIdx = 0;
  let nextOldFiber = null;
  // 第一次遍历，对比同位置的节点是否一样
  for (; oldFiber !== null && newIdx < newChildren.length; newIdx++) {
    if (oldFiber.index > newIdx) {
      nextOldFiber = oldFiber;
      oldFiber = null;
    } else {
      nextOldFiber = oldFiber.sibling;
    }
    // updateSlot 比对新老节点，返回null 表示旧节点不可复用，否则返回可复用的节点，即旧节点
    const newFiber = updateSlot(returnFiber, oldFiber, newChildren[newIdx]);
    if (newFiber === null) {
      if (oldFiber === null) {
        oldFiber = nextOldFiber;
      }
      break;
    }
    if (shouldTrackSideEffects) {
      if (oldFiber && newFiber.alternate === null) {
        deleteChild(returnFiber, oldFiber);
      }
    }
    // 给newFiber添加flags标识
    lastPlaceIndex = placeChild(newFiber, lastPlacedIndex, newIdx);
    if (previousNewFiber === null) {
      resultingFirstChild = newFiber; // 链表头
    } else {
      previousNewFiber.sibling = newFiber;
    }
    previousNewFiber = newFiber;
    oldFiber = nextOldFiber;
  }
  // 新节点已经全部遍历完毕
  if (newIdx === newChildren.length) {
    // 删除剩余的节点
    deleteRemainingChildren(returnFiber, oldFiber);
    return resultingFirstChild;
  }
  // 老节点遍历完毕，新节点中剩下的则为新创建的
  if (oldFiber === null) {
    for (; newIdx < newChildren.length; newIdx++) {
      const newFiber = createChild(returnFiber, newChildren[newIdx], lanes);
      if (newFiber === null) {
        continue;
      }
      lastPlacedIndex = placeChild(newFiber, lastPlacedIndex, newIdx);
      if (previousNewFiber === null) {
        resultingFirstChild = newFiber;
      } else {
        previousNewFiber.sibling = newFiber;
      }
      previousNewFiber = newFiber;
    }
    return resultingFirstChild;
  }
  // 处理需要移动节点的情况，即旧节点中存在可复用，位置变化的节点
  const existingChildren = mapRemainingChildren(returnFiber, oldFiber);
  // 处理剩余的新节点
  for (; newIdx < newChildren.length; newIdx++) {
    const newFiber = updateFromMap(
      existingChildren,
      returnFiber,
      newIdx,
      newChildren[newIndex]
    );

    if (newFiber !== null) {
      if (shouldTrackSideEffects) {
        if (newFiber.alternate !== null) {
          // newFiber复用的旧节点已经被复用了，从existingChildren删除此节点
          existingChildren.delete(
            newFiber.key === null ? newIdx : newFiber.key
          );
        }
      }
    }
    // 修改lastPlacedIndex的值，给newFiber添加flags标识
    lastPlacedIndex = placeChild(newFiber, lastPlacedIndex, newIdx);
    if (previousNewFiber === null) {
      resultingFirstChild = newFiber;
    } else {
      previousNewFiber.sibling = newFiber;
    }
    previousNewFiber = newFiber;
  }
  if (shouldTrackSideEffects) {
    // 旧节点中可复用的节点都已经被删除了，剩余的旧节点都是不能被复用的，需要删除
    existingChildren.forEach((child) => deleteChild(returnFiber, child));
  }

  return resultingFirstChild; // 链表头节点
}

function placeSingleChild(fiber) {
  if (shouldTrackSideEffects && newFiber.alternate === null) {
    fiber.flags = Placement;
  }
  return fiber;
}

function reconcileChildFibers(returnFiber, currentFirstChild, newChild) {
  if (newChild.type === REACT_FRAGMENT_TYPE) {
    newChild = newChild.props.children;
  }
  const isObject = typeof newChild === 'object' && newChild !== null;
  if (isObject) {
    switch (newChild.$$typeof) {
      case REACT_ELEMENT_TYPE: // react节点 打上flags属性
        return placeSingleChild(
          reconcileSingleElement(returnFiber, currentFirstChild, newChild)
        );
    }
  }

  // 新节点为普通的文本类型
  if (typeof newChild === 'string' || typeof newChild === 'number') {
    return placeSingleChild(
      reconcileSingleTextNode(returnFiber, currentFirstChild, '' + newChild)
    );
  }

  // 新节点是数组
  if (Array.isArray(newChild)) {
    return reconcileChildrenArray(returnFiber, currentFirstChild, newChild);
  }
}
