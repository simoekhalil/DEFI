#!/usr/bin/env python3
"""
Bidirectional Trading Bot - GALA <-> GWBTC (TEST1 Environment)
Executes continuous round-trip trades:
- GALA -> GWBTC
- GWBTC -> GALA
Environment: test1
"""

import os
import subprocess
import time
import logging
from typing import Tuple, Optional
from datetime import datetime

# Get script directory and ensure logs directory exists there
SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
LOGS_DIR = os.path.join(SCRIPT_DIR, 'logs')
os.makedirs(LOGS_DIR, exist_ok=True)

# Configure logging
logging.basicConfig(
    level=logging.WARNING,
    format='%(asctime)s - %(message)s',
    handlers=[
        logging.FileHandler(os.path.join(LOGS_DIR, 'gala_gwbtc_bot.log')),
        logging.StreamHandler()
    ]
)

logger = logging.getLogger('gala_gwbtc_bot')

class GalaGwbtcBot:
    def __init__(self):
        print("Initializing GalaGwbtcBot...")
        # TEST1 ENVIRONMENT CREDENTIALS
        self.wallet_private_key = os.environ.get("STAGING_WALLET_PRIVATE_KEY", 
                                                  "0x4ab34585b43439b62466a4d2a08a04563dcd6a6611511bd0e111f8ecf358f149")
        self.wallet_address = os.environ.get("STAGING_WALLET_ADDRESS", 
                                             "client|618ae395c1c653111d3315be")
        self.is_testnet = True  # TEST1 environment
        
        # POOL CONFIGURATION - BIDIRECTIONAL GALA <-> GWBTC
        # NOTE: Price ratio is ~101M GALA = 1 GWBTC, so need large GALA amounts
        self.pools = [
            {
                "name": "GALA->GWBTC",
                "token_in": "GALA",
                "token_out": "GWBTC",
                "token_in_full": "GALA|Unit|none|none",
                "token_out_full": "GWBTC|Unit|none|none",
                "fee_tier": 10000,  # 1% fee tier
                "trade_amount": 100000.0  # Trade with 100,000 GALA (~0.001 GWBTC output)
            },
            {
                "name": "GWBTC->GALA",
                "token_in": "GWBTC",
                "token_out": "GALA",
                "token_in_full": "GWBTC|Unit|none|none",
                "token_out_full": "GALA|Unit|none|none",
                "fee_tier": 10000,  # 1% fee tier
                "trade_amount": 0.001  # Trade with 0.001 GWBTC (~100,000 GALA output)
            }
        ]
        self.current_pool_idx = 0
        
        # TRADING PARAMETERS
        self.base_trade_amount = float(os.getenv('BASE_TRADE_AMOUNT', '1.0'))
        self.max_cycles = int(os.getenv('MAX_CYCLES', '999999'))
        self.cycle_delay = float(os.getenv('CYCLE_DELAY', '10'))  # 10 second delay
        
        # Performance tracking
        self.start_time = datetime.now()
        self.total_trades = 0
        self.successful_trades = 0
        # Track balances per token
        self.balances = {
            "GALA": 100000.0,  # Starting GALA
            "GWBTC": 0.001     # Starting GWBTC
        }
        self.initial_balances = self.balances.copy()
        
        logger.warning(f"[ROCKET] Bidirectional Trading Bot initialized")
        logger.warning(f"[GLOBE] Pools: {len(self.pools)} trades configured (GALA <-> GWBTC)")
        for pool in self.pools:
            fee_pct = pool['fee_tier'] / 10000  # Convert to decimal percentage (3000 -> 0.3%)
            logger.warning(f"  - {pool['name']} (fee: {fee_pct:.2f}%, amount: {pool['trade_amount']} {pool['token_in']})")
        logger.warning(f"[WALLET] Wallet: {self.wallet_address}")

    def _execute_swap(self, token_in_full: str, token_out_full: str, amount: str, 
                     token_in_name: str, token_out_name: str, fee_tier: int) -> Tuple[bool, Optional[str], Optional[str]]:
        """Execute a single swap"""
        # Let SDK handle amount conversion - pass as string directly
        amount_float = float(amount)
        amount_str = str(amount_float)  # Human-readable amount
        # Try different formats
        amount_in_smallest_unit_8dec = str(int(amount_float * 100000000))  # 8 decimals
        amount_in_smallest_unit_18dec = str(int(amount_float * 1000000000000000000))  # 18 decimals (like ETH)
        
        # Configure test1 environment URLs
        staging_config = f"""
            walletAddress: '{self.wallet_address}',
            gatewayBaseUrl: 'https://galachain-gateway-chain-platform-stage-chain-platform-eks.stage.galachain.com',
            bundlerBaseUrl: 'https://bundle-backend-test1.defi.gala.com',
            dexBackendBaseUrl: 'https://dex-backend-test1.defi.gala.com',
            """
        
        script_content = f"""
const {{ GSwap, PrivateKeySigner }} = require('@gala-chain/gswap-sdk');
const axios = require('axios');

async function waitForTransaction(txId, maxAttempts = 10) {{
    for (let i = 0; i < maxAttempts; i++) {{
        try {{
            const response = await axios.get(
                `https://dex-backend-test1.defi.gala.com/api/transactions/${{txId}}`
            );
            console.error(`DEBUG: Attempt ${{i+1}}, TX Status:`, JSON.stringify(response.data));
            if (response.data && response.data.status) {{
                return response.data.status;
            }}
        }} catch (e) {{
            console.error(`DEBUG: Error checking tx status:`, e.message);
        }}
        await new Promise(r => setTimeout(r, 1000)); // Wait 1 second
    }}
    return 'timeout';
}}

(async () => {{
    try {{
        const signer = new PrivateKeySigner('{self.wallet_private_key}');
        const gSwap = new GSwap({{ 
            signer,
            {staging_config}
        }});
        // Try with human-readable amount string
        console.error("DEBUG: Attempting quote with amount:", "{amount_str}");
        const quote = await gSwap.quoting.quoteExactInput(
            "{token_in_full}",
            "{token_out_full}",
            "{amount_str}"
        );
        console.error("DEBUG: Quote completed. Raw output:", quote.outTokenAmount.toString());
        console.error("DEBUG: Attempting swap with amount:", "{amount_str}");
        const tx = await gSwap.swaps.swap(
            "{token_in_full}",
            "{token_out_full}",
            {fee_tier},
            {{
                exactIn: "{amount_str}",
                amountOutMinimum: quote.outTokenAmount.multipliedBy(0.95)
            }},
            '{self.wallet_address}'
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
    }} catch (error) {{
        console.log("ERROR");
        console.log(error.message);
        console.error("DEBUG: Full error:", error.stack);
    }}
}})();
"""
        
        script_filename = f"temp_gala_gwbtc_swap_{int(time.time()*1000000)}.js"
        try:
            with open(script_filename, "w") as f:
                f.write(script_content)
            
            result = subprocess.run(
                ["node", script_filename],
                capture_output=True,
                text=True,
                timeout=30
            )
            
            # Log debug info from stderr
            if result.stderr:
                logger.warning(f"   [DEBUG OUTPUT]:")
                for line in result.stderr.strip().split('\n'):
                    logger.warning(f"   {line}")
            
            if result.returncode == 0 and "ERROR" not in result.stdout:
                lines = result.stdout.strip().split('\n')
                if len(lines) >= 2:
                    amount_out_raw = lines[0]
                    tx_id = lines[1]
                    tx_status = lines[2] if len(lines) >= 3 else 'unknown'
                    logger.warning(f"   [STATUS] Transaction status: {tx_status}")
                    # Convert raw amount - try as-is first
                    try:
                        amount_out = str(float(amount_out_raw))
                        logger.warning(f"   [AMOUNT] Raw: {amount_out_raw}, Parsed: {amount_out}")
                    except:
                        amount_out = amount_out_raw
                    return (True, amount_out, tx_id)
            
            # Log error if available
            if "ERROR" in result.stdout:
                error_lines = result.stdout.strip().split('\n')
                if len(error_lines) > 1:
                    logger.warning(f"   Swap error: {error_lines[1]}")
            
            return (False, None, None)
        except Exception as e:
            logger.warning(f"   Exception: {str(e)}")
            return (False, None, None)
        finally:
            if os.path.exists(script_filename):
                try:
                    os.remove(script_filename)
                except:
                    pass

    def run_cycles(self):
        """Run bidirectional trading cycles - GALA <-> GWBTC"""
        logger.warning(f"[ROCKET] BOT STARTING - Cycle delay: {self.cycle_delay}s")
        logger.warning(f"[CYCLE] Strategy: Bidirectional trading GALA <-> GWBTC")
        
        cycle_count = 0
        
        try:
            while cycle_count < self.max_cycles:
                cycle_count += 1
                
                # Get current pool
                pool = self.pools[self.current_pool_idx]
                
                # Execute trade
                token_in = pool["token_in"]
                token_out = pool["token_out"]
                amount_in = pool["trade_amount"]
                
                logger.warning(f"\n[CYCLE] Cycle {cycle_count} | {pool['name']} | {amount_in} {token_in} -> {token_out}")
                success, amount_out, tx_id = self._execute_swap(
                    pool["token_in_full"], pool["token_out_full"], 
                    str(amount_in), token_in, token_out, pool["fee_tier"]
                )
                
                if success and amount_out:
                    amount_received = float(amount_out)
                    self.successful_trades += 1
                    
                    logger.warning(f"   [CHECK] Success: {amount_in} {token_in} -> {amount_received} {token_out}")
                    logger.warning(f"   [CLIPBOARD] TX: {tx_id}")
                    
                    # Update the next pool's trade amount based on what we received
                    next_pool_idx = (self.current_pool_idx + 1) % len(self.pools)
                    self.pools[next_pool_idx]["trade_amount"] = amount_received
                    logger.warning(f"   [ARROWS] Next trade will use {amount_received} {token_out}")
                    
                    # Move to next pool after successful trade
                    self.current_pool_idx = next_pool_idx
                else:
                    logger.warning(f"   [X] Failed to swap {token_in} -> {token_out}")
                    # Keep same pool to retry
                
                self.total_trades += 1
                
                # Status every 10 cycles
                if cycle_count % 10 == 0:
                    elapsed = (datetime.now() - self.start_time).total_seconds()
                    rate = cycle_count / elapsed if elapsed > 0 else 0
                    logger.warning(f"\n[BAR_CHART] STATUS: {cycle_count} cycles | {self.successful_trades} success | {rate:.2f} cycles/sec")
                
                # Delay between cycles
                if self.cycle_delay > 0:
                    time.sleep(self.cycle_delay)
                    
        except KeyboardInterrupt:
            logger.warning("\n[STOP] Stopped by user")
        finally:
            elapsed = (datetime.now() - self.start_time).total_seconds()
            logger.warning(f"\n[FLAG] FINAL: {cycle_count} cycles in {elapsed:.1f}s | {self.successful_trades} successful trades")

def main():
    try:
        print("Starting GALA <-> GWBTC trading bot...")
        bot = GalaGwbtcBot()
        bot.run_cycles()
    except Exception as e:
        print(f"FATAL ERROR: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    main()
