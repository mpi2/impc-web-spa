import Footer from "../Footer";
import Header from "../Header";
import Newsletter from "../Newsletter";

const Layout = ({ children }) => {
  return (
    <div>
      <Header />
      <noscript>
        <div className="container mt-3" style={{ maxWidth: "1240px" }}>
          <div className="alert alert-warning">
            <h4>Javascript is disabled</h4>
            <p>
              Javascript is a programming language built in every browser to
              provide functionality and this site requires it. <br />
              We have compiled a list of guides to enable it, based on your
              browser:
              <ul>
                <li>
                  <a
                    className="link primary"
                    title="enable javascript in Google Browser"
                    href="https://support.google.com/admanager/answer/12654?hl=en"
                  >
                    Chrome
                  </a>
                </li>
                <li>
                  <a
                    className="link primary"
                    title="enable javascript in Firefox Browser"
                    href="https://support.mozilla.org/en-US/kb/javascript-settings-for-interactive-web-pages"
                  >
                    Firefox
                  </a>
                </li>
                <li>
                  <a
                    className="link primary"
                    title="enable javascript in Safari Browser"
                    href="https://support.apple.com/en-mn/guide/safari/ibrw1032/16.0/mac/11.0"
                  >
                    Safari
                  </a>
                </li>
              </ul>
            </p>
          </div>
        </div>
      </noscript>
      <main>{children}</main>
      <Newsletter />
      <Footer />
    </div>
  );
};

export default Layout;
