/**
 * DecisionMesh Architecture Diagram
 *
 * Always serves the full-resolution image (1536x1024) — this diagram is
 * text-dense, so downscaled variants make labels unreadable once the
 * browser stretches them back up to the display width. WebP for modern
 * browsers, PNG fallback for the rest.
 *
 * Image lives in public/assets/architecture/ — Vite serves public/ as-is
 * from the site root, so it's referenced as a plain URL string (not
 * `import`ed as a JS module, which only works for files in src/).
 *
 * Styles live in src/index.css (.architecture-diagram*), not a separate
 * CSS file, so they share the app's design tokens (--card-radius, etc).
 */
const basePath = "/assets/architecture";

export default function ArchitectureDiagram() {
  return (
    <section className="architecture-diagram" aria-labelledby="architecture-heading">
      <h2 id="architecture-heading">DecisionMesh Architecture</h2>

      <a
        href={`${basePath}/decisionmesh-architecture.png`}
        className="architecture-diagram__link"
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Open full-size architecture diagram in a new tab"
      >
        <picture>
          <source type="image/webp" srcSet={`${basePath}/decisionmesh-architecture.webp`} />
          <img
            src={`${basePath}/decisionmesh-architecture.png`}
            width={1536}
            height={1024}
            alt="DecisionMesh AI Control Plane architecture: entry and access layer, five-layer control plane (intent, governance, execution, observability, learning), kill switch channel, and connections to the model/tool ecosystem and enterprise integrations."
            loading="lazy"
            decoding="async"
            className="architecture-diagram__img"
          />
        </picture>
      </a>
      <p className="architecture-diagram__caption">Click to view full resolution</p>

      <VerificationArchitecture />
    </section>
  );
}

/**
 * Explains the fact-verification stage that runs after every execution,
 * before an intent is marked satisfied — see decisionmesh-domain's
 * verification/ package (StructuredRuleEngine, VerificationRule) and
 * decisionmesh-application's FactVerificationService/VerificationRuleRegistry
 * for the actual implementation this describes.
 */
function VerificationArchitecture() {
  return (
    <div className="verification-architecture" aria-labelledby="verification-heading">
      <h2 id="verification-heading" className="verification-architecture__heading">
        Deterministic Response Verification
      </h2>
      <p className="verification-architecture__intro">
        Every execution's response passes through a fact-verification stage before
        the intent is marked satisfied — deterministic checks against the model's
        own output, not a second LLM call grading its own homework.
      </p>

      <div className="verification-flow">
        <div className="verification-flow__node verification-flow__node--start">LLM Response</div>
        <div className="verification-flow__arrow">↓</div>
        <div className="verification-flow__node verification-flow__node--decision">
          Rules registered for this intent type?
        </div>
        <div className="verification-flow__branches">
          <div className="verification-flow__branch">
            <span className="verification-flow__branch-label">Yes</span>
            <div className="verification-flow__node verification-flow__node--structured">
              <strong>Structured Rule Engine</strong>
              <span>
                Reads the response's own JSON fields directly — SUM_EQUALS,
                FIELD_SUM_EQUALS, REGEX_MATCH, LOOKUP_PREFIX_EQUALS, ONE_OF.
                Immune to phrasing: the same underlying error is caught
                whether the model writes "A + B = C" or buries it in a
                paragraph.
              </span>
            </div>
          </div>
          <div className="verification-flow__branch">
            <span className="verification-flow__branch-label">No</span>
            <div className="verification-flow__node verification-flow__node--heuristic">
              <strong>Free-text Heuristic</strong>
              <span>
                Scans prose for self-asserted arithmetic ("A + B = C").
                Best-effort fallback for intent types with no registered
                schema — real signal, but only catches an error if the
                model happens to phrase it cleanly.
              </span>
            </div>
          </div>
        </div>
        <div className="verification-flow__arrow">↓</div>
        <div className="verification-flow__node verification-flow__node--result">
          Verification Result
          <span className="verification-flow__badges">
            <span className="verification-badge verification-badge--pass">PASSED</span>
            <span className="verification-badge verification-badge--fail">VIOLATIONS_FOUND</span>
            <span className="verification-badge verification-badge--neutral">NO_CHECKABLE_CLAIMS</span>
          </span>
        </div>
      </div>

      <div className="verification-architecture__extend">
        <h3>Extending coverage</h3>
        <p>
          Rules are DATA, not code — one JSON file per vertical
          (<code>verification-rules-fintech.json</code>, and so on), each entry
          mapping an <code>intentType</code> to the response fields it needs and
          the checks against them. The engine has zero built-in domain
          knowledge — GST math, credit-score aggregation, whatever comes
          next all lives in the rule data, loaded at startup into an
          in-memory registry. Bringing a new intent type or an entirely new
          vertical online is "write a JSON entry," not "write a new Java
          service class" — most of the ~290+ intents across just the
          fintech library, and every other vertical, still fall back to the
          free-text heuristic simply because no one has written their rules
          yet, not because the architecture can't hold them.
        </p>
      </div>
    </div>
  );
}
