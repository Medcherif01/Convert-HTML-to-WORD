import { TemplateDoc } from '../types';

export const DOCUMENT_TEMPLATES: TemplateDoc[] = [
  {
    id: 'annual-report',
    title: 'Annual Activity & Performance Report',
    category: 'Business & Finance',
    description: 'Comprehensive corporate document with executive summary, KPI tables, key achievements, and strategic outlook.',
    defaultThemeId: 'corporate-navy',
    htmlContent: `<h1>ANNUAL BUSINESS ACTIVITY &amp; PERFORMANCE REPORT</h1>
<p><strong>Reporting Period:</strong> Fiscal Year 2025–2026 &nbsp;|&nbsp; <strong>Department:</strong> Corporate Strategy &amp; Finance &nbsp;|&nbsp; <strong>Date:</strong> August 28, 2026</p>
<hr />

<h2>1. Executive Summary</h2>
<p>The past fiscal year demonstrated <em>strong sustained growth</em> and landmark operational transformations. Driven by the expansion of our digital service portfolio and optimized overhead structures, overall company revenue surged by <strong>+18.4%</strong> year-over-year.</p>

<div class="callout callout-info">
  <p><strong>Key Takeaway:</strong> The Horizon 2028 strategic roadmap achieved 92% of its core operational milestones 3 months ahead of the projected timeline.</p>
</div>

<h2>2. Key Performance Indicators (KPIs) &amp; Financial Overview</h2>
<p>The table below summarizes our essential performance indicators benchmarked against initial annual targets:</p>

<table>
  <thead>
    <tr>
      <th style="width: 32%;">Key Performance Indicator</th>
      <th style="width: 17%;">Target 2025</th>
      <th style="width: 17%;">Actual 2025</th>
      <th style="width: 17%;">Variance</th>
      <th style="width: 17%;">Status</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><strong>Total Gross Revenue</strong></td>
      <td>$12,500,000</td>
      <td>$14,800,000</td>
      <td>+18.4%</td>
      <td>Exceeded</td>
    </tr>
    <tr>
      <td><strong>Operating Profit Margin</strong></td>
      <td>32.0%</td>
      <td>35.8%</td>
      <td>+3.8 pts</td>
      <td>Achieved</td>
    </tr>
    <tr>
      <td><strong>Customer Acquisition Cost (CAC)</strong></td>
      <td>$450</td>
      <td>$380</td>
      <td>-15.5%</td>
      <td>Optimized</td>
    </tr>
    <tr>
      <td><strong>Net Promoter Score (NPS)</strong></td>
      <td>+55</td>
      <td>+64</td>
      <td>+9 pts</td>
      <td>Excellent</td>
    </tr>
    <tr>
      <td><strong>Carbon Footprint Reduction</strong></td>
      <td>-10.0%</td>
      <td>-14.2%</td>
      <td>-4.2 pts</td>
      <td>Compliant</td>
    </tr>
  </tbody>
</table>

<h2>3. Major Operational Achievements</h2>
<ul>
  <li><strong>Unified Cloud Platform Deployment:</strong> Successfully migrated 100% of core infrastructure with zero downtime during business hours.</li>
  <li><strong>Acquisition of 45 Strategic Enterprise Accounts:</strong> Strengthened market positioning across North America and European territories.</li>
  <li><strong>ISO 27001 &amp; SOC-2 Type II Certification:</strong> Recognized for best-in-class data governance, encryption, and operational security standards.</li>
</ul>

<h2>4. Strategic Recommendations for 2027</h2>
<blockquote>
  <p>« Maintain technological leadership while solidifying client retention and accelerating responsible AI and automated workflow deployments. »</p>
</blockquote>
<p>For the upcoming fiscal cycle, executive management recommends prioritizing resource allocation toward core R&amp;D and continuous training initiatives for operational teams.</p>`
  },
  {
    id: 'commercial-proposal',
    title: 'Business Proposal & Quotation',
    category: 'Sales & Billing',
    description: 'Commercial document structure with client details, itemized service breakdown, tax calculations, and sign-off block.',
    defaultThemeId: 'modern-slate',
    htmlContent: `<h1>COMMERCIAL PROPOSAL &amp; QUOTATION</h1>
<p><strong>Quote Ref:</strong> QUO-2026-0842 &nbsp;|&nbsp; <strong>Issue Date:</strong> August 28, 2026 &nbsp;|&nbsp; <strong>Validity:</strong> 30 Days</p>
<hr />

<h2>General Information</h2>
<table>
  <thead>
    <tr>
      <th style="width: 50%;">Service Provider</th>
      <th style="width: 50%;">Client Information</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>
        <strong>ACME DIGITAL ENTERPRISE CORP</strong><br />
        100 Innovation Boulevard, Suite 400, New York, NY 10001<br />
        Tax ID: US-849123456 &nbsp;|&nbsp; D-U-N-S: 12-345-6789<br />
        Contact: billing@acme-digital.com
      </td>
      <td>
        <strong>GLOBAL HORIZON TECHNOLOGIES LLC</strong><br />
        250 Enterprise Way, Floor 12, Chicago, IL 60601<br />
        Attention: Mr. Thomas Lauren, Chief Technology Officer<br />
        Email: t.lauren@globalhorizon.com
      </td>
    </tr>
  </tbody>
</table>

<h2>Itemized Scope of Services</h2>
<table>
  <thead>
    <tr>
      <th style="width: 48%;">Service Description</th>
      <th style="width: 14%;">Qty / Days</th>
      <th style="width: 18%;">Unit Price</th>
      <th style="width: 20%;">Total Amount</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><strong>Phase 1: Architecture Audit &amp; Technical Framing</strong><br /><small>Analysis of legacy systems, stakeholder workshops, and system architecture blueprint.</small></td>
      <td>5 days</td>
      <td>$1,100.00</td>
      <td>$5,500.00</td>
    </tr>
    <tr>
      <td><strong>Phase 2: Custom Web Platform &amp; API Integration</strong><br /><small>Modern responsive frontend, secure REST/GraphQL gateway, enterprise SSO authentication.</small></td>
      <td>18 days</td>
      <td>$950.00</td>
      <td>$17,100.00</td>
    </tr>
    <tr>
      <td><strong>Phase 3: QA Validation, Performance &amp; Load Testing</strong><br /><small>End-to-end automated testing, GDPR &amp; SOC2 compliance review, vulnerability assessment.</small></td>
      <td>4 days</td>
      <td>$950.00</td>
      <td>$3,800.00</td>
    </tr>
    <tr>
      <td><strong>Phase 4: Knowledge Transfer &amp; Team Training</strong><br /><small>Comprehensive developer documentation, administrator playbooks, and 2 hands-on workshops.</small></td>
      <td>2 days</td>
      <td>$850.00</td>
      <td>$1,700.00</td>
    </tr>
  </tbody>
</table>

<h2>Financial Summary &amp; Total</h2>
<table>
  <tbody>
    <tr>
      <td style="width: 72%; text-align: right;"><strong>Net Subtotal:</strong></td>
      <td style="width: 28%;"><strong>$28,100.00</strong></td>
    </tr>
    <tr>
      <td style="text-align: right;">Sales Tax / VAT (8.875%):</td>
      <td>$2,493.88</td>
    </tr>
    <tr style="background-color: #f1f5f9;">
      <td style="text-align: right;"><strong>TOTAL PAYABLE (USD):</strong></td>
      <td><strong>$30,593.88</strong></td>
    </tr>
  </tbody>
</table>

<div class="callout callout-info">
  <p><strong>Payment Schedule:</strong> 30% initial deposit upon signing ($9,178.16), 40% upon completion of Phase 2 milestone, and the remaining 30% balance net-30 days post final acceptance.</p>
</div>

<p><em>Accepted and agreed by Authorized Client Representative:</em></p>
<p><br />Authorized Signature &amp; Date: __________________________________________</p>`
  },
  {
    id: 'mutual-nda',
    title: 'Mutual Non-Disclosure Agreement (NDA)',
    category: 'Legal & Compliance',
    description: 'Legally structured contract with numbered clauses, clear definitions, non-disclosure obligations, and jurisdiction.',
    defaultThemeId: 'bordeaux-prestige',
    htmlContent: `<h1>MUTUAL NON-DISCLOSURE AGREEMENT (NDA)</h1>
<p><strong>Contract Ref:</strong> NDA-2026-MNT &nbsp;|&nbsp; <strong>Effective Date:</strong> August 28, 2026</p>
<hr />

<h2>BY AND BETWEEN:</h2>
<p><strong>1. NOVAPROJECT CORP</strong>, a corporation organized under the laws of Delaware, having its principal office at 100 Wall Street, 15th Floor, New York, NY 10005, represented by Claire Valette, Chief Executive Officer,<br /><em>(hereinafter referred to as the "First Party"),</em></p>

<p><strong>AND:</strong></p>

<p><strong>2. DATACORE SYSTEMS INC</strong>, a corporation organized under the laws of California, having its principal office at 500 Silicon Way, Palo Alto, CA 94301, represented by Alexander Mitchell, Managing Director,<br /><em>(hereinafter referred to as the "Second Party").</em></p>

<p><em>Each a "Party" and collectively the "Parties".</em></p>

<div class="callout callout-info">
  <p><strong>Preamble:</strong> In connection with exploring a potential commercial and technological collaboration, the Parties will exchange proprietary, technical, and confidential financial information.</p>
</div>

<h2>Section 1 — Definition of Confidential Information</h2>
<p>The term <strong>"Confidential Information"</strong> encompasses all technical data, trade secrets, software code, product roadmaps, financial projections, customer lists, and proprietary know-how disclosed by either Party, whether in written, oral, visual, or electronic form.</p>

<h2>Section 2 — Non-Disclosure &amp; Protection Obligations</h2>
<p>Each Receiving Party explicitly agrees to:</p>
<ul>
  <li>Maintain strict confidentiality of all received Confidential Information using the highest standard of care;</li>
  <li>Not disclose or disseminate any Confidential Information to third parties without prior written consent;</li>
  <li>Restrict access to employees and contractors on a strict "need-to-know" basis under equivalent non-disclosure agreements;</li>
  <li>Refrain from reverse-engineering, decompiling, or duplicating any confidential materials.</li>
</ul>

<h2>Section 3 — Term &amp; Termination</h2>
<p>This Agreement shall remain in effect for a period of <strong>three (3) years</strong> from the Effective Date, and the confidentiality obligations herein shall survive termination for an additional two (2) years.</p>

<h2>Section 4 — Governing Law &amp; Dispute Resolution</h2>
<p>This Agreement shall be governed by and construed in accordance with the laws of the State of New York. Any legal dispute shall be submitted to the exclusive jurisdiction of the state and federal courts located in New York County, New York.</p>`
  },
  {
    id: 'technical-spec',
    title: 'Technical System Architecture & API Spec',
    category: 'Engineering & IT',
    description: 'System design document featuring API endpoint matrices, SLA tables, security guidelines, and formatted code blocks.',
    defaultThemeId: 'emerald-executive',
    htmlContent: `<h1>SYSTEM ARCHITECTURE &amp; API SPECIFICATION</h1>
<p><strong>System:</strong> Core Microservices Gateway &nbsp;|&nbsp; <strong>Version:</strong> 3.4.0 &nbsp;|&nbsp; <strong>Status:</strong> Production Ready</p>
<hr />

<h2>1. Architectural Overview</h2>
<p>The API Gateway module centralizes OAuth2/JWT token validation, rate limiting, telemetry logging, and dynamic routing to downstream distributed storage and rendering engines.</p>

<div class="callout callout-info">
  <p><strong>Security Standard:</strong> All inbound requests must utilize TLS 1.3 encryption with ECDHE-RSA-AES256-GCM-SHA384 cipher suites and signed JWT authorization headers.</p>
</div>

<h2>2. Core Endpoints &amp; Request Methods</h2>
<table>
  <thead>
    <tr>
      <th style="width: 14%;">HTTP Method</th>
      <th style="width: 36%;">Endpoint URI</th>
      <th style="width: 25%;">Authentication</th>
      <th style="width: 25%;">Response Format</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><strong>GET</strong></td>
      <td><code>/api/v3/documents</code></td>
      <td>Bearer Token (JWT)</td>
      <td>JSON / Application</td>
    </tr>
    <tr>
      <td><strong>POST</strong></td>
      <td><code>/api/v3/documents/convert</code></td>
      <td>Bearer Token (Scope: Write)</td>
      <td>Binary / Multi-part</td>
    </tr>
    <tr>
      <td><strong>PUT</strong></td>
      <td><code>/api/v3/settings/theme</code></td>
      <td>Admin Role Required</td>
      <td>JSON Object</td>
    </tr>
    <tr>
      <td><strong>DELETE</strong></td>
      <td><code>/api/v3/cache/flush</code></td>
      <td>SuperAdmin Only</td>
      <td>Status 204 No Content</td>
    </tr>
  </tbody>
</table>

<h2>3. Service Level Agreement (SLA) &amp; Availability Matrix</h2>
<table>
  <thead>
    <tr>
      <th style="width: 32%;">Component Name</th>
      <th style="width: 22%;">Target Availability</th>
      <th style="width: 20%;">P99 Latency</th>
      <th style="width: 26%;">Fault Tolerance Model</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>Edge Proxy (Nginx / Envoy)</td>
      <td>99.99%</td>
      <td>&lt; 5 ms</td>
      <td>Multi-Zone Active/Active</td>
    </tr>
    <tr>
      <td>Word / PDF Conversion Engine</td>
      <td>99.95%</td>
      <td>&lt; 150 ms</td>
      <td>Kubernetes Horizontal Autoscaling</td>
    </tr>
    <tr>
      <td>Distributed Object Storage</td>
      <td>99.999%</td>
      <td>&lt; 20 ms</td>
      <td>Triple Geo-Redundant Replication</td>
    </tr>
  </tbody>
</table>`
  },
  {
    id: 'executive-resume',
    title: 'Professional Software Architect CV / Resume',
    category: 'Career & HR',
    description: 'Polished executive resume structure with executive summary, employment history, technical competencies, and degrees.',
    defaultThemeId: 'imperial-indigo',
    htmlContent: `<h1>MARC A. DUBOIS</h1>
<p><strong>Principal Software Architect &amp; Full-Stack Technical Lead</strong><br />
San Francisco, CA &nbsp;|&nbsp; marc.dubois@email.com &nbsp;|&nbsp; +1 (415) 555-0198 &nbsp;|&nbsp; linkedin.com/in/marcadubois</p>
<hr />

<h2>Executive Summary</h2>
<p>Results-driven Principal Architect with 10+ years of expertise designing high-throughput, fault-tolerant distributed cloud systems. Specialized in TypeScript, React, scalable document processing pipelines, and developer tooling.</p>

<h2>Professional Experience</h2>
<h3>Principal Architect — Apex Software Systems (2021 – Present)</h3>
<ul>
  <li>Led a high-performing engineering division of 16 senior and staff software engineers.</li>
  <li>Architected high-volume document rendering microservices processing 600,000+ files monthly.</li>
  <li>Reduced system end-to-end latency by 42% via an event-driven architecture and optimized TypeScript engine.</li>
</ul>

<h3>Senior Full-Stack Engineer — CloudSphere Labs (2017 – 2021)</h3>
<ul>
  <li>Engineered mission-critical web applications with React, Node.js, and PostgreSQL.</li>
  <li>Implemented automated CI/CD deployment pipelines with 94%+ automated test coverage.</li>
</ul>

<h2>Core Competencies &amp; Technical Skills</h2>
<table>
  <thead>
    <tr>
      <th style="width: 30%;">Domain / Focus Area</th>
      <th style="width: 70%;">Mastered Technologies &amp; Methodologies</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><strong>Programming Languages</strong></td>
      <td>TypeScript, JavaScript (ESNext), Python, SQL, HTML5 / CSS3</td>
    </tr>
    <tr>
      <td><strong>Frameworks &amp; Libraries</strong></td>
      <td>React, Express, Vite, Tailwind CSS, Next.js, Redux Toolkit</td>
    </tr>
    <tr>
      <td><strong>Cloud &amp; DevOps Infrastructure</strong></td>
      <td>Docker, Kubernetes, AWS (ECS, S3, RDS), GCP Cloud Run, GitHub Actions CI/CD</td>
    </tr>
    <tr>
      <td><strong>Engineering Practices</strong></td>
      <td>Domain-Driven Design (DDD), Test-Driven Development (TDD), Microservices, Agile Scrum</td>
    </tr>
  </tbody>
</table>

<h2>Education &amp; Credentials</h2>
<p><strong>Master of Science in Computer Science &amp; Distributed Systems</strong> — Stanford University (2017)</p>`
  }
];

