import Skeleton from "react-loading-skeleton";

export const GeneResultSkeleton = ({ isFirst }: { isFirst: boolean }) => (
  <>
    <div className="row">
      <div
        style={{
          minHeight: "139px",
          marginTop: isFirst ? "3rem" : "0",
          padding: "1.5rem 1.25rem",
        }}
      >
        <Skeleton width={370} />
        <Skeleton width={140} containerClassName="mt-1" />
        <div className="mt-1" style={{ display: "flex", gap: "1rem" }}>
          <Skeleton width={150} inline />
          <Skeleton width={150} inline />
          <Skeleton width={150} inline />
        </div>
      </div>
    </div>
    <hr className="mt-0 mb-0" />
  </>
);
