import Rx from 'rxjs/Rx';
let Observable = Rx.Observable;

function dh(node) {
  node.subscriptions.forEach(subs => subs.unsubscribe());
}

function h(tag, attrs, ...children) {
  children = children.reduce((rs, c) => rs.concat(c), []);
  let element = document.createElement(tag);
  let subscriptions = [];
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
  for (let index = 0; index < children.length; index++) {
    let child = children[index];
    if (child instanceof Observable) {
      subscriptions.push(child.subscribe(c => {
        let cnode = element.childNodes[index];
        if (cnode) {
          if (c) {
            element.replaceChild(c, cnode);
          } else {
            dh(cnode);
            let placeholder = document.createComment('placeholder for h');
            element.replaceChild(placeholder, cnode);
          }
        } else {
          if (c) {
            element.appendChild(c);
          } else {
            let placeholder = document.createComment('placeholder for h');
            element.appendChild(placeholder);
          }
        }
      }));
    } else {
      element.appendChild(child);
    }
  }
  element.subscriptions = subscriptions;
  return element;
}

export default h;
