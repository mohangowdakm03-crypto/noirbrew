import TransitionLink from './TransitionLink';

export default function Footer() {
  return (
    <footer>
      <div>
        <div className="f-logo">Noir Brew</div>
        <div className="f-tagline">Taste the Dark — Since 1924</div>
      </div>
      <ul className="f-links">
        <li><TransitionLink href="/story">Our Story</TransitionLink></li>
        <li><TransitionLink href="/menu">The Blend</TransitionLink></li>
        <li><TransitionLink href="/find">Find a Location</TransitionLink></li>
        <li><TransitionLink href="/contact">Contact</TransitionLink></li>
      </ul>
      <div className="f-copy">
        <p>© 2024 Noir Brew. All rights reserved.</p>
        <p className="fc-accent">Crafted with obsession.</p>
      </div>
    </footer>
  );
}
