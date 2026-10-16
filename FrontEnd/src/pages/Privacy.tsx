const Privacy = () => (
  <div className="container mx-auto min-h-screen px-4 py-12">
    <article aria-labelledby="privacy-title" className="max-w-3xl">
      <p className="font-mono-ticket text-xs uppercase text-vermilion">Demo document · Not legal advice</p>
      <h1 id="privacy-title" className="mt-2 font-display text-5xl">Privacy notice</h1>
      <p className="mt-3 text-sm text-muted-foreground">For the Stubline demonstration only.</p>

      <div className="mt-8 space-y-6">
        <section>
          <h2 className="font-display text-2xl">Information entered</h2>
          <p className="mt-2">When you create an account, the connected demo API receives your name, email address, and password. Booking actions are associated with that account. Use test information only.</p>
        </section>
        <section>
          <h2 className="font-display text-2xl">Session storage</h2>
          <p className="mt-2">The browser stores an authentication token in local storage so the demo can keep you signed in between page loads. Clearing site data removes that browser token; it may not remove account or booking records from the API database.</p>
        </section>
        <section>
          <h2 className="font-display text-2xl">Payments and tracking</h2>
          <p className="mt-2">The demo does not accept payment information. This interface does not add analytics or advertising trackers. The hosting environment and API operator may have their own infrastructure logs.</p>
        </section>
        <section>
          <h2 className="font-display text-2xl">Demo limitations</h2>
          <p className="mt-2">This notice describes the sample application, not a production privacy program. Do not submit sensitive or real payment information.</p>
        </section>
      </div>
    </article>
  </div>
);

export default Privacy;