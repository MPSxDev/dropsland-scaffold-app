import React from "react";
import { useWallet } from "../hooks/useWallet";
import { useWalletBalance } from "../hooks/useWalletBalance";
import { connectWallet, type Balance } from "../util/wallet";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const isCreditAsset = (
  balance: Balance,
): balance is Balance & { asset_code: string; asset_issuer: string } => {
  return (
    balance.asset_type !== "native" &&
    balance.asset_type !== "liquidity_pool_shares" &&
    "asset_code" in balance &&
    "asset_issuer" in balance
  );
};

const Wallet: React.FC = () => {
  const { address, isPending } = useWallet();
  const { xlm, balances, isLoading, error } = useWalletBalance();
  const creditBalances = balances.filter(isCreditAsset);

  return (
    <div className="container space-y-8 px-4 py-10">
      <section className="space-y-2">
        <p className="text-sm font-semibold uppercase tracking-[0.3em] text-amber-300">
          Manage Assets
        </p>
        <h1 className="text-4xl font-bold text-white">Wallet</h1>
        <p className="text-muted-foreground">
          Check balances, review issued tokens, and understand what&apos;s
          inside your Dropsland wallet.
        </p>
      </section>

      {!address ? (
        <Card className="border-border/60 bg-background/70">
          <CardHeader>
            <CardTitle>Connect your wallet</CardTitle>
            <CardDescription>
              Hook up Freighter or any Stellar-compatible wallet to fetch
              balances and start interacting with Dropsland.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              type="button"
              onClick={() => void connectWallet()}
              disabled={isPending}
            >
              {isPending ? "Connecting..." : "Connect Wallet"}
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          <Card className="border-border/60 bg-background/70">
            <CardHeader>
              <CardTitle>Wallet connected</CardTitle>
              <CardDescription>
                Your Stellar account is live on Dropsland.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border border-border/50 bg-[#05080f] p-4 font-mono text-xs text-muted-foreground break-all">
                {address}
              </div>
            </CardContent>
          </Card>

          <div className="grid gap-6 lg:grid-cols-2">
            <Card className="border-border/60 bg-background/60">
              <CardHeader>
                <CardTitle>Balance</CardTitle>
                <CardDescription>
                  Live XLM balance + funding status.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm uppercase tracking-wide text-muted-foreground">
                    XLM
                  </p>
                  <p className="text-4xl font-bold text-white">
                    {isLoading ? "—" : `${xlm} XLM`}
                  </p>
                </div>
                {error ? (
                  <p className="text-sm text-red-400">{error.message}</p>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    {Number(xlm.replace(/,/g, "")) > 0
                      ? "Account funded"
                      : "Fund your account to deploy and interact."}
                  </p>
                )}
              </CardContent>
            </Card>

            <Card className="border-border/60 bg-background/60">
              <CardHeader>
                <CardTitle>Held tokens</CardTitle>
                <CardDescription>
                  Issued assets detected in this wallet.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {creditBalances.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    No tokens yet. Collect some artist assets to see them here.
                  </p>
                ) : (
                  creditBalances.map((balance) => (
                    <div
                      key={`${balance.asset_code}-${balance.asset_issuer}`}
                      className="rounded-lg border border-border/40 bg-background/40 p-3"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-base font-semibold text-white">
                            {balance.asset_code}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Issuer: {balance.asset_issuer.slice(0, 10)}...
                            {balance.asset_issuer.slice(-6)}
                          </p>
                        </div>
                        <span className="font-mono text-sm text-amber-200">
                          {balance.balance}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          </div>

          <Card className="border-border/60 bg-background/60">
            <CardHeader>
              <CardTitle>Owned NFTs</CardTitle>
              <CardDescription>
                Dropsland NFTs unlock IRL perks, early releases, and token-gated
                chats.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-muted-foreground">
              <p>
                No NFTs minted yet. Watch this space or explore drops to
                collect.
              </p>
              <ul className="list-disc space-y-1 pl-4">
                <li>Private listening parties & green room access.</li>
                <li>Token airdrops + allowlist fast tracks.</li>
                <li>Physical merch and IRL meetups.</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default Wallet;
