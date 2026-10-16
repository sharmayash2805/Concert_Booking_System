const Terms = () => (
  <div className="container mx-auto min-h-screen px-4 py-12">
    <article aria-labelledby="terms-title" className="max-w-3xl">
      <p className="font-mono-ticket text-xs uppercase text-vermilion">Demo document · Not legal advice</p>
      <h1 id="terms-title" className="mt-2 font-display text-5xl">Terms of use</h1>
      <p className="mt-3 text-sm text-muted-foreground">For the Stubline demonstration only.</p>

      <div className="mt-8 space-y-6">
        <section>
          <h2 className="font-display text-2xl">Demonstration service</h2>
          <p className="mt-2">Stubline is a software demo. Events, reservations, availability, and prices are sample application data and are not offers to sell admission.</p>
        </section>
        <section>
          <h2 className="font-display text-2xl">No payments or tickets</h2>
          <p className="mt-2">The app does not collect payment details, charge money, issue valid tickets, or guarantee venue entry. A booking record is not a ticket.</p>
        </section>
        <section>
          <h2 className="font-display text-2xl">Use of the demo</h2>
          <p className="mt-2">Use test information only. Do not rely on the service to make a purchase or retain important booking information. The demo may change or become unavailable without notice.</p>
        </section>
        <section>
          <h2 className="font-display text-2xl">Document status</h2>
          <p className="mt-2">This page describes the intended behavior of a portfolio project. It is not a contract or legal advice for a production service.</p>
        </section>
      </div>
    </article>
  </div>
);

export default Terms;