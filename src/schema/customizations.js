exports.customTypes = `
type CV3__Product implements Node {
  id: ID!
  sku: String!
  name: String!
  categoryIDs: [ID]
  categories: [CV3__Category] @link
}
type CV3__Category implements Node {
  id: ID!
  name: String!
  productIDs: [ID]
  products: [CV3__Product] @link
}`
