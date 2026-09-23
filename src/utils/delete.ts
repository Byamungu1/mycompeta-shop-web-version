import { router } from "@/router";
import { Alert } from "@/components/common/ui";

  const handleDeleteProduct = async (executeDelete: (productId: string)=> 
    Promise<{success: string, data: any | null } 
  | {success: boolean, error?: any}>, refetchData: ()=>void, productId: string, back?: boolean) => {
        // 1. Double check security confirmation step for destructive mobile actions
        Alert.alert(
            "Delete Product",
            "Are you sure you want to permanently delete this product? This action cannot be undone.",
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Delete",
                    style: "destructive",
                    onPress: async () => {
                        // 🚀 Debug Log: User confirmed deletion action
                        console.log(`🚀 [Frontend Screen] Starting delete sequence for ID: ${productId}`);

                        const result = await executeDelete(productId);
                        refetchData()
                        console.log('the result success stastud', result)

                        if (result.success) {
                            // 🏁 Debug Log: Successful UI teardown phase
                            console.log('🏁 [Frontend Screen] Product removed successfully. Navigating back.');
                            if (back)  router.back();    
                        } else {
                            // ❌ Debug Log: UI execution error barrier caught
                            console.error('💥 [Frontend Screen] Failed to complete removal action:', result.error);
                            Alert.alert("Error", result.error || "Could not delete product.");
                        }
                    }
                }
            ]
        );
    };

    export default handleDeleteProduct
