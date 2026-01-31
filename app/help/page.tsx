"use client";

import { Mail, MessageCircle, Phone, HelpCircle, Zap, Shield, Gift, Clock, CreditCard, Info } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function HelpPage() {
    const helpSections = [
        {
            icon: HelpCircle,
            title: "How does Grodify work?",
            content: "Grodify allows you to order high-quality nightlife flyers in just a few steps. Choose a flyer, complete the form, select your delivery time, and our design team takes care of the rest.",
        },
        {
            icon: CreditCard,
            title: "What do I receive after purchasing?",
            content: "You will receive a professionally designed JPG flyer, ready to post or print. We do not provide PSD or editable files.",
        },
        {
            icon: Clock,
            title: "How long does delivery take?",
            content: "Delivery time depends on the option selected at checkout: Standard delivery, 5-hour rush delivery, or 1-hour express delivery. We always aim to deliver on time.",
        },
        {
            icon: Zap,
            title: "What if my flyer is delayed?",
            content: "In rare cases, delays may occur due to high order volume. If this happens, your order will still be completed and delivered. Grodify always fulfills its orders.",
        },
        {
            icon: Info,
            title: "Do you offer animated flyers?",
            content: "Yes. Animated flyers are available as an extra add-on for $25.",
        },
        {
            icon: Gift,
            title: "Do you offer birthday flyers?",
            content: "Yes. We specialize in Birthday Flyers with premium quality and nightlife-ready designs.",
        },
        {
            icon: Shield,
            title: "Can I trust Grodify?",
            content: "Yes. Grodify is built specifically for nightlife promotions and professional flyer design. If you placed an order, your flyer will be delivered.",
        }
    ];

    return (
        <div className="min-h-screen bg-black text-white">
            {/* Hero Section */}
            <section className="relative py-20 px-4">
                <div className="absolute inset-0 bg-gradient-to-b from-red-500/10 to-transparent" />
                <div className="container mx-auto max-w-4xl relative z-10 text-center">
                    <h1 className="text-4xl md:text-6xl font-bold mb-6">
                        Help <span className="text-red-500">Center</span>
                    </h1>
                    <p className="text-xl text-gray-400 max-w-2xl mx-auto">
                        Welcome to Grodify Help Center. Here you’ll find answers to the most common questions about orders, delivery times, and how our platform works.
                    </p>
                </div>
            </section>

            {/* Help Content Grid */}
            <section className="py-16 px-4">
                <div className="container mx-auto max-w-6xl">
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {helpSections.map((section, index) => (
                            <div
                                key={index}
                                className="bg-gray-900 border border-gray-800 rounded-lg p-8 hover:border-red-500/50 transition-all duration-300 group shadow-lg"
                            >
                                <div className="flex items-center justify-center w-12 h-12 bg-red-500/10 rounded-full mb-6 group-hover:bg-red-500/20 transition-colors">
                                    <section.icon className="w-6 h-6 text-red-500" />
                                </div>
                                <h3 className="text-xl font-bold mb-4">{section.title}</h3>
                                <p className="text-gray-400 leading-relaxed text-sm">
                                    {section.content}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Contact Support Section */}
            <section className="py-20 px-4 bg-gradient-to-t from-gray-900/50 to-transparent">
                <div className="container mx-auto max-w-4xl text-center">
                    <div className="bg-gray-900 border border-gray-800 rounded-2xl p-10 md:p-16">
                        <h2 className="text-3xl md:text-5xl font-bold mb-6">
                            What if I need <span className="text-red-500">help</span> with my order?
                        </h2>
                        <p className="text-xl text-gray-400 mb-10">
                            If you need assistance, please contact our support team. We generally respond as soon as possible.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
                            <Link href="/contact" className="w-full sm:w-auto">
                                <Button className="bg-red-500 hover:bg-red-600 text-white px-10 py-7 text-lg h-auto w-full sm:w-auto hover:cursor-pointer shadow-lg shadow-red-500/20">
                                    <Mail className="w-6 h-6 mr-3" />
                                    Contact Support
                                </Button>
                            </Link>
                            <Link href="/faq" className="w-full sm:w-auto">
                                <Button variant="outline" className="border-gray-700 hover:border-red-500 px-10 py-7 text-lg h-auto w-full sm:w-auto hover:cursor-pointer">
                                    Browse FAQ
                                </Button>
                            </Link>
                        </div>
                        <p className="mt-8 text-gray-500 text-sm italic">
                            Email us directly: <a href="mailto:admin@grodify.com" className="text-red-500 hover:underline">admin@grodify.com</a>
                        </p>
                    </div>
                </div>
            </section>
        </div>
    );
}
