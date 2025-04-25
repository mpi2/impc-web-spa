"use client";
import { faSearch } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Link from "next/link";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Container } from "react-bootstrap";
import styles from "./styles.module.scss";
import { debounce } from "lodash";

export type Tab = {
  name: string;
  link: string;
  external?: boolean;
  type?: string | null;
  altType?: string;
};

const Search = ({
  defaultType,
  onChange,
  updateURL = false,
}: {
  defaultType?: string;
  onChange?: (val: string) => void;
  updateURL?: boolean;
}) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const [query, setQuery] = useState<string>(searchParams.get("term") || "");

  const handleInput = (val: string) => {
    if (onChange) onChange(val);
  };

  const delayedOnChange = useRef(
    debounce((q: string) => handleInput(q), 500),
  ).current;
  const type = searchParams.get("type");

  const tabs: Tab[] = [
    {
      name: "Genes",
      link: "/search",
      type: null,
    },
    {
      name: "Phenotypes",
      link: "/search?type=pheno",
      type: "pheno",
      altType: "phenotype",
    },
    {
      name: "Help, news, blog",
      link: `${process.env.NEXT_PUBLIC_NEWS_SEARCH}/?s=`,
      external: true,
      type: "blog",
    },
  ];
  const getSelectedIndex = (typeInput) =>
    tabs.findIndex(
      (tab) => tab.type === typeInput || tab.altType === typeInput,
    );
  const [tabIndex, setTabIndex] = useState(getSelectedIndex(defaultType));
  useEffect(() => {
    let tabType = type;
    if (type === null && !!defaultType) {
      tabType = defaultType;
    }
    setTabIndex(getSelectedIndex(tabType));
  }, [type, defaultType]);

  useEffect(() => {
    if (searchParams.has("term")) {
      setQuery(searchParams.get("term") || "");
      handleInput(searchParams.get("term") || "");
    }
  }, [searchParams]);

  useEffect(() => {
    if (updateURL) {
      if (searchParams.get("query") !== query) {
        const updatedSearchParams = new URLSearchParams(
          searchParams.toString(),
        );
        updatedSearchParams.set("term", query);
        router.push(`${pathname}?${updatedSearchParams.toString()}`);
      }
    }
  }, [query]);

  return (
    <div className={`${styles.banner}`}>
      <Container className={`pb-4 pt-5 ${styles.container}`}>
        <div className="col-12 col-md-8 ps-4 pe-4">
          <div className={styles.tabs}>
            {tabs.map((tab, i) => {
              const isActive = i === tabIndex;
              if (tab.external) {
                return (
                  <a
                    className={isActive ? styles.tab__active : styles.tab}
                    href={tab.link}
                    key={`tab-${tab.name}`}
                  >
                    {tab.name}
                  </a>
                );
              } else {
                return (
                  <Link
                    href={tab.link}
                    key={`tab-${tab.name}`}
                    className={isActive ? styles.tab__active : styles.tab}
                  >
                    {tab.name}
                  </Link>
                );
              }
            })}
          </div>
          <div className={styles.inputCont}>
            <input
              title="main search box"
              className={styles.input}
              type="text"
              placeholder={
                tabIndex === 0
                  ? "Search for a gene..."
                  : "Search for a phenotype..."
              }
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                delayedOnChange(e.target.value);
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  if (pathname !== "/search") {
                    let url = `/search?term=${e.currentTarget.value}`;
                    if (tabIndex === 1) {
                      url += "&type=pheno";
                    }
                    router.push(url);
                  } else {
                    const updatedSearchParams = new URLSearchParams(
                      searchParams.toString(),
                    );
                    updatedSearchParams.set("term", e.currentTarget.value);
                    router.push(
                      `${pathname}?${updatedSearchParams.toString()}`,
                    );
                  }
                }
              }}
            />
            <button
              className={styles.searchBtn}
              onClick={() => {
                handleInput(query);
              }}
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
      </Container>
    </div>
  );
};

export default Search;
