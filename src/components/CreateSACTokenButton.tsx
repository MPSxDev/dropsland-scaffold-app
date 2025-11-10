import React, { useState } from "react";
import { CreateTokenForm } from "./CreateTokenForm";
import { useWallet } from "../hooks/useWallet";
import factory from "../contracts/factory";
import { Asset } from "@stellar/stellar-sdk";
import { Button } from "./ui/button.tsx";

export const CreateFungibleTokenButton: React.FC = () => {
  const { address, signTransaction } = useWallet();
  const [showCreateTokenForm, setShowCreateTokenForm] = useState(false);
  const [isCreatingToken, setIsCreatingToken] = useState(false);
  const [tokenCreationError, setTokenCreationError] = useState<string | null>(
    null,
  );
  const [tokenCreationSuccess, setTokenCreationSuccess] = useState<{
    tokenAddress: string;
    transactionHash: string;
  } | null>(null);

  const handleCreateToken = async (assetCode: string) => {
    if (!address) {
      setTokenCreationError("Please connect your wallet first");
      return;
    }

    if (!signTransaction) {
      setTokenCreationError("Wallet signing is not available");
      return;
    }

    setIsCreatingToken(true);
    setTokenCreationError(null);
    setTokenCreationSuccess(null);

    try {
      // create token
      const asset = new Asset(assetCode, address);
      const xdrBytes = asset.toXDRObject().toXDR();

      // TODO! handle result
      await factory.deploy_sac({
        serialized_asset: xdrBytes,
        issuer: address,
      });

      setTimeout(() => {
        setShowCreateTokenForm(false);
        setTokenCreationSuccess(null);
      }, 2000);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to create token";
      setTokenCreationError(errorMessage);
      console.error("Error creating token:", error);
    } finally {
      setIsCreatingToken(false);
    }
  };

  return (
    <>
      <Button onClick={() => setShowCreateTokenForm(true)}>
        Create Your Token
      </Button>

      <CreateTokenForm
        visible={showCreateTokenForm}
        onClose={() => {
          setShowCreateTokenForm(false);
          setTokenCreationError(null);
          setTokenCreationSuccess(null);
        }}
        onSubmit={handleCreateToken}
        isSubmitting={isCreatingToken}
        error={tokenCreationError}
        success={tokenCreationSuccess}
      />
    </>
  );
};

export default CreateFungibleTokenButton;
