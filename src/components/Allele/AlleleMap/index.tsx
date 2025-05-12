import Card from "../../Card";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faExternalLinkAlt } from "@fortawesome/free-solid-svg-icons";
import { useQuery } from "@tanstack/react-query";
import { fetchAPI } from "@/api-service";
import { md5 } from "@/utils/md5.ts";

const ALLELE_RESOURCE_URL = import.meta.env.VITE_ALLELE_RESOURCES_URL;

const AlleleMap = ({
  mgiGeneAccessionId,
  alleleName,
  emsembleUrl,
}: {
  mgiGeneAccessionId: string;
  alleleName: string;
  emsembleUrl: string;
}) => {
  const { data } = useQuery({
    queryKey: ['genes', mgiGeneAccessionId, 'alleles', 'es_cell', alleleName],
    queryFn: () => fetchAPI(`/api/v1/alleles/es_cell/get_by_mgi_and_allele_name/${mgiGeneAccessionId}/${alleleName}`)
  });

  if (!data || (Array.isArray(data) && data.length === 0)) {
    return null;
  }

  const {
    otherLinks: { genbankFile, alleleSimpleImage },
  } = data[0];

  // don't show the section if we don't have any data
  if (!genbankFile && !alleleSimpleImage && !emsembleUrl) {
    return null;
  }

  const number = genbankFile.split("/")[4];
  const hash = md5(genbankFile.split("/")[4]).substring(0, 2).toLowerCase();
  const updatedGenbankFile = `${ALLELE_RESOURCE_URL}${hash}/${number}/${genbankFile.split("/")[5]}`;
  const updatedAlleleImage = `${ALLELE_RESOURCE_URL}${hash}/${number}/${alleleSimpleImage.split("/")[5]}`;

  return (
    <Card>
      <h2>Allele Map</h2>
      <p className="mb-0">
        {updatedGenbankFile && (
          <>
            <a href={updatedGenbankFile} target="_blank" className="primary link">
              Genbank
              <FontAwesomeIcon icon={faExternalLinkAlt} style={{ marginLeft: "5px" }} />
            </a>&nbsp;
            <span className="grey ms-2 me-2">|</span>
          </>
        )}

        {emsembleUrl && (
          <a href={emsembleUrl} target="_blank" className="primary link">
            Ensembl<FontAwesomeIcon icon={faExternalLinkAlt} style={{ marginLeft: "5px" }} />
          </a>
        )}
      </p>
      {!!updatedAlleleImage && (
        <div>
          <img
            src={updatedAlleleImage}
            style={{ display: "block", maxWidth: "100%" }}
          />
        </div>
      )}
    </Card>
  );
};

export default AlleleMap;
