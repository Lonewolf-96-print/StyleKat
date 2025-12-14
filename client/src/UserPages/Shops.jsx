import React,{useState} from 'react'
import {Link,Navigate} from "react-router-dom"
import Booking from "../UserPages/Booking"
import axios from 'axios'
import { Search } from 'lucide-react'
const Shops = () => {
   const fetchData =() =>{
   
   
   }
    const [city,setCity] = useState("")
   const [data,setData] = useState('')
    const demoShops =[]
  return (
  <>
    <section className = "space-y-6">
        <div className="flex flex-col sm:flex-row items-center gap-3">
  <div className="relative w-full sm:max-w-md">
    <input
      className="w-full border rounded-xl pl-10 pr-10 py-2 focus:outline-none"
      placeholder="Search for city"
      value={city}
      onChange={(e) => setCity(e.target.value)}
    />
    {/* Left icon */}
    <Search
      size={20}
      className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500"
      onClick={
        fetchData()
      }
     
    />
  </div>
</div>

    </section>
  </>
  )
}


export default Shops
