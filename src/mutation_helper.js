
import "core-js/fn/symbol" // see https://github.com/zloirock/core-js
import "core-js/fn/symbol/iterator"
import "core-js/fn/array/find"
import "core-js/fn/array/from"
import "core-js/fn/array/some"
import "core-js/fn/array/includes"
import "core-js/fn/string/includes"

export default class MutationsHelper {
  constructor(resetAndReloadFormHelpers) {
    this.resetAndReloadFormHelpers = resetAndReloadFormHelpers
    this.monitorMutations()
  }

  monitorMutations(){
    if (window.MutationObserver) {
      /* for modern browsers */
      var observer = new MutationObserver(this._mutationHandler.bind(this));
      observer.observe(document.body, {childList: true, subtree: true});

    } else if (window.addEventListener) {
      /* for IE 9 and 10 */
      document.body.addEventListener('DOMNodeInserted', this._domNodeModifiedHandler.bind(this), false);
      document.body.addEventListener('DOMNodeRemoved', this._domNodeModifiedHandler.bind(this), false);
    } else {
        if (window.console) {
          console.info('AddressFinder Error - please use a more modern browser')
        }
    }
  }

  _mutationHandler(mutations){
    const changedNodes = mutations.reduce((nodes, mutation) => {
      // ignore this mutation if the target is the AddressFinder UL element
      if (mutation.target && mutation.target.classList && mutation.target.classList.contains("af_list")) {
        return nodes
      }

      return nodes.concat([...mutation.addedNodes]).concat([...mutation.removedNodes])
    }, [])

    const anyBigCommerceChanges = changedNodes.find((node) => {
      return !(node.classList && node.classList.contains("af_list"))
    })

    if (!anyBigCommerceChanges) {
      return // ignore AddressFinder changes
    }

    this._setMutationTimeout()
  }

  _domNodeModifiedHandler(event){
    if ((event.target.className && event.target.className.includes("af_list")) ||
        (event.relatedNode && event.relatedNode.className && event.relatedNode.className.includes("af_list"))) {
        return // ignore AddressFinder changes
    }

    _setMutationTimeout()
  }

  _setMutationTimeout() {
    if (this._mutationTimeout) {
      clearTimeout(this._mutationTimeout) // reset previous timeout
    }

    // ignore any further changes for the next 750 mS
    this._mutationTimeout = setTimeout(this.resetAndReloadFormHelpers, 750)
  }
}