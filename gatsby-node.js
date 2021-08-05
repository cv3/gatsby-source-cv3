var axios = require('axios')
const camelcaseKeys = require('camelcase-keys')
var qs = require('qs')

// include code
const { doAuth } = require('./src/auth')
const { getSKUs, getProducts } = require('./src/getProducts')
const { getCategories } = require('./src/getCategories')

// print loading
exports.onPreInit = () => console.log('Loaded gatsby-source-cv3')

// Add types for missing fields that can't be inferred
exports.createSchemaCustomization = ({ actions }) => {
  const { createTypes } = actions
  const typeDefs = `
    type CV3ProductsRetailPricesPrices {
      standardPrice: Float
      specialPrice: Float
    }

    type CV3ProductsWeight {
      shipWeight: Float
      displayWeight: Float
    } 
  `
  createTypes(typeDefs)
}

exports.sourceNodes = async (
  { actions, createContentDigest, createNodeId, getNodesByType },
  pluginOptions
) => {
  const { createNode } = actions

  // products
  var scope = 'products'
  const token_products = await doAuth({ pluginOptions, scope }) // auth
  const all_product_skus = await getSKUs({ token_products }) // get skus

  // push all skus into an array
  let skus = []
  all_product_skus.data.exportProducts.products.forEach((product) => {
    skus.push(product.sku)
  })

  // query based on skus
  const api_products = await getProducts({ token_products, skus })
  console.log('CV3 Products retrieved.')

  // categories
  scope = 'categories'
  const token_categories = await doAuth({ pluginOptions, scope })
  const api_categories = await getCategories({ token_categories })
  console.log('CV3 Categories retrieved.')

  // first let's create one top CV3 element with everything in it
  let cv3all = {
    products: api_products.data.exportProducts.products,
    categories: api_categories.data.exportCategories,
  }

  createNode({
    ...cv3all,
    id: createNodeId(`commercev3`),
    parent: null,
    children: [],
    internal: {
      type: 'commercev3',
      content: JSON.stringify(cv3all),
      contentDigest: createContentDigest(cv3all),
    },
  })

  // now let's create individual elements for Products, Categoires, etc.
  api_products.data.exportProducts.products.forEach((product) => {
    product = camelcaseKeys(product, { deep: true })
    createNode({
      ...product,
      id: createNodeId(`Product-${product.prodId}`),
      parent: null,
      children: [],
      internal: {
        type: 'commercev3Products',
        content: JSON.stringify(product),
        contentDigest: createContentDigest(product),
      },
    })
  })

  api_categories.data.exportCategories.forEach((category) =>
    createNode({
      ...category,
      id: createNodeId(`Category-${category.id}`),
      categoryId: category.id,
      parent: null,
      children: [],
      internal: {
        type: 'commercev3Categories',
        content: JSON.stringify(category),
        contentDigest: createContentDigest(category),
      },
    })
  )

  return
}
