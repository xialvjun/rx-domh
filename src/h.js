function dh(node) {
  node.subscriptions.forEach(subs => subs.unsubscribe());
}

function h(tag, attrs, ...children) {
  children = children.reduce((rs, c) => rs.concat(c), []);
  var element = document.createElement(tag);
  var subscriptions = [];
  for (var key in attrs) {
    if (attrs.hasOwnProperty(key)) {
      var value = attrs[key];
      if (value instanceof Observable) {
        subscriptions.push(value.subscribe(v => element.setAttribute(key, v)));
      } else {
        element.setAttribute(key, value);
      }
    }
  }
  for (var index = 0; index < children.length; index++) {
    var child = children[index];
    if (child instanceof Observable) {
      subscriptions.push(child.subscribe(c => {
        var cnode = element.childNodes[index];
        if (cnode) {
          if (c) {
            element.replaceChild(cnode, c);
          } else {
            dh(cnode);
            var placeholder = document.createComment('placeholder for h');
            element.replaceChild(cnode, placeholder);
          }
        } else {
          if (c) {
            element.appendChild(c);
          } else {
            var placeholder = document.createComment('placeholder for h');
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
