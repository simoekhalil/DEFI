
const { GSwap, PrivateKeySigner } = require('@gala-chain/gswap-sdk');
const axios = require('axios');

async function waitForTransaction(txId, maxAttempts = 10) {
    for (let i = 0; i < maxAttempts; i++) {
        try {
            const response = await axios.get(
                `https://dex-backend-test1.defi.gala.com/api/transactions/${txId}`
            );
            console.error(`DEBUG: Attempt ${i+1}, TX Status:`, JSON.stringify(response.data));
            if (response.data && response.data.status) {
                return response.data.status;
            }
        } catch (e) {
            console.error(`DEBUG: Error checking tx status:`, e.message);
        }
        await new Promise(r => setTimeout(r, 1000)); // Wait 1 second
    }
    return 'timeout';
}

(async () => {
    try {
        const signer = new PrivateKeySigner('0x4ab34585b43439b62466a4d2a08a04563dcd6a6611511bd0e111f8ecf358f149');
        const gSwap = new GSwap({ 
            signer,
            
            walletAddress: 'client|618ae395c1c653111d3315be',
            gatewayBaseUrl: 'https://galachain-gateway-chain-platform-stage-chain-platform-eks.stage.galachain.com',
            bundlerBaseUrl: 'https://bundle-backend-test1.defi.gala.com',
            dexBackendBaseUrl: 'https://dex-backend-test1.defi.gala.com',
            
        });
        // Try with human-readable amount string
        console.error("DEBUG: Attempting quote with amount:", "1.00144837");
        const quote = await gSwap.quoting.quoteExactInput(
            "GALA|Unit|none|none",
            "GWBTC|Unit|none|none",
            "1.00144837"
        );
        console.error("DEBUG: Quote completed. Raw output:", quote.outTokenAmount.toString());
        console.error("DEBUG: Attempting swap with amount:", "1.00144837");
        const tx = await gSwap.swaps.swap(
            "GALA|Unit|none|none",
            "GWBTC|Unit|none|none",
            10000,
            {
                exactIn: "1.00144837",
                amountOutMinimum: quote.outTokenAmount.multipliedBy(0.95)
            },
            'client|618ae395c1c653111d3315be'
        );
        console.error("DEBUG: Swap returned, tx:", JSON.stringify(tx));
        console.error("DEBUG: Transaction ID:", tx.transactionId || 'no_id');
        
        // Wait for transaction confirmation
        const status = await waitForTransaction(tx.transactionId);
        console.error("DEBUG: Final transaction status:", status);
        
        // Return the quote amount as-is (SDK should handle units)
        console.log(quote.outTokenAmount.toString());
        console.log(tx.transactionId || 'no_id');
        console.log(status);
    } catch (error) {
        console.log("ERROR");
        console.log(error.message);
        console.error("DEBUG: Full error:", error.stack);
    }
})();
