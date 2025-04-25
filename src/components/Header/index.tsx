"use client";
import { Fragment, useState } from "react";
import headerCss from "./styles.module.scss";
import { useQuery } from "@tanstack/react-query";
import { Collapse } from "react-bootstrap";
import { faSearch } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Link from "next/link";

export interface MenuItem {
  name: string;
  link: string;
  id?: number;
  classes?: string;
  sort?: number;
  children?: MenuItem[];
}

export interface INavBarProps {
  menuItems: MenuItem[];
}

const rewriteMenu = (data) => {
  return data.map((item) => {
    return {
      ...item,
      link: getInternalLink(item.name, item.link),
      children:
        item.children && item.children.length > 0
          ? rewriteMenu(item.children)
          : [],
    };
  });
};
const getInternalLink = (name: string, link: string) => {
  switch (name) {
    case "Cardiovascular":
      return "/cardiovascular";
    case "Embryo Development":
      return "/embryo";
    case "Papers Using IMPC Resources":
      return "/publications";
    case "Histopathology":
      return "/histopath";
    case "Sexual Dimorphism":
      return "/sexual-dimorphism";
    case "Genes Critical for Hearing Identified":
      return "/hearing";
    case "Genetic Basis for Metabolic Diseases":
      return "/metabolism";
    case "Essential Genes - Translating to Other Species":
      return "/conservation";
    case "Batch query":
      return "/batchQuery";
    case "Late Adult Data":
      return "/late-adult-data";
    case "Latest Data Release":
      return "/release";
    default:
      return link;
  }
};

const getURLJSONMenu = () => {
  switch (location.hostname) {
    case "mousephenotype.org":
    case "www.mousephenotype.org":
    case "nginx.mousephenotype-prod.org":
      return "https://www.mousephenotype.org/jsonmenu/";
    case "dev.mousephenotype.org":
    case "nginx.mousephenotype-dev.org":
      return "https://dev.mousephenotype.org/jsonmenu/";
    default:
      return "https://www.mousephenotype.org/jsonmenu/";
  }
};

const Header = () => {
  const { data: menuItems } = useQuery({
    queryKey: ["menu"],
    queryFn: async () => {
      const params = new URLSearchParams();
      params.append("timestamp", (+new Date()).toString(10));
      const response = await fetch(`${getURLJSONMenu()}?${params}`);
      return await response.json();
    },
    placeholderData: [],
    // TODO: to be removed after site is launched to production
    select: rewriteMenu,
  });
  const [activeMenuId, setActiveMenu] = useState(-1);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className={headerCss.header}>
      <div className="header__nav-top d-none d-lg-block">
        <div className="container text-right">
          <div className="row">
            <div className="col">
              <div className="menu-top-nav-container">
                <ul id="menu-top-nav" className="menu">
                  <li className="menu-item">
                    <a href="//www.mousephenotype.org/help/">Help</a>
                  </li>
                  <li className="menu-item">
                    <a href="https://cloud.mousephenotype.org">IMPC Cloud</a>
                  </li>
                  <li className="menu-item">
                    <a href="//www.mousephenotype.org/contact-us/">
                      Contact us
                    </a>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div>
        <div className="header__nav">
          <div className="container">
            <div className="row">
              <div
                className="col-6 col-md-3"
                style={{ display: "flex", alignItems: "center" }}
              >
                <a
                  href="/"
                  className="header__logo-link active"
                  aria-label="Link to IMPC homepage"
                >
                  <img
                    className="header__logo"
                    src="/data/logo.svg"
                    alt="International Mouse Phenotyping Consortium Office Logo"
                    width={355}
                    height={105}
                  />
                </a>
              </div>
              <div className="col-6 col-md-9 text-right">
                <div className="d-none d-lg-block">
                  <div className="menu-main-nav-container">
                    <ul id="menu-main-nav" className="menu">
                      {menuItems?.map((menuItem, i) => {
                        return (
                          <li
                            key={`menu-item-${menuItem.id}-${i}`}
                            id={`menu-item-${menuItem.id}`}
                            className={`${
                              menuItem.classes
                            } menu-item menu-item-type-post_type menu-item-object-page menu-item-${
                              menuItem.id
                            } ${
                              menuItem.classes === "data"
                                ? "current-menu-item"
                                : ""
                            }`}
                            onMouseOver={() => setActiveMenu(menuItem.id || -1)}
                            onFocus={() => setActiveMenu(menuItem.id || -1)}
                            onMouseLeave={() => setActiveMenu(-1)}
                          >
                            <Link href={menuItem.link}>{menuItem.name}</Link>
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                </div>
                <button
                  className="navbar-toggler d-inline d-lg-none collapsed"
                  type="button"
                  aria-controls="navbarToggleExternalContent"
                  aria-label="Toggle navigation"
                  onClick={() => setMobileMenuOpen((prevState) => !prevState)}
                >
                  <span className="icon-bar top-bar"></span>
                  <span className="icon-bar middle-bar"></span>
                  <span className="icon-bar bottom-bar"></span>
                </button>
              </div>
            </div>
          </div>
        </div>
        {menuItems
          ?.filter(
            (menuItem) => menuItem.children && menuItem.children.length > 0,
          )
          ?.map((menuItem, i) => {
            const itemId = `${menuItem.classes?.split("-")[0]}-menu`;
            return (
              <div
                key={`subMenu-${menuItem.id}-${i}`}
                className={`${itemId} sub-menu d-none d-lg-block ${
                  activeMenuId == menuItem.id ? "active" : "collapse"
                }`}
                id={itemId}
                onMouseOver={() => setActiveMenu(menuItem.id || -1)}
                onFocus={() => setActiveMenu(menuItem.id || -1)}
                onMouseLeave={() => setActiveMenu(-1)}
              >
                <div className={`${itemId}__inside sub-menu__inside`}>
                  <div className="container">
                    <div className="row justify-content-end">
                      {menuItem.classes == "about-impc" ? (
                        <div className="col col-auto text-left">
                          <a key={menuItem.link} href={menuItem.link}>
                            {menuItem.name}
                          </a>
                        </div>
                      ) : null}
                      {menuItem.children?.some(
                        (item) => item.children && item.children?.length > 0,
                      ) ? (
                        <>
                          {menuItem.children
                            ?.sort((a, b) => a.sort - b.sort)
                            .map((subMenuItem) => {
                              return (
                                <div
                                  key={subMenuItem.link}
                                  className="col col-auto text-left"
                                >
                                  <Link href={subMenuItem.link}>
                                    {subMenuItem.name}
                                  </Link>
                                  <div className="sub-pages">
                                    {subMenuItem.children
                                      ?.sort((a, b) => a.sort - b.sort)
                                      .map((subMenutItemChild) => {
                                        return (
                                          <p key={subMenutItemChild.link}>
                                            <Link href={subMenutItemChild.link}>
                                              {subMenutItemChild.name}
                                            </Link>
                                          </p>
                                        );
                                      })}
                                  </div>
                                </div>
                              );
                            })}
                        </>
                      ) : (
                        <>
                          {menuItem.children
                            ?.sort((a, b) => a.sort - b.sort)
                            .map((subMenuItem) => {
                              return (
                                <div
                                  key={subMenuItem.link}
                                  className="col col-auto text-left"
                                >
                                  <Link href={subMenuItem.link}>
                                    {subMenuItem.name}
                                  </Link>
                                </div>
                              );
                            })}
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <div className={`${itemId}__drop`}></div>
              </div>
            );
          })}
      </div>
      <Collapse in={mobileMenuOpen}>
        <div className="mobile-nav" id="navbarToggleExternalContent">
          <button
            className="navbar-toggler"
            type="button"
            aria-controls="navbarToggleExternalContent"
            aria-label="Toggle navigation"
            onClick={() => setMobileMenuOpen((prevState) => !prevState)}
          >
            <span className="icon-bar top-bar"></span>
            <span className="icon-bar middle-bar"></span>
            <span className="icon-bar bottom-bar"></span>
          </button>
          <div className="mobile-nav__search mb-3">
            <form action="/">
              <div className="row">
                <div className="col col-10 text-left">
                  <input
                    type="search"
                    className="form-control"
                    id="s"
                    name="s"
                    placeholder="Search documentation and news"
                  />
                </div>
                <div className="col col-2 text-right">
                  <button
                    type="submit"
                    aria-describedby="svg-inline--fa-title-search-icon"
                  >
                    <FontAwesomeIcon
                      icon={faSearch}
                      title="Search button"
                      titleId="search-icon"
                    />
                  </button>
                </div>
              </div>
            </form>
          </div>
          <div className="row">
            <div className="col-12">
              <h3 className="mt-2">
                <a className="" href="/data/summary">
                  My Genes
                </a>
              </h3>
              {menuItems?.map((menuItem, i) => (
                <Fragment key={i}>
                  <h3 className="mt-2">
                    <Link href={menuItem.link} className={menuItem.classes}>
                      {menuItem.name}
                    </Link>
                  </h3>
                  <div className="mobile-nav__sub-pages">
                    {menuItem?.children
                      .sort((a, b) => a.sort - b.sort)
                      .map((subMenuItem, i) => (
                        <Fragment key={i}>
                          <p>
                            <Link href={subMenuItem.link}>
                              {subMenuItem.name}
                            </Link>
                          </p>
                          <div className="sub-pages">
                            {subMenuItem.children &&
                              subMenuItem.children
                                .sort((a, b) => a.sort - b.sort)
                                .map((subMenuItemChild) => (
                                  <p>
                                    <Link href={subMenuItemChild.link}>
                                      {subMenuItemChild.name}
                                    </Link>
                                  </p>
                                ))}
                          </div>
                        </Fragment>
                      ))}
                  </div>
                </Fragment>
              ))}
            </div>
          </div>
        </div>
      </Collapse>
    </div>
  );
};

export default Header;
