"use client";

import { ChevronDown } from "lucide-react";
import { useState } from "react";
import Link from "next/link";

export default function FAQPage() {
    const [openIndex, setOpenIndex] = useState<number | null>(0);

    const faqs = [
        {
            category: "Product & Quality",
            questions: [
                {
                    q: "What do I receive when I purchase a flyer?",
                    a: "You will receive a high-quality JPG flyer in professional resolution, ready to post on social media or print. We do not deliver PSD files. All flyers are delivered as finished designs.",
                },
                {
                    q: "What file format will I receive?",
                    a: "All flyers are delivered in JPG format only. This ensures compatibility, fast delivery, and easy sharing.",
                },
                {
                    q: "Are your flyers high quality?",
                    a: "Absolutely. All Grodify flyers are first-class quality, high resolution, professionally designed, and optimized for nightlife promotions. We focus on premium visuals that stand out.",
                },
                {
                    q: "Do you offer birthday flyers?",
                    a: "Yes. We specialize in Birthday Flyers with premium quality, bold visuals, and nightlife-ready designs. Birthday flyers are one of our most popular products.",
                },
            ],
        },
        {
            category: "Pricing & Options",
            questions: [
                {
                    q: "What flyer prices do you offer?",
                    a: "We offer three fixed flyer prices: $10 – Basic Flyer, $15 – Regular Flyer, and $40 – Premium Flyer. Each price reflects the level of design detail and complexity.",
                },
                {
                    q: "Do you offer animated flyers?",
                    a: "Yes. Animated flyers are available as an add-on for $25. If selected, you will receive an animated version optimized for social media use.",
                },
            ],
        },
        {
            category: "Delivery & Trust",
            questions: [
                {
                    q: "What are your delivery times?",
                    a: "We offer multiple delivery options: Standard delivery (included), 5-hour rush ($10), and 1-hour express ($20). Delivery time depends on the option selected at checkout.",
                },
                {
                    q: "What happens if my flyer is delayed?",
                    a: "In rare cases, delays may occur when we are experiencing a high volume of orders. However, we always deliver and honor the delivery time selected. Grodify is known for reliability and consistency in nightlife flyer design.",
                },
                {
                    q: "Can I trust Grodify with my order?",
                    a: "Yes. We always complete our work. If you placed an order, expect your flyer. Grodify is one of the top platforms for nightlife flyer design, and customer satisfaction is our priority.",
                },
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
                        Frequently Asked <span className="text-red-500">Questions</span>
                    </h1>
                    <p className="text-xl text-gray-400 text-center max-w-2xl mx-auto">
                        Find answers to common questions about Grodify
                    </p>
                </div>
            </section>

            {/* FAQ Section */}
            <section className="py-16 px-4">
                <div className="container mx-auto max-w-4xl">
                    {faqs.map((category, categoryIndex) => (
                        <div key={categoryIndex} className="mb-12">
                            <h2 className="text-2xl font-bold mb-6 text-red-500">
                                {category.category}
                            </h2>
                            <div className="space-y-4">
                                {category.questions.map((faq, faqIndex) => {
                                    const globalIndex = categoryIndex * 100 + faqIndex;
                                    const isOpen = openIndex === globalIndex;

                                    return (
                                        <div
                                            key={faqIndex}
                                            className="bg-gray-900 border border-gray-800 rounded-lg overflow-hidden hover:border-red-500/50 transition-colors"
                                        >
                                            <button
                                                onClick={() => setOpenIndex(isOpen ? null : globalIndex)}
                                                className="w-full flex items-center justify-between p-6 text-left"
                                            >
                                                <span className="font-semibold text-lg pr-8">{faq.q}</span>
                                                <ChevronDown
                                                    className={`w-5 h-5 text-red-500 flex-shrink-0 transition-transform ${isOpen ? "rotate-180" : ""
                                                        }`}
                                                />
                                            </button>
                                            {isOpen && (
                                                <div className="px-6 pb-6">
                                                    <p className="text-gray-400 leading-relaxed">{faq.a}</p>
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* Contact CTA */}
            <section className="py-16 px-4 bg-gray-900/50">
                <div className="container mx-auto max-w-4xl text-center">
                    <h2 className="text-3xl md:text-4xl font-bold mb-6">
                        Still Have <span className="text-red-500">Questions</span>?
                    </h2>
                    <p className="text-xl text-gray-400 mb-8">
                        Our support team is here to help
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
