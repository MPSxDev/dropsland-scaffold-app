import React, { useEffect, useState } from "react";
import { Button } from "./ui/button.tsx";
import { Input } from "./ui/input.tsx";
import { Label } from "./ui/label.tsx";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog.tsx";
import { CheckCircle2 } from "lucide-react";

interface BuyDialogProps {
  visible: boolean;
  onClose: () => void;
  tokenSymbol: string;
  onConfirm: (amount: number) => Promise<void> | void;
}

export const BuyDialog: React.FC<BuyDialogProps> = ({
  visible,
  onClose,
  tokenSymbol,
  onConfirm,
}) => {
  const [inputType, setInputType] = useState<"usdc" | "tokens">("usdc");
  const [amount, setAmount] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState("");
  const [rate, setRate] = useState(0.5);
  const [purchasedAmounts, setPurchasedAmounts] = useState<{
    usdc: number;
    tokens: number;
  } | null>(null);
  const [rateUpdating, setRateUpdating] = useState(false);

  useEffect(() => {
    if (!visible) {
      setAmount("");
      setIsSubmitting(false);
      setIsSuccess(false);
      setError("");
      setInputType("usdc");
      setPurchasedAmounts(null);
      setRateUpdating(false);
    }
  }, [visible]);

  useEffect(() => {
    if (!visible || isSubmitting || isSuccess) return;

    const interval = setInterval(() => {
      const change = (Math.random() - 0.5) * 0.1;
      setRateUpdating(true);
      setRate((prevRate) => {
        const newRate = prevRate + change;
        return Math.max(0.1, Math.min(2.0, newRate));
      });
      setTimeout(() => setRateUpdating(false), 500);
    }, 3000);

    return () => clearInterval(interval);
  }, [visible, isSubmitting, isSuccess]);

  const calculateUsdcAmount = (tokenAmount: number): number =>
    tokenAmount / rate;
  const calculateTokenAmount = (usdcAmount: number): number =>
    usdcAmount * rate;

  const usdcAmount =
    inputType === "usdc"
      ? amount && !isNaN(parseFloat(amount))
        ? parseFloat(amount)
        : 0
      : amount && !isNaN(parseFloat(amount))
        ? calculateUsdcAmount(parseFloat(amount))
        : 0;

  const tokenAmount =
    inputType === "tokens"
      ? amount && !isNaN(parseFloat(amount))
        ? parseFloat(amount)
        : 0
      : amount && !isNaN(parseFloat(amount))
        ? calculateTokenAmount(parseFloat(amount))
        : 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const amountNum = parseFloat(amount);
    if (!amount || isNaN(amountNum) || amountNum <= 0) {
      setError("Please enter a valid amount");
      return;
    }

    setIsSubmitting(true);
    try {
      const finalUsdcAmount =
        inputType === "usdc" ? amountNum : calculateUsdcAmount(amountNum);
      const result = onConfirm(finalUsdcAmount);
      if (result instanceof Promise) {
        await result;
      }

      const finalTokenAmount =
        inputType === "tokens" ? amountNum : calculateTokenAmount(amountNum);
      setPurchasedAmounts({
        usdc: finalUsdcAmount,
        tokens: finalTokenAmount,
      });

      setIsSuccess(true);

      setTimeout(() => {
        setAmount("");
        setIsSuccess(false);
        setIsSubmitting(false);
        setPurchasedAmounts(null);
        onClose();
      }, 2000);
    } catch (err) {
      console.error("Error purchasing token:", err);
      setError(
        err instanceof Error
          ? err.message
          : "Purchase failed. Please try again.",
      );
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting && !isSuccess) {
      setAmount("");
      setError("");
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
        <DialogContent className="sm:max-w-xl">
          {isSuccess ? (
            <div className="flex flex-col items-center gap-3 text-center">
              <div className="rounded-full bg-emerald-500/10 p-4 text-emerald-400">
                <CheckCircle2 className="size-12" />
              </div>
              <h3 className="text-xl font-semibold text-foreground">
                Purchase successful!
              </h3>
              <p className="text-sm text-muted-foreground">
                You've purchased{" "}
                {purchasedAmounts
                  ? purchasedAmounts.tokens.toFixed(4)
                  : "0.0000"}{" "}
                {tokenSymbol} for{" "}
                {purchasedAmounts ? purchasedAmounts.usdc.toFixed(2) : "0.00"}{" "}
                USDC
              </p>
            </div>
          ) : (
            <>
              <DialogHeader>
                <DialogTitle>Buy {tokenSymbol}</DialogTitle>
                <DialogDescription>
                  Use USDC to acquire {tokenSymbol} at the live market rate.
                </DialogDescription>
              </DialogHeader>

              <form
                id="buyTokenForm"
                className="space-y-6"
                onSubmit={(e) => {
                  void handleSubmit(e);
                }}
              >
                <div className="rounded-xl border border-border/50 bg-muted/10 p-4 text-center">
                  <p className="text-xs uppercase tracking-wide text-muted-foreground">
                    Current rate
                  </p>
                  <p
                    className={`text-3xl font-semibold text-amber-300 transition-all duration-300 ${rateUpdating ? "scale-105" : ""}`}
                  >
                    {rate.toFixed(4)} {tokenSymbol}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    1 USDC = {rate.toFixed(4)} {tokenSymbol}
                  </p>
                </div>

                <div className="inline-flex w-full rounded-md border border-border/60 bg-background p-1 text-xs font-semibold text-muted-foreground">
                  <button
                    type="button"
                    className={`flex-1 rounded-md px-3 py-2 transition ${inputType === "usdc" ? "bg-foreground text-background" : "hover:text-foreground"}`}
                    onClick={() => {
                      setInputType("usdc");
                      setAmount("");
                      setError("");
                    }}
                    disabled={isSubmitting}
                  >
                    USDC
                  </button>
                  <button
                    type="button"
                    className={`flex-1 rounded-md px-3 py-2 transition ${inputType === "tokens" ? "bg-foreground text-background" : "hover:text-foreground"}`}
                    onClick={() => {
                      setInputType("tokens");
                      setAmount("");
                      setError("");
                    }}
                    disabled={isSubmitting}
                  >
                    {tokenSymbol}
                  </button>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="amount">
                    {inputType === "usdc"
                      ? "Amount to Pay (USDC)"
                      : `Amount to Buy (${tokenSymbol})`}
                  </Label>
                  <div className="relative">
                    <Input
                      id="amount"
                      type="number"
                      step="0.01"
                      min="0"
                      value={amount}
                      onChange={(e) => {
                        setAmount(e.target.value);
                        setError("");
                      }}
                      placeholder="0.00"
                      disabled={isSubmitting}
                      required
                      autoFocus
                      className="pr-16 text-lg"
                    />
                    <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-xs font-semibold text-muted-foreground">
                      {inputType === "usdc" ? "USDC" : tokenSymbol}
                    </span>
                  </div>
                  {error && <p className="text-xs text-destructive">{error}</p>}
                </div>

                <div className="space-y-3 rounded-xl border border-border/60 bg-background/40 p-4 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">
                      You will receive:
                    </span>
                    <span className="font-semibold text-foreground">
                      {tokenAmount > 0
                        ? `${tokenAmount.toFixed(4)} ${tokenSymbol}`
                        : `0.0000 ${tokenSymbol}`}
                    </span>
                  </div>
                  <div className="flex items-center justify-between border-t border-border/40 pt-3">
                    <span className="text-muted-foreground">Pay with:</span>
                    <span className="font-semibold text-amber-300">
                      {usdcAmount > 0
                        ? `${usdcAmount.toFixed(2)} USDC`
                        : "0.00 USDC"}
                    </span>
                  </div>
                </div>
              </form>

              <DialogFooter className="gap-2 sm:flex-row">
                <Button
                  type="submit"
                  form="buyTokenForm"
                  disabled={
                    !amount ||
                    isNaN(parseFloat(amount)) ||
                    parseFloat(amount) <= 0 ||
                    isSubmitting
                  }
                  className="min-w-[180px]"
                >
                  {isSubmitting ? (
                    <span className="inline-flex items-center gap-2 text-sm">
                      <span className="size-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                      Processing...
                    </span>
                  ) : (
                    <>
                      <span role="img" aria-hidden>
                        💰
                      </span>
                      Buy with USDC
                    </>
                  )}
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  onClick={handleClose}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      )}
    </Dialog>
  );
};
