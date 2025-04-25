import Skeleton from "react-loading-skeleton";

const SkeletonTable = ({ numOfColumns = 7, numOfRows = 5 }) => (
  <table>
    <tbody>
    {[...Array(numOfRows)].map((_, i) => (
      <tr key={i}>
        {[...Array(numOfColumns)].map((_, i2) => (
          <td key={i2}>
            <Skeleton />
          </td>
        ))}
      </tr>
    ))}
    </tbody>
  </table>
);

export default SkeletonTable;