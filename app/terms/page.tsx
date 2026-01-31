"use client";

import { FileText, CheckCircle2, UserCheck, CreditCard, Shield, AlertTriangle, RefreshCcw } from "lucide-react";
import Link from "next/link";

export default function TermsPage() {
    const termSections = [
        {
            icon: RefreshCcw,
            title: "Services",
            content: "Grodify provides digital flyer templates and custom flyer design services. All purchases are digital and delivered electronically.",
        },
        {
            icon: UserCheck,
            title: "User Responsibilities",
            items: [
                "You are responsible for providing accurate information during checkout.",
                "You confirm that you have the rights to use any content you upload.",
                "You agree not to use Grodify for illegal or abusive purposes.",
            ],
        },
        {
            icon: CreditCard,
            title: "Orders & Payments",
            items: [
                "All payments are processed securely via Stripe.",
                "Prices are displayed before checkout.",
                "Taxes and processing fees may apply and are charged to the customer.",
            ],
        },
        {
            icon: Shield,
            title: "Intellectual Property",
            content: "All designs, templates, and content provided by Grodify remain the intellectual property of Grodify unless otherwise stated. Purchased designs are licensed for personal or commercial use by the buyer.",
        },
        {
            icon: AlertTriangle,
            title: "Limitation of Liability",
            content: "Grodify is not responsible for indirect damages, loss of revenue, or misuse of delivered files.",
        },
        {
            icon: FileText,
            title: "Modifications",
            content: "We reserve the right to update these terms at any time. Continued use of the platform constitutes acceptance of updated terms.",
        }
    ];

    return (
        <div className="min-h-screen bg-black text-white">
            {/* Hero Section */}
            <section className="relative py-20 px-4 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-b from-red-500/10 to-transparent" />
                <div className="container mx-auto max-w-4xl relative z-10">
                    <h1 className="text-4xl md:text-6xl font-bold text-center mb-6">
                        Terms of <span className="text-red-500">Service</span>
                    </h1>
                    <p className="text-xl text-gray-400 text-center max-w-2xl mx-auto">
                        By accessing or using Grodify, you agree to the following terms.
                    </p>
                    <p className="text-sm text-gray-500 text-center mt-4">
                        Effective Date: January 2024
                    </p>
                </div>
            </section>

            {/* Main Content */}
            <section className="py-16 px-4">
                <div className="container mx-auto max-w-4xl space-y-8">
                    {termSections.map((section, index) => (
                        <div key={index} className="bg-gray-900 border border-gray-800 rounded-lg p-8 hover:border-red-500/30 transition-all duration-300">
                            <div className="flex items-center space-x-4 mb-4">
                                <div className="flex items-center justify-center w-12 h-12 bg-red-500/10 rounded-full">
                                    <section.icon className="w-6 h-6 text-red-500" />
                                </div>
                                <h2 className="text-2xl font-bold">{section.title}</h2>
                            </div>
                            {section.content && (
                                <p className="text-gray-400 leading-relaxed">
                                    {section.content}
                                </p>
                            )}
                            {section.items && (
                                <ul className="space-y-3 mt-4">
                                    {section.items.map((item, i) => (
                                        <li key={i} className="flex items-start space-x-3 text-gray-400">
                                            <span className="text-red-500 mt-1">•</span>
                                            <span>{item}</span>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>
                    ))}
                </div>
            </section>

            {/* Contact Section */}
            <section className="py-16 px-4 bg-gray-900/50">
                <div className="container mx-auto max-w-4xl text-center">
                    <h2 className="text-3xl md:text-4xl font-bold mb-6">
                        Questions About Our <span className="text-red-500">Terms</span>?
                    </h2>
                    <p className="text-xl text-gray-400 mb-8">
                        Contact us at admin@grodify.com if you need clarification on any of these terms
                    </p>
                    <Link
                        href="/contact"
                        className="inline-block bg-red-500 hover:bg-red-600 text-white font-semibold px-8 py-4 rounded-lg transition-colors"
                    >
                        Contact Us
                    </Link>
                </div>
            </section>
        </div>
    );
}
