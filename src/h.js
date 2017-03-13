import { Observable} from 'rxjs/Observable';

import isEqual from 'lodash/isEqual'

export default function h(tag, attrs, ...children) {
  if (tag==='txt' && typeof attrs === 'string') {
    return document.createTextNode(attrs);
  }
  if (tag==='comment' && typeof attrs === 'string') {
    return document.createComment(attrs);//
  }
  if (typeof attrs === 'object') {
    let element = document.createElement(tag);
    let observables_zip_children = [];
    let subscriptions = element['__subscriptions'] = [];
    for (let key in attrs) {
      if (attrs.hasOwnProperty(key)) {
        let value = attrs[key];
        if (value instanceof Observable) {
          subscriptions.push(value.subscribe(v => element.setAttribute(key, v)));
        } else {
          element.setAttribute(key, value);
        }
      }
    }
    children = children.reduce((acc, cv) => acc.concat(cv), []);
    children.forEach(child => {
      if (child instanceof Observable) {
        let placeholder = document.createComment('placeholder');
        element.appendChild(placeholder);
        observables_zip_children.push({ observable: child, position: placeholder, elements: [] });
        let subscription = child.subscribe(([v, renderer]) => {
          v = [].concat(v).filter(v => v);
          let ozc = observables_zip_children.find(ozc => ozc.observable==child);
          let position = ozc.position;
          let old_elements = ozc.elements.slice();
          if (v.length>0) {
            ozc.elements = v.map(vi => {
              let found = old_elements.find(o => isEqual(vi, o.data));
              if (found) {
                old_elements.splice(old_elements.indexOf(found), 1);
                return { element: found.element, data: vi };
              }
              return { element: renderer(vi), data: vi };
            });
            ozc.elements.slice().forEach(ele => element.insertBefore(ele.element, position));
          } else {
            ozc.elements = [];
          }
          old_elements.forEach(oe => {
            dh(oe.element);
            oe.element.remove();
          });
          // let old_data = ozc.old_data;
          // ozc.data = v;
          // -----------------------
          // if (!v || (Object.prototype.toString.call(v)==='[object Array]' && v.length===0)) {
          //   ozc.elements = [{element: document.createComment('placeholder'), data: v}];
          //   ozc.elements.slice().reverse().forEach(ele => element.insertBefore(ele.element, old_elements[0].element));
          // } else if (Object.prototype.toString.call(v)!=='[object Array]') {
          //   if (!lodash.isEqual(old_data, v)) {
          //     ozc.elements = [].concat(renderer(v));
          //     ozc.elements.slice().reverse().forEach(ele => element.insertBefore(ele, old_elements[0]));
          //   }
          // } else {
          //   old_data = [].concat(old_data);
          //   v.map(vi => {
          //     let found = old_data.find(o => lodash.isEqual(vi, 0));

          //   });
          // }
          // old_elements.forEach(oe => oe.remove());
        });
        subscriptions.push(subscription);
      } else {
        element.appendChild(child);
      }
    });
    return element;
  } else {
    throw new Error('Unknown arguments for h method!');
  }
}

function dh(ele) {
  (ele['__subscriptions'] || []).forEach(sub => sub.unsubscirbe());
  ([].slice.call(ele.childNodes)).forEach(cn => dh(cn));
}
