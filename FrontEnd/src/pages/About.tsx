const About = () => (
  <div className="container mx-auto min-h-screen px-4 py-12">
    <section aria-labelledby="about-title" className="max-w-3xl">
      <p className="font-mono-ticket text-xs uppercase text-vermilion">Stubline · Demo project</p>
      <h1 id="about-title" className="mt-2 font-display text-5xl">About the build</h1>
      <p className="mt-5 max-w-2xl text-lg">
        Stubline is a concert booking demo for browsing events, reserving ticket zones, and reviewing bookings. It does not process payments or issue real tickets.
      </p>

      <div className="mt-10 border-t-2 border-ink pt-5">
        <h2 className="font-display text-3xl">Colophon</h2>
        <dl className="mt-4 grid gap-x-8 gap-y-4 sm:grid-cols-[10rem_1fr]">
          <dt className="font-mono-ticket text-sm uppercase">API</dt>
          <dd>Java with Spring Boot 3 and a relational database.</dd>
          <dt className="font-mono-ticket text-sm uppercase">Interface</dt>
          <dd>React 18, TypeScript, and Vite.</dd>
          <dt className="font-mono-ticket text-sm uppercase">Server state</dt>
          <dd>TanStack React Query with Axios for API requests.</dd>
          <dt className="font-mono-ticket text-sm uppercase">Forms</dt>
          <dd>React Hook Form with Zod validation.</dd>
          <dt className="font-mono-ticket text-sm uppercase">Design</dt>
          <dd>Box Office palette, SVG venue map, and CSS ticket-stub surfaces.</dd>
        </dl>
      </div>
    </section>
  </div>
);

export default About;