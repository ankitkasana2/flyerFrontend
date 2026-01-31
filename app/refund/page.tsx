"use client";

import { RefreshCcw, Clock, CheckCircle2, XCircle, AlertCircle, FileWarning } from "lucide-react";
import Link from "next/link";

export default function RefundPage() {
    const policySections = [
        {
            icon: XCircle,
            title: "No Refunds",
            items: [
                "Once a flyer is delivered, no refunds will be issued.",
                "Instant-download or completed designs are non-refundable.",
            ],
        },
        {
            icon: CheckCircle2,
            title: "Exceptions",
            description: "Refunds may be considered only if:",
            items: [
                "The service was not delivered",
                "A technical error caused a duplicate charge",
                "The delivered file is corrupted and cannot be replaced",
            ],
            footer: "Refund requests must be submitted within 24 hours of purchase."
        },
        {
            icon: FileWarning,
            title: "Digital Products",
            content: "Because Grodify provides digital products and custom design services, all sales are generally final."
        }
    ];

    return (
        <div className="min-h-screen bg-black text-white">
            {/* Hero Section */}
            <section className="relative py-20 px-4 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-b from-red-500/10 to-transparent" />
                <div className="container mx-auto max-w-4xl relative z-10">
                    <h1 className="text-4xl md:text-6xl font-bold text-center mb-6">
                        Refund <span className="text-red-500">Policy</span>
                    </h1>
                    <p className="text-xl text-gray-400 text-center max-w-2xl mx-auto">
                        Please review our policies regarding digital product purchases.
                    </p>
                    <p className="text-sm text-gray-500 text-center mt-4">
                        Effective Date: January 2024
                    </p>
                </div>
            </section>

            {/* Main Content */}
            <section className="py-16 px-4">
                <div className="container mx-auto max-w-4xl space-y-8">
                    {policySections.map((section, index) => (
                        <div key={index} className="bg-gray-900 border border-gray-800 rounded-lg p-8 hover:border-red-500/30 transition-all duration-300">
                            <div className="flex items-center space-x-4 mb-4">
                                <div className="flex items-center justify-center w-12 h-12 bg-red-500/10 rounded-full">
                                    <section.icon className="w-6 h-6 text-red-500" />
                                </div>
                                <h2 className="text-2xl font-bold">{section.title}</h2>
                            </div>
                            {section.content && (
                                <p className="text-gray-300 leading-relaxed italic">
                                    {section.content}
                                </p>
                            )}
                            {section.description && (
                                <p className="text-gray-300 mb-4">{section.description}</p>
                            )}
                            {section.items && (
                                <ul className="space-y-3">
                                    {section.items.map((item, i) => (
                                        <li key={i} className="flex items-start space-x-3 text-gray-400">
                                            <span className="text-red-500 mt-1">•</span>
                                            <span>{item}</span>
                                        </li>
                                    ))}
                                </ul>
                            )}
                            {section.footer && (
                                <p className="mt-6 text-sm text-gray-500 font-medium border-t border-gray-800 pt-4">
                                    {section.footer}
                                </p>
                            )}
                        </div>
                    ))}
                </div>
            </section>

            {/* Contact Section */}
            <section className="py-16 px-4 bg-gray-900/50">
                <div className="container mx-auto max-w-4xl text-center">
                    <h2 className="text-3xl md:text-4xl font-bold mb-6">
                        Refund <span className="text-red-500">Inquiry</span>?
                    </h2>
                    <p className="text-xl text-gray-400 mb-8">
                        For refund inquiries, contact us at admin@grodify.com
                    </p>
                    <Link
                        href="/contact"
                        className="inline-block bg-red-500 hover:bg-red-600 text-white font-semibold px-8 py-4 rounded-lg transition-colors"
                    >
                        Contact Support
                    </Link>
                </div>
            </section>
        </div>
    );
}
