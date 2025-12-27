"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "./ui/dialog";
import { Button } from "./ui/button";
import { ScrollArea } from "./ui/scroll-area"; // You might need a ScrollArea component or just use div with overflow

export function TermsModal({ open, onOpenChange }) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl max-h-[80vh] flex flex-col">
                <DialogHeader>
                    <DialogTitle>Terms and Conditions</DialogTitle>
                    <DialogDescription>
                        Please read our terms and conditions carefully.
                    </DialogDescription>
                </DialogHeader>

                <div className="flex-1 overflow-y-auto p-4 border rounded-md bg-muted/20 text-sm leading-relaxed text-muted-foreground">
                    <h3 className="font-bold text-foreground mb-2">1. Introduction</h3>
                    <p className="mb-4">
                        Welcome to StyleKat. By creating an account, you agree to comply with and be bound by the following terms and conditions of use.
                    </p>

                    <h3 className="font-bold text-foreground mb-2">2. User Accounts</h3>
                    <p className="mb-4">
                        You are responsible for maintaining the confidentiality of your account and password. You agree to accept responsibility for all activities that occur under your account.
                    </p>

                    <h3 className="font-bold text-foreground mb-2">3. Services</h3>
                    <p className="mb-4">
                        StyleKat provides a platform for booking appointments with barbers and salons. We do not provide the services themselves and are not responsible for the conduct of any service provider.
                    </p>

                    <h3 className="font-bold text-foreground mb-2">4. Cancellations & Refunds</h3>
                    <p className="mb-4">
                        Cancellation policies are determined by the individual service providers. Please review the booking details for specific cancellation rules.
                    </p>

                    <h3 className="font-bold text-foreground mb-2">5. Privacy</h3>
                    <p className="mb-4">
                        Your use of StyleKat is also governed by our Privacy Policy. Please review our Privacy Policy for information on how we collect and use your data.
                    </p>

                    <h3 className="font-bold text-foreground mb-2">6. Modifications</h3>
                    <p>
                        We adhere to the right to change these terms at any time. Your continued use of the platform signifies your acceptance of any adjustments to these terms.
                    </p>
                </div>

                <div className="flex justify-end pt-2">
                    <Button onClick={() => onOpenChange(false)}>I Understand</Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
