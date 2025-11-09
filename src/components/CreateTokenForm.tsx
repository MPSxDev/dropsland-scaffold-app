import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog.tsx";
import { Button } from "./ui/button.tsx";
import { Input } from "./ui/input.tsx";
import { Label } from "./ui/label.tsx";

interface CreateTokenFormProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (assetCode: string) => void | Promise<void>;
  isSubmitting?: boolean;
  error?: string | null;
  success?: { tokenAddress: string; transactionHash: string } | null;
}

export const CreateTokenForm: React.FC<CreateTokenFormProps> = ({
  visible,
  onClose,
  onSubmit,
  isSubmitting: externalIsSubmitting = false,
  error: externalError = null,
  success: externalSuccess = null,
}) => {
  const [assetCode, setAssetCode] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Use external submitting state if provided, otherwise use internal state
  const isSubmittingFinal = externalIsSubmitting || isSubmitting;

  // Reset form when modal closes
  useEffect(() => {
    if (!visible) {
      setAssetCode("");
      setIsSubmitting(false);
    }
  }, [visible]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!assetCode.trim()) {
      return;
    }

    // If external submitting state is provided, don't manage internal state
    if (!externalIsSubmitting) {
      setIsSubmitting(true);
    }

    try {
      const result = onSubmit(assetCode.trim().toUpperCase());
      if (result instanceof Promise) {
        await result;
      }
      // Only close if not using external state management
      if (!externalIsSubmitting && !externalError && !externalSuccess) {
        setAssetCode("");
        onClose();
      }
    } catch (error) {
      console.error("Error creating token:", error);
    } finally {
      if (!externalIsSubmitting) {
        setIsSubmitting(false);
      }
    }
  };

  const handleClose = () => {
    if (!isSubmittingFinal) {
      setAssetCode("");
      onClose();
    }
  };

  return (
    <Dialog
      open={visible}
      onOpenChange={(open) => {
        if (!open) {
          handleClose();
        }
      }}
    >
      {visible && (
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Create Your Token</DialogTitle>
            <DialogDescription>
              Create a custom Stellar Asset (SAC) for your community. Your
              connected wallet will be the issuer.
            </DialogDescription>
          </DialogHeader>

          <form
            id="createTokenForm"
            className="space-y-4"
            onSubmit={(e) => {
              void handleSubmit(e);
            }}
          >
            <div className="space-y-2">
              <Label htmlFor="assetCode">Asset Code</Label>
              <Input
                id="assetCode"
                type="text"
                value={assetCode}
                onChange={(e) => setAssetCode(e.target.value.toUpperCase())}
                placeholder="e.g., DJUMP (1-12 chars)"
                disabled={isSubmittingFinal}
                required
                autoFocus
                maxLength={12}
              />
              {assetCode && (
                <p className="text-xs text-muted-foreground">
                  Asset code will be{" "}
                  <span className="font-semibold text-foreground">
                    {assetCode.toUpperCase()}
                  </span>
                </p>
              )}
            </div>

            {externalError && (
              <div className="rounded-md border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive">
                {externalError}
              </div>
            )}

            {externalSuccess && (
              <div className="rounded-md border border-emerald-500/40 bg-emerald-500/10 p-3 text-sm text-emerald-200">
                <p className="font-semibold">Token created successfully!</p>
                <p className="font-mono text-xs opacity-80">
                  Address: {externalSuccess.tokenAddress.slice(0, 8)}...
                  {externalSuccess.tokenAddress.slice(-8)}
                </p>
                <p className="font-mono text-xs opacity-80">
                  Transaction: {externalSuccess.transactionHash.slice(0, 8)}...
                  {externalSuccess.transactionHash.slice(-8)}
                </p>
              </div>
            )}
          </form>

          <DialogFooter>
            <Button
              type="submit"
              form="createTokenForm"
              disabled={!assetCode.trim() || isSubmittingFinal}
            >
              {isSubmittingFinal ? "Creating..." : "Create Token"}
            </Button>
            <Button
              type="button"
              variant="ghost"
              onClick={handleClose}
              disabled={isSubmittingFinal}
            >
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      )}
    </Dialog>
  );
};
