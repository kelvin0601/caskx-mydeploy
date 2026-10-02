export type TTopicArticleSubsection = {
    title: string;
    content: string;
};

export type TTopicArticleSection = {
    title?: string;
    level?: 1 | 2;
    content?: string | string[];
    bullets?: string[];
    trailingContent?: string;
    subsections?: TTopicArticleSubsection[];
};

export type TTopicArticle = {
    id: string;
    title: string;
    sections: TTopicArticleSection[];
};

export const BUYER_TOPIC_ARTICLES: readonly TTopicArticle[] = [
    {
        id: "how-to-buy-a-cask",
        title: "How to Buy a Cask",
        sections: [
            {
                title: "Introduction",
                level: 1,
                content: [
                    "This guide explains how buying works from finding a cask to becoming its recorded owner.",
                    "Buying a whisky cask on Cask Exchange is designed to be straightforward and secure. Whether you purchase instantly using an existing listing or negotiate with a seller by making an offer, every transaction follows the same verified ownership transfer process.",
                ],
            },
            {
                title: "Step 1. Browse Available Casks",
                level: 1,
                content:
                    "Explore the marketplace to compare different casks by:",
                bullets: [
                    "Distillery",
                    "Vintage",
                    "Region",
                    "Cask type",
                    "Market activity",
                    "Current listings",
                ],
                trailingContent:
                    "Each cask page provides detailed specifications, pricing information, and historical market data to help you make an informed decision.",
            },
            {
                title: "Step 2. Choose How You Want to Buy",
                level: 1,
                content: "There are two ways to purchase.",
                subsections: [
                    {
                        title: "Buy Now",
                        content:
                            'We offer a way for you to communicate orders (each an "Order") for Whisky Casks ("Marketplace Whisky Casks") to Third Party Suppliers listed on our Platform. The legal contract for the supply and purchase of the Marketplace Whisky Casks is between you and the Third Party Supplier that you place your Order with. The Third Party Supplier is solely responsible for performing that contract.',
                    },
                    {
                        title: "Make Offer",
                        content:
                            "You understand that some Marketplace Whisky Casks require the customer to be at least 18 years old. You agree to provide such information and documentation if necessary and requested by the Third Party Supplier to process your Order.",
                    },
                ],
            },
            {
                title: "Step 3. Seller Confirmation",
                level: 1,
                content:
                    "Once a buyer and seller are matched, the seller confirms the transaction and verifies asset availability.",
            },
            {
                title: "Step 4. Complete Payment",
                level: 1,
                content: "Transactions are completed in two stages:",
                bullets: ["Deposit Payment", "Final Payment"],
                trailingContent:
                    "Both payments are protected through the transaction process before ownership changes.",
            },
            {
                title: "Step 5. Ownership Transfer",
                level: 1,
                content:
                    "Once payment and documentation are complete, ownership records are updated and the cask appears in your Portfolio.",
            },
        ],
    },
    {
        id: "buy-now-vs-make-offer",
        title: "Buy Now vs Make Offer",
        sections: [
            {
                title: "Overview",
                level: 1,
                content: [
                    "When purchasing on Cask Exchange, buyers have two flexible purchase options depending on listing availability and target pricing.",
                ],
            },
            {
                title: "Buy Now Mechanism",
                level: 1,
                content:
                    "Buy Now allows immediate execution at the seller's listed asking price. The cask is temporarily locked to prevent competing purchases while the checkout transaction is initialized.",
                bullets: [
                    "Guaranteed pricing with no negotiation round",
                    "Immediate order confirmation sent to seller",
                    "Ideal for high-demand distillery casks",
                ],
            },
            {
                title: "Make Offer Mechanism",
                level: 1,
                content:
                    "Making an offer enables you to propose your purchase price below the current asking price or place a bid on unlisted portfolio casks.",
                bullets: [
                    "Seller has 72 hours to accept, reject, or counter-offer",
                    "No payment is deducted until the offer is accepted",
                    "Offers can be cancelled prior to seller acceptance",
                ],
            },
        ],
    },
    {
        id: "what-happens-after-you-buy",
        title: "What Happens After You Buy",
        sections: [
            {
                title: "Post-Purchase Overview",
                level: 1,
                content: [
                    "After completing your payment and signing the ownership transfer agreement, full legal title is transferred to you.",
                ],
            },
            {
                title: "Warehouse Record Updates",
                level: 1,
                content:
                    "The HMRC-bonded warehouse where your cask resides is notified of the ownership change. Delivery orders and warehouse certificates are issued in your legal name.",
            },
            {
                title: "Portfolio Integration",
                level: 1,
                content:
                    "Your purchased cask will automatically appear in your Cask Exchange Portfolio dashboard where you can monitor estimated market valuation, order re-gauge samples, or relist for resale.",
            },
        ],
    },
];

export const SELLER_TOPIC_ARTICLES: readonly TTopicArticle[] = [
    {
        id: "how-to-sell-a-cask",
        title: "How to Sell a Cask",
        sections: [
            {
                title: "Introduction",
                level: 1,
                content: [
                    "Selling your whisky casks on Cask Exchange gives you access to a global network of verified private buyers and trade collectors.",
                ],
            },
            {
                title: "Step 1. List Your Cask",
                level: 1,
                content:
                    "Provide cask documentation, distillery certificates, warehouse location, and specify your desired asking price.",
            },
            {
                title: "Step 2. Review and Accept Offers",
                level: 1,
                content:
                    "When buyers submit offers, you will receive real-time notifications. You can accept, reject, or submit counter-proposals directly from your dashboard.",
            },
            {
                title: "Step 3. Sign Release & Receive Payout",
                level: 1,
                content:
                    "Once the buyer completes deposit and final payments, sign the transfer release form to receive your payout via bank transfer or Stripe.",
            },
        ],
    },
    {
        id: "understanding-offers",
        title: "Understanding Offers",
        sections: [
            {
                title: "Introduction",
                level: 1,
                content: [
                    "The offers system gives buyers and sellers flexibility when trading casks on Cask Exchange. Sellers can review incoming purchase proposals and negotiate terms without losing control of their assets.",
                ],
            },
            {
                title: "How Offers Work",
                level: 1,
                content:
                    "When a prospective buyer submits an offer on your cask:",
                bullets: [
                    "You receive an instant notification with the offered price and validity period",
                    "Your listing remains live for other buyers until an offer is accepted",
                    "You have 72 hours to accept, counter, or decline the offer",
                ],
            },
            {
                title: "Responding to an Offer",
                level: 1,
                content: "You have three actions available for every offer:",
                subsections: [
                    {
                        title: "Accept Offer",
                        content:
                            "Accepting initiates the transaction immediately. The buyer is prompted to submit the deposit, and the cask is reserved.",
                    },
                    {
                        title: "Counter Offer",
                        content:
                            "Propose an alternate price between your asking price and the buyer's bid. The buyer will then have 48 hours to respond.",
                    },
                    {
                        title: "Decline Offer",
                        content:
                            "Politely reject the proposal. The buyer can submit a revised offer if they choose.",
                    },
                ],
            },
        ],
    },
    {
        id: "setting-a-competitive-price",
        title: "Setting a Competitive Price",
        sections: [
            {
                title: "Valuation Guidance",
                level: 1,
                content:
                    "Pricing your cask accurately improves liquidity and shortens time-to-sale. Use recent marketplace sales of identical distillery vintages and cask types as a benchmark.",
            },
        ],
    },
    {
        id: "managing-incoming-offers",
        title: "Managing Incoming Offers",
        sections: [
            {
                title: "Offer Workflow",
                level: 1,
                content:
                    "You will receive email and push notifications whenever a potential buyer places an offer. You have complete control to evaluate each buyer proposal.",
            },
        ],
    },
];

export const MARKETPLACE_TOPIC_ARTICLES: readonly TTopicArticle[] = [
    {
        id: "how-the-marketplace-works",
        title: "How the Marketplace Works",
        sections: [
            {
                title: "Introduction",
                level: 1,
                content: [
                    "Cask Exchange is a transparent, secure peer-to-peer marketplace facilitating transactions of HMRC-bonded single malt Scotch whisky casks.",
                ],
            },
            {
                title: "Verification & Custody",
                level: 1,
                content:
                    "All listed casks are verified with their respective bonded warehouses before listing approval to ensure clean title and authentic provenance.",
            },
        ],
    },
    {
        id: "order-matching-and-offers",
        title: "Order Matching and Offers",
        sections: [
            {
                title: "Market Mechanism",
                level: 1,
                content:
                    "Our order engine matches buyers and sellers based on asking prices and bids, ensuring optimal liquidity and fair market value execution.",
            },
        ],
    },
];

export const WHISKY_CASKS_TOPIC_ARTICLES: readonly TTopicArticle[] = [
    {
        id: "understanding-cask-types",
        title: "Understanding Cask Types",
        sections: [
            {
                title: "Cask Types and Capacities",
                level: 1,
                content:
                    "Whisky maturation depends heavily on the cask type and wood history. Common casks include Ex-Bourbon Barrels (200L), Hogsheads (250L), and Sherry Butts (500L).",
            },
            {
                title: "Wood Influence",
                level: 1,
                content:
                    "American white oak (Quercus alba) imparts vanilla and caramel notes, while European oak (Quercus robur) contributes rich spices and dried fruit flavours.",
            },
        ],
    },
    {
        id: "bonded-warehousing-and-regulations",
        title: "Bonded Warehousing and Regulations",
        sections: [
            {
                title: "HMRC Regulations",
                level: 1,
                content:
                    "All Scotch whisky casks must mature in HMRC-registered excise warehouses located exclusively within Scotland. Cask Exchange ensures all casks remain strictly compliant.",
            },
        ],
    },
];

export function getArticlesByTopic(topicId: string): readonly TTopicArticle[] {
    switch (topicId) {
        case "buying":
            return BUYER_TOPIC_ARTICLES;
        case "selling":
            return SELLER_TOPIC_ARTICLES;
        case "marketplace":
            return MARKETPLACE_TOPIC_ARTICLES;
        case "whisky-casks":
            return WHISKY_CASKS_TOPIC_ARTICLES;
        default:
            return BUYER_TOPIC_ARTICLES;
    }
}

export function getTopicArticle(
    topicId: string,
    articleId: string
): TTopicArticle | undefined {
    const articles = getArticlesByTopic(topicId);
    return articles.find((article) => article.id === articleId);
}
