"use client";

import { Bar, Line } from "react-chartjs-2";
import dataLabelsPlugin from "chartjs-plugin-datalabels";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Colors,
  ChartData,
} from "chart.js";
import { useEffect, useMemo, useState } from "react";
import {
  faTable,
  faChartBar,
  faDownload,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  LoadingProgressBar,
  Pagination,
  PublicationListProps,
  SortableTable,
} from "@/components";
import styles from "./styles.module.scss";
import { Modal } from "react-bootstrap";
import dynamic from "next/dynamic";
import {
  PublicationsByGrantAgency,
  PublicationsByQuarter,
  PublicationsIncrementalCountsByYear,
} from "@/models/publications";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Colors,
);

const PublicationsList = dynamic<PublicationListProps>(
  () => import("@/components/PublicationsList"),
  { ssr: false },
);

export function PublicationsIncreaseChart({ data: yearlyIncrementData }) {
  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      title: { display: false },
    },
    scales: {
      y: {
        title: { display: true, text: "Number of publications" },
      },
    },
  };
  const data = useMemo(() => {
    return {
      labels: yearlyIncrementData.map((point) => point.pubYear),
      datasets: [
        {
          data: yearlyIncrementData.map((point, index) => {
            const totalBefore = yearlyIncrementData
              .slice(0, index)
              .reduce((acc, point) => acc + point.count, 0);
            return point.count + totalBefore;
          }),
          borderColor: "rgb(53, 162, 235)",
          backgroundColor: "rgba(53, 162, 235, 0.5)",
        },
      ],
    };
  }, [yearlyIncrementData]);

  if (!!yearlyIncrementData) {
    return <Line data={data} options={options} />;
  } else {
    return (
      <div
        className="mt-4"
        style={{ display: "flex", justifyContent: "center" }}
      >
        <LoadingProgressBar />
      </div>
    );
  }
}

export function PublicationsByYearChart({
  data: publicationsByQuarter,
  yearlyIncrementData,
}) {
  const [quarterChartView, setQuarterChartView] = useState<"year" | "quarter">(
    "year",
  );
  const [pubByQuarterData, setPubByQuarterData] =
    useState<ChartData<"bar"> | null>(null);

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      title: { display: true },
      datalabels: {
        color: "#000",
        align: "top" as const,
        anchor: "end" as const,
      },
    },
    scales: {
      y: {
        title: { display: true, text: "Number of publications" },
      },
    },
    onHover: (e, elements) => {
      elements.length
        ? (e.native.target.style.cursor = "pointer")
        : (e.native.target.style.cursor = "auto");
    },
    onClick: (e, elements) => {
      if (elements.length > 0 && quarterChartView === "year") {
        const elementClicked = elements[0];
        const yearInfo = publicationsByQuarter[elementClicked.index];
        const newData = {
          labels: yearInfo.byQuarter.map(
            (quarter) => `${yearInfo.pubYear} Q${quarter.quarter}`,
          ),
          datasets: [
            {
              data: yearInfo.byQuarter.map((quarter) => quarter.count),
            },
          ],
        };
        setQuarterChartView("quarter");
        setPubByQuarterData(newData);
      } else if (quarterChartView === "quarter") {
        setQuarterChartView("year");
        setPubByQuarterData({
          labels: publicationsByQuarter.map((pubCount) =>
            pubCount.pubYear.toString(),
          ),
          datasets: [
            {
              data: yearlyIncrementData.map((pubCount) => pubCount.count),
            },
          ],
        });
      }
    },
  };

  const data = useMemo(() => {
    return {
      labels: publicationsByQuarter.map((pubCount) =>
        pubCount.pubYear.toString(),
      ),
      datasets: [
        {
          data: yearlyIncrementData.map((pubCount) => pubCount.count),
        },
      ],
    };
  }, [publicationsByQuarter, yearlyIncrementData]);

  useEffect(() => {
    if (data.labels.length && pubByQuarterData === null) {
      setPubByQuarterData(data);
    }
  }, [data]);

  if (!!pubByQuarterData) {
    return (
      <Bar
        data={pubByQuarterData}
        options={options}
        plugins={[dataLabelsPlugin]}
      />
    );
  } else {
    return (
      <div
        className="mt-4"
        style={{ display: "flex", justifyContent: "center" }}
      >
        <LoadingProgressBar />
      </div>
    );
  }
}

export function GrantsChart({
  data: publicationsByGrantsChartData,
  onAgencySelection,
}) {
  const options = {
    indexAxis: "y" as const,
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      title: { display: false },
    },
    onHover: (e, elements) => {
      elements.length
        ? (e.native.target.style.cursor = "pointer")
        : (e.native.target.style.cursor = "auto");
    },
    onClick: (e, elements) => {
      if (elements.length > 0) {
        onAgencySelection(elements[0].index);
      }
    },
  };

  const data = useMemo(() => {
    return {
      labels: publicationsByGrantsChartData.map((pubCount) => pubCount.agency),
      datasets: [
        {
          label: "Publications",
          data: publicationsByGrantsChartData.map((pubCount) => pubCount.count),
        },
      ],
    };
  }, [publicationsByGrantsChartData]);

  if (!!publicationsByGrantsChartData) {
    return <Bar data={data} options={options} />;
  } else {
    return (
      <div
        className="mt-4"
        style={{ display: "flex", justifyContent: "center" }}
      >
        <LoadingProgressBar />
      </div>
    );
  }
}

type GrantSectionProps = {
  data: {
    yearlyIncrementData: PublicationsIncrementalCountsByYear;
    publicationsByGrantsChartData: PublicationsByGrantAgency;
    publicationsByQuarter: PublicationsByQuarter;
    allGrantsData: PublicationsByGrantAgency;
  };
};

export function GrantSection({ data }: GrantSectionProps) {
  const [grantAgencyView, setGrantAgencyView] = useState<"chart" | "table">(
    "chart",
  );
  const [selectedAgency, setSelectedAgency] = useState("");
  const [showModal, setShowModal] = useState(false);

  const onDownloadBtnClick = () => {
    const fileData = data.allGrantsData.map(({ agency, count }) => [
      agency,
      count,
    ]);
    fileData.splice(0, 0, ["Agency", "Count"]);
    let tsvContent = "";
    fileData.forEach((row) => (tsvContent += row.join("\t") + "\n"));
    const blob = new Blob([tsvContent], { type: "text/tsv;charset=utf-8," });
    const objURL = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", objURL);
    link.setAttribute("download", "list-grant-agencies.tsv");
    link.click();
  };

  const onAgencySelection = (agencyPos: number) => {
    const agencyData = data.publicationsByGrantsChartData[agencyPos];
    setSelectedAgency(agencyData.agency);
    setShowModal(true);
  };

  return (
    <>
      <div className={styles.changeViewWrapper}>
        <button
          className={`btn btn-secondary btn-lg ${
            grantAgencyView === "chart" ? "active" : ""
          }`}
          onClick={() => setGrantAgencyView("chart")}
        >
          <FontAwesomeIcon icon={faChartBar} />
          Chart view
        </button>
        <button
          className={`btn btn-secondary btn-lg ${
            grantAgencyView === "table" ? "active" : ""
          }`}
          onClick={() => setGrantAgencyView("table")}
        >
          <FontAwesomeIcon icon={faTable} />
          Table view
        </button>
        <a
          className="btn impc-secondary-button small"
          onClick={onDownloadBtnClick}
          style={{ marginLeft: "auto" }}
        >
          Download list of agencies&nbsp;
          <FontAwesomeIcon icon={faDownload}></FontAwesomeIcon>
        </a>
      </div>
      <h2>
        {grantAgencyView === "chart"
          ? "Top 100 grant agencies by number of publications"
          : "All grant agencies funded IKMC/IMPC related publications"}
      </h2>
      {grantAgencyView === "chart" ? (
        <div style={{ minHeight: "2000px" }} className="position-relative">
          <GrantsChart
            data={data.publicationsByGrantsChartData}
            onAgencySelection={onAgencySelection}
          />
        </div>
      ) : (
        <Pagination data={data?.allGrantsData}>
          {(pageData) => (
            <SortableTable
              headers={[
                {
                  width: 1,
                  label: "Grant agency",
                  field: "key",
                  disabled: true,
                },
                {
                  width: 1,
                  label: "Number of publications",
                  field: "value",
                  disabled: true,
                },
              ]}
            >
              {pageData.map((row) => (
                <tr key={row.agency}>
                  <td>{row.agency}</td>
                  <td>{row.count}</td>
                </tr>
              ))}
            </SortableTable>
          )}
        </Pagination>
      )}
      <Modal
        show={showModal}
        onHide={() => setShowModal(false)}
        dialogClassName="publications modal-85w"
      >
        <Modal.Header closeButton>
          <Modal.Title>Publications funded by {selectedAgency}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <PublicationsList
            filterByGrantAgency={selectedAgency}
          ></PublicationsList>
        </Modal.Body>
      </Modal>
    </>
  );
}
