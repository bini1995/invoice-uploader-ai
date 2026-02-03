import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  BookOpenIcon,
  CodeBracketIcon,
  CogIcon,
  ShieldCheckIcon,
  RocketLaunchIcon,
  ArrowRightIcon,
  ChevronDownIcon,
  ChevronRightIcon,
  DocumentTextIcon,
  CubeIcon,
  KeyIcon,
} from '@heroicons/react/24/outline';

const DOCS_SECTIONS = [
  {
    id: 'getting-started',
    title: 'Getting Started',
    icon: RocketLaunchIcon,
    content: [
      {
        title: 'Quick Start Guide',
        body: `Welcome to ClarifyOps! Here's how to get started in 5 minutes:

1. **Create an Account**: Visit /signup to create your free account. You can also sign in with Google SSO.

2. **Upload Your First Claim**: Go to ClarifyClaims and click the upload button. Drag and drop any claim document (PDF, Word, or image).

3. **Review Extracted Data**: Our AI will automatically extract key fields like policy numbers, claim amounts, CPT/ICD codes, dates, and patient information.

4. **Set Up Workflows**: Configure OpsClaim to automatically route claims to the right teams based on your rules.

5. **Monitor with AuditFlow**: Use AuditFlow to detect fraud and ensure compliance with audit trails.

Need help? Contact support@clarifyops.com or chat with Clari, our AI assistant.`
      },
      {
        title: 'Understanding the Dashboard',
        body: `The Operations Dashboard is your command center. Here's what each section does:

- **ClarifyClaims**: Upload and manage claim documents with AI extraction
- **AI Spend Analytics**: Track AI usage and processing costs
- **Vendors**: Manage your vendor relationships and contracts
- **AuditFlow**: Review flagged claims and fraud alerts
- **Review**: Human review queue for claims needing attention
- **Archive**: Access historical claims and documents
- **Settings**: Configure your account, team, and integrations`
      }
    ]
  },
  {
    id: 'api-reference',
    title: 'API Reference',
    icon: CodeBracketIcon,
    content: [
      {
        title: 'Authentication',
        body: `All API requests require authentication via API key. Include your key in the X-API-Key header:

\`\`\`
X-API-Key: ck_your_api_key_here
\`\`\`

Generate API keys from Settings > API Keys. Keys can be scoped to specific permissions and set to expire.`
      },
      {
        title: 'Claims API',
        body: `**GET /api/v1/claims**
List all claims with optional filters.

Query Parameters:
- status: Filter by status (pending, approved, denied, review, escalated)
- limit: Number of results (default 50)
- offset: Pagination offset
- since: ISO date for claims created after

**GET /api/v1/claims/:id**
Get a specific claim by ID.

**POST /api/v1/claims/:id/status**
Update claim status.

Body:
\`\`\`json
{
  "status": "approved",
  "notes": "Optional notes"
}
\`\`\`

Valid statuses: pending, approved, denied, review, escalated`
      },
      {
        title: 'Webhooks',
        body: `**POST /api/v1/webhooks/claim-update**
Receive external status updates for claims.

Body:
\`\`\`json
{
  "claim_id": 123,
  "external_status": "processed",
  "external_id": "EXT-456",
  "source": "guidewire"
}
\`\`\`

Webhooks are queued and processed asynchronously. Use this endpoint to sync claim status from external systems.`
      }
    ]
  },
  {
    id: 'integrations',
    title: 'Integrations',
    icon: CubeIcon,
    content: [
      {
        title: 'Guidewire ClaimCenter',
        body: `Connect ClarifyOps to Guidewire ClaimCenter for seamless claims synchronization.

**Setup:**
1. Go to Settings > Integrations > Guidewire
2. Enter your ClaimCenter API credentials
3. Configure field mappings
4. Enable real-time sync

**Features:**
- Bi-directional claim sync
- Status updates
- Document attachments
- Custom field mapping`
      },
      {
        title: 'Duck Creek',
        body: `Integrate with Duck Creek for policy and claims management.

**Setup:**
1. Go to Settings > Integrations > Duck Creek
2. Configure OAuth credentials
3. Map claim fields
4. Test connection

**Supported Operations:**
- Claim creation
- Status updates
- Policy lookups
- Document sync`
      },
      {
        title: 'Zapier',
        body: `Connect ClarifyOps to 5,000+ apps via Zapier.

**Popular Triggers:**
- New claim uploaded
- Claim status changed
- Fraud alert triggered

**Popular Actions:**
- Create claim from form submission
- Send notification on approval
- Update CRM on claim completion

Visit zapier.com/apps/clarifyops to set up your Zaps.`
      }
    ]
  },
  {
    id: 'security',
    title: 'Security & Compliance',
    icon: ShieldCheckIcon,
    content: [
      {
        title: 'HIPAA Compliance',
        body: `ClarifyOps is fully HIPAA compliant:

- **Encryption**: All data encrypted at rest (AES-256) and in transit (TLS 1.3)
- **Audit Logging**: Complete audit trail of all data access and modifications
- **PHI Redaction**: Automatic detection and redaction of PHI in exports
- **BAA**: We sign Business Associate Agreements with all customers
- **Access Controls**: Role-based permissions with MFA support`
      },
      {
        title: 'SOC 2 Type II',
        body: `Our SOC 2 Type II certification demonstrates our commitment to security:

- **Security**: Robust access controls and threat protection
- **Availability**: 99.9% uptime SLA with redundant infrastructure
- **Confidentiality**: Data isolation and encryption
- **Processing Integrity**: Validated data processing accuracy
- **Privacy**: Comprehensive privacy controls`
      },
      {
        title: 'Data Retention',
        body: `Configure data retention policies to meet your compliance requirements:

- Default retention: 7 years (adjustable)
- Automatic archival after configurable period
- Secure deletion with audit trail
- Export before deletion option

Configure retention in Settings > Compliance > Data Retention.`
      }
    ]
  },
  {
    id: 'sso',
    title: 'SSO & Authentication',
    icon: KeyIcon,
    content: [
      {
        title: 'Google SSO',
        body: `Sign in with your Google account for easy access.

**For Users:**
1. Click "Continue with Google" on the login page
2. Select your Google account
3. You're signed in!

**For Admins:**
Google SSO is enabled by default. No configuration required.`
      },
      {
        title: 'Enterprise SSO',
        body: `Enterprise plans support custom SSO providers:

**Supported Protocols:**
- SAML 2.0
- OpenID Connect (OIDC)
- OAuth 2.0

**Configuration:**
Contact your account manager to set up enterprise SSO with your identity provider (Okta, Azure AD, OneLogin, etc.).`
      }
    ]
  }
];

export default function DocsPage() {
  const [expandedSections, setExpandedSections] = useState(['getting-started']);
  const [selectedArticle, setSelectedArticle] = useState(null);

  const toggleSection = (sectionId) => {
    setExpandedSections(prev =>
      prev.includes(sectionId)
        ? prev.filter(id => id !== sectionId)
        : [...prev, sectionId]
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900">
      <nav className="fixed top-0 left-0 right-0 bg-white dark:bg-slate-800 border-b border-gray-200 dark:border-slate-700 z-20">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3">
            <span className="font-bold text-xl tracking-tight"><span className="text-gray-900 dark:text-white">CLARIFY</span><span className="text-purple-600">OPS</span></span>
            <span className="text-gray-400">|</span>
            <span className="text-gray-500 dark:text-gray-400 font-medium">Docs</span>
          </Link>
          <div className="flex items-center gap-4">
            <Link to="/login" className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white">
              Sign In
            </Link>
            <Link to="/signup" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      <div className="pt-16 flex">
        <aside className="w-64 fixed left-0 top-16 bottom-0 overflow-y-auto bg-white dark:bg-slate-800 border-r border-gray-200 dark:border-slate-700 p-4">
          <div className="space-y-2">
            {DOCS_SECTIONS.map((section) => {
              const Icon = section.icon;
              const isExpanded = expandedSections.includes(section.id);
              return (
                <div key={section.id}>
                  <button
                    onClick={() => toggleSection(section.id)}
                    className="w-full flex items-center gap-2 px-3 py-2 text-left rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors"
                  >
                    {isExpanded ? (
                      <ChevronDownIcon className="w-4 h-4 text-gray-500" />
                    ) : (
                      <ChevronRightIcon className="w-4 h-4 text-gray-500" />
                    )}
                    <Icon className="w-5 h-5 text-blue-600" />
                    <span className="font-medium text-gray-900 dark:text-white">{section.title}</span>
                  </button>
                  {isExpanded && (
                    <div className="ml-9 mt-1 space-y-1">
                      {section.content.map((article, idx) => (
                        <button
                          key={idx}
                          onClick={() => setSelectedArticle({ section, article })}
                          className={`w-full text-left px-3 py-1.5 text-sm rounded-lg transition-colors ${
                            selectedArticle?.article.title === article.title
                              ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400'
                              : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-700'
                          }`}
                        >
                          {article.title}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </aside>

        <main className="ml-64 flex-1 p-8">
          {selectedArticle ? (
            <article className="max-w-3xl">
              <nav className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                <span>{selectedArticle.section.title}</span>
                <span className="mx-2">/</span>
                <span className="text-gray-900 dark:text-white">{selectedArticle.article.title}</span>
              </nav>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
                {selectedArticle.article.title}
              </h1>
              <div className="prose dark:prose-invert max-w-none">
                <pre className="whitespace-pre-wrap font-sans text-gray-700 dark:text-gray-300 leading-relaxed">
                  {selectedArticle.article.body}
                </pre>
              </div>
            </article>
          ) : (
            <div className="max-w-3xl">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                ClarifyOps Documentation
              </h1>
              <p className="text-lg text-gray-600 dark:text-gray-400 mb-8">
                Everything you need to get started with ClarifyOps - from quick start guides to API reference.
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {DOCS_SECTIONS.map((section) => {
                  const Icon = section.icon;
                  return (
                    <button
                      key={section.id}
                      onClick={() => {
                        toggleSection(section.id);
                        setSelectedArticle({ section, article: section.content[0] });
                      }}
                      className="flex items-start gap-4 p-4 bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 hover:border-blue-300 dark:hover:border-blue-700 transition-colors text-left"
                    >
                      <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                        <Icon className="w-6 h-6 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900 dark:text-white">{section.title}</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                          {section.content.length} articles
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
