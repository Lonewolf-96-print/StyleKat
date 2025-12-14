import React from 'react'
import {useParams,Link} from "react-router-dom"

const ShopDetails = () => {
  const shopId = useParams();
    return (
    <section className = "space-y-4">
        <h2 className = "text-2xl font-bold"> Shop #{shopId}</h2>
        <p className = "text-gray-600">Services,pricing,hours,live,queue....</p>
        <Link to ={`/booking/${shopId}`} className="inline-block px py-2 rouned-xl bg-black text-white">Book Now</Link>
    </section>
  )
}

export default ShopDetails
