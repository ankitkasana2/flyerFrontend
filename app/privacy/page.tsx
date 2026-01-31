"use client";

import { Shield, Lock, Eye, UserCheck } from "lucide-react";
import Link from "next/link";

export default function PrivacyPage() {
    const sections = [
        {
            icon: Shield,
            title: "Information We Collect",
            content: [
                "Name and email address",
                "Payment information (processed securely via Stripe — we do not store card details)",
                "Order details and uploaded files",
                "Technical data such as IP address, browser type, and device information",
            ],
        },
        {
            icon: Lock,
            title: "How We Use Your Information",
            content: [
                "Process orders and payments",
                "Deliver purchased flyers and services",
                "Communicate order updates and support messages",
                "Improve platform performance and user experience",
                "Prevent fraud and ensure platform security",
            ],
        },
        {
            icon: Eye,
            title: "Data Protection",
            content: [
                "All data is stored securely using industry-standard practices",
                "Payments are handled through Stripe",
                "Files are stored using secure cloud infrastructure",
            ],
        },
        {
            icon: Shield,
            title: "Third-Party Services",
            content: [
                "We use trusted third-party services (such as Stripe and AWS) strictly for platform operation",
                "These services follow their own privacy and security standards",
            ],
        },
        {
            icon: UserCheck,
            title: "Your Rights",
            content: [
                "Request access to your personal data",
                "Request correction of your personal data",
                "Request deletion of your personal data",
                "Contact us at admin@grodify.com for any requests",
            ],
        },
    ];

    return (
        <div className="min-h-screen bg-black text-white">
            {/* Hero Section */}
            <section className="relative py-20 px-4 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-b from-red-500/10 to-transparent" />
                <div className="container mx-auto max-w-4xl relative z-10">
                    <h1 className="text-4xl md:text-6xl font-bold text-center mb-6">
                        Privacy <span className="text-red-500">Policy</span>
                    </h1>
                    <p className="text-xl text-gray-400 text-center max-w-2xl mx-auto">
                        Your privacy is important to us. Learn how we protect your information.
                    </p>
                    <p className="text-sm text-gray-500 text-center mt-4">
                        Effective Date: January 2024
                    </p>
                </div>
            </section>

            {/* Main Content */}
            <section className="py-16 px-4">
                <div className="container mx-auto max-w-4xl">
                    <div className="space-y-12">
                        {sections.map((section, index) => (
                            <div
                                key={index}
                                className="bg-gray-900 border border-gray-800 rounded-lg p-8 hover:border-red-500/50 transition-colors"
                            >
                                <div className="flex items-center space-x-4 mb-6">
                                    <div className="flex items-center justify-center w-12 h-12 bg-red-500/10 rounded-full">
                                        <section.icon className="w-6 h-6 text-red-500" />
                                    </div>
                                    <h2 className="text-2xl font-bold">{section.title}</h2>
                                </div>
                                <ul className="space-y-3">
                                    {section.content.map((item, itemIndex) => (
                                        <li key={itemIndex} className="flex items-start space-x-3">
                                            <span className="text-red-500 mt-1">•</span>
                                            <span className="text-gray-400">{item}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Contact Section */}
            <section className="py-16 px-4 bg-gray-900/50">
                <div className="container mx-auto max-w-4xl text-center">
                    <h2 className="text-3xl md:text-4xl font-bold mb-6">
                        Questions About <span className="text-red-500">Privacy</span>?
                    </h2>
                    <p className="text-xl text-gray-400 mb-8">
                        Email us at admin@grodify.com if you have any questions about our privacy practices
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
