import Skeleton from "react-loading-skeleton";

export const PhenotypeResultSkeleton = ({ isFirst }: { isFirst: boolean }) => (
  <>
    <div className="row">
      <div
        style={{
          minHeight: "139px",
          padding: "1.5rem 1.25rem",
        }}
      >
        <Skeleton width={140} />
        <div style={{ display: "flex", gap: "1rem" }}>
          <Skeleton width={530} count={2} containerClassName="mt-1" />
          <Skeleton width={450} count={2} containerClassName="mt-1" />
        </div>
        <Skeleton width={150} />
      </div>
    </div>
    <hr className="mt-0 mb-0" />
  </>
);
