import { ConnectionProvider,WalletProvider } from "@solana/wallet-adapter-react";
import { WalletModalProvider } from "@solana/wallet-adapter-react-ui";
import { PhantomWalletAdapter, GlowWalletAdapter } from "@solana/wallet-adapter-wallets";
import { useMemo } from "react";

const WalletConnectionProvider=({children})=>{
    const endpoint=useMemo(()=>"https://api.devnet.solana.com",[]);
    const wallets=useMemo(()=>[new PhantomWalletAdapter(),new GlowWalletAdapter()],[]);
    return(
        <ConnectionProvider endpoint={endpoint}>
            <WalletProvider wallets={wallets} autoconnect>
                <WalletModalProvider>
                    {children}
                </WalletModalProvider>
            </WalletProvider>
        </ConnectionProvider>
    )
}

export default WalletConnectionProvider;
