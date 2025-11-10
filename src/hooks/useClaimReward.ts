import { useCallback, useState } from "react";
import type { MethodOptions } from "@stellar/stellar-sdk/contract";
import { Client as DjNftClient } from "dj_nft";
import { toast } from "sonner";
import { networkPassphrase, rpcUrl } from "../contracts/util";
import { useWallet } from "./useWallet";

export function useClaimReward() {
  const { address, signTransaction } = useWallet();
  const [pendingRewardId, setPendingRewardId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const claim = useCallback(
    async (nftContractId: string, rewardId?: string) => {
      if (!address || !signTransaction) {
        const message = "Connect your wallet to claim rewards";
        setError(message);
        toast.error(message);
        return null;
      }

      setPendingRewardId(rewardId ?? nftContractId);
      setError(null);
      const toastId = toast.loading("Preparing claim transaction...");

      try {
        const client = new DjNftClient({
          contractId: nftContractId,
          networkPassphrase: String(networkPassphrase),
          rpcUrl,
          allowHttp: true,
        });

        const methodOptions: MethodOptions & {
          publicKey: string;
          address: string;
        } = {
          publicKey: address,
          address,
        };

        const tx = await client.award_item({ to: address }, methodOptions);

        const sentTx = await tx.signAndSend({
          signTransaction: (xdr, opts) =>
            signTransaction(xdr, {
              ...opts,
              address,
              networkPassphrase: String(networkPassphrase),
            }),
        });

        const hash = sentTx.sendTransactionResponse?.hash;

        toast.success("Reward claimed", {
          id: toastId,
          description: hash ? `Tx: ${hash.slice(0, 10)}…` : undefined,
        });

        return hash ?? null;
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Failed to submit transaction";
        setError(message);
        toast.error("Reward claim failed", {
          id: toastId,
          description: message,
        });
        return null;
      } finally {
        setPendingRewardId(null);
      }
    },
    [address, signTransaction],
  );

  return {
    claim,
    error,
    pendingRewardId,
    loading: pendingRewardId !== null,
  };
}
