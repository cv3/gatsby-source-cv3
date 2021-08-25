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
  api_products.data.exportProducts.products.forEach((product) => {
    // create schema
    var catIds = []
    product.categories.category_ids.map(function (e) {
      nid = createNodeId(`category-${e}`)
      catIds.push(nid)
    })
    var productObj = {
      id: createNodeId(`product-${product.prod_id}`),
      sku: product.sku,
      name: product.name,
      categoryIDs: catIds,
      categories: catIds,
    }

    if (
      'includeRawAPI' in pluginOptions &&
      pluginOptions.includeRawAPI == true
    ) {
      productObj['raw'] = product
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

    // make the products array, it comes in as SKU numbers
    // but we need prod_id to match the Gatsby IDs.
    // TODO: this is crazy expensive I would think, because
    //       two loops through all products. Refactor!
    catProdIDs = []
    category.products.skus.forEach((sku) => {
      rootObj.products.forEach((product) => {
        if (sku == product.sku) {
          nid = product.id
          catProdIDs.push(nid)
        }
      })
    })

    // create node data
    nodeID = createNodeId(`category-${category.id}`)

    var obj = {
      id: nodeID,
      name: category.name,
      parentID: parentNodeID,
      productIDs: catProdIDs,
      products: catProdIDs,
      subCategories: subCatIDs,
      internal: {
        type: 'Category',
      },
    }

    if (
      'includeRawAPI' in pluginOptions &&
      pluginOptions.includeRawAPI == true
    ) {
      obj['raw'] = category
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
