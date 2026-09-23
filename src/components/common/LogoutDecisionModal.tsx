import { LogOut } from "lucide-react"
import { Modal, TouchableOpacity } from "@/components/common/ui"


interface LogoutDecisionProps {
    showLogoutModal: boolean
    cancelLogout: ()=> void
    confirmLogout: ()=>void
}

const LogoutDecisionModal = ({showLogoutModal, cancelLogout, confirmLogout}: LogoutDecisionProps)=>{

    return(
        <Modal
    visible={showLogoutModal}
    transparent={true}
    animationType="fade"
    onRequestClose={cancelLogout}
>
    <div className="flex-1 bg-black/50 justify-center items-center px-4">
        <div className="bg-white rounded-lg p-6 w-full max-w-sm shadow-2xl">
            <div className="items-center mb-4">
                <div className="w-16 h-16 bg-market-100 rounded-full items-center justify-center mb-3">
                    <LogOut size={32} color="#DC2626" />
                </div>
                <p className="text-xl font-bold text-sand-900 text-center">
                    Are you sure you want to logout?
                </p>
                <p className="text-sm text-sand-600 text-center mt-2 leading-relaxed">
                    You will need to sign in again to access your account and orders.
                </p>
            </div>

            <div className="flex flex-col gap-3">
                <TouchableOpacity
                    onPress={confirmLogout}
                    className="bg-market-600 py-3 rounded-xl items-center"
                >
                    <p className="text-white font-semibold">Yes, Logout</p>
                </TouchableOpacity>
                <TouchableOpacity
                    onPress={cancelLogout}
                    className="bg-sand-200 py-3 rounded-xl items-center"
                >
                    <p className="text-sand-900 font-semibold">Cancel</p>
                </TouchableOpacity>
            </div>
        </div>
    </div>
</Modal>
    )
}

export default LogoutDecisionModal