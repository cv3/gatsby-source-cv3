const camelcaseKeys = require('camelcase-keys')

const { doAuth } = require('./auth')
const { getProducts } = require('./getProducts')
const { getCategories } = require('./getCategories')

exports.getData = async ({ createNodeId }, pluginOptions) => {
  // create a root object to hold all the JSON data. We don't
  // create any GraphQL nodes here, we simply collect all the
  // data into this root object. During collection we can
  // clean and rearrange the data as needed.
  //
  // Of particular note are ID fields. We move all CV3 IDs into
  // 'cv3ID' fiels so that we can use 'id' fields for Gatsby
  // generated unique node ids. We create the Gatsby ids from
  // the cv3ID values. This is important for cross linking
  // products and categories, nesting categories, related
  // products, related categories, etc.
  var rootObj = {}
  rootObj.products = []
  rootObj.categories = []

  // get product data from the CV3 REST API
  var scope = 'products'
  const token_products = await doAuth({ pluginOptions, scope })
  const api_products = await getProducts({ token_products })

  // get category data from the CV3 REST API
  scope = 'categories'
  const token_categories = await doAuth({ pluginOptions, scope })
  const api_categories = await getCategories({ token_categories })

  // Loop through all the products returned, snakeCase the field
  // names, clean things up and (most importantly) create all the
  // necessary Gatsby Node IDs required for cross-linking nodes.
  api_products.data.exportProducts.products.forEach((rawProduct) => {
    var product = camelcaseKeys(rawProduct, { deep: true })

    // clean up subProducts
    newSubPs = []
    if ('subProducts' in product) {
      product.subProducts.subProducts.forEach((subP) => {
        var newSubP = {
          ...subP,
          cv3ID: subP.prodId,
          imageLink: subP.image.link,
        }
        newSubPs.push(newSubP)
      })
      product.subProducts.subProducts = newSubPs
    }

    // create Gatsby node ids for the product's categories
    var catIds = []
    product.categories.categoryIds.map(function (e) {
      nid = createNodeId(`category-${e}`)
      catIds.push(nid)
    })

    // build our final product object
    var productObj = {
      ...product,
      id: createNodeId(`product-${product.prodId}`),
      cv3ID: product.prodId,
      categories: catIds,
      categoryIDs: catIds, // will consumers want this array?
    }

    // add product to root object
    rootObj.products.push(productObj)
  })

  // Loop through categories to do the same things we did above
  // for products. It's a bit more complicated because categories
  // are nested to some unknown degree. So we run everything through
  // a recursive function, passing in the category and a parent.
  // For top-level categories we need a null parent object.
  var topLevelParent = {
    parentID: null,
    id: null,
    name: null,
  }

  // for each top-level category, call the function with our
  // null parent object. SubCategories are embedded in the top-level
  // category objects, so if there are any, they'll trigger calls
  // to the same function.
  api_categories.data.exportCategories.forEach((category) => {
    recursiveCategories(category, topLevelParent)
  })

  // recursiveCategories() is a function that will continue to create
  // category objects as deep as they may go.
  function recursiveCategories(category, parentNode) {
    // we only snakeCase one level at a time instead of all of them at once
    category = camelcaseKeys(category)

    // if parent, get the id
    parentNodeID = null
    if (parentNode.id != null) {
      parentNodeID = parentNode.id
    }

    // create Gatsby ids for any subcategories
    subCatIDs = []
    if ('subCategories' in category) {
      category.subCategories.forEach((subCat) => {
        scid = createNodeId(`category-${subCat.id}`)
        subCatIDs.push(scid)
      })
    }

    // get Gasby IDs for all products in this
    // category. Unfortunately, we have SKUs, not
    // the internal CV3 IDs we need to create the right
    // Gatsby IDs, so we need to match on the products
    // we already added above to the rootObject.
    catProdIDs = []
    category.products.skus.forEach((sku) => {
      rootObj.products.forEach((product) => {
        if (sku == product.sku) {
          nid = product.id
          catProdIDs.push(nid)
        }
      })
    })

    // same with featured products
    featuredProdIDs = []
    category.featuredProducts.skus.forEach((sku) => {
      rootObj.products.forEach((product) => {
        if (sku == product.sku) {
          nid = product.id
          featuredProdIDs.push(nid)
        }
      })
    })

    // custom fields is a large object from the api, returning
    // here as a simple array. Need to test ease of use vs. schema
    customFields = []
    if ('customFields' in category) {
      for (let [key, value] of Object.entries(category.customFields)) {
        customFields.push(value)
      }
    }

    // create Gatsby IDs for linking relatedCategories
    relCats = []
    if ('relatedCategories' in category) {
      category.relatedCategories.forEach((catId) => {
        rcid = createNodeId(`category-${catId}`)
        relCats.push(rcid)
      })
    }

    // build our final category object
    nodeID = createNodeId(`category-${category.id}`)

    var obj = {
      ...category,
      id: nodeID,
      cv3ID: category.id,
      name: category.name,
      parentID: parentNodeID,
      productIDs: catProdIDs,
      products: catProdIDs,
      featuredProducts: featuredProdIDs,
      subCategories: subCatIDs,
      customFields: customFields,
      relatedCategories: relCats,
      internal: {
        type: 'Category',
      },
    }

    // add to our root object
    rootObj.categories.push(obj)

    // if we have more subcategories, recurse
    if ('subCategories' in category) {
      category.subCategories.forEach((subCat) => {
        recursiveCategories(subCat, obj)
      })
    }
  }

  // finally, return our Root object with all the hard work done
  // so the calling code can easily create the nodes it wants.
  return rootObj
}
