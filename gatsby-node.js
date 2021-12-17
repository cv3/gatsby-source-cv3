// include code
const { customTypes } = require('./src/schema.js')
const { getData } = require('./src/api')
const { createRemoteFileNode } = require(`gatsby-source-filesystem`)
const CDNPath = "https://s3.amazonaws.com/cdn.shopsavannah.net"

// Logging
var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault")
var _reporter = _interopRequireDefault(require("gatsby-cli/lib/reporter"));

// called each time a node is created
exports.onCreateNode = async ({
  node, // the node that was just created
  actions: { createNode, createNodeField },
  createNodeId,
  getCache,
}) => {
  //_reporter.default.info(JSON.stringify(node));
  if (node.internal.type === "CV3__Product") {
    // _reporter.default.info(JSON.stringify(node));
    _reporter.default.info("onCreateNode asynchronously createRemoteFileNode for images (Product): "+node.name)
    // _reporter.default.info(JSON.stringify(node.images))
    // Loop through all product images and create keyed remoteImage nodes for main product images
    var keys = Object.keys(node.images.imageLinks);
    let fileNodes = [];
    for (var i=0; i<keys.length; i++) {
      // Prepend the CDN URL if needed (would be better to obtain this from a template tag out of store admin)
      var prependCDN = ""
      if (!node.images.imageLinks[keys[i]].popup.includes("://")) {
        prependCDN = CDNPath
      }
      _reporter.default.info("Creating gatsby main product image "+keys[i]+" for \""+node.name+"\": "+prependCDN + node.images.imageLinks[keys[i]].popup)
      const fileNode = await createRemoteFileNode({
        url: prependCDN + node.images.imageLinks[keys[i]].popup,
        parentNodeId: node.id,
        createNode,
        createNodeId,
        getCache,
      })
      if (fileNode) {
        fileNodes.push(fileNode.id)
      }
    }
    if (fileNodes.length > 0) {
      createNodeField({ node, name: 'remoteImages', value: fileNodes })
    }

    // Loop through all subproduct images and create keyed remoteImage nodes for main product images
    // Check that the subproduct exists
    if (typeof(node.subProducts) != "undefined") {
      var subprodkeys = Object.keys(node.subProducts.subProducts);
      let subproductFileNodes = [];
      for (var i=0; i<subprodkeys.length; i++) {
        // Prepend the CDN URL if needed (would be better to obtain this from a template tag out of store admin)
        var prependCDN = "";
        if (!node.subProducts.subProducts[subprodkeys[i]].imageLink.includes("://")) {
          prependCDN = CDNPath
        }
        _reporter.default.info("Creating gatsby subproduct image "+subprodkeys[i]+" for \""+node.name+" - "+node.subProducts.subProducts[subprodkeys[i]].name+"\": "+prependCDN + node.subProducts.subProducts[subprodkeys[i]].imageLink)
        const fileNode = await createRemoteFileNode({
          url: prependCDN + node.subProducts.subProducts[subprodkeys[i]].imageLink,
          parentNodeId: node.id,
          createNode,
          createNodeId,
          getCache,
        })
        if (fileNode) {
          subproductFileNodes.push(fileNode.id)
        }
      }
  
      if (subproductFileNodes.length > 0) {
        createNodeField({ node, name: 'remoteSubProductImages', value: subproductFileNodes })
      }
    }

  } else if ((node.internal.type === "CV3__Category") && (node.images)) {
    _reporter.default.info("onCreateNode createRemoteFileNode for images (Category): "+node.name)
    // Loop through all category images and create keyed remoteImage nodes
    var keys = Object.keys(node.images.image_links);
    let fileNodes = [];
    for (var i=0; i<keys.length; i++) {
      // Prepend the CDN URL if needed (would be better to obtain this from a template tag out of store admin)
      var prependCDN = ""
      if (!node.images.image_links[keys[i]].link.includes("://")) {
        prependCDN = CDNPath
      }
      _reporter.default.info("Creating gatsby category image "+keys[i]+" for \""+node.name+"\": "+prependCDN + node.images.image_links[keys[i]].link)
      const fileNode = await createRemoteFileNode({
        url: prependCDN + node.images.image_links[keys[i]].link,
        parentNodeId: node.id,
        createNode,
        createNodeId,
        getCache,
      })
      if (fileNode) {
        fileNodes.push(fileNode.id)
      }
    }
    if (fileNodes.length > 0) {
      createNodeField({ node, name: 'remoteImages', value: fileNodes })
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
