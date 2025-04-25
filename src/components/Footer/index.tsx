import {
  faCreativeCommons,
  faCreativeCommonsBy,
  faFacebookSquare,
  faReddit,
  faTwitter,
  faYoutube,
  faLinkedin,
} from "@fortawesome/free-brands-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Container, Row } from "react-bootstrap";
import footerCss from "./styles.module.scss";
import Link from "next/link";

export const DR_VERSION = process.env.NEXT_PUBLIC_DATA_RELEASE_VERSION || "";

const Footer = () => {
  return (
    <div className={`bg-black text-white ${footerCss.footer}`}>
      <Container>
        <Row>
          <div className="col-12 col-md-6 footer-text mb-3">
            <p>
              <FontAwesomeIcon
                icon={faCreativeCommons}
                size="2x"
                className="me-2"
              />{" "}
              <FontAwesomeIcon icon={faCreativeCommonsBy} size="2x" />
              {/* <i className="fab fa-creative-commons fa-2x mr-2"></i>{' '}
                <i className="fab fa-creative-commons-by fa-2x"></i> */}
            </p>
            <p>
              Content on this site is licensed under a<br />
              <a href="//www.mousephenotype.org/help/faqs/is-impc-data-freely-available/">
                Creative Commons Attribution 4.0 International license
              </a>
            </p>
            <p>
              <a href="//www.mousephenotype.org/about-impc/accessibility-cookies/">
                Privacy &amp; Cookies
              </a>
              <br />
              <a href="//www.mousephenotype.org/about-impc/terms-of-use/">
                Terms of use
              </a>
            </p>
          </div>

          <div className="col-12 col-md-3 footer-nav">
            <div className="menu-main-nav-container">
              <ul id="menu-main-nav-1" className="menu">
                <li id="" className="menu-item ">
                  <a href="/data/summary">My Genes</a>
                </li>

                <li id="about-impc" className="menu-item about-impc">
                  <a href="https://www.mousephenotype.org/about-impc/">
                    About the IMPC
                  </a>
                </li>

                <li id="data" className="menu-item data">
                  <a href="https://www.mousephenotype.org/understand/">Data</a>
                </li>

                <li id="human-diseases" className="menu-item human-diseases">
                  <a href="https://www.mousephenotype.org/human-diseases/">
                    Human Diseases
                  </a>
                </li>

                <li id="publications" className="menu-item publications">
                  <a href="https://www.mousephenotype.org/publications/">
                    Publications
                  </a>
                </li>

                <li id="news" className="menu-item news">
                  <a href="https://www.mousephenotype.org/news/">News</a>
                </li>

                <li id="blog" className="menu-item blog">
                  <a href="https://www.mousephenotype.org/blog/">Blog</a>
                </li>
              </ul>
            </div>
          </div>

          <div className="col-12 col-md-3 footer-nav">
            <div className="menu-top-nav-container">
              <ul id="menu-top-nav-1" className="menu">
                <li className="menu-item menu-item-type-post_type menu-item-object-page menu-item-13">
                  <a href="//www.mousephenotype.org/help/">Help</a>
                </li>
                <li className="menu-item menu-item-type-custom menu-item-object-custom menu-item-14">
                  <a href="http://cloud.mousephenotype.org">IMPC Cloud</a>
                </li>
                <li className="menu-item menu-item-type-post_type menu-item-object-page menu-item-15">
                  <a href="//www.mousephenotype.org/contact-us/">Contact us</a>
                </li>
              </ul>
            </div>
          </div>
        </Row>
        <Row className="mt-3">
          <div className="col-12 col-md-6">
            <ul className="footer__social">
              <li>
                <a
                  href="https://www.linkedin.com/company/impc--international-mouse-phenotyping-consortium/"
                  target="_blank"
                  rel="noreferrer"
                >
                  <span className="sr-only">IMPC LinkedIn</span>
                  <FontAwesomeIcon icon={faLinkedin} size="2x" />
                </a>
              </li>
              <li>
                <a
                  href="https://twitter.com/impc"
                  target="_blank"
                  rel="noreferrer"
                >
                  <span className="sr-only">IMPC Twitter</span>
                  <FontAwesomeIcon icon={faTwitter} size="2x" />
                </a>
              </li>
              <li>
                <a
                  href="https://www.youtube.com/channel/UCXp3DhDYbpJHu4MCX_wZKww"
                  target="_blank"
                  rel="noreferrer"
                >
                  <span className="sr-only">IMPC YouTube</span>
                  <FontAwesomeIcon icon={faYoutube} size="2x" />
                </a>
              </li>
              <li>
                <a
                  href="https://www.facebook.com/InternationalMousePhenotypingConsortium"
                  target="_blank"
                  rel="noreferrer"
                >
                  <span className="sr-only">IMPC Facebook</span>
                  <FontAwesomeIcon icon={faFacebookSquare} size="2x" />
                </a>
              </li>
              <li>
                <a
                  href="https://www.reddit.com/user/MousePhenotyping"
                  target="_blank"
                  rel="noreferrer"
                >
                  <span className="sr-only">IMPC Reddit</span>
                  <FontAwesomeIcon icon={faReddit} size="2x" />
                </a>
              </li>
            </ul>
          </div>
          <div className="col-12 col-md-6 text-right">
            <h6>
              <Link href="/release">
                <small>
                  Access Data Release <span id="data-no">{DR_VERSION}</span>
                  &nbsp;Data
                </small>
              </Link>
            </h6>
            <div className="menu-footer-access-container">
              <ul id="menu-footer-access" className="menu">
                <li
                  id="menu-item-1887"
                  className="menu-item menu-item-type-post_type menu-item-object-page menu-item-1887"
                >
                  <a href="//www.mousephenotype.org/understand/accessing-the-data/batch-query/">
                    Batch query
                  </a>
                </li>
                <li
                  id="menu-item-1889"
                  className="menu-item menu-item-type-post_type menu-item-object-page menu-item-1889"
                >
                  <a href="//www.mousephenotype.org/understand/accessing-the-data/access-via-api/">
                    Access via API
                  </a>
                </li>
                <li
                  id="menu-item-1890"
                  className="menu-item menu-item-type-post_type menu-item-object-page menu-item-1890"
                >
                  <a href="//www.mousephenotype.org/understand/accessing-the-data/access-via-ftp/">
                    Access via FTP
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </Row>
      </Container>
    </div>
  );
};

export default Footer;
