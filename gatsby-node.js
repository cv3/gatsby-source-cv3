var axios = require('axios')
var qs = require('qs')

exports.onPreInit = () => console.log("Loaded gatsby-source-cv3")

exports.sourceNodes = async ({
  actions,
  createContentDigest,
  createNodeId,
  getNodesByType,
  },
  pluginOptions
) => {
  const { createNode } = actions
 
  // Step One: Use OAuth to get a token for use with the API endpoint
  // TODO: Runs every time, change to only run if we don't already have
  //       a good one, they are good for one hour.
  let auth_result;
  try {
    auth_result = await axios.request({
      baseURL: "https://service.commercev3.com/rest",
      url: "oauth2/token",
      method: "post",
      headers: { 
        "Content-Type": "application/x-www-form-urlencoded",
      },
      auth: {
        username: pluginOptions.rest_key,
        password: pluginOptions.rest_secret
      },
      data: qs.stringify({
        grant_type: "client_credentials",
        scope: "products"
      })
    });
  } catch (err) {
    console.log("JS ERROR")
    console.log(err)
  }
 
  let bearer_token = auth_result.data.oauth2.access_token
  console.log("CV3 OAuth Token generated.")


  // Step Two: Now that we have a token, let loose with the API pulls!
  try {
    api_result = await axios.request({
      baseURL: "https://service.commercev3.com/rest",
      url: "products",
      method: "post",
      headers: { 
        "Authorization": "Bearer " + bearer_token
      },
      data: {
        data: {
          exportProducts:{
            export_by_range:{
              start:1,
              end:10000,
              limit:1000
            }
        }
        }
      }
    });
  } catch (err) {
    console.log("CV3 ERROR")
    console.log(err)
  }

  console.log("CV3 Products retrieved.")

  // Step Three: Loop through and create the Gatsby nodes...
  api_result.data.exportProducts.products.forEach(product =>
    createNode({
      ...product,
      id: createNodeId(`Product-${product.prod_id}`),
      parent: null,
      children: [],
      internal: {
        type: "Product",
        content: JSON.stringify(product),
        contentDigest: createContentDigest(product),
      },
    })
  )

  return
}