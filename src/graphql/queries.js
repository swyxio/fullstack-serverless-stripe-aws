/* eslint-disable */
// this is an auto generated file. This will be overwritten

export const getProduct = /* GraphQL */ `
  query GetProduct($id: ID!) {
    getProduct(id: $id) {
      id
      categories
      price
      prices {
        id
        price
        currency
      }
      name
      image
      description
      currentInventory
      brand
      createdAt
      updatedAt
    }
  }
`;
export const listProducts = /* GraphQL */ `
  query ListProducts(
    $filter: ModelProductFilterInput
    $limit: Int
    $nextToken: String
  ) {
    listProducts(filter: $filter, limit: $limit, nextToken: $nextToken) {
      items {
        id
        categories
        price
        prices {
          id
          price
          currency
        }
        name
        image
        description
        currentInventory
        brand
        createdAt
        updatedAt
      }
      nextToken
    }
  }
`;
