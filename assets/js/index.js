import data from './data/testData.js'
import * as helpers from './modules/helpers.js'

/**
 * Either adds or removes the open attribute from the modal
 *
 * @param {boolean} openOrClose whether to open or close the modal
 */
const modalToggle = (openOrClose) => {
  const modal = helpers.getProductModal()
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
  const modal = helpers.getProductModal()
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
    const productElem = helpers.createProductWrapper(handleModalChange)
    const productThumb = helpers.createProductThumb(imageSrc, productTitle)
    const productDesc = helpers.createP(productTitle)

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
  const wrapper = helpers.getProductsWrapper()
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
 * Set the value of the hidden filter input used for filtering products
 *
 * @param {object} newFilter object of the new filter
 */
const setCurrentFilters = (newFilter) => {
  // Get the hidden input elem with the filter values
  const filterValueElem = helpers.getFiltersElem()
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
 * Append a p element with an error message
 * to the product wrapper if no products match the filter
 */
const noProductsFound = () => {
  const p = helpers.createP(
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
  const filtersJSON = helpers.getFiltersAsJSON()
  const filteredProducts = helpers.getFilteredProducts(filtersJSON)
  const filteredProductElements = buildProducts(filteredProducts)

  return filteredProducts.length > 0
    ? appendProducts(filteredProductElements)
    : noProductsFound()
}

/**
 * Handles the event when a user changes the price filter
 */
function handlePriceChange() {
  const minInput = helpers.getPriceMinInput()
  const maxInput = helpers.getPriceMaxInput()
  const minInputNumb = helpers.getPriceMinInputNumb()
  const maxInputNumb = helpers.getPriceMaxInputNumb()

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
 *
 * Set the values of the min and max price elements according the passed object
 * @param {object} minMaxPrices object containing min and max prices
 */
const setMinMaxPriceRange = (minMaxPrices) => {
  const priceMinInput = helpers.getPriceMinInput()
  const priceMaxInput = helpers.getPriceMaxInput()
  const priceMinInputNumb = helpers.getPriceMinInputNumb()
  const priceMaxInputNumb = helpers.getPriceMaxInputNumb()

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
  const wrapper = helpers.getTypeFilterContainer()
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
  const filterContainer = helpers.getFilterContainer()

  // This button is active so close the form
  if (this.hasAttribute('active-button')) {
    closeForm()
    this.blur()
    return
  }

  // A different button is active, close it
  if (activeButton) {
    activeButton.removeAttribute('active-button')
  }

  // Also remove the open-filter attr from it
  if (openFilter) {
    openFilter.removeAttribute('open-filter')
  }

  // Activate this filter button
  if (!this.hasAttribute('active-button')) {
    this.setAttribute('active-button', '')
    associatedInput.setAttribute('open-filter', '')
    filterContainer.setAttribute('open', '')
  }
}

/**
 * Close the filter form
 * @param {object} event js event object
 */
const closeForm = (event = null) => {
  // Ensure event exists before using it
  if (event) {
    event.preventDefault()
  }

  const filterContainer = helpers.getFilterContainer()
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
  // Set our variables and call elements we need
  const products = buildProducts(data)
  const modalClose = helpers.getModalClose()
  const search = helpers.getSearchInput()
  const minMaxPrices = helpers.getMinMaxPricesFromProducts(data)
  const priceMinInput = helpers.getPriceMinInput()
  const priceMaxInput = helpers.getPriceMaxInput()
  const priceMinInputNumb = helpers.getPriceMinInputNumb()
  const priceMaxInputNumb = helpers.getPriceMaxInputNumb()
  const productTypes = helpers.getProductTypes(data)
  const filterToggleButtons = helpers.getFilterToggleButtons()
  const closeFilterFormButton = helpers.getCloseFilterFormButton()

  // Append the newly created products array to the carousel wrapper
  appendProducts(products)

  // Set the initial min and max prices according to the min n max
  // in the products array
  setMinMaxPriceRange(minMaxPrices)

  // Build our select drop down for product types
  buildProductTypesFilter(productTypes)

  // Add listener to product type selector
  helpers.getProductTypesInput().addEventListener('change', handleFilterChange)

  // Add listeners to search filter
  search.addEventListener('change', handleFilterChange)
  search.addEventListener('input', handleFilterChange)
  search.addEventListener('keypress', handleFilterChange)

  // Add listeners to price filter
  priceMinInput.addEventListener('change', handlePriceChange)
  priceMaxInput.addEventListener('change', handlePriceChange)
  priceMinInputNumb.addEventListener('change', handlePriceChange)
  priceMaxInputNumb.addEventListener('change', handlePriceChange)

  // Add listener to modal
  modalClose.addEventListener('click', modalToggle)

  // Add listeners to filter open buttons
  filterToggleButtons.forEach((btn) =>
    btn.addEventListener('click', filterFormToggle)
  )

  // Add listener to close form button
  closeFilterFormButton.addEventListener('click', closeForm)

  // Set the --vh css var according to the current window height
  document.documentElement.style.setProperty(
    '--vh',
    `${window.innerHeight * 0.01}px`
  )
})
