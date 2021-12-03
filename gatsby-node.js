// include code
const { customTypes } = require('./src/schema.js')
const { getData } = require('./src/api')
const { createRemoteFileNode } = require(`gatsby-source-filesystem`)

// called each time a node is created
exports.onCreateNode = async ({
  node, // the node that was just created
  actions: { createNode, createNodeField },
  createNodeId,
  getCache,
}) => {
  // console.log(JSON.stringify(node))
  if (node.internal.type === "CV3__Product") {
    console.log("onCreateNode createRemoteFileNode for images (Product): "+node.name)
    // console.log(JSON.stringify(node.images))
    const fileNode = await createRemoteFileNode({
      url: "https://s3.amazonaws.com/cdn.shopsavannah.net"+node.images.imageLinks[0].popup,
      parentNodeId: node.id,
      createNode,
      createNodeId,
      getCache,
    })
    if (fileNode) {
      createNodeField({ node, name: 'remoteImage', value: fileNode.id })
    }
  } else if ((node.internal.type === "CV3__Category") && (node.images)) {
    console.log("onCreateNode createRemoteFileNode for images (Category): "+node.name)
    // console.log(JSON.stringify(node.images))
    console.log(JSON.stringify(node))
    const fileNode = await createRemoteFileNode({
      url: "https://s3.amazonaws.com/cdn.shopsavannah.net"+node.images.image_links[0].link,
      parentNodeId: node.id,
      createNode,
      createNodeId,
      getCache,
    })
    if (fileNode) {
      createNodeField({ node, name: 'remoteImage', value: fileNode.id })
    }
  }
}

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