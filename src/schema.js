exports.customTypes = `
type CV3__Category implements Node @dontInfer {
  id: ID!
  parentCategory: CV3__Category @link
  cv3ID: Int
  name: String!
  subCategories: [CV3__Category] @link
  productIDs: [ID]
  products: [CV3__Product] @link
  featuredProducts: [CV3__Product] @link
  relatedCategories: [CV3__Category] @link
  invisible: Boolean!
  featured: Boolean!
  urlName: String
  description: String
  metaTitle: String
  metaDescription: String
  metaKeywords: String
  template: String
  numProdsPerPage: Int
  categoryPath: String!
  customFields: [String]
  images: CV3__CategoryImages
  remoteImages: [File] @link(from: "fields.remoteImages")
}

type CV3__Product implements Node @dontInfer {
  id: ID!
  cv3ID: Int
  sku: String!
  name: String!
  categoryIDs: [ID]
  categories: [CV3__Category] @link
  retailPrices: CV3__RetailPrices
  inactive: Boolean
  outOfSeason: Boolean
  textField: Boolean
  hidden: Boolean
  featured: Boolean
  new: Boolean
  comparable: Boolean
  googleCheckoutExempt: Boolean
  contentOnly: Boolean
  isDonation: Boolean
  kit: Boolean
  urlName: String
  description: String
  keywords: String
  brand: String
  manufacturer: String
  rating: Float
  images: CV3__ProductImages
  inventoryControl: CV3__Inventory
  quantityRestrictions: CV3__QuantityRestrictions
  weight: CV3__Weight
  recurringEligible: Boolean
  attributes: CV3__Attributes
  subProducts: CV3__SubProducts
  dateCreated: Date
  remoteImages: [File] @link(from: "fields.remoteImages")
  remoteSubProductImages: [File] @link(from: "fields.remoteSubProductImages")
}

type CV3__Attributes {
  active: Boolean
  titles: [CV3__AttributeTitles]
  attributes: [CV3__InnerAttributes]
}
type CV3__AttributeTitles {
  column: String
  title: String
}
type CV3__InnerAttributes {
  status: String
  isDonation: Boolean
  sku: String
  altId: String
  combination: CV3__AttributeCombination
  inventoryControl: CV3__Inventory
  retailPrices: CV3__RetailPrices
}

type CV3__AttributeCombination {
  values: [CV3__AttributeCombinations]
}
type CV3__AttributeCombinations {
  column: Int
  value: String
}

type CV3__SubProducts {
  active: Boolean
  subProducts: [CV3__SubProduct]
}
type CV3__SubProduct {
  inactive: Boolean
  outOfSeason: Boolean
  googleCheckoutExempt: Boolean
  isDonation: Boolean
  cv3ID: Int
  prodId: Int!
  sku: String!
  name: String!
  imageLink: String
  retailPrices: CV3__RetailPrices
  inventoryControl: CV3__Inventory
  quantityRestrictions: CV3__QuantityRestrictions
  weight: CV3__Weight
  recurringEligible: Boolean
  dateCreated: Date
}

type CV3__Weight {
  shipWeight: Float
  displayWeight: Float
  displayUnit: String
}

type CV3__QuantityRestrictions {
  allowFractionalQty: Boolean
  minimumQuantity: Int
  maximumQuantity: Int
  sellInSets: CV3__SellInSets
}

type CV3__SellInSets {
  quantityInSet: Int
  numIterationDisplayed: Int
}

type CV3__Inventory {
  ignoreBackorder: Boolean
  inventoryControlExempt: Boolean
  status: String
  inventory: Int
  outOfStockPoint: Int
  onOrder: Int
}

type CV3__CategoryImages {
  replace_existing: Boolean
  image_links: [CV3__CategoryImage]
}

type CV3__ProductImages {
  replaceExisting: Boolean
  imageLinks: [CV3__ProductImage]
}

type CV3__CategoryImage {
  link: String
  title: String
  rank: Int
}

type CV3__ProductImage {
  inactive: Boolean
  thumbnail: String
  large: String
  popup: String
  title: String
  imageType: String
  currentRank: Int
  link: String
}

type CV3__Special {
  ongoing: Boolean
  start: String
  stop: String
  text: String
  allowFree: Boolean
}
type CV3__RetailPrices {
  prices: [CV3__Prices]
  active: Boolean
  special: CV3__Special
}

type CV3__Prices {
  priceCategory: String
  standardPrice: Float
  specialPrice: Float
}
`
