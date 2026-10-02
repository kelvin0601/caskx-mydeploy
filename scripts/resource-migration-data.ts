import { ROUTE_PUBLIC } from "@/lib/constants/route";

export type TResourceTopicIcon =
    | "buying"
    | "selling"
    | "marketplace"
    | "whisky-casks";

export type TResourceTopic = {
    id: string;
    title: string;
    description: string;
    articleCount: number;
    actionLabel: string;
    href: string;
    icon: TResourceTopicIcon;
};

export type TResourceGuide = {
    id: string;
    topicId: string;
    href: string;
    topics?: readonly string[];
    title: string;
    description: string;
    readTime: string;
    imageSrc: string;
    imageAlt: string;
};

export type TResourceFaq = {
    id: string;
    topics?: readonly string[];
    question: string;
    answer: string;
};

export const RESOURCE_TOPICS: readonly TResourceTopic[] = [
    {
        id: "buying",
        title: "Buying",
        description:
            "Learn how to buy whisky casks confidently, from finding an asset to becoming its owner.",
        articleCount: 3,
        actionLabel: "Explore Now",
        href: `${ROUTE_PUBLIC.RESOURCES}/buying`,
        icon: "buying",
    },
    {
        id: "selling",
        title: "Selling",
        description:
            "Learn how to sell your whisky casks, manage listings, and complete secure transactions.",
        articleCount: 4,
        actionLabel: "Explore Now",
        href: `${ROUTE_PUBLIC.RESOURCES}/selling`,
        icon: "selling",
    },
    {
        id: "marketplace",
        title: "Marketplace",
        description:
            "Learn how the marketplace works, from pricing and offers to market insights.",
        articleCount: 5,
        actionLabel: "Explore Now",
        href: `${ROUTE_PUBLIC.RESOURCES}/marketplace`,
        icon: "marketplace",
    },
    {
        id: "whisky-casks",
        title: "Whisky Casks",
        description:
            "Understand the characteristics, terminology, and details that define a whisky cask.",
        articleCount: 3,
        actionLabel: "Explore Now",
        href: `${ROUTE_PUBLIC.RESOURCES}/whisky-casks`,
        icon: "whisky-casks",
    },
] as const;

export const RESOURCE_GUIDES: readonly TResourceGuide[] = [
    {
        id: "how-to-buy-a-cask",
        topicId: "buying",
        href: `${ROUTE_PUBLIC.RESOURCES}/buying/how-to-buy-a-cask`,
        topics: ["buying"],
        title: "How to Buy a Cask",
        description:
            "A step-by-step walkthrough of the purchase process, from browsing listings to completing your first transaction.",
        readTime: "5 mins read",
        imageSrc: "/images/resources/how-to-buy-a-cask.png",
        imageAlt: "Whisky casks stacked in a warehouse",
    },
    {
        id: "what-happens-after-you-buy",
        topicId: "buying",
        href: `${ROUTE_PUBLIC.RESOURCES}/buying/what-happens-after-you-buy`,
        topics: ["buying", "whisky-casks"],
        title: "What Happens After You Buy",
        description:
            "Learn what to expect once your purchase is confirmed - storage, documentation, and portfolio tracking.",
        readTime: "5 mins read",
        imageSrc: "/images/resources/what-happens-after-you-buy.png",
        imageAlt: "A distillery warehouse filled with whisky casks",
    },
    {
        id: "how-to-sell-a-cask",
        topicId: "selling",
        href: `${ROUTE_PUBLIC.RESOURCES}/selling/how-to-sell-a-cask`,
        topics: ["selling"],
        title: "How to Sell a Cask",
        description:
            "Understand how to list your cask, set a competitive price, and manage incoming offers from buyers.",
        readTime: "5 mins read",
        imageSrc: "/images/resources/how-to-sell-a-cask.png",
        imageAlt: "Whisky casks being inspected inside a warehouse",
    },
    {
        id: "understanding-offers",
        topicId: "selling",
        href: `${ROUTE_PUBLIC.RESOURCES}/selling/understanding-offers`,
        topics: ["selling", "marketplace"],
        title: "Understanding Offers",
        description:
            "How the offers system works, including how to accept, decline, or counter an offer on your listing.",
        readTime: "5 mins read",
        imageSrc: "/images/resources/understanding-offers.png",
        imageAlt: "People discussing whisky casks in a warehouse",
    },
] as const;

export const RESOURCE_FAQS: readonly TResourceFaq[] = [
    {
        id: "transaction-duration",
        topics: ["buying"],
        question: "How long does a transaction take?",
        answer: "Transaction times vary depending on seller confirmation, document completion, and payment processing.",
    },
    {
        id: "ownership-timing",
        topics: ["buying"],
        question: "When do I officially become the owner?",
        answer: "You officially become the owner once payment, required documentation, and the ownership transfer have been completed.",
    },
    {
        id: "cancel-offer",
        topics: ["buying"],
        question: "Can I cancel an offer?",
        answer: "Offer cancellation depends on its current status. Review the offer details or contact support before the seller accepts it.",
    },
    {
        id: "payment-methods",
        topics: ["buying"],
        question: "What payment methods are supported?",
        answer: "We support secure bank transfers and major credit/debit cards via Stripe for deposit and final invoice settlement.",
    },
    {
        id: "selling-fees",
        topics: ["selling"],
        question: "What are the fees for selling a cask?",
        answer: "Listing is free. Platform transaction fees are clearly displayed before you confirm any sale.",
    },
    {
        id: "seller-payout-timing",
        topics: ["selling"],
        question: "When do I receive payment as a seller?",
        answer: "Once the ownership transfer documents are signed and validated with the bonded warehouse, funds are released to your connected payout account within 2-5 business days.",
    },
    {
        id: "manage-offers",
        topics: ["selling"],
        question: "Can I decline or counter an offer?",
        answer: "Yes, you have full control over incoming offers. You can accept, decline, or submit a counter-offer within 72 hours.",
    },
    {
        id: "cask-documents",
        topics: ["selling"],
        question: "What documents do I need to list my cask?",
        answer: "You will need the Delivery Order (DO), certificate of ownership, or warehouse receipt from the HMRC-bonded warehouse holding the cask.",
    },
    {
        id: "how-matching-works",
        topics: ["marketplace"],
        question: "How does order matching work on the marketplace?",
        answer: "Our order engine matches buyers and sellers based on listing prices, competitive bids, and transaction confirmations, ensuring optimal liquidity and fair market execution.",
    },
    {
        id: "vat-duty-regulations",
        topics: ["marketplace"],
        question: "Are listed prices inclusive of VAT and UK excise duty?",
        answer: "Casks in HMRC-bonded warehouses are traded under bond and are exempt from UK excise duty and VAT until bottled and removed from bond.",
    },
    {
        id: "anonymous-trading",
        topics: ["marketplace"],
        question: "Can I trade anonymously on the platform?",
        answer: "Yes, member identities remain confidential on public listings. All trades are escrow-managed and verified securely by Cask Exchange.",
    },
    {
        id: "cask-storage",
        topics: ["whisky-casks"],
        question: "Where are whisky casks stored?",
        answer: "All casks are stored in HMRC-bonded warehouses under optimal conditions with insurance and regular inspections.",
    },
    {
        id: "angels-share",
        topics: ["whisky-casks"],
        question: "What is the 'Angels' Share'?",
        answer: "The Angels' Share is the natural evaporation of liquid and alcohol (typically 1.5% to 2% annually) that occurs while the whisky matures in the cask.",
    },
    {
        id: "cask-sampling",
        topics: ["whisky-casks"],
        question: "Can I sample or inspect my cask?",
        answer: "Yes, you can request a regauge and draw a sample bottle from your cask directly through your portfolio dashboard at any time.",
    },
] as const;

export function getResourceTopic(id: string): TResourceTopic | undefined {
    return RESOURCE_TOPICS.find((topic) => topic.id === id);
}

export function getGuidesByTopic(topicId: string): readonly TResourceGuide[] {
    return RESOURCE_GUIDES.filter(
        (guide) => !guide.topics || guide.topics.includes(topicId)
    );
}

export function getFaqsByTopic(topicId: string): readonly TResourceFaq[] {
    return RESOURCE_FAQS.filter(
        (faq) => !faq.topics || faq.topics.includes(topicId)
    );
}
