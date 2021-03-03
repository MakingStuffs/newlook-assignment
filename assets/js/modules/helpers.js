import data from '../data/testData.js'

// Document element getters for readability
export const getSearchInput = () =>
  document.querySelector('input[name="search"]')
export const getTypeFilterContainer = () =>
  document.querySelector('.filter__type')
export const getFilterContainer = () =>
  document.querySelector('.filter__container')
export const getPriceMinInput = () => document.querySelector('#priceMin')
export const getPriceMaxInput = () => document.querySelector('#priceMax')
export const getPriceMaxInputNumb = () =>
  document.querySelector('#priceMaxNumb')
export const getPriceMinInputNumb = () =>
  document.querySelector('#priceMinNumb')
export const getProductsWrapper = () =>
  document.querySelector('.carousel__content')
export const getProductModal = () => document.querySelector('.product__modal')
export const getModalClose = () => document.querySelector('#productModalClose')
export const getProductTypesInput = () =>
  document.querySelector('#productTypes')
export const getFiltersElem = () => document.querySelector('#filters')
export const getFilterToggleButtons = () =>
  document.querySelectorAll('.filter__button')
export const getCloseFilterFormButton = () =>
  document.querySelector('#closeFilterForm')

/**
 *
 * Return a HTML P element with the passed parameters set
 *
 * @param {string} content TextContent for the P element
 * @param {string} classes CSS classes to add to the p element
 */
export const createP = (content, classes) => {
  const p = document.createElement('p')
  if (classes) {
    p.classList = classes
  }
  if (content) {
    p.textContent = content
  }
  return p
}

/**
 * Create a wrapping div element for our products
 */
export const createProductWrapper = (clickHandler) => {
  const button = document.createElement('button')
  button.classList = 'product__card'
  button.addEventListener('click', clickHandler)
  return button
}

/**
 *
 * Return an img element with the correct attrs for the product thumbnail
 *
 * @param {string} src the src attribute used in the thumbnail
 * @param {string} alt the alt attribute used in the thumbnail
 */
export const createProductThumb = (src, alt) => {
  const img = document.createElement('img')
  img.classList = 'product__thumb'
  img.setAttribute('height', '200px')
  img.src = src
  img.alt = alt
  return img
}

/**
 * Parses the output of getFiltersElem().value as a true JSON object
 */
export const getFiltersAsJSON = () => JSON.parse(getFiltersElem().value)

/**
 *
 * filter products list into an array of elements whose
 * titles contain the words passed in the filter
 *
 * @param {string} filter word to be matched
 * @param {array} products array to be filtered
 */
export const filterBySearch = (filter, products) => {
  // Split words into an array
  const words = filter.split(/ /).map((word) => word.toLowerCase())
  // reduce products array into one with just products containing our words
  const filtered = products.reduce((output, product) => {
    // default to true
    let includesAllTerms = true
    // iterate our words
    words.forEach((word) => {
      //Test the current product title against the current search word
      if (!product.productTitle.toLowerCase().includes(word.toLowerCase())) {
        // If it doesn't include the search word set the variable to false
        includesAllTerms = false
      }
    })
    // If all terms are present in the title push the object to output
    if (includesAllTerms) {
      output.push(product)
    }
    // Return the output array
    return output
  }, [])
  // Return our filtered array
  return filtered
}

/**
 * filter products according to min and max price
 *
 * @param {object} filter object with min and max price
 * @param {array} products array of product objects
 */
export const filterByPrice = (filter, products) =>
  products.filter(({ price }) => price >= filter.min && price <= filter.max)

/**
 * Filter products according to type
 *
 * @param {string} type string containing the current type
 * @param {array} products array of product objects
 */
export const filterByType = (type, products) =>
  products.filter(({ productUrl }) => productUrl.includes(`clothing/${type}`))

/**
 * Returns an object containing default min and max prices
 * returned values have been typed to int
 */
export const getDefaultPrices = () => {
  const min = parseInt(getPriceMinInputNumb().getAttribute('value'))
  const max = parseInt(getPriceMaxInputNumb().getAttribute('value'))
  return { min, max }
}

/**
 *
 * return an array of products which have been filtered according to the passed
 * object
 *
 * @param {object} filters an object containing key/value pairs of filter
 */
export const getFilteredProducts = (filters) => {
  const filterKeys = Object.keys(filters)
  let min, max, defaultPrices
  const filteredProducts = filterKeys.reduce(
    (output, filter) => {
      switch (filter) {
        case 'search':
          if (filters.search == '') {
            removeFilter('search')
            break
          }
          toggleFilterActive('search', true)
          output = [...filterBySearch(filters.search, output)]
          break
        case 'price':
          defaultPrices = getDefaultPrices()
          min = filters.price.min
          max = filters.price.max
          if (min == defaultPrices.min && max == defaultPrices.max) {
            removeFilter('price')
            break
          }
          toggleFilterActive('price', true)
          output = [...filterByPrice(filters.price, output)]
          break
        case 'type':
          if (filters.type == 0) {
            removeFilter('type')
            break
          }
          toggleFilterActive('type', true)
          output = [...filterByType(filters.type, output)]
          break
        default:
          break
      }
      return output
    },
    [...data]
  )

  return filteredProducts
}

/**
 * Removes the provided filter from the hidden filter input
 * Default removes all filters
 * @param {string} toRemove filter to be removed
 */
export const removeFilter = (toRemove) => {
  const filterValueElem = getFiltersElem()
  const filterValueJSON = getFiltersAsJSON()
  switch (toRemove) {
    case 'price':
      delete filterValueJSON.price
      filterValueElem.value = JSON.stringify(filterValueJSON)
      getFilteredProducts(filterValueJSON)
      toggleFilterActive('price', false)
      break
    case 'search':
      delete filterValueJSON.search
      filterValueElem.value = JSON.stringify(filterValueJSON)
      getFilteredProducts(filterValueJSON)
      toggleFilterActive('search', false)
      break
    case 'type':
      delete filterValueJSON.type
      filterValueElem.value = JSON.stringify(filterValueJSON)
      getFilteredProducts(filterValueJSON)
      toggleFilterActive('type', false)
      break
    default:
      filterValueElem.value = ''
      getFilteredProducts({})
      toggleFilterActive()
      break
  }
}

/**
 * Either activate or deactivate thr provided filter
 * default is to remove all filters
 * @param {string} filter filter to be toggled
 * @param {boolean} activate whether to activate the filter
 */
export const toggleFilterActive = (filter, activate) => {
  let elem
  switch (filter) {
    case 'type':
      elem = document.querySelector('#typeToggle')
      return activate
        ? elem.setAttribute('active-filter', '')
        : elem.removeAttribute('active-filter')
    case 'price':
      elem = document.querySelector('#priceToggle')
      return activate
        ? elem.setAttribute('active-filter', '')
        : elem.removeAttribute('active-filter')
    case 'search':
      elem = document.querySelector('#searchToggle')
      return activate
        ? elem.setAttribute('active-filter', '')
        : elem.removeAttribute('active-filter')
    default:
      return [
        document.querySelector('#typeToggle'),
        document.querySelector('#priceToggle'),
        document.querySelector('#priceToggle'),
      ].forEach((element) => element.removeAttribute('active-filter'))
  }
}

/**
 * return an object containing the min and max price range from the passed objects
 * @param {array} products array of products
 */
export const getMinMaxPricesFromProducts = (products) => {
  const prices = products.map((product) => parseFloat(product.price))
  return {
    max: Math.ceil(Math.max(...prices)),
    min: Math.floor(Math.min(...prices)),
  }
}

/**
 * return an array of strings containing product types
 * @param {array} products array of products
 */
export const getProductTypes = (products) => {
  const typeRegex = /(clothing\/)([a-z]+(-[a-z]+)*)/g
  const productTypes = products.reduce((output, current) => {
    const currentUrl = current.productUrl
    // Get the current type if there is one
    const currentType = typeRegex.test(currentUrl)
      ? currentUrl.match(typeRegex)[0].split('/')[1]
      : null
    // Reset the regex to stop it acting weird when iterated multiple times
    typeRegex.lastIndex = 0
    // Push the current type to the array if the type exists and isnt already present
    if (currentType && !output.includes(currentType)) {
      output.push(currentType)
    }

    return output
  }, [])
  return productTypes
}

/**
 * Return a string with the hyphens swapped for spaces
 */
export const formatForLabel = (word) => word.split(/-/g).join(' ')
