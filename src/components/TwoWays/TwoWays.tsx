import Link from 'next/link';
import './TwoWays.scss';

const TwoWays = () => {
  return (
    <section className="two-ways">
      <div className="two-ways__inner">
        <div className="two-ways__header">
          <h2>Two ways to work on <span className="brand">workvence</span></h2>
          <p>
            Choose the hiring experience that fits your needs—purchase ready-made services instantly or
            post a custom project and receive competitive proposals from verified professionals.
          </p>
        </div>

        <div className="two-ways__cards">
          <div className="way-card">
            <div className="way-card__icon">
              <img src="/all-icons/discount-tag-02.svg" alt="Fixed-Price" />
            </div>
            <h3>Buy a Fixed-Price Service</h3>
            <p>
              Browse curated gig packages with clear scopes and set timelines. Perfect for defined tasks like logos, articles, or bug fixes.
            </p>
            <Link href="/gigs" className="way-card__btn way-card__btn--primary">
              Browse gigs
            </Link>
          </div>

          <div className="way-card">
            <div className="way-card__icon">
              <img src="/all-icons/ai-security-03.svg" alt="Post Project" />
            </div>
            <h3>Post a Project, Get Bids</h3>
            <p>
              Submit your custom requirements and let our vetted experts pitch their best solutions. Best for long-term or complex initiatives.
            </p>
            <Link href="/gigs" className="way-card__btn way-card__btn--outline">
              Post project
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default TwoWays;
