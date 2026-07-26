import VideoEmbed from '../components/shared/VideoEmbed';

/**
 * /demo — the page you link to in outreach.
 *
 * WHY A PAGE, NOT A RAW YOUTUBE LINK:
 * "decimeshi.com/demo" in an email reads as a company with a product.
 * "youtu.be/YLYqmVmJ39g" reads as a founder pasting a link. Same video, different
 * signal — and the page lets you put a CTA underneath, which YouTube never will.
 *
 * PUBLIC ROUTE. This must sit alongside /docs, /security and /blog in main.jsx —
 * NOT inside the authenticated App routes. A CIO clicking your link should not hit a
 * login wall. That is the single most common way founders lose a warm click.
 */
export default function DemoPage() {
  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-4xl px-6 py-16">

        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">
            Most AI governance tools tell you what happened.
          </h1>
          <p className="mt-3 text-lg text-slate-600">
            DecisionMesh lets you stop it mid-flight — and prove to an auditor who
            stopped it, why, and how long it ran.
          </p>
        </div>

        <VideoEmbed
          videoId="iucFxhOhpT4"
          title="DecisionMesh — the enterprise AI control plane for regulated industries"
          className="shadow-2xl"
        />

        <div className="mt-10 grid gap-4 sm:grid-cols-3">
          {[
            { h: 'Govern',  p: 'Your rules enforced on every AI request, automatically.' },
            { h: 'Prove',   p: 'Any decision reconstructed and replayed, months later.' },
            { h: 'Stop',    p: 'Halt any model mid-flight. One click. Fully audited.' },
          ].map(c => (
            <div key={c.h} className="rounded-xl border border-slate-200 bg-white p-5">
              <p className="text-sm font-semibold text-slate-900">{c.h}</p>
              <p className="mt-1 text-sm text-slate-600">{c.p}</p>
            </div>
          ))}
        </div>

        <div className="mt-10 rounded-xl border border-slate-200 bg-white p-6 text-center">
          <p className="text-sm font-semibold text-slate-900">
            Running AI in a regulated environment?
          </p>
          <p className="mx-auto mt-2 max-w-xl text-sm text-slate-600">
            A 4-week proof of concept on a single AI workflow. Governance, spend control,
            and audit evidence from day one — an endpoint change and a policy config.
          </p>
          <a
            href="mailto:hello@decimeshi.com?subject=DecisionMesh%20—%20proof%20of%20concept"
            className="mt-4 inline-flex items-center rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-blue-700"
          >
            Start a conversation
          </a>
        </div>

      </div>
    </div>
  );
}
