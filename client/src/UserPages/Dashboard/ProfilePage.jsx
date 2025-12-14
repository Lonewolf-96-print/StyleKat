import { DashboardLayout } from "../../components/dashboard-layout"
import { UserProfile } from "../../components/user-profile"
import { useState } from "react"
import { motion } from "framer-motion"
import { Card } from "../../components/ui/card"
import { Button } from "../../components/ui/button"
import { Input } from "../../components/ui/input"
import { Label } from "../../components/ui/label"
import { Avatar, AvatarImage, AvatarFallback } from "../../components-barber/ui/avatar"
import { Upload } from "lucide-react"

// export default function ProfilePage() {
//   return (
//     <DashboardLayout>
//       <UserProfile />
//     </DashboardLayout>
//   )
// }

export default function ProfilePage() {
    return (
        // <DashboardLayout>
        <UserProfile />
        // </DashboardLayout>
    )
}