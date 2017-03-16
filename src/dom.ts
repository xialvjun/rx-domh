// 后面接个 value 是用来递归处理 Array 的
function classListProcessor(className: any, value: string = '') {
  if (typeof className === 'string' || className instanceof String) {
    value += ' ' + className;
  } else if (Object.prototype.toString.call(className)==='[object Array]' && className instanceof Array) {
    className.forEach(sub => { value += classListProcessor(sub, value) });
  } else if (className instanceof Object) {
    for (var name in className) {
      if (className.hasOwnProperty(name)) {
        className[name] ? value += ' ' + name.trim() : null;
      }
    }
  }
  return value.trim();
}

function styleListProcessor(style: any, value: string = '') {
  if (typeof style === 'string' || style instanceof String) {
    value += style + ';'
  } else if (Object.prototype.toString.call(style)==='[object Array]' && style instanceof Array) {
    style.forEach(sub => { value += styleListProcessor(sub, value) });
  } else if (style instanceof Object) {
    for (var name in style) {
      if (style.hasOwnProperty(name)) {
        // 把 backgroundColor 之类的转成 background-color
        value += name.trim().replace(/[A-Z]/g, match => '-' + match.toLowerCase()) + '=' + style[name] + ';'
      }
    }
  }
  return value;
}



export function setAttribute(element: HTMLElement, name: string, value: any) {
  name = name.trim();
  if (name.startsWith('on')) {
    element[name] = value;
    return element;
  }
  if (['value', 'checked'].indexOf(name) > -1 && element instanceof HTMLInputElement) {
    element[name] = value;
    // element.setAttribute(name, value);
    return element;
  }
  switch (name) {
    case 'class':
    case 'className':
      element.className = classListProcessor(value);
      return element;
    case 'style':
      element.style.cssText = styleListProcessor(value);
      return element;
    default:
      element.setAttribute(name.replace(/[A-Z]/g, (match) => '-' + match.toLowerCase()), value);
      return element;
  }
}
