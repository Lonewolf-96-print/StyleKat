"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "./ui/dialog";
import { Button } from "./ui/button";
// You might need a ScrollArea component or just use div with overflow

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

                    <p className="mb-4">
                        <strong>Last updated:</strong> [Add date]
                    </p>

                    <p className="mb-6">
                        Welcome to <strong>StyleKat</strong>. These Terms and Conditions (“Terms”) govern your use of the StyleKat website and services
                        (collectively, the “Platform”). By accessing or using StyleKat, you agree to be bound by these Terms.
                    </p>

                    <h3 className="font-bold text-foreground mb-2">1. About StyleKat</h3>
                    <p className="mb-4">
                        StyleKat is a technology platform that connects users with local salons and grooming professionals.
                        StyleKat does not itself provide salon or grooming services. All services are provided directly by
                        independent salons or professionals listed on the Platform.
                    </p>

                    <h3 className="font-bold text-foreground mb-2">2. User Accounts</h3>
                    <ul className="list-disc pl-5 mb-4 space-y-1">
                        <li>You may be required to create an account to access certain features.</li>
                        <li>You are responsible for maintaining the confidentiality of your login credentials.</li>
                        <li>You agree to provide accurate and complete information.</li>
                        <li>
                            StyleKat reserves the right to suspend or terminate accounts that provide false information
                            or misuse the Platform.
                        </li>
                    </ul>

                    <h3 className="font-bold text-foreground mb-2">3. Booking & Appointments</h3>
                    <ul className="list-disc pl-5 mb-4 space-y-1">
                        <li>Users can browse salons, view availability, and book appointments.</li>
                        <li>All bookings are subject to the availability and acceptance of the salon.</li>
                        <li>StyleKat is not responsible for cancellations, delays, or service quality.</li>
                        <li>Any service-related disputes must be resolved directly with the salon.</li>
                    </ul>

                    <h3 className="font-bold text-foreground mb-2">4. Salon Partner Responsibilities</h3>
                    <ul className="list-disc pl-5 mb-4 space-y-1">
                        <li>Provide accurate business information</li>
                        <li>Honor confirmed bookings</li>
                        <li>Deliver services professionally and lawfully</li>
                        <li>Comply with all applicable laws, licenses, and regulations</li>
                    </ul>
                    <p className="mb-4">
                        StyleKat reserves the right to remove salons that violate these terms.
                    </p>

                    <h3 className="font-bold text-foreground mb-2">5. User Responsibilities</h3>
                    <ul className="list-disc pl-5 mb-4 space-y-1">
                        <li>Not misuse the Platform</li>
                        <li>Not provide false reviews or ratings</li>
                        <li>Not harass salons or other users</li>
                        <li>Not attempt to hack, disrupt, or exploit the Platform</li>
                    </ul>
                    <p className="mb-4">
                        Violations may result in account suspension or termination.
                    </p>

                    <h3 className="font-bold text-foreground mb-2">6. Ratings & Reviews</h3>
                    <ul className="list-disc pl-5 mb-4 space-y-1">
                        <li>Reviews must be honest and based on genuine experiences.</li>
                        <li>Abusive, fake, or misleading reviews may be removed.</li>
                        <li>StyleKat is not responsible for opinions expressed in reviews.</li>
                    </ul>

                    <h3 className="font-bold text-foreground mb-2">7. Intellectual Property</h3>
                    <p className="mb-4">
                        All content on the Platform, including logos, designs, text, and software, belongs to StyleKat
                        or its licensors. You may not copy, modify, or distribute any content without prior written permission.
                    </p>

                    <h3 className="font-bold text-foreground mb-2">8. Limitation of Liability</h3>
                    <ul className="list-disc pl-5 mb-4 space-y-1">
                        <li>StyleKat acts solely as a facilitator.</li>
                        <li>We are not liable for service quality, injuries, losses, or disputes.</li>
                        <li>We are not responsible for indirect or consequential damages.</li>
                    </ul>

                    <h3 className="font-bold text-foreground mb-2">9. Termination</h3>
                    <p className="mb-4">
                        StyleKat may suspend or terminate access to the Platform at any time, without notice,
                        if these Terms are violated or if required by law.
                    </p>

                    <h3 className="font-bold text-foreground mb-2">10. Privacy</h3>
                    <p className="mb-4">
                        Your use of the Platform is governed by our Privacy Policy, which explains how we collect
                        and use your data.
                    </p>

                    <h3 className="font-bold text-foreground mb-2">11. Modifications to Terms</h3>
                    <p className="mb-4">
                        StyleKat may update these Terms periodically. Continued use of the Platform
                        constitutes acceptance of the updated Terms.
                    </p>

                    <h3 className="font-bold text-foreground mb-2">12. Governing Law</h3>
                    <p className="mb-4">
                        These Terms are governed by the laws of India. Any disputes shall be subject to the
                        jurisdiction of courts located in India.
                    </p>

                    <h3 className="font-bold text-foreground mb-2">13. Contact Us</h3>
                    <p>
                        For questions or support, contact us at:
                        <br />
                        📧 <strong>usersupport@stylekat.in</strong>
                    </p>

                </div>

                <div className="flex justify-end pt-2">
                    <Button onClick={() => onOpenChange(false)}>I Understand</Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
