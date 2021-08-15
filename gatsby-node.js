var axios = require('axios')
const camelcaseKeys = require('camelcase-keys')
var qs = require('qs')

// include code
const { doAuth } = require('./src/auth')
const { getSKUs, getProducts } = require('./src/getProducts')
const { getCategories } = require('./src/getCategories')

// if we don't have options, alert!
// exports.onPreInit = ({ pluginOptions }) =>
//   console.log('Loaded gatsby-source-cv3 with ' + pluginOptions.rest_key)

// Add types for missing fields that can't be inferred
// exports.createSchemaCustomization = ({ actions }) => {
//   const { createTypes } = actions
//   const typeDefs = `
//     type CV3ProductsRetailPricesPrices {
//       standardPrice: Float
//       specialPrice: Float
//     }

//     type CV3ProductsWeight {
//       shipWeight: Float
//       displayWeight: Float
//     }
//   `
//   createTypes(typeDefs)
// }

exports.onCreateNode = ({ node, actions, createNodeId }) => {
  const { createNode, createNodeField } = actions
  // Transform the new node here and create a new node or
  // create a new node field.
  console.log('creating node... ', node.internal.type)
  // const new_id = createNodeId('what-')
  // createNodeField({ node, name: 'id', value: new_id })
  // createNodeField({ node, name: 'blake', value: new_id })
}

exports.sourceNodes = async (
  { actions, createContentDigest, createNodeId, getNodesByType },
  pluginOptions
) => {
  const { createNode } = actions

  console.log('do we have options? ' + pluginOptions.rest_key)

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
  // let cv3all = new Map()
  // cv3all.set('products', api_products.data.exportProducts.products)
  // cv3all.set('categories', api_categories.data.exportCategories)

  let cv3all = [
    {
      name: 'commercev3Products',
      key: 'prodId',
      data: api_products.data.exportProducts.products,
    },
    {
      name: 'commercev3Categories',
      key: 'id',
      data: api_categories.data.exportCategories,
    },
  ]

  // now let's transform anything we need to before Gatsby gets it
  cv3all = camelcaseKeys(cv3all, { deep: true }) // change snake_case to camelCase

  // write out a top level element for all of CV3
  // const rootID = createNodeId('root')
  // fakeTop = {
  //   name: 'cv3test',
  //   description: 'this is a thing',
  // }

  // createNode({
  //   ...fakeTop,
  //   id: rootID,
  //   parent: null,
  //   children: [],
  //   internal: {
  //     type: 'commercev3',
  //     content: JSON.stringify(fakeTop),
  //     contentDigest: createContentDigest(fakeTop),
  //   },
  // })

  // add everything under this parent
  cv3all.forEach((cv3Type) =>
    cv3Type.data.forEach((object) =>
      createNode({
        ...object,
        id: createNodeId(object[cv3Type.key]),
        parent: null,
        children: [],
        internal: {
          type: cv3Type.name,
          content: JSON.stringify(object),
          contentDigest: createContentDigest(object),
        },
      })
    )
  )

  // now let's create individual elements for Products, Categoires, etc.
  // cv3all.products.forEach((product) =>
  //   createNode({
  //     ...product,
  //     id: createNodeId(`Product-${product.prodId}`),
  //     cv3Id: product.prodId,
  //     parent: `cv3-test-node-id-12345`,
  //     children: [],
  //     internal: {
  //       type: 'commercev3Products',
  //       content: JSON.stringify(product),
  //       contentDigest: createContentDigest(product),
  //     },
  //   })
  // )

  // cv3all.categories.forEach((category) =>
  //   createNode({
  //     ...category,
  //     id: createNodeId(`Category-${category.id}`),
  //     cv3Id: category.id,
  //     parent: `cv3-test-node-id-12345`,
  //     children: [],
  //     internal: {
  //       type: 'commercev3Categories',
  //       content: JSON.stringify(category),
  //       contentDigest: createContentDigest(category),
  //     },
  //   })
  // )

  return
}
