import defaultStateMappings from './default_state_mappings'

export default [
  {
    label: "Address book (Stencil)",
    layoutSelectors: ["form[data-address-form]", "#FormField_12_input"],
    countryIdentifier: "#FormField_11_select",
    searchIdentifier: "#FormField_8_input",
    nz: {
      countryValue: "New Zealand",
      elements: {
        address1: "#FormField_8_input",
        address2: null,
        suburb: "#FormField_9_input",
        city: "#FormField_10_input",
        region: "#FormField_12_input",
        postcode: "#FormField_13_input",
      },
      regionMappings: null
    },
    au: {
      countryValue: "Australia",
      elements: {
        address1: "#FormField_8_input",
        address2: "#FormField_9_input",
        suburb: "#FormField_10_input",
        state: "#FormField_12_input",
        postcode: "#FormField_13_input"
      },
      stateMappings: defaultStateMappings
    }
  },
  {
    label: "Address book - Edit Address (Stencil)",
    layoutSelectors: ["form[data-address-form]", "#FormField_12_select"],
    countryIdentifier: "#FormField_11_select",
    searchIdentifier: "#FormField_8_input",
    nz: {
      countryValue: "New Zealand",
      elements: {
        address1: "#FormField_8_input",
        address2: null,
        suburb: "#FormField_9_input",
        city: "#FormField_10_input",
        region: "#FormField_12_select",
        postcode: "#FormField_13_input",
      },
      regionMappings: null
    },
    au: {
      countryValue: "Australia",
      elements: {
        address1: "#FormField_8_input",
        address2: "#FormField_9_input",
        suburb: "#FormField_10_input",
        state: "#FormField_12_select",
        postcode: "#FormField_13_input"
      },
      stateMappings: defaultStateMappings
    }
  }
]
