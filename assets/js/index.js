import data from './data/testData.js'

// Document element getters for readability
const getSearchInput = () => document.querySelector('input[name="search"]')
const getTypeFilterContainer = () => document.querySelector('.filter__type')
const getFilterContainer = () => document.querySelector('.filter__container')
const getPriceMinInput = () => document.querySelector('#priceMin')
const getPriceMaxInput = () => document.querySelector('#priceMax')
const getPriceMaxInputNumb = () => document.querySelector('#priceMaxNumb')
const getPriceMinInputNumb = () => document.querySelector('#priceMinNumb')
const getProductsWrapper = () => document.querySelector('.carousel__content')
const getProductModal = () => document.querySelector('.product__modal')
const getModalClose = () => document.querySelector('#productModalClose')
const getProductTypesInput = () => document.querySelector('#productTypes')
const getFiltersElem = () => document.querySelector('#filters')
const getFilterToggleButtons = () =>
  document.querySelectorAll('.filter__button')
const getCloseFilterFormButton = () =>
  document.querySelector('#closeFilterForm')

/**
 *
 * Return a HTML P element with the passes parameters set
 *
 * @param {string} content TextContent for the P element
 * @param {string} classes CSS classes to add to the p element
 */
const createP = (content, classes) => {
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
const createProductWrapper = () => {
  const button = document.createElement('button')
  button.classList = 'product__card'
  button.addEventListener('click', handleModalChange)
  return button
}

/**
 *
 * Return an img element with the correct attrs for the product thumbnail
 *
 * @param {string} src the src attribute used in the thumbnail
 * @param {string} alt the alt attribute used in the thumbnail
 */
const createProductThumb = (src, alt) => {
  const img = document.createElement('img')
  img.classList = 'product__thumb'
  img.setAttribute('height', '200px')
  img.src = src
  img.alt = alt

  return img
}

/**
 * Either adds or removes the open attribute from the modal
 *
 * @param {boolean} openOrClose whether to open or close the modal
 */
const modalToggle = (openOrClose) => {
  const modal = getProductModal()
  return openOrClose === 'open'
    ? modal.setAttribute('open', '')
    : modal.removeAttribute('open')
}

/**
 * Handle to be called when the modal is changed
 * It replaces the content of the various modal elements
 */
function handleModalChange() {
  const { productTitle, imageSrc, price, productUrl } = JSON.parse(
    this.getAttribute('data-product')
  )
  const modal = getProductModal()
  const modalThumb = modal.querySelector('.product-modal__thumb img')
  const modalTitle = modal.querySelector('.product-modal__title')
  const modalPrice = modal.querySelector('.product-modal__price')
  const modalLink = modal.querySelector('.product-modal__link')

  modalPrice.textContent = `£${price}`
  modalTitle.textContent = productTitle

  modalThumb.setAttribute('src', imageSrc)
  modalThumb.setAttribute('alt', productTitle)

  modalLink.href = productUrl
  modalLink.title = productUrl

  return modalToggle('open')
}

/**
 *
 * Output an array of product elements from the passed array of JSON objects
 *
 * @param {array} products array of product objects
 */
const buildProducts = (products) =>
  products.map((product) => {
    const { productTitle, imageSrc } = product
    const productElem = createProductWrapper(product)
    const productThumb = createProductThumb(imageSrc, productTitle)
    const productDesc = createP(productTitle)

    productElem.setAttribute('data-product', JSON.stringify(product))
    productElem.append(productThumb, productDesc)
    return productElem
  })

/**
 *
 * Append HTML elements to the products wrapper element
 *
 * @param {array} products array of HTML elements
 */
const appendProducts = (products) => {
  const wrapper = getProductsWrapper()
  removeChildNodes(wrapper)
  products.forEach((product) => wrapper.appendChild(product))
}

/**
 * Remove children from the passed element
 *
 * @param {HTMLElement} elem element which is to be cleaned of children
 */
const removeChildNodes = (elem) => {
  while (elem.firstChild) {
    elem.removeChild(elem.firstChild)
  }
}

/**
 *
 * Set the value of the hidden filter input used to filtering products
 *
 * @param {object} newFilter object of the new filter
 */
const setCurrentFilters = (newFilter) => {
  // Get the hidden input elem with the filter values
  const filterValueElem = getFiltersElem()
  // IF there are no current filters we just need to assign the new Filter
  if (!filterValueElem.value) {
    filterValueElem.value = JSON.stringify(newFilter)
  } else {
    // Get current filters
    const currentFilters = JSON.parse(filterValueElem.value)
    // Get new filter key
    const newFilterKey = Object.keys(newFilter)[0]
    // Change the value of the newly set filter
    currentFilters[newFilterKey] = newFilter[newFilterKey]
    // Assign it to the filter elem value
    filterValueElem.value = JSON.stringify(currentFilters)
  }
}

/**
 * Parses the output of getFiltersElem().value as a true JSON object
 */
const getFiltersAsJSON = () => JSON.parse(getFiltersElem().value)

/**
 *
 * filter products list into an array of elements whose
 * titles contain the words passed in the filter
 *
 * @param {string} filter word to be matched
 * @param {array} products array to be filtered
 */
const filterBySearch = (filter, products) => {
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
const filterByPrice = (filter, products) =>
  products.filter(({ price }) => price >= filter.min && price <= filter.max)

/**
 * Filter products according to type
 *
 * @param {string} type string containing the current type
 * @param {array} products array of product objects
 */
const filterByType = (type, products) =>
  products.filter(({ productUrl }) => productUrl.includes(`clothing/${type}`))

const getDefaultPrices = () => {
  const min = getPriceMinInputNumb().getAttribute('value')
  const max = getPriceMaxInputNumb().getAttribute('value')
  return { min, max }
}

/**
 *
 * return an array of products which have been filtered according to the passed
 * object
 *
 * @param {object} filters an object containing key/value pairs of filter
 */
const getFilteredProducts = (filters) => {
  const filterKeys = Object.keys(filters)
  let min, max, defaultPrices
  const filteredProducts = filterKeys.reduce(
    (output, filter) => {
      switch (filter) {
        case 'search':
          if (filters.search == '') {
            const filterValueElem = getFiltersElem()
            const filterValueJSON = getFiltersAsJSON()
            delete filterValueJSON.search
            filterValueElem.value = JSON.stringify(filterValueJSON)
            getFilteredProducts(filterValueJSON)
            filterDeactivate('search')
            break
          }

          filterActivate('search')
          output = [...filterBySearch(filters.search, output)]
          break
        case 'price':
          defaultPrices = getDefaultPrices()
          min = filters.price.min
          max = filters.price.max

          if (min == defaultPrices.min && max == defaultPrices.max) {
            const filterValueElem = getFiltersElem()
            const filterValueJSON = getFiltersAsJSON()
            delete filterValueJSON.price
            filterValueElem.value = JSON.stringify(filterValueJSON)
            getFilteredProducts(filterValueJSON)
            filterDeactivate('price')
            break
          }

          filterActivate('price')
          output = [...filterByPrice(filters.price, output)]
          break
        case 'type':
          if (filters.type == 0) {
            const filterValueElem = getFiltersElem()
            const filterValueJSON = getFiltersAsJSON()
            delete filterValueJSON.type
            filterValueElem.value = JSON.stringify(filterValueJSON)
            getFilteredProducts(filterValueJSON)
            filterDeactivate('type')
            break
          }
          filterActivate('type')
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
 * Append a p element with an error message
 * to the product wrapper if no products match the filter
 */
const noProductsFound = () => {
  const p = createP(
    'It looks as though we cant find anything to match your filters. Please try again.',
    'nothing-found'
  )
  appendProducts([p])
}

/**
 * Handles the events which occur when a user uses the
 * filter bar. All filters eventually refer to this function
 * it uses the context provided to get the current filter being changed
 * and the new values.
 *
 * It will update a hidden form field which stores all filter values.
 *
 * This allows for multiple filters to be applied
 */
function handleFilterChange() {
  const filter = { [this.name]: this.value }
  setCurrentFilters(filter)
  const filtersJSON = getFiltersAsJSON()
  const filteredProducts = getFilteredProducts(filtersJSON)
  const filteredProductElements = buildProducts(filteredProducts)

  return filteredProducts.length > 0
    ? appendProducts(filteredProductElements)
    : noProductsFound()
}

/**
 * Handles the event when a user changes the price filter
 */
function handlePriceChange() {
  const minInput = getPriceMinInput()
  const maxInput = getPriceMaxInput()
  const minInputNumb = getPriceMinInputNumb()
  const maxInputNumb = getPriceMaxInputNumb()

  const value = parseInt(this.value)
  let min = parseInt(minInput.value)
  let max = parseInt(maxInput.value)

  // Alter max price
  if (this.id.includes('priceMax')) {
    // Is it valid
    const isValid = value > min
    // if new max is not greater than current min max it one more than it
    if (!isValid) {
      maxInputNumb.value = min + 1
      maxInput.value = min + 1
      max = min + 1
    } else {
      maxInputNumb.value = value
      maxInput.value = value
      max = value
    }
  }

  // Alter max price
  if (this.id.includes('priceMin')) {
    // Is it valid
    const isValid = value < max
    // if new max is not greater than current min max it one more than it
    if (!isValid) {
      minInputNumb.value = max - 1
      minInput.value = max - 1
      min = max - 1
    } else {
      minInputNumb.value = value
      minInput.value = value
      min = value
    }
  }

  // Now that we have set our min max we can hit the same function as
  // the search filter and pass the context using call
  return handleFilterChange.call({ name: 'price', value: { min, max } })
}

/**
 * return an object containing the min and max price range from the passed objects
 * @param {array} products array of products
 */
const getMinMaxPricesFromProducts = (products) => {
  const prices = products.map((product) => parseFloat(product.price))
  return {
    max: Math.ceil(Math.max(...prices)),
    min: Math.floor(Math.min(...prices)),
  }
}

/**
 *
 * Set the values of the min and max price elements according the passed object
 * @param {object} minMaxPrices object containing min and max prices
 */
const setMinMaxPriceRange = (minMaxPrices) => {
  const priceMinInput = getPriceMinInput()
  const priceMaxInput = getPriceMaxInput()
  const priceMinInputNumb = getPriceMinInputNumb()
  const priceMaxInputNumb = getPriceMaxInputNumb()

  priceMaxInput.setAttribute('min', minMaxPrices.min)
  priceMinInput.setAttribute('min', minMaxPrices.min)

  priceMaxInput.setAttribute('max', minMaxPrices.max)
  priceMinInput.setAttribute('max', minMaxPrices.max)

  priceMaxInput.setAttribute('value', minMaxPrices.max)
  priceMinInput.setAttribute('value', minMaxPrices.min)

  priceMaxInputNumb.setAttribute('min', minMaxPrices.min)
  priceMinInputNumb.setAttribute('min', minMaxPrices.min)

  priceMaxInputNumb.setAttribute('max', minMaxPrices.max)
  priceMinInputNumb.setAttribute('max', minMaxPrices.max)

  priceMaxInputNumb.setAttribute('value', minMaxPrices.max)
  priceMinInputNumb.setAttribute('value', minMaxPrices.min)
}

/**
 * return an array of strings containing product types
 * @param {array} products array of products
 */
const getProductTypes = (products) => {
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
const formatForLabel = (word) => word.split(/-/g).join(' ')

/**
 * return an array of HTML option elements from the passed
 * array of product types
 * @param {array} productTypes an array of strings
 */
const createOptionElements = (productTypes) => {
  const defaultOption = document.createElement('option')
  defaultOption.value = 0
  defaultOption.textContent = 'filter type'

  const types = productTypes.map((pType) => {
    const option = document.createElement('option')
    const formattedLabel = formatForLabel(pType)
    option.value = pType
    option.textContent = formattedLabel
    return option
  })
  return [defaultOption, ...types]
}

/**
 * Build a select element with options corresponding to the
 * passed array of strings.
 *
 * append the resulting select element to the wrapper from getTypeFilterContainer
 * @param {array} productTypes array of strings
 */
const buildProductTypesFilter = (productTypes) => {
  const wrapper = getTypeFilterContainer()
  const select = document.createElement('select')
  const options = createOptionElements(productTypes)

  select.name = 'type'
  select.id = 'productTypes'

  select.append(...options)
  wrapper.appendChild(select)
}

/**
 *
 */
function filterFormToggle() {
  const associatedInput = document.querySelector(
    `#${this.getAttribute('aria-controls')}`
  )
  const activeButton = document.querySelector('[active-button]')
  const openFilter = document.querySelector('[open-filter]')
  const filterContainer = getFilterContainer()

  if (this.hasAttribute('active-button')) {
    closeForm()
    this.blur()
  }

  if (activeButton) {
    activeButton.removeAttribute('active-button')
  }

  if (openFilter) {
    openFilter.removeAttribute('open-filter')
  }

  if (!this.hasAttribute('active-button')) {
    this.setAttribute('active-button', '')
    associatedInput.setAttribute('open-filter', '')
    filterContainer.setAttribute('open', '')
  }
}

/**
 * Remove the active filter attribute from the filter type provided
 *
 * @param {string} toDeactivate filter to deactivate
 */
const filterDeactivate = (toDeactivate) => {
  let elem
  switch (toDeactivate) {
    case 'type':
      elem = document.querySelector('#typeToggle')
      elem.removeAttribute('active-filter')
      break
    case 'price':
      elem = document.querySelector('#priceToggle')
      elem.removeAttribute('active-filter')
      break
    case 'search':
      elem = document.querySelector('#searchToggle')
      elem.removeAttribute('active-filter')
      break
    default:
      break
  }
}

/**
 * Add the active-filter attribute to the filter provided
 * @param {string} toDeactivate
 */
const filterActivate = (toActivate) => {
  let elem
  switch (toActivate) {
    case 'type':
      elem = document.querySelector('#typeToggle')
      elem.setAttribute('active-filter', '')
      break
    case 'price':
      elem = document.querySelector('#priceToggle')
      elem.setAttribute('active-filter', '')
      break
    case 'search':
      elem = document.querySelector('#searchToggle')
      elem.setAttribute('active-filter', '')
      break
    default:
      break
  }
}

/**
 * Close the filter form
 * @param {object} event js event object
 */
const closeForm = (event) => {
  event.preventDefault()
  const filterContainer = getFilterContainer()
  const activeButton = document.querySelector('[active-button]')
  const openFilter = document.querySelector('[open-filter]')
  openFilter.removeAttribute('open-filter')
  activeButton.removeAttribute('active-button')
  filterContainer.removeAttribute('open')
}
/**
 * Initialize the carousel on the load of the DOM
 */
document.addEventListener('DOMContentLoaded', () => {
  const products = buildProducts(data)
  const modalClose = getModalClose()
  const search = getSearchInput()
  const minMaxPrices = getMinMaxPricesFromProducts(data)
  const priceMinInput = getPriceMinInput()
  const priceMaxInput = getPriceMaxInput()
  const priceMinInputNumb = getPriceMinInputNumb()
  const priceMaxInputNumb = getPriceMaxInputNumb()
  const productTypes = getProductTypes(data)
  const filterToggleButtons = getFilterToggleButtons()
  const closeFilterFormButton = getCloseFilterFormButton()

  appendProducts(products)
  setMinMaxPriceRange(minMaxPrices)
  buildProductTypesFilter(productTypes)

  getProductTypesInput().addEventListener('change', handleFilterChange)

  search.addEventListener('change', handleFilterChange)
  search.addEventListener('input', handleFilterChange)
  search.addEventListener('keypress', handleFilterChange)

  priceMinInput.addEventListener('change', handlePriceChange)
  priceMaxInput.addEventListener('change', handlePriceChange)
  priceMinInputNumb.addEventListener('change', handlePriceChange)
  priceMaxInputNumb.addEventListener('change', handlePriceChange)

  modalClose.addEventListener('click', modalToggle)
  filterToggleButtons.forEach((btn) =>
    btn.addEventListener('click', filterFormToggle)
  )
  closeFilterFormButton.addEventListener('click', closeForm)
})
