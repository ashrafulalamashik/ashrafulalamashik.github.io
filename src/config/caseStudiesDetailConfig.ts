// Configuration for detailed case studies.
// Keeps the main siteConfig.ts clean while supporting high-density technical copy.

export interface CaseStudyDetailData {
  slug: string;
  category: string;
  title: string;
  subtitle: string;
  role: string;
  status: string;
  completionProgress: {
    backend: number;
    frontend: number;
  };
  techStack: {
    frontend: string[];
    backend: string[];
    infrastructure: string[];
  };
  summary: string;
  challenge: {
    description: string;
    objectives: string[];
  };
  architectureAndSecurity: {
    title: string;
    points: {
      title: string;
      description: string;
      codeSnippet?: string;
    }[];
  };
  keyFeatures: {
    title: string;
    description: string;
  }[];
  outcomes: string[];
}

export const caseStudiesDetailConfig: Record<string, CaseStudyDetailData> = {
  "future-shop": {
    slug: "future-shop",
    category: "E-COMMERCE & DEVSECOPS",
    title: "Future Shop",
    subtitle: "A high-performance, mobile-first, multi-vendor marketplace designed with a zero-trust security architecture.",
    role: "Lead Full-Stack Architect & DevSecOps Engineer (Solo Developer)",
    status: "MVP ~85% Complete (Backend 100% Complete)",
    completionProgress: {
      backend: 100,
      frontend: 85
    },
    techStack: {
      frontend: ["Next.js 16 (App Router)", "React 19", "TypeScript", "Tailwind CSS 4", "shadcn/ui", "Zustand", "Recharts"],
      backend: ["Laravel 12 (PHP 8.2)", "PostgreSQL 18.4", "Redis (Cache & OTP)"],
      infrastructure: ["Cloudflare R2", "SSL Commerz Payment Gateway", "SSL Wireless SMS API"]
    },
    summary: "Future Shop is a next-generation multi-vendor e-commerce marketplace engineered specifically for local commerce in the Sherpur and Bogura regions of Bangladesh. Architected as a high-performance, mobile-first MVP, the platform bridges the gap between rural and semi-urban retail hubs and digital buyers. Developed single-handedly, the project demonstrates how modern architectural patterns, strict security parameters, and robust automated operations can deliver enterprise-grade performance on a localized scale.",
    challenge: {
      description: "Local commerce in Bogura/Sherpur requires a mobile-first, lightweight interface (given variable mobile network quality) while supporting complex multi-role operations (Super Admins, Vendors, Delivery Boys, and Customers) and localized payment/SMS systems. It also needs to prevent typical security loopholes in standard e-commerce scripts (such as SQL injection, cart-tampering, price exploits, and SMS OTP abuse).",
      objectives: [
        "Create a hyper-fast mobile-first interface optimized for budget devices and fluctuating network connections.",
        "Implement a secure, stateless authentication mechanism with robust rate-limiting.",
        "Build a tamper-proof payment verification flow that defends against webhook exploits.",
        "Establish pessimistic inventory locking at the database level to prevent race conditions during flash sales."
      ]
    },
    architectureAndSecurity: {
      title: "DevSecOps & Zero-Trust Security Implementation",
      points: [
        {
          title: "Zero SQL Injection & Type-Safe Inputs",
          description: "Implemented an elliptical database interaction pattern using Eloquent ORM exclusively. No raw SQL queries are allowed in the repository layer. Inputs are parsed and validated at the HTTP boundary using dedicated Laravel FormRequest schemas containing strict type-checking.",
          codeSnippet: `// Example of FormRequest validation enforcing strict input schema
public function rules(): array {
    return [
        'product_id' => 'required|integer|exists:products,id',
        'quantity'   => 'required|integer|min:1|max:10',
        'payment_method' => 'required|string|in:cash_on_delivery,sslcommerz'
    ];
}`
        },
        {
          title: "Redis-Backed Stateless OTP Authentication",
          description: "All client requests are stateless and authenticated via Laravel Sanctum bearer tokens. Customer accounts are verified using phone OTPs stored temporarily in Redis. To prevent brute-force attacks and SMS gateway financial drain, the auth endpoint enforces a strict rate-limit and triggers a 60-minute IP/number lockout after 5 consecutive failed verification attempts.",
          codeSnippet: `// Rate-limiting configuration in Redis cache store
$lockKey = "otp_lock:" . $phoneNumber;
$attempts = Redis::incr($lockKey);
if ($attempts > 5) {
    Redis::expire($lockKey, 3600); // 1-hour block
    throw new LockoutException("Too many verification attempts.");
}`
        },
        {
          title: "Defense-in-Depth XSS & Token Shielding",
          description: "Next.js frontend access tokens are kept strictly in client-side sessionStorage, ensuring they are deleted immediately upon closing the browser tab. All routing and middleware checks are secured via HttpOnly, Secure, and SameSite=Strict cookies to verify user identity at the edge, blocking unauthorized access prior to page rendering.",
        },
        {
          title: "Tamper-Proof Payment Webhook Verification",
          description: "The SSL Commerz payment gateway webhook utilizes strict SHA-256 HMAC signature verification. On callback receipt, the backend re-verifies the transaction signature and queries the database to compare the absolute order amount and currency against the paid amount, preventing payload tampering, price exploits, and transaction replay attacks.",
          codeSnippet: `// Server-side payment validation webhook
$isValidSignature = SSLCommerz::verifySignature($request->all());
if (!$isValidSignature) {
    return response()->json(['message' => 'Invalid signature'], 400);
}
$order = Order::findOrFail($request->order_id);
if ($order->amount !== (float)$request->amount || $order->currency !== $request->currency) {
    throw new PaymentMismatchException("Transaction verification failed.");
}`
        },
        {
          title: "Sandboxed File Handling & R2 Uploads",
          description: "All uploaded images are processed in a memory sandbox. Using Intervention Image v3, files undergo magic-byte and MIME checking to detect nested shell scripts within images. They are then compressed, converted to WebP formats, resized to standard dimensions, and uploaded to Cloudflare R2 using pre-signed secure URLs.",
        },
        {
          title: "Security through Obscurity & Hydration Safety",
          description: "The administrative panel login endpoint is hidden under a custom obscure route (/fuminds) to bypass automated scanner bots. Additionally, secure CORS policies are enforced to restrict cross-origin scripts, and Next.js hydration safety wrappers prevent data leakage during server-to-client rendering.",
        }
      ]
    },
    keyFeatures: [
      {
        title: "Dynamic Multi-Role RBAC",
        description: "Custom Role-Based Access Control enforcing distinct dashboard views, database views, and transaction boundaries for Super Admins, Vendors, Delivery Boys, and Customers."
      },
      {
        title: "Complex Performance Dashboard",
        description: "Built a double-panel collapsible sidebar layout featuring interactive business metrics (Revenue, Profit Margin tracking, low-stock warnings, vendor payouts) powered by Next.js Server Actions and visualized with Recharts."
      },
      {
        title: "Unified Cart & Stock Locking",
        description: "Engineered a cache-abstracted cart engine that merges guest and authenticated user carts on login. Implemented database-level pessimistic locking (sharedLock/lockForUpdate) during checkout, blocking race conditions on high-demand items."
      },
      {
        title: "Localized Mobile-First UX",
        description: "Strict viewport sizing down to 375px with 44px touch targets. Built to be highly responsive and lightweight for users on slow or variable cellular connections."
      }
    ],
    outcomes: [
      "100% completed Laravel API layer with unified error handling and database transaction wrapper.",
      "Bulletproof backend authentication with zero vulnerability surface on OTP and token exchange.",
      "High scalability and low latency due to extensive Redis caching and Cloudflare R2 offloading.",
      "Robust client-side protection blocking price, quantity, and payload modifications through strict server checks."
    ]
  },
  "local-retail-seo": {
    slug: "local-retail-seo",
    category: "E-COMMERCE",
    title: "E-commerce SEO Optimization for Local Retailer",
    subtitle: "How we reduced load times and boosted organic reach by 180% for a local merchant.",
    role: "SEO Specialist & Technical Web Consultant",
    status: "Completed",
    completionProgress: {
      backend: 100,
      frontend: 100
    },
    techStack: {
      frontend: ["WordPress", "Custom CSS", "Core Web Vitals Optimizers"],
      backend: ["PHP Customizations"],
      infrastructure: ["Google Search Console", "Google Analytics", "Ahrefs"]
    },
    summary: "A local retail merchant was struggling with low organic search engine visibility, slow load times exceeding 8 seconds, and zero digital conversion rates. We implemented a comprehensive technical SEO restructure, optimized core assets, and established high-value local backlinks.",
    challenge: {
      description: "The client's website had massive unoptimized image assets, redundant scripts, missing schema markup, and incorrect meta setups. This caused search indexing issues and high bounce rates from mobile searchers.",
      objectives: [
        "Optimize page speed performance and pass Core Web Vitals.",
        "Implement detailed Product schema markup for Google Search snippets.",
        "Improve organic keyword rankings on high-intent local search queries."
      ]
    },
    architectureAndSecurity: {
      title: "Technical SEO & Performance Architectures",
      points: [
        {
          title: "Speed Restructure & Asset Deferral",
          description: "Compressed and migrated all site assets to next-gen WebP formats. Deferred non-critical JS/CSS execution, reducing the Largest Contentful Paint (LCP) from 6.8s to 1.8s."
        },
        {
          title: "Structured Schema Implementation",
          description: "Implemented JSON-LD schema markup dynamically for products, reviews, and local business address information. This led to rich snippets displaying price, stock availability, and ratings directly on search engine result pages (SERPs)."
        }
      ]
    },
    keyFeatures: [
      {
        title: "Technical Site Audits",
        description: "Fixed indexing loops, broken internal link structures, and resolved duplicate content issues."
      },
      {
        title: "On-Page Optimization",
        description: "Wrote optimized title tags, meta descriptions, and header tags for over 150+ product lines."
      }
    ],
    outcomes: [
      "Page load speed decreased from 8 seconds to 2.1 seconds.",
      "Organic traffic grew by 180% in the first 4 months following deployment.",
      "15 competitive local keywords reached page one of Google Search.",
      "Monthly conversions from organic search channels rose from 0 to 45/month."
    ]
  },
  "corporate-redesign": {
    slug: "corporate-redesign",
    category: "CORPORATE",
    title: "Corporate Website Redesign for Service Company",
    subtitle: "Transforming an outdated corporate portal into a lead-generating, mobile-first asset.",
    role: "Lead Full-Stack Web Developer & UI/UX Designer",
    status: "Completed",
    completionProgress: {
      backend: 100,
      frontend: 100
    },
    techStack: {
      frontend: ["React", "Tailwind CSS", "shadcn/ui", "Framer Motion"],
      backend: ["Laravel", "PostgreSQL"],
      infrastructure: ["CRM Integrations", "Vercel Hosting"]
    },
    summary: "A corporate B2B services firm was losing prospective leads due to an outdated, slow, and non-responsive web design that suffered from a high 78% bounce rate. We fully redesigned the platform to optimize lead funnels and integrate automatic CRM lead capturing.",
    challenge: {
      description: "The old site was not responsive on mobile screens, and the contact and intake forms were prone to errors, failing to forward leads to the sales team.",
      objectives: [
        "Build a modern, responsive web application that loads instantly.",
        "Establish clean UI/UX with smooth transitions using Framer Motion.",
        "Integrate a secure, automated webhook connection to the company's internal CRM."
      ]
    },
    architectureAndSecurity: {
      title: "UI/UX & Integration Security",
      points: [
        {
          title: "Mobile-First Fluid Layout",
          description: "Re-engineered all layouts using Tailwind's flexbox/grid models, ensuring identical rendering from small mobile viewports up to wide 4K displays."
        },
        {
          title: "Secure Webhook Form Submissions",
          description: "Designed secure REST endpoints to handle contact submissions, adding CSRF validation, email filtering, and sanitization before pushing lead objects to the CRM."
        }
      ]
    },
    keyFeatures: [
      {
        title: "Conversion-Focused Landing Pages",
        description: "Interactive service description pages with strategic Call-to-Action (CTA) triggers."
      },
      {
        title: "CRM System Integration",
        description: "Automatic lead routing, status classification, and email notifications to the operations team."
      }
    ],
    outcomes: [
      "Bounce rate decreased from 78% to 32% within 30 days of launch.",
      "Lead generation conversions rose by 220% due to clearer funnel designs.",
      "Mobile traffic engagement increased by 150%, boosting average session duration by 3x."
    ]
  }
};
