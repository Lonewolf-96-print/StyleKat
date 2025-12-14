import User from "../model/User.model.js"
import Shop from "../model/SHop.model.js"
export const createShop = async(req,res) =>{
    try{
    const ownerId = req.user.sub;
    const data = req.body()
    const shop = await Shop.create({data:{...data,ownerId}})
    res.json(shop);
}catch(error){
    console.error("Error in createshop controller ",error.message)
}

}

