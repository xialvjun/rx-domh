import { Observable } from 'rxjs/Observable';
import { Subscription } from 'rxjs/Subscription';

import isEqual from 'lodash/isEqual';

// TODO: 加入生命周期，如 onAttach onDetach

export default function h(tag: string, attrs: Object | string, children=[]): Node & { __subscriptions: Subscription[] } {
  let __subscriptions: Subscription[] = [];
  if (tag==='txt' && typeof attrs === 'string') {
    return Object.assign(document.createTextNode(attrs), { __subscriptions });
  }
  if (tag==='comment' && typeof attrs === 'string') {
    return Object.assign(document.createComment(attrs), { __subscriptions });//
  }
  if (typeof attrs === 'object') {
    let element = document.createElement(tag);
    let observables_zip_children = [];
    // let subscriptions = element['__subscriptions'] = [];
    for (let key in attrs) {
      if (attrs.hasOwnProperty(key)) {
        let value = attrs[key];
        if (value instanceof Observable) {
          __subscriptions.push(value.subscribe(v => element.setAttribute(key, v)));
        } else {
          element.setAttribute(key, value);
        }
      }
    }

    children.forEach(child => {
      if (child instanceof Observable) {
        let placeholder = document.createComment('placeholder');
        element.appendChild(placeholder);
        observables_zip_children.push({ observable: child, position: placeholder, elements: [] });
        let subscription = child.subscribe(([v, renderer]) => {
          // 这里不做非空过滤，保留使用者对空值的处理能力
          v = [].concat(v);//.filter(v => v);
          let ozc = observables_zip_children.find(ozc => ozc.observable==child);
          let position = ozc.position;
          let old_elements = ozc.elements.slice();
          if (v.length>0) {
            ozc.elements = v.map(vi => {
              // 使用 key 加快比较速度
              let found = old_elements.find(o => isEqual(vi['key'], o.data['key']) && isEqual(vi, o.data));
              if (found) {
                old_elements.splice(old_elements.indexOf(found), 1);
                return { element: found.element, data: vi };
              }
              // 这里 renderer(vi) 可能得到的是空值，或者非 Node 元素
              return { element: renderer(vi), data: vi };
            });
            // 因为 ozc.elements 里可能有非 Node 元素，避免 insertBefore 出错，所以要在这里进行过滤
            ozc.elements.slice().filter(ele => ele instanceof Node).forEach(ele => element.insertBefore(ele.element, position));
          } else {
            ozc.elements = [];
          }
          // 因为 ozc.elements 里可能有非 Node 元素，避免 remove 出错，所以要在这里进行过滤
          old_elements.filter(oe => oe instanceof Node).forEach(oe => {
            dh(oe.element);
            oe.element.remove();
          });
        });
        __subscriptions.push(subscription);
      } else {
        element.appendChild(child);
      }
    });
    return Object.assign(element, { __subscriptions });
  } else {
    throw new Error('Unknown arguments for h method!');
  }
}

function dh(ele: Node) {
  (ele['__subscriptions'] || []).forEach(sub => sub.unsubscirbe());
  ([].slice.call(ele.childNodes)).forEach(cn => dh(cn));
}
