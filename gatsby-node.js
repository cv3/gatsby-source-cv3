var axios = require('axios')
var qs = require('qs')

// include code
const { doAuth } = require('./src/auth')
const { getProducts } = require('./src/getProducts')
const { getCategories } = require('./src/getCategories')

// print loading
exports.onPreInit = () => console.log('Loaded gatsby-source-cv3')

exports.sourceNodes = async (
  { actions, createContentDigest, createNodeId, getNodesByType },
  pluginOptions
) => {
  const { createNode } = actions

  // products
  var scope = 'products'
  const token_products = await doAuth({ pluginOptions, scope })
  const api_products = await getProducts({ token_products })
  console.log('CV3 Products retrieved.')

  // categories
  scope = 'categories'
  const token_categories = await doAuth({ pluginOptions, scope })
  const api_categories = await getCategories({ token_categories })
  console.log('CV3 Categories retrieved.')

  // create product nodes
  api_products.data.exportProducts.products.forEach((product) =>
    createNode({
      ...product,
      id: createNodeId(`Product-${product.prod_id}`),
      parent: null,
      children: [],
      internal: {
        type: 'CV3Product',
        content: JSON.stringify(product),
        contentDigest: createContentDigest(product),
      },
    })
  )

  // create category nodes
  api_categories.data.exportCategories.forEach((category) =>
    createNode({
      ...category,
      id: createNodeId(`Category-${category.id}`),
      parent: null,
      children: [],
      internal: {
        type: 'CV3Category',
        content: JSON.stringify(category),
        contentDigest: createContentDigest(category),
      },
    })
  )

  return
}
