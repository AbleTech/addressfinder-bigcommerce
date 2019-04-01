import FormHelper from "./form_helper"

export default class MutationsHelper {
  constructor(layoutConfigurations, widgetConfig) {
    this.formHelperConfig = {}
    this.formHelpers = []
    this.layoutConfigurations = layoutConfigurations
    this.widgetConfig = widgetConfig
    this.countryCodes = ["au", "nz"]
    this.identifyLayout()
    this.monitorMutations()
  }

  domNodeModifiedHandler(event){
    if (event.target.className && event.target.className.includes("af_list")) {
      return // ignore AddressFinder changes
    }

    if (event.relatedNode && event.relatedNode.className && event.relatedNode.className.includes("af_list")) {
      return // ignore AddressFinder changes
    }

    if (this._mutationTimeout) {
      clearTimeout(this._mutationTimeout) // reset previous timeout
    }

    // ignore any further changes for the next 750 mS
    this._mutationTimeout = setTimeout(this.resetAndReloadFormHelpers.bind(this), 750)
  }


  identifyLayout(){
    for (const layoutConfig of this.layoutConfigurations) {
      let identifyingElement = document.querySelector(layoutConfig.layoutSelector)

      if (identifyingElement) {
        this._log(`Identified layout named: ${layoutConfig.label}`)
        this.initialiseFormHelper(layoutConfig)
      }
    }
  }

  initialiseFormHelper(layoutConfig){
    let searchElement = document.getElementById(layoutConfig.searchIdentifier)

    if (searchElement) {
      this.formHelperConfig = {
        countryElement: document.getElementById(layoutConfig.countryIdentifier),
        label: layoutConfig.label,
        layoutSelector: layoutConfig.layoutSelector,
        nz: {
          countryValue: layoutConfig.nz.countryValue,
          searchElement: document.getElementById(layoutConfig.nz.elements.address1),
          elements: {
            address_line_1_and_2: document.getElementById(layoutConfig.nz.elements.address1),
            address_line_1: null,
            address_line_2: null,
            suburb: document.getElementById(layoutConfig.nz.elements.suburb),
            city: document.getElementById(layoutConfig.nz.elements.city),
            region: document.getElementById(layoutConfig.nz.elements.region),
            postcode: document.getElementById(layoutConfig.nz.elements.postcode)
          },
          regionMappings: null
        },
        au: {
          countryValue: layoutConfig.au.countryValue,
          searchElement: document.getElementById(layoutConfig.au.elements.address1),
          elements: {
            address_line_1_and_2: null,
            address_line_1: document.getElementById(layoutConfig.au.elements.address1),
            address_line_2: document.getElementById(layoutConfig.au.elements.address2),
            locality_name: document.getElementById(layoutConfig.au.elements.suburb),
            city: null,
            state_territory: document.getElementById(layoutConfig.au.elements.state),
            postcode: document.getElementById(layoutConfig.au.elements.postcode)
          },
          stateMappings: layoutConfig.au.stateMappings
        }
      }
      let helper = new FormHelper(this.widgetConfig, this.formHelperConfig)
      this.formHelpers.push(helper)
    }
  }

    // search active formHelpers for this layoutSelector
    anyFormHelpersWithLayoutIdentifier(identifierToSearchFor){
      for (const activeFormHelper of this.formHelpers) {
        if (activeFormHelper.layoutSelector == identifierToSearchFor) {
          return true
        }
      }
  
      return false
    }

  _bodyContainsElement(element) {
    document.body.contains(element)
  }

    // check all of the elements in the formHelper and confirm they are still
  // within the page DOM
  areAllElementsStillInTheDOM(){

    if( !this._bodyContainsElement(this.formHelperConfig.countryElement)){
      this._log("Country Element is not in the DOM")
      return false
    }

    const countryCodeWithMissingElements = this.countryCodes.find((countryCode) => {
      if (this.areAllElementsStillInTheDOMForCountryCode(countryCode)) {
        return false // not missing
      } else {
        return true // missing an element
      }
    });

    const allElementsStillInTheDOM = !countryCodeWithMissingElements
    this._log('areAllElementsStillInTheDOM?', allElementsStillInTheDOM)

    return allElementsStillInTheDOM
  }

  areAllElementsStillInTheDOMForCountryCode(countryCode) {
    const formConfig = this.formHelperConfig[countryCode]

    // if config is not supplied then no need to check elements
    if (!formConfig) {
      return true
    }

    if (!this._bodyContainsElement(formConfig.searchElement)){
      this._log("Search Element is not in the DOM")
      return false
    }
    // const findElement = elementName => formConfig.elements[elementName]
    const isPresent = element => element != undefined

    const elementNotInDOM = Object.values(formConfig.elements)
                                  .filter(isPresent)
                                  .find(!this._bodyContainsElement)

    if (elementNotInDOM) {
      this._log("Element is not in the DOM", elementNotInDOM)
      return false
    }

    // all elements are still in the DOM
    return true
  }

  identifyAdditionalLayouts(){
    const layoutSelectorExists = config => document.querySelector(config.layoutSelector)
    const isNewFormHelper = config => !this.anyFormHelpersWithLayoutIdentifier(config.layoutSelector)

    this.layoutConfigurations.filter(layoutSelectorExists)
                             .filter(isNewFormHelper)
                             .forEach(this.initialiseFormHelper.bind(this))
  }

  _formHelpersWithMissingElements(){
    const hasMissingElements = formHelper => !this.areAllElementsStillInTheDOM()

    return this.formHelpers.filter(hasMissingElements)
  }

  resetAndReloadFormHelpers(){
    const formHelpersToDestroy = this._formHelpersWithMissingElements()

    for (const formHelper of formHelpersToDestroy) {
      formHelper.destroy()
    }

    const isStillActive = formHelper => !formHelpersToDestroy.includes(formHelper)
    this.formHelpers = this.formHelpers.filter(isStillActive)

    this.identifyAdditionalLayouts()
  }

  mutationHandler(mutations){
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

    if (this._mutationTimeout) {
      clearTimeout(this._mutationTimeout) // reset previous timeout
    }

    // ignore any further changes for the next 750 mS
    this._mutationTimeout = setTimeout(this.resetAndReloadFormHelpers.bind(this), 750)
  }

  monitorMutations(){
    if (window.MutationObserver) {
      /* for modern browsers */
      var observer = new MutationObserver(this.mutationHandler.bind(this));
      observer.observe(document.body, {childList: true, subtree: true});

    } else if (window.addEventListener) {
      /* for IE 9 and 10 */
      document.body.addEventListener('DOMNodeInserted', this.domNodeModifiedHandler.bind(this), false);
      document.body.addEventListener('DOMNodeRemoved', this.domNodeModifiedHandler.bind(this), false);
    } else {
        if (window.console) {
          console.info('AddressFinder Error - please use a more modern browser')
        }
    }
  }

  _log(message, object1=undefined){
    // widgetConfig.debug should be on 
    if (window.console) {
      if (object1 != undefined) {
        console.log(`${message}`, object1)
      }
      else {
        console.log(`${message}`)
      }
    }
  }

}