const camelcaseKeys = require('camelcase-keys')

const { doAuth } = require('./auth')
const { getProducts } = require('./getProducts')
const { getCategories } = require('./getCategories')

exports.getData = async (
  { createContentDigest, createNodeId },
  pluginOptions
) => {
  // set up root object
  var rootObj = {}
  rootObj.products = []
  rootObj.categories = []

  // products
  var scope = 'products'
  const token_products = await doAuth({ pluginOptions, scope }) // auth
  const api_products = await getProducts({ token_products })

  // categories
  scope = 'categories'
  const token_categories = await doAuth({ pluginOptions, scope })
  const api_categories = await getCategories({ token_categories })

  // Add Product Nodes
  api_products.data.exportProducts.products.forEach((rawProduct) => {
    // snakeCase this node
    var product = camelcaseKeys(rawProduct, { deep: true })

    // clean up sub-products
    newSubPs = []
    if ('subProducts.subProducts' in product) {
      product.subProducts.subProducts.forEach((subP) => {
        var newSubP = {
          ...subP,
          cv3ID: subP.prodId,
          imageLink: subP.image.link,
        }
        newSubPs.push(newSubP)
      })
      product.subProducts.subProducts = {}
      product.subProducts.subProducts = newSubPs
    }

    // create schema
    var catIds = []
    product.categories.categoryIds.map(function (e) {
      nid = createNodeId(`category-${e}`)
      catIds.push(nid)
    })
    var productObj = {
      ...product,
      id: createNodeId(`product-${product.prodId}`),
      cv3ID: product.prodId,
      sku: product.sku,
      name: product.name,
      categoryIDs: catIds,
      categories: catIds,
    }

    // add product to root object
    rootObj.products.push(productObj)
  })

  // add category nodes
  var catObj = {
    parentID: null,
    id: null,
    name: null,
  }
  api_categories.data.exportCategories.forEach((category) => {
    recursiveCategories(category, catObj) // call recursive categories function
  })

  // recursiveCategories() is a recursive function
  // that will continue to create category nodes
  // as deep as they may go.
  function recursiveCategories(category, parentNode) {
    // snakeCase this node
    category = camelcaseKeys(category)

    // if parent, get the id
    parentNodeID = null
    if (parentNode.id != null) {
      parentNodeID = parentNode.id
    }

    // create ids for any subcategories
    subCatIDs = []
    if ('subCategories' in category) {
      category.subCategories.forEach((subCat) => {
        scid = createNodeId(`category-${subCat.id}`)
        subCatIDs.push(scid)
      })
    }

    // make the products array
    catProdIDs = []
    category.products.skus.forEach((sku) => {
      rootObj.products.forEach((product) => {
        if (sku == product.sku) {
          nid = product.id
          catProdIDs.push(nid)
        }
      })
    })

    // make the featured products array
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

    relCats = []
    if ('relatedCategories' in category) {
      category.relatedCategories.forEach((catId) => {
        rcid = createNodeId(`category-${catId}`)
        relCats.push(rcid)
      })
    }

    // create node data
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

    // create node

    rootObj.categories.push(obj)

    // if we have more subcategories, recurse
    if ('subCategories' in category) {
      category.subCategories.forEach((subCat) => {
        // new nodeMeta
        recursiveCategories(subCat, obj)
      })
    }
  }

  return rootObj
}
