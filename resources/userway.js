/* eslint-disable */
export default () => {
  var loadWidget = function () {
    (function(d){
      var s = d.createElement("script");
      s.setAttribute("data-account", "D3656BNpyD");
      s.setAttribute("data-trigger", "accessibilityWidget");
      s.setAttribute("src", "https://cdn.userway.org/widget.js");
      s.async = true;
      (d.body || d.head).appendChild(s);})(document);
  };

  if (document.readyState === "complete") {
    loadWidget();
  } else {
    window.addEventListener("load", loadWidget, { once: true });
  }

  (function(d){
    var ns = d.createElement("noscript");
    ns.innerHTML = `Please ensure Javascript is enabled for purposes of <a href="https://userway.org">website accessibility</a>`;
    (d.body || d.head).appendChild(ns);})(document);
}
