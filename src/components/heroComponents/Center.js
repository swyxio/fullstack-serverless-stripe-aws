import React from "react"
import { Button } from "../"
import { navigate } from "gatsby"

function formatNum({ number, currency }) {
  const locale = typeof window !== "undefined" ? "en-US" : navigator.language
  const result = new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
  }).format((number / 100).toFixed(2))
  return result
}
const Center = ({ price, title, link }) => {
  function navigateTo() {
    navigate(link)
  }

  return (
    <div>
      <p className="text-4xl xl:text-5xl font-bold tracking-widest leading-none">
        {title}
      </p>
      <p>
        FROM <span>{formatNum({ currency: "USD", number: price })}</span>
      </p>
      <Button onClick={navigateTo} title="Shop Now" />
    </div>
  )
}

export default Center
