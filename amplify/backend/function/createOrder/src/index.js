const axios = require("axios")
const gql = require("graphql-tag")
const graphql = require("graphql")
const { print } = graphql

const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY)

const listProducts = gql`
  query {
    listProducts {
      items {
        id
        categories
      }
    }
  }
`
exports.handler = async event => {
  if (!event.body || event.httpMethod !== "POST") {
    return {
      statusCode: 400,
      // headers,
      body: JSON.stringify({
        status: "invalid http method",
      }),
    }
  }
  const order = JSON.parse(event.body)
  console.log(order.items)
  let items = order.items
  try {
    const graphqlData = await axios({
      url: process.env.API_JAMSTACKECOMMERCE_GRAPHQLAPIENDPOINTOUTPUT,
      method: "post",
      headers: {
        "x-api-key": process.env.API_JAMSTACKECOMMERCE_GRAPHQLAPIKEYOUTPUT,
      },
      data: {
        query: print(listProducts),
      },
    })
    console.log({ data: graphqlData.data.data.listProducts })
    const products = graphqlData.data.data.listProducts.items
    if (!products) {
      return {
        statusCode: 500,
        body: "no products found",
      }
    }

    let totalAmount = 0
    let step = 0
    items = items.map(item => {
      const productInfo = products.find(prod => prod.id === item.id)
      if (productInfo) {
        console.log(
          { totalAmount, step: step++ },
          typeof productInfo.price,
          typeof item.quantity
        )
        totalAmount += Number(productInfo.price) * Number(item.quantity)
        // TODO: decrease inventory
      }
    })

    console.log(("final total", totalAmount))
    try {
      const intent = await stripe.paymentIntents.create({
        amount: 5000,
        currency: "usd", // TODO - PASS CURRENCY
        payment_method: order.payment_method_id,

        // A PaymentIntent can be confirmed some time after creation,
        // but here we want to confirm (collect payment) immediately.
        confirm: true,

        // If the payment requires any follow-up actions from the
        // customer, like two-factor authentication, Stripe will error
        // and you will need to prompt them for a new payment method.
        error_on_requires_action: true,
      })

      if (intent.status === "succeeded") {
        // This creates a new Customer and attaches the PaymentMethod in one API call.
        const customer = await stripe.customers.create({
          payment_method: intent.payment_method,
          email: order.email,
          address: order.address,
        })
        // Handle post-payment fulfillment
        console.log(
          `Created Payment: ${intent.id} for Customer: ${customer.id}`
        )

        // Now ship those goodies
        // TODO: await inventoryAPI.ship(order)
        // TODO create MUTATION call to graphql API
        // CREATE new Customer in AppSync

        return {
          statusCode: 200,
          body: JSON.stringify(customer), // TODO  - dont send cust details to client
          headers: {
            "Access-Control-Allow-Origin": "*",
          },
        }
      } else {
        // Any other status would be unexpected, so error
        console.log({ error: "Unexpected status " + intent.status })
        return {
          statusCode: 400,
          body: JSON.stringify(intent),
        }
      }
    } catch (e) {
      if (e.type === "StripeCardError") {
        // Display error to customer
        console.log({ error: e.message })
        return {
          statusCode: 400,
          body: JSON.stringify(e),
        }
      } else {
        // Something else happened
        console.log({ error: e.type })
        return {
          statusCode: 500,
          body: JSON.stringify(e),
        }
      }
    }
  } catch (err) {
    console.log("error posting to appsync: ", err)
    return {
      statusCode: 500,
      body: JSON.stringify(err),
    }
  }
}
