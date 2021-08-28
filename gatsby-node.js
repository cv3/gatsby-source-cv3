// include code
const { customTypes } = require('./src/schema.js')
const { getData } = require('./src/api')

// schema
exports.createSchemaCustomization = ({ actions }) => {
  const { createTypes } = actions
  createTypes(customTypes)
}

// node creation
exports.sourceNodes = async (
  { actions, createContentDigest, createNodeId },
  pluginOptions
) => {
  const { createNode } = actions

  // fetch data from the api and return it in
  // a root object.
  const cv3data = await getData(
    { createContentDigest, createNodeId },
    pluginOptions
  )

  // create product nodes
  cv3data.products.forEach((product) => {
    node = {
      ...product,
      parent: null,
      children: [],
      internal: {
        type: 'CV3__Product',
        content: JSON.stringify(product),
        contentDigest: createContentDigest(product),
      },
    }
    createNode(node)
  })

  // create category nodes
  cv3data.categories.forEach((category) => {
    node = {
      ...category,
      parent: null,
      children: [],
      internal: {
        type: 'CV3__Category',
        content: JSON.stringify(category),
        contentDigest: createContentDigest(category),
      },
    }
    createNode(node)
  })

  return
}
